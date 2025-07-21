import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-08-16',
});

const mongoClient = new MongoClient(process.env.MONGODB_URI as string);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: NodeJS.ReadableStream) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf as Buffer, sig, webhookSecret);
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

        // Connect to MongoDB
        await mongoClient.connect();
        const db = mongoClient.db(); // Get default database
        const clientsCollection = db.collection('clients');

        // Extract customer info
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name;
        const stripeCustomerId = session.customer as string;

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
            console.log(`New client ${clientId} created.`);
          }
        } catch (dbError) {
          console.error('MongoDB operation failed:', dbError);
          return res.status(500).json({ error: 'Database operation failed' });
        } finally {
          await mongoClient.close();
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
