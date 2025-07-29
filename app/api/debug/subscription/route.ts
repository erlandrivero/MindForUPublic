import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { MongoClient } from 'mongodb';

// This is a debug-only endpoint to help diagnose subscription issues
export async function GET(_req: NextRequest) {
  try {
    console.log('Starting debug subscription API route');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    // Get user data from User model
    const user = await User.findOne({ email: session.user.email });
    console.log('User model subscription data:', user.subscription || 'No subscription data');
    
    // Initialize debug response
    const debugData: any = {
      userEmail: session.user.email,
      userModelSubscription: user.subscription || null,
      clientsData: null,
      allPurchases: [],
      paidPurchases: [],
      sortedPurchases: [],
      latestPurchase: null,
      error: null
    };

    // Connect directly to MongoDB to query the clients collection
    try {
      console.log('MongoDB URI:', process.env.MONGODB_URI ? 'defined' : 'undefined');
      const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
      await mongoClient.connect();
      console.log('MongoDB connected successfully');
      const db = mongoClient.db();
      const clientsCollection = db.collection('clients');
      
      // Find the client data for this user's email
      const clientData = await clientsCollection.findOne({ email: session.user.email });
      console.log('Client data found:', clientData ? 'Yes' : 'No');
      
      if (clientData) {
        // Add basic client data to debug response (excluding purchases for now)
        const { purchases, ...clientDataWithoutPurchases } = clientData;
        debugData.clientsData = clientDataWithoutPurchases;
        
        if (purchases && purchases.length > 0) {
          console.log(`Found ${purchases.length} purchases in client data`);
          
          // Add all purchases to debug response
          debugData.allPurchases = purchases.map((p: any) => ({
            id: p.id,
            amount_total: p.amount_total,
            payment_status: p.payment_status,
            created: p.created,
            createdAt: p.createdAt
          }));
          
          // Filter for purchases with paid status
          const paidPurchases = purchases.filter((p: any) => p.payment_status === 'paid');
          console.log(`Found ${paidPurchases.length} paid purchases out of ${purchases.length} total`);
          
          debugData.paidPurchases = paidPurchases.map((p: any) => ({
            id: p.id,
            amount_total: p.amount_total,
            payment_status: p.payment_status,
            created: p.created,
            createdAt: p.createdAt
          }));
          
          if (paidPurchases.length > 0) {
            // Sort paid purchases by date (newest first) using either created or createdAt field
            console.log('Sorting purchases by createdAt/created date (newest first)...');
            const sortedPurchases = [...paidPurchases].sort((a: any, b: any) => {
              // Use createdAt if available, fall back to created
              const dateA = a.createdAt || a.created;
              const dateB = b.createdAt || b.created;
              
              // Convert to timestamp and compare (newest first)
              const timeA = new Date(dateA).getTime();
              const timeB = new Date(dateB).getTime();
              return timeB - timeA;
            });
            
            debugData.sortedPurchases = sortedPurchases.map((p: any) => ({
              id: p.id,
              amount_total: p.amount_total,
              payment_status: p.payment_status,
              created: p.created ? new Date(p.created).toISOString() : null,
              createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null
            }));
            
            // Get the latest purchase (first in sorted array)
            const latestPurchase = sortedPurchases[0];
            debugData.latestPurchase = {
              id: latestPurchase.id,
              amount_total: latestPurchase.amount_total,
              payment_status: latestPurchase.payment_status,
              created: latestPurchase.created ? new Date(latestPurchase.created).toISOString() : null,
              createdAt: latestPurchase.createdAt ? new Date(latestPurchase.createdAt).toISOString() : null
            };
            
            // Map amount to plan name for debugging
            const amountTotal = latestPurchase.amount_total;
            const numericAmount = typeof amountTotal === 'string' ? parseFloat(amountTotal) : amountTotal;
            
            let planName = 'Unknown Plan';
            if (numericAmount === 9900) {
              planName = 'Starter Plan';
            } else if (numericAmount === 24900) {
              planName = 'Professional Plan';
            } else if (numericAmount === 49900) {
              planName = 'Business Plan';
            } else if (numericAmount === 99900) {
              planName = 'Enterprise Plan';
            } else if (numericAmount === 199900) {
              planName = 'Enterprise Plus Plan';
            } else if (numericAmount >= 199000 && numericAmount <= 200000) {
              planName = 'Enterprise Plus Plan (approximate match)';
            }
            
            debugData.mappedPlan = {
              amount: numericAmount,
              planName: planName
            };
          }
        }
      }
      
      // Close the MongoDB connection
      await mongoClient.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error accessing clients collection:', error);
      debugData.error = {
        message: 'Error accessing clients collection',
        details: error instanceof Error ? error.message : String(error)
      };
    }
    
    return NextResponse.json(debugData);

  } catch (error) {
    console.error('Debug subscription API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
