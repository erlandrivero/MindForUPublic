import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
  typescript: true,
});

export async function POST(req: NextRequest) {
  try {
    console.log('Starting subscription checkout API route');
    
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
    const { priceId, successUrl, cancelUrl } = body;
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }
    
    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Success and cancel URLs are required' }, { status: 400 });
    }
    
    console.log(`Creating checkout session for price ${priceId} for user ${user.email}`);
    
    try {
      // Check if user already has a Stripe customer ID
      let customerId = user.stripeCustomerId;
      
      // If not, create a new customer in Stripe
      if (!customerId) {
        console.log(`Creating new Stripe customer for user ${user.email}`);
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: user._id.toString()
          }
        });
        
        customerId = customer.id;
        
        // Save the customer ID to the user record
        user.stripeCustomerId = customerId;
        await user.save();
        
        console.log(`Created new Stripe customer: ${customerId}`);
      }
      
      // Create a checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        client_reference_id: user._id.toString(),
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          metadata: {
            userId: user._id.toString()
          }
        },
        allow_promotion_codes: false, // Disable promotion codes
        metadata: {
          userId: user._id.toString()
        }
      });
      
      console.log(`Created checkout session: ${checkoutSession.id}`);
      
      return NextResponse.json({ 
        success: true,
        url: checkoutSession.url
      });
      
    } catch (stripeError: any) {
      console.error('Error creating checkout session:', stripeError);
      return NextResponse.json({ 
        error: `Failed to create checkout session: ${stripeError.message}` 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Subscription checkout API error:', error);
    return NextResponse.json({ 
      error: `An unexpected error occurred: ${error.message}` 
    }, { status: 500 });
  }
}
