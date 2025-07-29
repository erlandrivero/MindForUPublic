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

// Helper function to cancel an existing subscription
async function cancelExistingSubscription(requestId: string, customerId: string, newSubscriptionId: string) {
  try {
    logMessage(`[${requestId}] Checking for existing subscriptions to cancel for customer ${customerId}`);
    
    // List all active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });
    
    // Filter out the new subscription we just created
    const existingSubscriptions = subscriptions.data.filter(sub => sub.id !== newSubscriptionId);
    
    if (existingSubscriptions.length > 0) {
      logMessage(`[${requestId}] Found ${existingSubscriptions.length} existing subscription(s) to cancel`);
      
      // Cancel each existing subscription
      for (const subscription of existingSubscriptions) {
        logMessage(`[${requestId}] Cancelling subscription ${subscription.id}`);
        
        await stripe.subscriptions.cancel(subscription.id, {
          prorate: true, // Prorate the unused portion
        });
        
        logMessage(`[${requestId}] Successfully cancelled subscription ${subscription.id}`);
      }
    } else {
      logMessage(`[${requestId}] No existing subscriptions found to cancel`);
    }
    
    return true;
  } catch (error) {
    logMessage(`[${requestId}] Error cancelling existing subscriptions: ${error}`);
    return false;
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
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
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
      case 'customer.subscription.created':
        const newSubscription = event.data.object as Stripe.Subscription;
        logMessage(`[${requestId}] Processing new subscription ${newSubscription.id}`);
        
        // Get customer details from Stripe
        try {
          const customer = await stripe.customers.retrieve(newSubscription.customer as string);
          if (customer && !customer.deleted) {
            const customerEmail = customer.email;
            
            if (customerEmail) {
              // Connect to Mongoose to use the User model
              await connectMongo();
              
              // Find the user by email
              const user = await User.findOne({ email: customerEmail });
              
              if (user) {
                logMessage(`[${requestId}] Found user with email ${customerEmail}, updating subscription data`);
                
                // Cancel any existing subscriptions for this customer
                await cancelExistingSubscription(requestId, newSubscription.customer as string, newSubscription.id);
                
                // Get the price ID from the subscription
                const priceId = newSubscription.items.data[0]?.price.id;
                
                // Determine plan name and limits based on price ID
                let planName = 'Starter Plan'; // Default
                let planLimits = 80; // Default minutes for Starter
                
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
                      customerId: newSubscription.customer as string,
                      'subscription.id': newSubscription.id,
                      'subscription.planName': planName,
                      'subscription.status': newSubscription.status,
                      'subscription.currentPeriodStart': new Date(newSubscription.current_period_start * 1000),
                      'subscription.currentPeriodEnd': new Date(newSubscription.current_period_end * 1000),
                      'subscription.billingCycle': newSubscription.items.data[0]?.plan.interval === 'year' ? 'yearly' : 'monthly',
                      'subscription.cancelAtPeriodEnd': newSubscription.cancel_at_period_end,
                      'usage.minutesLimit': planLimits,
                      hasAccess: newSubscription.status === 'active'
                    }
                  }
                );
                
                logMessage(`[${requestId}] Updated user ${customerEmail} with subscription data for ${planName}`);
              } else {
                logMessage(`[${requestId}] No user found with email ${customerEmail}`);
              }
            } else {
              logMessage(`[${requestId}] No email found for customer ${newSubscription.customer}`);
            }
          } else {
            logMessage(`[${requestId}] Customer ${newSubscription.customer} not found or deleted`);
          }
        } catch (error) {
          logMessage(`[${requestId}] Error processing subscription event: ${error}`);
        }
        break;
        
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
        try {
          const updatedSubscription = event.data.object as Stripe.Subscription;
          const customerId = updatedSubscription.customer as string;
          
          // Connect to Mongoose
          await connectMongo();
          
          // Find user by Stripe customer ID
          const user = await User.findOne({ customerId: customerId });
          
          if (user) {
            // Determine subscription status
            const status = updatedSubscription.status === 'active' ? 'active' : 
                          updatedSubscription.status === 'past_due' ? 'past_due' : 
                          updatedSubscription.status === 'canceled' ? 'canceled' : 'inactive';
            
            // Update user's subscription status
            await User.updateOne(
              { customerId: customerId },
              {
                $set: {
                  'subscription.status': status,
                  'subscription.currentPeriodStart': new Date(updatedSubscription.current_period_start * 1000),
                  'subscription.currentPeriodEnd': new Date(updatedSubscription.current_period_end * 1000),
                  hasAccess: status === 'active'
                }
              }
            );
            
            logMessage(`[${requestId}] Updated subscription status to ${status} for user with customer ID ${customerId}`);
          } else {
            logMessage(`[${requestId}] No user found with customer ID ${customerId}`);
          }
        } catch (error) {
          logMessage(`[${requestId}] Error handling subscription update event: ${error}`);
        }
        break;
        
      case 'customer.subscription.deleted':
        try {
          const deletedSubscription = event.data.object as Stripe.Subscription;
          const customerId = deletedSubscription.customer as string;
          
          // Connect to Mongoose
          await connectMongo();
          
          // Find user by Stripe customer ID
          const user = await User.findOne({ customerId: customerId });
          
          if (user) {
            // Update user's subscription status to canceled
            await User.updateOne(
              { customerId: customerId },
              {
                $set: {
                  'subscription.status': 'canceled',
                  'subscription.currentPeriodEnd': new Date(deletedSubscription.current_period_end * 1000),
                  'subscription.cancelAtPeriodEnd': true,
                  hasAccess: false
                }
              }
            );
            
            logMessage(`[${requestId}] Updated subscription status to canceled for user with customer ID ${customerId}`);
          } else {
            logMessage(`[${requestId}] No user found with customer ID ${customerId}`);
          }
        } catch (error) {
          logMessage(`[${requestId}] Error handling subscription deletion event: ${error}`);
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
