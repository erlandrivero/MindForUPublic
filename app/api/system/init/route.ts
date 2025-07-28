import { NextRequest, NextResponse } from 'next/server';
import { initScheduledTasks } from '@/lib/scheduled-tasks';

// Track if tasks have been initialized
let tasksInitialized = false;

export async function GET(_req: NextRequest) {
  try {
    // Only initialize tasks once
    if (!tasksInitialized) {
      console.log('Initializing scheduled tasks...');
      initScheduledTasks();
      tasksInitialized = true;
      console.log('Scheduled tasks initialized successfully');
    } else {
      console.log('Scheduled tasks already initialized');
    }
    
    return NextResponse.json({
      success: true,
      initialized: tasksInitialized,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error initializing scheduled tasks:', error);
    return NextResponse.json(
      { error: 'Failed to initialize scheduled tasks', details: error.message },
      { status: 500 }
    );
  }
}
