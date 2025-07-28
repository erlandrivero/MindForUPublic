import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import Call from '@/models/Call';
import vapi from '@/libs/vapi';

export async function GET(_req: NextRequest) {
  try {
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
    
    // Track sync results
    const syncResults = {
      totalCallsFetched: 0,
      newCallsAdded: 0,
      assistantsUpdated: 0,
      errors: [] as string[]
    };

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
        // Use type assertion to access data property that TypeScript doesn't recognize
        const callLogs = (callLogsResponse as any)?.data || [];
        
        if (!callLogs || !Array.isArray(callLogs)) {
          syncResults.errors.push(`No call data for assistant ${assistant.name}`);
          continue;
        }
        
        syncResults.totalCallsFetched += callLogs.length;
        
        // Process each call
        for (const callLog of callLogs) {
          // Check if call already exists in our database
          const existingCall = await Call.findOne({ vapiCallId: callLog.id });
          
          if (!existingCall) {
            // Create new call record
            await Call.create({
              userId: user._id,
              assistantId: assistant._id,
              vapiCallId: callLog.id,
              phoneNumber: callLog.phoneNumberId, // This might need adjustment based on Vapi's response structure
              outcome: callLog.status === 'completed' ? 'successful' : callLog.status,
              duration: callLog.duration || 0,
              createdAt: new Date(callLog.createdAt),
              metadata: {
                vapiStatus: callLog.status,
                from: callLog.from,
                to: callLog.to
              }
            });
            
            syncResults.newCallsAdded++;
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
        let totalDuration = 0;
        callLogs.forEach((call: any) => {
          totalDuration += call.duration || 0;
        });
        const avgDuration = callLogs.length > 0 ? totalDuration / callLogs.length : 0;
        
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
        
        syncResults.assistantsUpdated++;
        
      } catch (error: any) {
        console.error(`Error syncing calls for assistant ${assistant.name}:`, error);
        syncResults.errors.push(`Error for ${assistant.name}: ${error.message || 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      syncResults
    });
    
  } catch (error: any) {
    console.error('Vapi call sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
