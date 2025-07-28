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

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create logs directory:', err);
  }
}

const logFilePath = path.join(logsDir, 'stripe-webhook.log');

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

export const config = {
  api: {
    bodyParser: false,
  },
};

// Simple buffer implementation to handle raw request body
async function buffer(readable: NodeJS.ReadableStream): Promise<Buffer> {
  // Use Uint8Array[] instead of any[] to fix TypeScript compatibility issue
  const chunks: Uint8Array[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = uuidv4().substring(0, 8);
  logMessage(`[${requestId}] Webhook handler received a request`);
  
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf as Buffer, sig, webhookSecret);
      logMessage(`[${requestId}] Successfully verified Stripe event: ${event.type}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = `Webhook Error: ${err.message}`;
        logMessage(`[${requestId}] ${errorMessage}`);
        return res.status(400).send(errorMessage);
      } else {
        logMessage(`[${requestId}] Webhook Error: An unexpected error occurred`);
        return res.status(400).send('Webhook Error: An unexpected error occurred');
      }
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        logMessage(`[${requestId}] Processing checkout.session.completed for session ${session.id}`);

        // Connect to MongoDB
        try {
          await mongoClient.connect();
          logMessage(`[${requestId}] Successfully connected to MongoDB`);
        } catch (mongoConnectError) {
          logMessage(`[${requestId}] MongoDB connection error: ${mongoConnectError}`);
          return res.status(500).json({ error: 'Failed to connect to database' });
        }
        
        const db = mongoClient.db(); // Get default database
        
        // Ensure clients collection exists
        let clientsCollection;
        try {
          const collections = await db.listCollections({ name: 'clients' }).toArray();
          if (collections.length === 0) {
            logMessage(`[${requestId}] Clients collection does not exist, creating it`);
            await db.createCollection('clients');
          }
          clientsCollection = db.collection('clients');
          logMessage(`[${requestId}] Successfully accessed clients collection`);
        } catch (collectionError) {
          logMessage(`[${requestId}] Error accessing/creating clients collection: ${collectionError}`);
          await mongoClient.close();
          return res.status(500).json({ error: 'Failed to access clients collection' });
        }

        // Extract customer info
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name;
        const stripeCustomerId = session.customer as string;
        
        logMessage(`[${requestId}] Processing transaction for customer: ${customerEmail || 'unknown'}, Stripe ID: ${stripeCustomerId}`);

        // Generate a unique client ID
        const clientId = uuidv4();

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
              // You might want to fetch line items here to get product details
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        try {
          // Check if client already exists by stripeCustomerId
          let existingClient;
          try {
            existingClient = await clientsCollection.findOne({ stripeCustomerId: stripeCustomerId });
            logMessage(`[${requestId}] Client lookup by Stripe ID ${stripeCustomerId}: ${existingClient ? 'Found' : 'Not found'}`);
          } catch (lookupError) {
            logMessage(`[${requestId}] Error looking up client: ${lookupError}`);
            // Continue with null existingClient, will create a new one
          }

          if (existingClient) {
            // Update existing client's purchases
            try {
              const updateResult = await clientsCollection.updateOne(
                { stripeCustomerId: stripeCustomerId },
                { $push: { purchases: clientData.purchases[0] }, $set: { updatedAt: new Date() } }
              );
              logMessage(`[${requestId}] Updated client ${stripeCustomerId} with new purchase. ModifiedCount: ${updateResult.modifiedCount}`);
            } catch (updateError) {
              logMessage(`[${requestId}] Error updating client: ${updateError}`);
              // If update fails, try inserting a new document
              await clientsCollection.insertOne(clientData);
              logMessage(`[${requestId}] Inserted new client ${clientId} after update failure`);
            }
          } else {
            // Insert new client
            try {
              const insertResult = await clientsCollection.insertOne(clientData);
              logMessage(`[${requestId}] New client ${clientId} created with ID: ${insertResult.insertedId}`);
            } catch (insertError) {
              logMessage(`[${requestId}] Error inserting new client: ${insertError}`);
              throw insertError; // Re-throw to be caught by outer try-catch
            }
          }
          
          // IMPORTANT: Update the User model with subscription data
          if (customerEmail) {
            // Connect to Mongoose to use the User model
            await connectMongo();
            
            // Find the user by email
            const user = await User.findOne({ email: customerEmail });
            
            if (user) {
              console.log(`Found user with email ${customerEmail}, updating subscription data`);
              
              // Get subscription details from Stripe
              let _subscriptionDetails; // Prefixed with _ to indicate it's unused
              let planName = 'Starter Plan'; // Default
              let planLimits = 80; // Default minutes for Starter
              
              // If there's a subscription ID in the session metadata, fetch it
              if (session.subscription) {
                try {
                  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                  
                  // Get the price ID from the subscription
                  const priceId = subscription.items.data[0]?.price.id;
                  
                  // Determine plan name and limits based on price ID
                  // These should match your Stripe product configuration
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
                  
                  // Update user's subscription data
                  await User.updateOne(
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
                  
                  console.log(`Updated user ${customerEmail} with subscription data for ${planName}`);
                } catch (stripeError) {
                  console.error('Error fetching subscription details from Stripe:', stripeError);
                }
              }
            } else {
              console.log(`No user found with email ${customerEmail}`);
            }
          }
        } catch (dbError) {
          logMessage(`[${requestId}] MongoDB operation failed: ${dbError}`);
          return res.status(500).json({ error: 'Database operation failed' });
        } finally {
          try {
            await mongoClient.close();
            logMessage(`[${requestId}] MongoDB connection closed`);
          } catch (closeError) {
            logMessage(`[${requestId}] Error closing MongoDB connection: ${closeError}`);
          }
        }

        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        try {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          // Connect to Mongoose
          await connectMongo();
          
          // Find user by Stripe customer ID
          const user = await User.findOne({ customerId: customerId });
          
          if (user) {
            // Determine subscription status
            const status = subscription.status === 'active' ? 'active' : 
                          subscription.status === 'past_due' ? 'past_due' : 
                          subscription.status === 'canceled' ? 'canceled' : 'inactive';
            
            // Update user's subscription status
            await User.updateOne(
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
            
            console.log(`Updated subscription status to ${status} for user with customer ID ${customerId}`);
          } else {
            console.log(`No user found with customer ID ${customerId}`);
          }
        } catch (error) {
          console.error('Error handling subscription event:', error);
        }
        break;
        
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    logMessage(`[${requestId}] Webhook processed successfully`);
    res.status(200).json({ received: true, requestId });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
