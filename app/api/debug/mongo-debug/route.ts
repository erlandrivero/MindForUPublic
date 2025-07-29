import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { MongoClient } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('MongoDB Debug API called by:', session.user.email);
    
    // Connect to MongoDB
    const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    
    const db = mongoClient.db();
    
    // Get user from database
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get client data
    const clientData = await db.collection('clients').findOne({ userId: user._id });
    
    // Prepare response data
    const responseData: any = {
      user: {
        email: user.email,
        subscription: user.subscription || null
      },
      client: clientData ? {
        email: clientData.email,
        userId: clientData.userId,
        hasSubscription: !!clientData.subscription,
        purchaseCount: clientData.purchases ? clientData.purchases.length : 0
      } : null
    };
    
    // Add detailed purchase data if available
    if (clientData?.purchases?.length > 0) {
      // Map purchases to a simplified format
      responseData.purchases = clientData?.purchases?.map((purchase: any) => ({
        id: purchase.id,
        amount_total: purchase.amount_total,
        payment_status: purchase.payment_status,
        created: purchase.created,
        createdAt: purchase.createdAt
      })) || [];
      
      // Sort purchases by date (newest first)
      const sortedPurchases = [...(clientData?.purchases || [])].sort((a: any, b: any) => {
        const dateA = a.createdAt || a.created;
        const dateB = b.createdAt || b.created;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      // Add latest purchase
      if (sortedPurchases.length > 0) {
        const latest = sortedPurchases[0];
        responseData.latestPurchase = {
          id: latest.id,
          amount_total: latest.amount_total,
          payment_status: latest.payment_status,
          created: latest.created,
          createdAt: latest.createdAt
        };
      }
      
      // Filter for paid purchases
      const paidPurchases = clientData?.purchases?.filter((p: any) => p.payment_status === 'paid') || [];
      
      // Sort paid purchases by date
      const sortedPaidPurchases = [...paidPurchases].sort((a: any, b: any) => {
        const dateA = a.createdAt || a.created;
        const dateB = b.createdAt || b.created;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      // Add latest paid purchase
      if (sortedPaidPurchases.length > 0) {
        const latestPaid = sortedPaidPurchases[0];
        responseData.latestPaidPurchase = {
          id: latestPaid.id,
          amount_total: latestPaid.amount_total,
          payment_status: latestPaid.payment_status,
          created: latestPaid.created,
          createdAt: latestPaid.createdAt
        };
      }
    }
    
    // Add subscription data if available
    if (clientData?.subscription) {
      responseData.subscription = clientData.subscription;
    }
    
    await mongoClient.close();
    console.log('MongoDB Debug API completed');
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('MongoDB Debug API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
