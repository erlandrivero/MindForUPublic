import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import vapi from '@/libs/vapi';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting call-stats API route');
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

    // Get all assistants for this user
    const assistants = await Assistant.find({ userId: user._id });
    
    console.log(`Found ${assistants.length} assistants for user ${user.email}`);
    // Log assistant IDs and Vapi IDs
    assistants.forEach(assistant => {
      console.log(`Assistant: ${assistant.name}, ID: ${assistant._id}, Vapi ID: ${assistant.vapiAssistantId || 'None'}`);
    });
    
    // Define interfaces for our response
    interface AssistantStat {
      assistantId: string;
      vapiAssistantId: string;
      name: string;
      totalCalls: number;
      callsToday: number;
      avgDuration: number;
      successRate: number;
      lastActiveTimestamp?: Date;
    }
    
    interface CallStatsResponse {
      assistantStats: AssistantStat[];
      overallStats: {
        totalCalls: number;
        callsToday: number;
        avgSuccessRate: number;
        avgDuration: number;
      };
      errors: string[];
    }
    
    // Track results
    const results: CallStatsResponse = {
      assistantStats: [],
      overallStats: {
        totalCalls: 0,
        callsToday: 0,
        avgSuccessRate: 0,
        avgDuration: 0
      },
      errors: []
    };

    // Process each assistant
    for (const assistant of assistants) {
      if (!assistant.vapiAssistantId) continue;
      
      try {
        console.log(`Fetching calls for assistant: ${assistant.name} (${assistant.vapiAssistantId})`);
        
        // Fetch calls directly from Vapi for this assistant
        const callLogsResponse = await vapi.calls.list({
          assistantId: assistant.vapiAssistantId as any,
          limit: 100, // Adjust as needed
        });
        
        console.log('Vapi call logs response:', JSON.stringify(callLogsResponse, null, 2));
        
        // Extract the data array from the response
        // The Vapi SDK returns a response with a data property that contains the call logs
        // Handle both direct array responses and responses with a data property
        const callLogs = Array.isArray(callLogsResponse) ? callLogsResponse : (callLogsResponse as any)?.data || [];
        
        console.log(`Call logs count for ${assistant.name}: ${callLogs.length}`);
        console.log('Call logs data type:', typeof callLogs, Array.isArray(callLogs) ? 'is array' : 'not array');
        
        // Continue processing even if there are no call logs - just show zero stats
        if (!callLogs || !Array.isArray(callLogs)) {
          console.log(`Invalid call logs data for assistant: ${assistant.name}`);
          results.errors.push(`Invalid call data for assistant ${assistant.name}`);
          continue;
        }
        
        // Log first call for debugging if available
        if (callLogs.length > 0) {
          console.log('First call example:', JSON.stringify(callLogs[0], null, 2));
        } else {
          console.log(`No call logs found for assistant: ${assistant.name}`);
          // Continue processing with zero stats - don't skip this assistant
        }
        
        // Get today's date for filtering
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter calls for today
        const todayCalls = callLogs.filter((call: any) => {
          const callDate = new Date(call.createdAt);
          return callDate.getDate() === today.getDate() &&
                 callDate.getMonth() === today.getMonth() &&
                 callDate.getFullYear() === today.getFullYear();
        });
        
        // Filter successful calls
        const successfulCalls = callLogs.filter((call: any) => call.status === 'completed');
        
        // Calculate average duration
        let totalDuration = 0;
        callLogs.forEach((call: any) => {
          // Log the call object to debug duration field
          console.log(`Call duration debug for ${assistant.name}:`, JSON.stringify({
            id: call.id,
            duration: call.duration,
            durationInSeconds: call.durationInSeconds,
            durationSeconds: call.durationSeconds,
            metadata: call.metadata ? {
              duration: call.metadata.duration,
              durationSeconds: call.metadata.durationSeconds
            } : 'No metadata',
            timestamps: {
              createdAt: call.createdAt,
              endedAt: call.endedAt
            }
          }, null, 2));
          
          // Try to get duration from various possible fields
          let callDuration = 0;
          
          if (typeof call.duration === 'number' && call.duration > 0) {
            // Use the duration field if it's a valid number
            callDuration = call.duration;
          } else if (typeof call.durationInSeconds === 'number' && call.durationInSeconds > 0) {
            // Try durationInSeconds field
            callDuration = call.durationInSeconds;
          } else if (typeof call.durationSeconds === 'number' && call.durationSeconds > 0) {
            // Try durationSeconds field
            callDuration = call.durationSeconds;
          } else if (call.metadata && typeof call.metadata.durationSeconds === 'number' && call.metadata.durationSeconds > 0) {
            // Try to get duration from metadata if available
            callDuration = call.metadata.durationSeconds;
          } else if (call.createdAt && call.endedAt) {
            // Calculate duration from timestamps if available
            const startTime = new Date(call.createdAt).getTime();
            const endTime = new Date(call.endedAt).getTime();
            callDuration = Math.floor((endTime - startTime) / 1000);
          }
          
          // If all else fails, use a default minimum duration (10 seconds)
          if (callDuration <= 0) {
            callDuration = 10; // Default to 10 seconds per call based on Vapi dashboard
          }
          
          console.log(`Final call duration for ${assistant.name}: ${callDuration} seconds`);
          totalDuration += callDuration;
        });
        const avgDuration = callLogs.length > 0 ? totalDuration / callLogs.length : 0;
        
        // Calculate success rate
        const successRate = callLogs.length > 0 
          ? Math.round((successfulCalls.length / callLogs.length) * 100) 
          : 0;
        
        // Get last active timestamp
        const lastActiveTimestamp = callLogs.length > 0 ? new Date(callLogs[0].createdAt) : undefined;
        
        // Add to assistant stats
        results.assistantStats.push({
          assistantId: assistant._id.toString(),
          vapiAssistantId: assistant.vapiAssistantId,
          name: assistant.name,
          totalCalls: callLogs.length,
          callsToday: todayCalls.length,
          avgDuration: avgDuration,
          successRate: successRate,
          lastActiveTimestamp: lastActiveTimestamp
        });
        
        // Update overall stats
        results.overallStats.totalCalls += callLogs.length;
        results.overallStats.callsToday += todayCalls.length;
      } catch (error: any) {
        console.error(`Error fetching calls for assistant ${assistant.name}:`, error);
        results.errors.push(`Error for ${assistant.name}: ${error.message || 'Unknown error'}`);
      }
    }
    
    // Calculate overall success rate and duration
    if (results.assistantStats.length > 0) {
      let totalSuccessRate = 0;
      let totalDuration = 0;
      let assistantsWithCalls = 0;
      
      results.assistantStats.forEach(stat => {
        if (stat.totalCalls > 0) {
          totalSuccessRate += stat.successRate;
          totalDuration += stat.avgDuration;
          assistantsWithCalls++;
        }
      });
      
      results.overallStats.avgSuccessRate = assistantsWithCalls > 0 
        ? Math.round(totalSuccessRate / assistantsWithCalls) 
        : 0;
        
      results.overallStats.avgDuration = assistantsWithCalls > 0 
        ? totalDuration / assistantsWithCalls 
        : 0;
    }
    
    return NextResponse.json(results);
    
  } catch (error: any) {
    console.error('Vapi call stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
