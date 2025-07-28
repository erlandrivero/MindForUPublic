import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import { syncCallData } from '@/lib/scheduled-tasks';

/**
 * API endpoint to manually trigger call data sync from Vapi to MongoDB
 * This is useful for testing and debugging
 */
export async function GET(_req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Manual call data sync triggered by user:', session.user.email);
    
    // Trigger the sync function
    const syncResults = await syncCallData();
    
    return NextResponse.json({
      success: true,
      message: 'Call data sync completed',
      results: syncResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error in manual call data sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync call data', details: error.message },
      { status: 500 }
    );
  }
}
