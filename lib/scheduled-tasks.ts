import cron from 'node-cron';
// MongoClient is not used in this file
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import Call from '@/models/Call';
import vapi from '@/libs/vapi';

/**
 * Syncs call data from Vapi to MongoDB for all users and assistants
 * Updates the Call collection with new calls
 * Updates User model with usage statistics
 */
export async function syncCallData() {
  console.log('Starting scheduled call data sync...');
  
  try {
    // Connect to MongoDB
    await connectMongo();
    
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);
    
    // Track overall sync results
    const syncResults = {
      totalUsers: users.length,
      usersProcessed: 0,
      totalAssistants: 0,
      assistantsProcessed: 0,
      totalCallsFetched: 0,
      newCallsAdded: 0,
      errors: [] as string[]
    };
    
    // Process each user
    for (const user of users) {
      try {
        // Get all assistants for this user
        const assistants = await Assistant.find({ userId: user._id });
        syncResults.totalAssistants += assistants.length;
        
        // Track user-specific call minutes
        let userTotalMinutes = 0;
        
        // Process each assistant
        for (const assistant of assistants) {
          if (!assistant.vapiAssistantId) continue;
          
          try {
            // Fetch calls from Vapi for this assistant
            const callLogsResponse = await vapi.calls.list({
              assistantId: assistant.vapiAssistantId as any,
              limit: 100, // Adjust as needed
            });
            
            // Extract the data array from the response
            const callLogs = Array.isArray(callLogsResponse) ? callLogsResponse : (callLogsResponse as any)?.data || [];
            
            if (!callLogs || !Array.isArray(callLogs)) {
              syncResults.errors.push(`No call data for assistant ${assistant.name}`);
              continue;
            }
            
            syncResults.totalCallsFetched += callLogs.length;
            
            // Track assistant-specific call minutes
            let assistantTotalDuration = 0;
            
            // Process each call
            for (const callLog of callLogs) {
              // Check if call already exists in our database
              const existingCall = await Call.findOne({ vapiCallId: callLog.id });
              
              if (!existingCall) {
                // Calculate call duration with fallbacks
                let callDuration = 0;
                
                if (callLog.duration) {
                  callDuration = callLog.duration;
                } else if (callLog.endedAt && callLog.createdAt) {
                  // Calculate duration from timestamps
                  const startTime = new Date(callLog.createdAt).getTime();
                  const endTime = new Date(callLog.endedAt).getTime();
                  callDuration = Math.max(10, Math.round((endTime - startTime) / 1000)); // At least 10 seconds
                } else {
                  // Default to minimum duration if no data available
                  callDuration = 10; // 10 seconds minimum
                }
                
                // Map Vapi status to our Call model status and outcome
                const callStatus = callLog.status;
                let callOutcome = callLog.status;
                
                // Map status if needed
                if (callLog.status === 'completed') {
                  callOutcome = 'successful';
                }
                
                // Extract phone number if available
                let phoneNumber = null;
                if (callLog.phoneNumberId) {
                  phoneNumber = callLog.phoneNumberId;
                } else if (callLog.to) {
                  phoneNumber = callLog.to;
                }
                
                // Create new call record
                await Call.create({
                  userId: user._id,
                  assistantId: assistant._id,
                  vapiCallId: callLog.id,
                  phoneNumber: phoneNumber,
                  outcome: callOutcome,
                  duration: callDuration,
                  cost: 0, // Set appropriate cost if available
                  status: callStatus,
                  startTime: new Date(callLog.createdAt),
                  endTime: callLog.endedAt ? new Date(callLog.endedAt) : undefined,
                  createdAt: new Date(callLog.createdAt),
                  metadata: {
                    vapiStatus: callLog.status,
                    from: callLog.from,
                    to: callLog.to
                  }
                });
                
                syncResults.newCallsAdded++;
                assistantTotalDuration += callDuration;
              } else {
                // Call already exists, add its duration to the total
                assistantTotalDuration += existingCall.duration;
              }
            }
            
            // Update assistant with call statistics
            const todayCalls = callLogs.filter((call: any) => {
              const callDate = new Date(call.createdAt);
              const today = new Date();
              return callDate.getDate() === today.getDate() &&
                     callDate.getMonth() === today.getMonth() &&
                     callDate.getFullYear() === today.getFullYear();
            });
            
            const successfulCalls = callLogs.filter((call: any) => call.status === 'completed');
            
            // Calculate average duration
            const avgDuration = callLogs.length > 0 ? assistantTotalDuration / callLogs.length : 0;
            
            // Update assistant with call statistics
            await Assistant.findByIdAndUpdate(assistant._id, {
              statistics: {
                totalCalls: callLogs.length,
                callsToday: todayCalls.length,
                avgDuration: avgDuration,
                successRate: callLogs.length > 0 
                  ? Math.round((successfulCalls.length / callLogs.length) * 100) 
                  : 0,
                lastActiveTimestamp: callLogs.length > 0 ? new Date(callLogs[0].createdAt) : undefined
              },
              lastSyncedAt: new Date()
            });
            
            // Add this assistant's minutes to the user total
            // Convert seconds to minutes (round up to nearest minute)
            const assistantMinutes = Math.ceil(assistantTotalDuration / 60);
            userTotalMinutes += assistantMinutes;
            
            syncResults.assistantsProcessed++;
            
          } catch (error: any) {
            console.error(`Error syncing calls for assistant ${assistant.name}:`, error);
            syncResults.errors.push(`Error for ${assistant.name}: ${error.message || 'Unknown error'}`);
          }
        }
        
        // Update user's usage statistics with the calculated minutes
        await User.findByIdAndUpdate(user._id, {
          'usage.minutesUsed': userTotalMinutes,
          'usage.lastUpdated': new Date()
        });
        
        syncResults.usersProcessed++;
        
      } catch (userError: any) {
        console.error(`Error processing user ${user.email}:`, userError);
        syncResults.errors.push(`Error for user ${user.email}: ${userError.message || 'Unknown error'}`);
      }
    }
    
    console.log('Call data sync completed:', syncResults);
    return syncResults;
    
  } catch (error: any) {
    console.error('Scheduled call data sync error:', error);
    return {
      error: 'Internal server error',
      details: error.message
    };
  }
}

/**
 * Initialize scheduled tasks
 */
export function initScheduledTasks() {
  // Schedule call data sync to run every hour
  // Format: '0 * * * *' = At minute 0 of every hour (1:00, 2:00, etc.)
  cron.schedule('0 * * * *', async () => {
    console.log(`Running scheduled call data sync at ${new Date().toISOString()}`);
    try {
      await syncCallData();
    } catch (error) {
      console.error('Error in scheduled call data sync:', error);
    }
  });
  
  console.log('Scheduled tasks initialized');
}
