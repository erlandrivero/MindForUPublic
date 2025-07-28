import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import Call from '@/models/Call';
import { MongoClient } from 'mongodb';


export async function GET(_req: NextRequest) {
  try {
    console.log('Starting dashboard stats API route');
    console.log('VAPI_PRIVATE_KEY:', process.env.VAPI_PRIVATE_KEY ? 'Exists (first 4 chars): ' + process.env.VAPI_PRIVATE_KEY.substring(0, 4) : 'Missing');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get basic counts
    const totalAssistants = await Assistant.countDocuments({ userId: user._id });
    const activeAssistants = await Assistant.countDocuments({ userId: user._id, status: 'active' });
    
    // Get all assistants for this user
    const assistants = await Assistant.find({ userId: user._id });
    
    // Fetch call statistics from MongoDB instead of Vapi
    console.log('Fetching call statistics from MongoDB');
    
    let totalCalls = 0;
    let todaysCalls = 0;
    let successfulCalls = 0;
    let totalCallsForSuccessRate = 0;
    let totalMinutesUsed = 0;
    const recentCalls = [];
    
    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      // Get all calls for this user from MongoDB
      const calls = await Call.find({ userId: user._id }).sort({ createdAt: -1 }).populate('assistantId');
      console.log(`Found ${calls.length} calls in MongoDB for user ${user.email}`);
      
      // Calculate total calls
      totalCalls = calls.length;
      
      // Filter calls for today
      const todayCallsArray = calls.filter(call => {
        const callDate = new Date(call.createdAt);
        return callDate.getDate() === today.getDate() &&
               callDate.getMonth() === today.getMonth() &&
               callDate.getFullYear() === today.getFullYear();
      });
      todaysCalls = todayCallsArray.length;
      
      // Filter successful calls
      const successfulCallsArray = calls.filter(call => call.outcome === 'successful');
      successfulCalls = successfulCallsArray.length;
      totalCallsForSuccessRate = calls.length;
      
      // Calculate total minutes used
      let totalDurationSeconds = 0;
      calls.forEach(call => {
        totalDurationSeconds += call.duration || 0;
      });
      
      // Convert seconds to minutes and round up to nearest minute
      // Ensure at least 1 minute per call as a minimum fallback
      totalMinutesUsed = Math.max(Math.ceil(totalDurationSeconds / 60), calls.length);
      console.log(`Total minutes used from MongoDB calls: ${totalMinutesUsed}`);
      
      // Process recent calls for activity feed
      const recentCallsData = calls.slice(0, 5); // Get 5 most recent calls
      
      for (const call of recentCallsData) {
        // Get assistant name
        let assistantName = 'Unknown Assistant';
        if (call.assistantId) {
          // If assistantId is populated, it will be an object
          if (typeof call.assistantId === 'object' && call.assistantId !== null) {
            assistantName = (call.assistantId as any).name || 'Unknown Assistant';
          } else {
            // If not populated, try to find the assistant
            const assistant = assistants.find(a => a._id.toString() === call.assistantId.toString());
            if (assistant) {
              assistantName = assistant.name;
            }
          }
        }
        
        recentCalls.push({
          assistantName: assistantName,
          outcome: call.outcome,
          duration: call.duration || 0,
          phoneNumber: call.phoneNumber || 'Unknown',
          createdAt: call.createdAt,
          metadata: call.metadata || {}
        });
      }
      
    } catch (error) {
      console.error('Error fetching calls from MongoDB:', error);
    }
    
    // Sort recent calls by date (most recent first)
    recentCalls.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Calculate success rate
    const successRate = totalCallsForSuccessRate > 0 
      ? Math.round((successfulCalls / totalCallsForSuccessRate) * 100) 
      : 0;

    // Get user's plan limits based on subscription
    let planLimits = 0; // Default to 0 for new users
    let planName = 'Starter Plan'; // Default plan name
    
    // Connect to MongoDB directly to query the clients collection
    const mongoClient = new MongoClient(process.env.MONGODB_URI as string);
    try {
      await mongoClient.connect();
      const db = mongoClient.db();
      const clientsCollection = db.collection('clients');
      
      // Find client by email
      const client = await clientsCollection.findOne({ email: user.email });
      console.log('DEBUG - Client from clients collection:', client ? 'Found' : 'Not found');
      
      if (client) {
        // Get the most recent purchase
        if (client.purchases && client.purchases.length > 0) {
          // Sort purchases by created date (descending)
          const sortedPurchases = [...client.purchases].sort((a, b) => 
            new Date(b.created).getTime() - new Date(a.created).getTime()
          );
          
          const latestPurchase = sortedPurchases[0];
          console.log('DEBUG - Latest purchase amount:', latestPurchase.amount_total);
          
          // Determine plan based on amount
          if (latestPurchase.amount_total === 9900) { // $99.00
            planName = 'Starter Plan';
            planLimits = 80;
          } else if (latestPurchase.amount_total === 24900) { // $249.00
            planName = 'Professional Plan';
            planLimits = 250;
          } else if (latestPurchase.amount_total === 49900) { // $499.00
            planName = 'Business Plan';
            planLimits = 600;
          } else if (latestPurchase.amount_total === 99900) { // $999.00
            planName = 'Enterprise Plan';
            planLimits = 1500;
          } else if (latestPurchase.amount_total === 199900) { // $1,999.00
            planName = 'Enterprise Plus Plan';
            planLimits = 3500;
          }
          
          console.log(`DEBUG - Determined plan from clients collection: ${planName} with ${planLimits} minutes`);
        }
      } else {
        console.log('DEBUG - No client found in clients collection, falling back to User model');
      }
    } catch (error) {
      console.error('Error querying clients collection:', error);
    } finally {
      await mongoClient.close();
    }
    
    // If no client found in clients collection, fall back to User model
    if (planLimits === 0) {
      console.log('DEBUG - Falling back to User model subscription data');
      console.log('DEBUG - User subscription data:', JSON.stringify(user.subscription, null, 2));
      
      // Check if user has a subscription with planName
      if (user.subscription?.planName) {
        const userPlanName = user.subscription.planName.toLowerCase();
        console.log('DEBUG - Found planName in User subscription:', userPlanName);
        
        // Professional plan
        if (userPlanName.includes('professional')) {
          planLimits = 250;
          console.log('DEBUG - Detected Professional plan, setting limit to 250');
        }
        // Business plan
        else if (userPlanName.includes('business')) {
          planLimits = 600;
          console.log('DEBUG - Detected Business plan, setting limit to 600');
        }
        // Enterprise plan
        else if (userPlanName.includes('enterprise')) {
          planLimits = userPlanName.includes('plus') ? 3500 : 1500;
          console.log(`DEBUG - Detected Enterprise plan${userPlanName.includes('plus') ? ' Plus' : ''}, setting limit to ${planLimits}`);
        }
        // Starter plan
        else if (userPlanName.includes('starter')) {
          planLimits = 80;
          console.log('DEBUG - Detected Starter plan, setting limit to 80');
        }
      }
    }
    
    // Override with usage limit if explicitly set
    if (user.usage?.minutesLimit) {
      console.log(`DEBUG - Overriding with usage.minutesLimit: ${user.usage.minutesLimit}`);
      planLimits = user.usage.minutesLimit;
    }
    
    console.log(`Final plan limits for user ${user.email}: ${planLimits} minutes`);

    // Format stats for the dashboard
    const stats = [
      {
        name: 'Total Calls',
        value: totalCalls.toString(),
        change: todaysCalls > 0 ? `+${todaysCalls} today` : 'No calls today',
        changeType: todaysCalls > 0 ? 'increase' : 'neutral',
        icon: 'Phone',
        color: 'bg-blue-500'
      },
      {
        name: 'Minutes Used',
        value: `${totalMinutesUsed}/${planLimits}`,
        change: `${Math.round((totalMinutesUsed / planLimits) * 100)}% used`,
        changeType: 'neutral',
        icon: 'Clock',
        color: 'bg-teal-500'
      },
      {
        name: 'Success Rate',
        value: `${successRate}%`,
        change: successRate >= 80 ? 'Excellent' : successRate >= 60 ? 'Good' : 'Needs improvement',
        changeType: successRate >= 80 ? 'increase' : successRate >= 60 ? 'neutral' : 'decrease',
        icon: 'TrendingUp',
        color: 'bg-green-500'
      },
      {
        name: 'Active Assistants',
        value: activeAssistants.toString(),
        change: `${totalAssistants} total`,
        changeType: 'neutral',
        icon: 'Users',
        color: 'bg-purple-500'
      }
    ];

    // Format recent activity
    const formattedActivity = recentCalls.slice(0, 4).map((call, index) => {
      const timeAgo = call.createdAt 
        ? getTimeAgo(new Date(call.createdAt))
        : 'Recently';
      
      return {
        id: index + 1,
        type: call.outcome === 'successful' ? 'success' : 'call',
        message: call.outcome === 'successful' 
          ? `Call completed - ${Math.round((call.duration || 0) / 60)} minutes with ${call.assistantName}`
          : `Call ${call.outcome || 'attempted'} with ${call.assistantName}`,
        time: timeAgo,
        icon: 'Phone',
        color: call.outcome === 'successful' ? 'text-green-600' : 'text-orange-600'
      };
    });

    return NextResponse.json({
      stats,
      recentActivity: formattedActivity
    });

  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}
