import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

// Simple buffer implementation to handle raw request body
async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Log to console for immediate visibility
    console.log('WEBHOOK-TEST: Received webhook request');
    
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    
    console.log('WEBHOOK-TEST: Headers received:', JSON.stringify(req.headers));
    
    try {
      // Try to parse the raw body as JSON
      const rawBody = buf.toString('utf8');
      const parsedBody = JSON.parse(rawBody);
      console.log('WEBHOOK-TEST: Event type:', parsedBody.type);
      console.log('WEBHOOK-TEST: Event ID:', parsedBody.id);
      
      // If it's a checkout.session.completed event, log more details
      if (parsedBody.type === 'checkout.session.completed') {
        const session = parsedBody.data.object;
        console.log('WEBHOOK-TEST: Session ID:', session.id);
        console.log('WEBHOOK-TEST: Customer:', session.customer);
        console.log('WEBHOOK-TEST: Amount:', session.amount_total, session.currency);
      }
    } catch (parseError) {
      console.error('WEBHOOK-TEST: Failed to parse event JSON:', parseError);
    }
    
    // Return success regardless of verification to prevent retries
    res.status(200).json({ received: true, test: true });
  } else {
    // For GET requests, return a simple status page
    res.status(200).json({ 
      status: 'Webhook test endpoint active',
      message: 'This endpoint is for testing Stripe webhook delivery. Send POST requests here to test.',
      timestamp: new Date().toISOString()
    });
  }
}
