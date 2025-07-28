import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';

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

// Helper function to log webhook events
async function logWebhookEvent(event: any) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    
    // Create webhook_logs collection if it doesn't exist
    if (!db.collection('webhook_logs')) {
      await db.createCollection('webhook_logs');
    }
    
    const webhookLogsCollection = db.collection('webhook_logs');
    
    // Log the webhook event
    await webhookLogsCollection.insertOne({
      eventId: event.id,
      eventType: event.type,
      timestamp: new Date(),
      data: event.data.object,
      rawEvent: event
    });
    
    console.log(`Logged webhook event ${event.id} of type ${event.type}`);
  } catch (error) {
    console.error('Failed to log webhook event:', error);
  } finally {
    await mongoClient.close();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf as Buffer, sig, webhookSecret);
      console.log(`Received webhook event: ${event.type} (${event.id})`);
      
      // Log the webhook event asynchronously (don't await)
      logWebhookEvent(event).catch(console.error);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      } else {
        return res.status(400).send('Webhook Error: An unexpected error occurred');
      }
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Processing checkout.session.completed for session ${session.id}`);

        // Connect to MongoDB
        try {
          await mongoClient.connect();
          console.log('MongoDB connected successfully');
          
          const database = mongoClient.db(); // Get default database
          const clientsCollection = database.collection('clients');

          // Extract customer info
          const customerEmail = session.customer_details?.email;
          const customerName = session.customer_details?.name;
          const stripeCustomerId = session.customer as string;

          console.log(`Customer info: ${customerEmail}, ${customerName}, ${stripeCustomerId}`);

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

          // Check if client already exists by stripeCustomerId
          const existingClient = await clientsCollection.findOne({ stripeCustomerId: stripeCustomerId });

          if (existingClient) {
            // Update existing client's purchases
            await clientsCollection.updateOne(
              { stripeCustomerId: stripeCustomerId },
              { $push: { purchases: clientData.purchases[0] }, $set: { updatedAt: new Date() } }
            );
            console.log(`Updated client ${stripeCustomerId} with new purchase.`);
          } else {
            // Insert new client
            await clientsCollection.insertOne(clientData);
            console.log(`New client ${clientId} created with data:`, clientData);
          }
          
          // IMPORTANT: Update the User model with subscription data
          if (customerEmail) {
            // Connect to Mongoose to use the User model
            await connectMongo();
            
            // Find the user by email
            const user = await User.findOne({ email: customerEmail });
            
            if (user) {
              console.log(`Found user with email ${customerEmail}, updating subscription data`);
              
              // Get subscription details from Stripe if available
              if (session.subscription) {
                try {
                  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                  
                  // Determine plan name and limits based on price ID
                  let planName = 'Starter Plan';
                  let planLimits = 80;
                  
                  const priceId = subscription.items.data[0]?.price.id;
                  
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
          console.error('MongoDB operation failed:', dbError);
          return res.status(500).json({ error: 'Database operation failed', details: dbError });
        } finally {
          await mongoClient.close();
          console.log('MongoDB connection closed');
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

    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
