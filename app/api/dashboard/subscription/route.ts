import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { MongoClient } from 'mongodb';

// Simplified subscription API that directly displays the latest transaction from clients collection
export async function GET(_req: NextRequest) {
  try {
    console.log('==== SIMPLIFIED SUBSCRIPTION API START ====');
    
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`Fetching subscription data for user: ${session.user.email}`);

    // Connect to MongoDB and get user data
    await connectMongo();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.log(`User not found: ${session.user.email}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get usage data from user model (we'll still need this)
    const userUsage = user.usage || {};
    
    // Initialize empty subscription data (for new users with no transactions)
    let subscriptionData = {
      id: '',
      planName: '',
      planPrice: 0,
      billingCycle: 'monthly',
      status: '',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      minutesIncluded: 0,
      minutesUsed: userUsage.minutesUsed || 0,
      nextBillingDate: new Date(),
      source: ''
    };
    
    // Connect to MongoDB to access clients collection directly
    const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
    await mongoClient.connect();
    console.log('MongoDB connected successfully');
    const db = mongoClient.db();
    const clientsCollection = db.collection('clients');
    
    // Find all client data for this user (by email and by ID)
    console.log(`Looking for clients with email: ${session.user.email} or ID: ${user._id}`);
    
    // First try to find by email
    const clientDataByEmail = await clientsCollection.findOne({ email: session.user.email });
    console.log('Client data found by email:', clientDataByEmail ? 'Yes' : 'No');
    
    // Also try to find by user ID (in case there are multiple client records)
    const clientDataById = await clientsCollection.findOne({ userId: user._id.toString() });
    console.log('Client data found by ID:', clientDataById ? 'Yes' : 'No');
    
    // Also try to find by clientId that might match the user ID
    const clientDataByClientId = await clientsCollection.findOne({ clientId: user._id.toString() });
    console.log('Client data found by clientId:', clientDataByClientId ? 'Yes' : 'No');
    
    // Get all clients for this user with more flexible matching
    const userId = user._id.toString();
    const userObjectId = user._id;
    
    console.log(`Searching for clients with userId: ${userId} or email: ${session.user.email}`);
    
    // Use $or to handle different userId formats and email
    const allClients = await clientsCollection.find({
      $or: [
        { email: session.user.email },
        { userId: userId }, // userId as string
        { userId: userObjectId }, // userId as ObjectId
        { 'userId.$oid': userId }, // userId as nested ObjectId format
        { clientId: userId },
        { 'clientId.$oid': userId }
      ]
    }).toArray();
    
    console.log(`Found ${allClients.length} total client records for this user`);
    console.log('ALL CLIENT RECORDS IDs:', allClients.map(c => c._id.toString()));
    
    // Collect ALL transactions from ALL client records
    let allTransactions: any[] = [];
    
    for (const client of allClients) {
      // Get transactions from both purchases and transactions arrays
      const clientTransactions = [
        ...(client.purchases || []),
        ...(client.transactions || [])
      ];
      
      if (clientTransactions.length > 0) {
        console.log(`Found ${clientTransactions.length} transactions in client ${client._id}`);
        allTransactions = [...allTransactions, ...clientTransactions];
      }
    }
    
    console.log(`Total transactions found across all clients: ${allTransactions.length}`);
    
    if (allTransactions.length > 0) {
      // Find the latest transaction by createdAt date
      let latestTransaction = null;
      let latestDate = 0;
      
      for (const transaction of allTransactions) {
        // Get the date from any available date field
        const createdAtDate = transaction.createdAt ? new Date(transaction.createdAt).getTime() : 0;
        const createdDate = transaction.created ? new Date(transaction.created).getTime() : 0;
        const dateField = transaction.date ? new Date(transaction.date).getTime() : 0;
        const createdAtField = transaction.created_at ? new Date(transaction.created_at).getTime() : 0;
        
        // Use the most recent date available
        const transactionDate = Math.max(
          createdAtDate,
          createdDate,
          dateField,
          createdAtField
        );
        
        // Check if this is the latest transaction we've seen
        if (transactionDate > latestDate) {
          latestDate = transactionDate;
          latestTransaction = transaction;
          console.log(`New latest transaction found: $${(transaction.amount_total || transaction.amount)/100}, date: ${new Date(transactionDate).toISOString()}`);
        }
      }
        
      if (latestTransaction) {
        console.log('Latest transaction found:', JSON.stringify(latestTransaction, null, 2));
        
        // Check if the subscription is cancelled
        const isCancelled = latestTransaction.status === 'canceled' || latestTransaction.canceled === true;
        
        // Get the amount and normalize it (Stripe stores amounts in cents)
        const amount = latestTransaction.amount_total || latestTransaction.amount || 0;
        const normalizedAmount = amount >= 1000 ? amount / 100 : amount; // If > 1000, assume it's in cents
        
        console.log(`Transaction amount: ${amount}, normalized: ${normalizedAmount}`);
        
        // Map amount to plan name and minutes
        let planName = 'Unknown Plan';
        let minutesIncluded = 0;
        
        // Map based on amount
        if (normalizedAmount >= 90 && normalizedAmount <= 110) {
          planName = 'Starter Plan';
          minutesIncluded = 80;
        } else if (normalizedAmount >= 240 && normalizedAmount <= 260) {
          planName = 'Professional Plan';
          minutesIncluded = 250;
        } else if (normalizedAmount >= 490 && normalizedAmount <= 510) {
          planName = 'Business Plan';
          minutesIncluded = 600;
        } else if (normalizedAmount >= 990 && normalizedAmount <= 1010) {
          planName = 'Enterprise Plan';
          minutesIncluded = 1500;
        } else if (normalizedAmount >= 1990 && normalizedAmount <= 2010) {
          planName = 'Enterprise Plus Plan';
          minutesIncluded = 3500;
        }
        
        // Check for price_id match (most reliable)
        const priceId = latestTransaction.price_id || latestTransaction.priceId;
        if (priceId) {
          console.log(`Found price_id in transaction: ${priceId}`);
          // Map Stripe price IDs to plans
          if (priceId === 'price_1Rk7XePolIihCLBaGS6oTCPF') {
            planName = 'Starter Plan';
            minutesIncluded = 80;
          } else if (priceId === 'price_1Rk7YcPolIihCLBacMvpJNqS') {
            planName = 'Professional Plan';
            minutesIncluded = 250;
          } else if (priceId === 'price_1Rk7bFPolIihCLBaollaNxW0') {
            planName = 'Business Plan';
            minutesIncluded = 600;
          } else if (priceId === 'price_1Rk7dePolIihCLBamIyBPcTm') {
            planName = 'Enterprise Plan';
            minutesIncluded = 1500;
          } else if (priceId === 'price_1Rk7f3PolIihCLBanYQALl0n') {
            planName = 'Enterprise Plus Plan';
            minutesIncluded = 3500;
          }
        }
        
        console.log(`Mapped to plan: ${planName} with ${minutesIncluded} minutes`);
        
        // Set period dates based on transaction date
        const transactionDate = new Date(latestDate);
        const periodEnd = new Date(transactionDate);
        periodEnd.setMonth(periodEnd.getMonth() + 1); // Assuming monthly billing
        
        // Update subscription data with information from latest transaction
        subscriptionData = {
          id: latestTransaction.id || '',
          planName: planName,
          planPrice: normalizedAmount,
          billingCycle: 'monthly',
          status: isCancelled ? 'canceled' : 'active',
          currentPeriodStart: transactionDate,
          currentPeriodEnd: periodEnd,
          minutesIncluded: minutesIncluded,
          minutesUsed: userUsage.minutesUsed || 0,
          nextBillingDate: periodEnd,
          source: 'clients_collection'
        };
      }
    }
    
    // Close the MongoDB connection
    await mongoClient.close();
    console.log('MongoDB connection closed');
    
    // Add metadata about the subscription for debugging
    const metadata = {
      userId: user._id?.toString(),
      email: session.user.email,
      timestamp: new Date().toISOString(),
      hasTransaction: subscriptionData.planName !== '',
      transactionStatus: subscriptionData.status,
      dataSource: subscriptionData.source
    };
    
    console.log('Final subscription data:', JSON.stringify(subscriptionData, null, 2));
    console.log('==== SIMPLIFIED SUBSCRIPTION API END ====');
    
    return NextResponse.json({
      ...subscriptionData,
      _metadata: process.env.NODE_ENV === 'development' ? metadata : undefined
    });
  } catch (error) {
    console.error('=== SUBSCRIPTION API ERROR ===');
    console.error('Error details:');
    
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    } else {
      console.error('Unknown error type:', error);
    }
    
    console.error('=== END SUBSCRIPTION API ERROR ===');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
