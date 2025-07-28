import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'stripe-webhook-test.log');

// Helper function to log messages
function logMessage(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  console.log(logEntry.trim());
  
  try {
    fs.appendFileSync(logFilePath, logEntry);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

// Simple buffer implementation to handle raw request body
async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const eventId = uuidv4().substring(0, 8);
  logMessage(`[${eventId}] Webhook test endpoint received a request`);
  
  try {
    // Get the raw body
    const buf = await buffer(req.body as unknown as NodeJS.ReadableStream);
    const rawBody = buf.toString('utf8');
    
    // Get the Stripe signature header
    const sig = req.headers.get('stripe-signature');
    
    logMessage(`[${eventId}] Request headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
    logMessage(`[${eventId}] Stripe signature: ${sig || 'None'}`);
    
    // Try to parse the event without verification first (for logging)
    try {
      const parsedEvent = JSON.parse(rawBody);
      logMessage(`[${eventId}] Parsed event type: ${parsedEvent.type}`);
      logMessage(`[${eventId}] Parsed event ID: ${parsedEvent.id}`);
      logMessage(`[${eventId}] Event data: ${JSON.stringify(parsedEvent.data.object, null, 2)}`);
    } catch (parseError) {
      logMessage(`[${eventId}] Failed to parse event JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
    
    // Verify the event with Stripe if signature is present
    if (sig) {
      try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
        if (!webhookSecret) {
          logMessage(`[${eventId}] Warning: STRIPE_WEBHOOK_SECRET is not set`);
        } else {
          const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
          logMessage(`[${eventId}] Successfully verified Stripe event: ${event.type}`);
          
          // Check if it's a checkout.session.completed event
          if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            logMessage(`[${eventId}] Checkout session completed: ${session.id}`);
            logMessage(`[${eventId}] Customer: ${session.customer}`);
            logMessage(`[${eventId}] Amount: ${session.amount_total} ${session.currency}`);
          }
        }
      } catch (verifyError) {
        logMessage(`[${eventId}] Failed to verify Stripe signature: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`);
      }
    } else {
      logMessage(`[${eventId}] No Stripe signature found in request`);
    }
    
    // Return a success response regardless of verification
    // This ensures Stripe doesn't retry the webhook
    return NextResponse.json({ received: true, eventId });
    
  } catch (error) {
    logMessage(`[${eventId}] Error processing webhook: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Check if logs exist and return the last few entries
  try {
    let logContent = 'No logs found';
    
    if (fs.existsSync(logFilePath)) {
      const stats = fs.statSync(logFilePath);
      const fileSizeInBytes = stats.size;
      
      // Read the last 50KB of the log file to avoid loading too much
      const bytesToRead = Math.min(fileSizeInBytes, 50 * 1024);
      const buffer = Buffer.alloc(bytesToRead);
      
      const fileDescriptor = fs.openSync(logFilePath, 'r');
      fs.readSync(
        fileDescriptor,
        buffer,
        0,
        bytesToRead,
        fileSizeInBytes - bytesToRead
      );
      fs.closeSync(fileDescriptor);
      
      logContent = buffer.toString('utf8');
    }
    
    return NextResponse.json({
      message: 'Webhook test endpoint is active',
      logFileExists: fs.existsSync(logFilePath),
      recentLogs: logContent,
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Webhook test endpoint is active',
      error: `Error reading logs: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

// Disable body parsing to get raw body using the modern App Router config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
