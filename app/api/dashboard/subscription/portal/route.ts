import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting subscription portal API route');
    console.log('Environment:', process.env.NODE_ENV);
    
    // Parse request body
    const body = await req.json();
    console.log('Request body:', body);
    
    // Get customerId from request
    const requestCustomerId = body.customerId;
    console.log('Customer ID from request:', requestCustomerId);
    
    // Default return URL
    const returnUrl = body.returnUrl || process.env.NEXT_PUBLIC_URL || 'http://localhost:3001/dashboard';
    console.log('Return URL:', returnUrl);
    
    let stripeCustomerId = requestCustomerId;
    
    // If no customerId provided in request, try to get it from the user session
    if (!stripeCustomerId) {
      // Check authentication
      const session = await getServerSession(authOptions);
      
      // In production, require authentication
      if (process.env.NODE_ENV !== 'development' && !session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // If we have a session with an email, try to find the user
      if (session?.user?.email) {
        // Connect to MongoDB and get user
        await connectMongo();
        const user = await User.findOne({ email: session.user.email });
        
        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        stripeCustomerId = user.stripeCustomerId;
      }
    }
    
    // Check if we have a Stripe customer ID
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer ID found' }, { status: 400 });
    }

    // Initialize Stripe
    console.log('Initializing Stripe with API key:', process.env.STRIPE_SECRET_KEY ? 'Key exists' : 'Key missing');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-08-16',
    });

    // Create a Stripe customer portal session
    console.log('Creating portal session with customer ID:', stripeCustomerId);
    
    // Create the portal session and get the URL
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });
    
    console.log('Portal session created successfully');
    console.log('Portal URL:', portalSession.url);
    
    // Return the URL to redirect to
    return NextResponse.json({ url: portalSession.url });

  } catch (error) {
    console.error('Subscription portal API error:', error);
    
    // Return more detailed error information in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
