import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import fs from 'fs';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

const mongoClient = new MongoClient(process.env.MONGODB_URI as string);

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple buffer implementation to handle raw request body
async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  // @ts-ignore - Ignoring type issues with Buffer.concat
  const chunks: any[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Debug logging function
function logToFile(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}${data ? ' - ' + JSON.stringify(data, null, 2) : ''}\n`;
  
  try {
    // Create logs directory if it doesn't exist
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(path.join(logDir, 'stripe-webhook-debug.log'), logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
  
  // Also log to console
  console.log(message, data || '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logToFile('Webhook handler called with method: ' + req.method);
  
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    logToFile('Received webhook request with signature', { signatureLength: sig?.length || 0 });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf as Buffer, sig, webhookSecret);
      logToFile('Successfully constructed event', { type: event.type, id: event.id });
    } catch (err: unknown) {
      if (err instanceof Error) {
        logToFile(`Webhook Error: ${err.message}`);
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      } else {
        logToFile('Webhook Error: An unexpected error occurred');
        return res.status(400).send('Webhook Error: An unexpected error occurred');
      }
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        logToFile('Processing checkout.session.completed', { sessionId: session.id });

        // Connect to MongoDB
        try {
          logToFile('Connecting to MongoDB...');
          await mongoClient.connect();
          logToFile('MongoDB connected successfully');
          
          const db = mongoClient.db(); // Get default database
          const clientsCollection = db.collection('clients');

          // Extract customer info
          const customerEmail = session.customer_details?.email;
          const customerName = session.customer_details?.name;
          const stripeCustomerId = session.customer as string;

          logToFile('Customer info extracted', { customerEmail, customerName, stripeCustomerId });

          // Generate a unique client ID
          const clientId = uuidv4();
          logToFile('Generated client ID', { clientId });

          // Prepare client data for MongoDB
          const clientData = {
            clientId: clientId,
            stripeCustomerId: stripeCustomerId,
            email: customerEmail,
            name: customerName,
            purchases: [
              {
                sessionId: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                payment_status: session.payment_status,
                created: new Date(session.created * 1000),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          logToFile('Prepared client data', clientData);

          try {
            // Check if client already exists by stripeCustomerId
            logToFile('Checking if client exists', { stripeCustomerId });
            const existingClient = await clientsCollection.findOne({ stripeCustomerId: stripeCustomerId });
            logToFile('Client exists check result', { exists: !!existingClient });

            if (existingClient) {
              // Update existing client's purchases
              logToFile('Updating existing client', { clientId: existingClient.clientId || existingClient._id });
              const updateResult = await clientsCollection.updateOne(
                { stripeCustomerId: stripeCustomerId },
                { $push: { purchases: clientData.purchases[0] }, $set: { updatedAt: new Date() } }
              );
              logToFile('Update result', { matchedCount: updateResult.matchedCount, modifiedCount: updateResult.modifiedCount });
            } else {
              // Insert new client
              logToFile('Inserting new client', { clientId });
              const insertResult = await clientsCollection.insertOne(clientData);
              logToFile('Insert result', { acknowledged: insertResult.acknowledged, insertedId: insertResult.insertedId });
            }
            
            // IMPORTANT: Update the User model with subscription data
            if (customerEmail) {
              // Connect to Mongoose to use the User model
              logToFile('Connecting to Mongoose for User model');
              await connectMongo();
              
              // Find the user by email
              logToFile('Finding user by email', { email: customerEmail });
              const user = await User.findOne({ email: customerEmail });
              
              if (user) {
                logToFile('Found user', { userId: user._id });
                
                // Get subscription details from Stripe
                let planName = 'Starter Plan'; // Default
                let planLimits = 80; // Default minutes for Starter
                
                // If there's a subscription ID in the session metadata, fetch it
                if (session.subscription) {
                  try {
                    logToFile('Retrieving subscription from Stripe', { subscriptionId: session.subscription });
                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                    
                    // Get the price ID from the subscription
                    const priceId = subscription.items.data[0]?.price.id;
                    logToFile('Retrieved price ID', { priceId });
                    
                    // Determine plan name and limits based on price ID
                    switch (priceId) {
                      case process.env.STRIPE_PRICE_PROFESSIONAL:
                        planName = 'Professional Plan';
                        planLimits = 250;
                        break;
                      case process.env.STRIPE_PRICE_BUSINESS:
                        planName = 'Business Plan';
                        planLimits = 600;
                        break;
                      case process.env.STRIPE_PRICE_ENTERPRISE:
                        planName = 'Enterprise Plan';
                        planLimits = 1500;
                        break;
                      case process.env.STRIPE_PRICE_ENTERPRISE_PLUS:
                        planName = 'Enterprise Plus Plan';
                        planLimits = 3500;
                        break;
                      default:
                        planName = 'Starter Plan';
                        planLimits = 80;
                    }
                    
                    logToFile('Determined plan details', { planName, planLimits });
                    
                    // Update user's subscription data
                    logToFile('Updating user subscription data');
                    const userUpdateResult = await User.updateOne(
                      { email: customerEmail },
                      {
                        $set: {
                          customerId: stripeCustomerId,
                          'subscription.planName': planName,
                          'subscription.status': 'active',
                          'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
                          'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                          'subscription.billingCycle': subscription.items.data[0]?.plan.interval === 'year' ? 'yearly' : 'monthly',
                          'usage.minutesLimit': planLimits,
                          hasAccess: true
                        }
                      }
                    );
                    
                    logToFile('User update result', { matchedCount: userUpdateResult.matchedCount, modifiedCount: userUpdateResult.modifiedCount });
                  } catch (stripeError: any) {
                    logToFile('Error fetching subscription details from Stripe', { error: stripeError.message });
                  }
                }
              } else {
                logToFile('No user found with email', { email: customerEmail });
              }
            }
          } catch (dbError: any) {
            logToFile('MongoDB operation failed', { error: dbError.message, stack: dbError.stack });
            console.error('MongoDB operation failed:', dbError);
            return res.status(500).json({ error: 'Database operation failed', details: dbError.message });
          }
        } catch (connectionError: any) {
          logToFile('MongoDB connection failed', { error: connectionError.message, stack: connectionError.stack });
          console.error('MongoDB connection failed:', connectionError);
          return res.status(500).json({ error: 'Database connection failed', details: connectionError.message });
        } finally {
          logToFile('Closing MongoDB connection');
          await mongoClient.close();
        }

        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        logToFile(`Processing ${event.type} event`);
        try {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          logToFile('Subscription event details', { customerId, status: subscription.status });
          
          // Connect to Mongoose
          await connectMongo();
          
          // Find user by Stripe customer ID
          const user = await User.findOne({ customerId: customerId });
          
          if (user) {
            logToFile('Found user for subscription update', { userId: user._id });
            
            // Determine subscription status
            const status = subscription.status === 'active' ? 'active' : 
                          subscription.status === 'past_due' ? 'past_due' : 
                          subscription.status === 'canceled' ? 'canceled' : 'inactive';
            
            // Update user's subscription status
            const updateResult = await User.updateOne(
              { customerId: customerId },
              {
                $set: {
                  'subscription.status': status,
                  'subscription.currentPeriodStart': new Date(subscription.current_period_start * 1000),
                  'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
                  hasAccess: status === 'active'
                }
              }
            );
            
            logToFile('Updated subscription status', { 
              status, 
              matchedCount: updateResult.matchedCount, 
              modifiedCount: updateResult.modifiedCount 
            });
          } else {
            logToFile('No user found with customer ID', { customerId });
          }
        } catch (error: any) {
          logToFile('Error handling subscription event', { error: error.message, stack: error.stack });
        }
        break;
        
      // Add more event types as needed
      default:
        logToFile(`Unhandled event type ${event.type}`);
    }

    logToFile('Webhook processing completed successfully');
    res.status(200).json({ received: true });
  } else {
    logToFile('Method not allowed', { method: req.method });
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
