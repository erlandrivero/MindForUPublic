import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
  typescript: true,
});

export async function POST(req: NextRequest) {
  try {
    console.log('Starting subscription cancellation API route');
    
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    await connectMongo();
    
    // Get the current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);
    let { subscriptionId } = body;
    
    console.log('Extracted ID:', subscriptionId);
    console.log('Type of ID:', typeof subscriptionId);
    
    // Check if this is a customer ID (starts with cus_) instead of a subscription ID
    if (subscriptionId && subscriptionId.startsWith('cus_')) {
      console.log('Received a customer ID instead of subscription ID. Fetching subscription from Stripe...');
      
      try {
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: subscriptionId,
          limit: 1,
          status: 'active'
        });
        
        console.log(`Found ${subscriptions.data.length} subscriptions for customer ${subscriptionId}`);
        
        if (subscriptions.data.length > 0) {
          // Use the most recent subscription
          subscriptionId = subscriptions.data[0].id;
          console.log(`Using subscription ID: ${subscriptionId}`);
        } else {
          console.log('No active subscriptions found for this customer');
          return NextResponse.json({ error: 'No active subscriptions found for this customer' }, { status: 404 });
        }
      } catch (stripeError) {
        console.error('Error fetching subscriptions from Stripe:', stripeError);
        return NextResponse.json({ error: 'Failed to retrieve subscription information' }, { status: 500 });
      }
    }
    
    if (!subscriptionId) {
      console.log('Error: Subscription ID is missing');
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }
    
    console.log(`Canceling subscription ${subscriptionId} for user ${user.email}`);
    
    // Check if user has a Stripe customer ID
    if (!user.customerId) {
      console.log('No Stripe customer ID found for user:', user.email);
      return NextResponse.json({ error: 'No Stripe customer ID found for this user' }, { status: 400 });
    }
    
    console.log('Found customer ID for user:', user.customerId);
    
    // Cancel the subscription in Stripe
    try {
      const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
      console.log('Subscription canceled in Stripe:', canceledSubscription.id);
      
      // Update user's subscription status in our database
      user.hasAccess = false;
      if (user.subscription) {
        user.subscription.status = 'canceled';
      }
      await user.save();
      
      // Update the clients collection if it exists
      try {
        const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
        await mongoClient.connect();
        const db = mongoClient.db();
        const clientsCollection = db.collection('clients');
        
        // Find the client record for this user
        const clientData = await clientsCollection.findOne({ 
          $or: [
            { email: user.email },
            { userId: user._id.toString() }
          ]
        });
        
        if (clientData) {
          // Update subscription status in clients collection
          await clientsCollection.updateOne(
            { _id: clientData._id },
            { 
              $set: { 
                'subscription.status': 'canceled',
                updatedAt: new Date()
              }
            }
          );
          console.log('Updated subscription status in clients collection');
        }
        
        await mongoClient.close();
      } catch (mongoError) {
        console.error('Error updating clients collection:', mongoError);
        // Continue even if clients collection update fails
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription canceled successfully',
        subscription: {
          id: canceledSubscription.id,
          status: canceledSubscription.status
        }
      });
      
    } catch (stripeError: any) {
      console.error('Error canceling subscription in Stripe:', stripeError);
      return NextResponse.json({ 
        error: `Failed to cancel subscription: ${stripeError.message}` 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Subscription cancellation API error:', error);
    return NextResponse.json({ 
      error: `An unexpected error occurred: ${error.message}` 
    }, { status: 500 });
  }
}
