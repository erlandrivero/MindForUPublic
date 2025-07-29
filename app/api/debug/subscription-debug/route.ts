import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import clientPromise from '@/libs/mongo';
import { ObjectId, MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to MongoDB
    const mongoClient = await clientPromise;
    if (!mongoClient) {
      return NextResponse.json({ error: 'Failed to connect to MongoDB' }, { status: 500 });
    }
    const db = mongoClient.db();
    
    // Get the user from the database
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: session.user.email });
    
    if (!user) {
      await mongoClient.close();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all client records for this user
    const clientsCollection = db.collection('clients');
    const allClients = await clientsCollection.find({ 
      $or: [
        { email: session.user.email },
        { userId: user._id.toString() },
        { clientId: user._id.toString() }
      ]
    }).toArray();
    
    // Extract all transactions from all clients
    const allTransactions = [];
    for (const client of allClients) {
      if (client.purchases && Array.isArray(client.purchases)) {
        for (const purchase of client.purchases) {
          allTransactions.push({
            ...purchase,
            source: 'purchases',
            clientId: client._id.toString()
          });
        }
      }
      
      if (client.transactions && Array.isArray(client.transactions)) {
        for (const transaction of client.transactions) {
          allTransactions.push({
            ...transaction,
            source: 'transactions',
            clientId: client._id.toString()
          });
        }
      }
    }
    
    // Sort transactions by date (newest first)
    allTransactions.sort((a, b) => {
      const aDate = new Date(
        a.createdAt || a.created || a.date || a.created_at || 0
      ).getTime();
      
      const bDate = new Date(
        b.createdAt || b.created || b.date || b.created_at || 0
      ).getTime();
      
      return bDate - aDate;
    });
    
    // Map each transaction to its plan
    const transactionsWithPlans = allTransactions.map(transaction => {
      const amount = transaction.amount_total || transaction.amount || 0;
      let planName = 'Unknown Plan';
      let minutesIncluded = 0;
      
      // Map amount to plan name
      if (amount === 9900 || amount === 99) {
        planName = 'Starter Plan';
        minutesIncluded = 80;
      } else if (amount === 24900 || amount === 249) {
        planName = 'Professional Plan';
        minutesIncluded = 250;
      } else if (amount === 49900 || amount === 499) {
        planName = 'Business Plan';
        minutesIncluded = 600;
      } else if (amount === 99900 || amount === 999) {
        planName = 'Enterprise Plan';
        minutesIncluded = 1500;
      } else if (amount === 199900 || amount === 1999) {
        planName = 'Enterprise Plus Plan';
        minutesIncluded = 3500;
      }
      
      // Get all date fields for debugging
      const dates = {
        createdAt: transaction.createdAt ? new Date(transaction.createdAt).toISOString() : null,
        created: transaction.created ? new Date(transaction.created).toISOString() : null,
        date: transaction.date ? new Date(transaction.date).toISOString() : null,
        created_at: transaction.created_at ? new Date(transaction.created_at).toISOString() : null,
      };
      
      // Calculate the effective date
      const effectiveDate = new Date(
        transaction.createdAt || 
        transaction.created || 
        transaction.date || 
        transaction.created_at || 
        0
      ).toISOString();
      
      return {
        ...transaction,
        planName,
        minutesIncluded,
        amount_dollars: amount / 100,
        dates,
        effectiveDate
      };
    });
    
    // Get the user's subscription from the user record
    const userSubscription = user.subscription || {};
    
    // Close MongoDB connection
    await mongoClient.close();
    
    // Return the debug data
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        subscription: userSubscription
      },
      clients: {
        count: allClients.length,
        ids: allClients.map(client => client._id.toString())
      },
      transactions: {
        count: allTransactions.length,
        items: transactionsWithPlans
      }
    });
    
  } catch (error) {
    console.error('Error in subscription debug endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
