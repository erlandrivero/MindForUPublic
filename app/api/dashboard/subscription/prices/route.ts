import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
  typescript: true,
});

export async function GET(req: NextRequest) {
  try {
    console.log('Starting subscription prices API route');
    
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch all active subscription prices from Stripe
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      limit: 100,
      expand: ['data.product']
    });
    
    console.log(`Found ${prices.data.length} active subscription prices`);
    
    // Format the prices for the frontend
    const formattedPrices = prices.data.map(price => {
      const product = price.product as Stripe.Product;
      
      return {
        id: price.id,
        productId: price.product as string,
        name: product.name,
        description: product.description,
        unitAmount: price.unit_amount,
        currency: price.currency,
        type: price.type,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count,
        nickname: price.nickname,
        metadata: price.metadata,
        active: price.active
      };
    });
    
    return NextResponse.json({ 
      success: true,
      prices: formattedPrices
    });
    
  } catch (error: any) {
    console.error('Subscription prices API error:', error);
    return NextResponse.json({ 
      error: `An unexpected error occurred: ${error.message}` 
    }, { status: 500 });
  }
}
