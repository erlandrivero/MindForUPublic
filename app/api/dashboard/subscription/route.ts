import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Call from '@/models/Call';
import { MongoClient } from 'mongodb';

export async function GET(_req: NextRequest) {
  try {
    console.log('Starting dashboard subscription API route');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize subscription data from user model as fallback
    const subscription = user.subscription || {};
    let planName = subscription.planName || '';
    let planPrice = subscription.planPrice || 0;
    const billingCycle = subscription.billingCycle || 'monthly';
    
    // Only set status and dates if there's a plan
    let status = planName ? (subscription.status || 'active') : '';
    let currentPeriodStart = planName ? (subscription.currentPeriodStart || new Date()) : null;
    let currentPeriodEnd = planName ? (subscription.currentPeriodEnd || new Date()) : null;
    
    // Get usage data
    const usage = user.usage || {};
    
    // Default to 0 minutes for users without a plan
    let minutesIncluded = planName ? 80 : 0;
    
    console.log('Checking clients collection for subscription data for user:', session.user.email);
    
    // Connect directly to MongoDB to query the clients collection
    try {
      console.log('MongoDB URI:', process.env.MONGODB_URI ? 'defined' : 'undefined');
      const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
      await mongoClient.connect();
      console.log('MongoDB connected successfully');
      const db = mongoClient.db();
      const clientsCollection = db.collection('clients');
      console.log('Querying clients collection for email:', session.user.email);
      
      // Find the client data for this user's email
      const clientData = await clientsCollection.findOne({ email: session.user.email });
      console.log('Client data found:', clientData ? 'Yes' : 'No');
      
      if (clientData) {
        console.log('Found client data in clients collection:', clientData);
        
        // Extract subscription data from clients collection
        // Check if client has purchases array and get the latest purchase
        if (clientData.purchases && clientData.purchases.length > 0) {
          // Sort purchases by created date (newest first) and get the first one
          const latestPurchase = [...clientData.purchases].sort((a, b) => 
            new Date(b.created).getTime() - new Date(a.created).getTime()
          )[0];
          
          // Calculate next billing date as one month after the latest transaction date
          const transactionDate = new Date(latestPurchase.created);
          const nextBillingDate = new Date(transactionDate);
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          console.log(`Transaction date: ${transactionDate.toISOString()}, Next billing: ${nextBillingDate.toISOString()}`);
          
          // Store the next billing date for later use
          currentPeriodEnd = nextBillingDate;
          
          const amountTotal = latestPurchase.amount_total;
          console.log(`Latest purchase amount_total: ${amountTotal} (type: ${typeof amountTotal})`);
          
          console.log('Checking plan based on amount_total:', amountTotal);
          console.log('Strict equality check with 49900:', amountTotal === 49900);
          console.log('Loose equality check with 49900:', amountTotal == 49900);
          console.log('Numeric comparison:', Number(amountTotal) === 49900);
          
          // Convert to number to ensure proper comparison
          const amountTotalNum = Number(amountTotal);
          
          if (amountTotalNum === 9900) { // $99.00
            planName = 'Starter Plan';
            planPrice = 99;
            minutesIncluded = 80;
            console.log('Detected Starter Plan from clients collection');
          } else if (amountTotalNum === 24900) { // $249.00
            planName = 'Professional Plan';
            planPrice = 249;
            minutesIncluded = 250;
            console.log('Detected Professional Plan from clients collection');
          } else if (amountTotalNum === 49900) { // $499.00
            planName = 'Business Plan';
            planPrice = 499;
            minutesIncluded = 600;
            console.log('Detected Business Plan from clients collection');
          } else if (amountTotalNum === 99900) { // $999.00
            planName = 'Enterprise Plan';
            planPrice = 999;
            minutesIncluded = 1500;
            console.log('Detected Enterprise Plan from clients collection');
          } else if (amountTotalNum === 199900) { // $1,999.00
            planName = 'Enterprise Plus Plan';
            planPrice = 1999;
            minutesIncluded = 3500;
            console.log('Detected Enterprise Plus Plan from clients collection');
          } else {
            console.log('No matching plan found for amount:', amountTotalNum);
          }
          
          // Update other subscription fields if available in client data
          if (clientData.subscription) {
            status = clientData.subscription.status || status;
            currentPeriodStart = clientData.subscription.current_period_start 
              ? new Date(clientData.subscription.current_period_start * 1000) 
              : currentPeriodStart;
            currentPeriodEnd = clientData.subscription.current_period_end 
              ? new Date(clientData.subscription.current_period_end * 1000) 
              : currentPeriodEnd;
          }
        }
      } else {
        console.log('No client data found in clients collection, using User model data');
      }
      
      await mongoClient.close();
    } catch (mongoError) {
      console.error('Error accessing clients collection:', mongoError);
      console.log('Falling back to User model subscription data');
    }
    
    // If we still have a User model subscription with planName, use it as fallback
    if (!planName && subscription.planName) {
      planName = subscription.planName;
      console.log(`Using User model plan name: ${planName}`);
      
      // Calculate minutes included based on plan name from User model
      const lowerPlanName = planName.toLowerCase();
      
      // Professional plan
      if (lowerPlanName.includes('professional')) {
        minutesIncluded = 250;
        planPrice = 249;
      }
      // Business plan
      else if (lowerPlanName.includes('business')) {
        minutesIncluded = 600;
        planPrice = 499;
      }
      // Enterprise plan
      else if (lowerPlanName.includes('enterprise')) {
        if (lowerPlanName.includes('plus')) {
          minutesIncluded = 3500;
          planPrice = 1999;
        } else {
          minutesIncluded = 1500;
          planPrice = 999;
        }
      }
      // Starter plan
      else if (lowerPlanName.includes('starter')) {
        minutesIncluded = 80;
        planPrice = 99;
      }
    }
    
    console.log(`Final plan name: ${planName}, Minutes included: ${minutesIncluded}`);
    
    // Override with usage limit if explicitly set
    if (usage.minutesLimit && usage.minutesLimit > 0) {
      minutesIncluded = usage.minutesLimit;
      console.log(`Overriding with explicit minutes limit: ${minutesIncluded}`);
    }
    
    // Get minutes used from MongoDB call records instead of Vapi
    let minutesUsed = 0;
    
    try {
      console.log('Fetching call statistics from MongoDB for subscription API');
      
      // Get all calls for this user from MongoDB
      const calls = await Call.find({ userId: user._id });
      console.log(`Found ${calls.length} calls in MongoDB for user ${user.email}`);
      
      // Calculate total duration in seconds
      let totalDurationSeconds = 0;
      calls.forEach(call => {
        totalDurationSeconds += call.duration || 0;
      });
      
      // Convert seconds to minutes and round up to nearest minute
      // Ensure at least 1 minute per call as a minimum fallback
      minutesUsed = Math.max(Math.ceil(totalDurationSeconds / 60), calls.length);
      console.log(`Total minutes used from MongoDB calls: ${minutesUsed}`);
      
    } catch (error) {
      console.error('Error calculating minutes used from MongoDB:', error);
      // Fall back to usage tracking if MongoDB query fails
      minutesUsed = usage.minutesUsed || 0;
    }
    
    console.log(`Calculated minutes used from Vapi calls: ${minutesUsed}`);
    
    // If we still have 0 minutes used, fall back to user.usage
    if (minutesUsed === 0 && usage.minutesUsed) {
      minutesUsed = usage.minutesUsed;
      console.log(`Falling back to user.usage.minutesUsed: ${minutesUsed}`);
    }
    
    // Format the response
    const subscriptionData = {
      id: user.customerId || 'sub_default',
      planName: planName,
      planPrice: planPrice,
      billingCycle: billingCycle,
      status: status,
      currentPeriodStart: currentPeriodStart,
      currentPeriodEnd: currentPeriodEnd,
      minutesIncluded: minutesIncluded,
      minutesUsed: minutesUsed,
      nextBillingDate: currentPeriodEnd
    };
    
    // Ensure we never return "Free Plan" as it doesn't exist
    if (subscriptionData.planName === 'Free Plan') {
      subscriptionData.planName = 'Starter Plan';
    }

    console.log('Subscription data:', subscriptionData);
    
    return NextResponse.json(subscriptionData);

  } catch (error) {
    console.error('Dashboard subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
