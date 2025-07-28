import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/auth';
import connectMongo from '@/libs/mongoose';
import mongoose from 'mongoose';
import Call from '@/models/Call';

/**
 * API endpoint to check MongoDB collections and call data
 * This is useful for debugging and verifying data
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('DB check triggered by user:', session.user.email);
    
    // Connect to MongoDB
    await connectMongo();
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check if calls collection exists
    const hasCallsCollection = collectionNames.includes('calls');
    
    // Get call count
    const callCount = hasCallsCollection ? await Call.countDocuments() : 0;
    
    // Get sample calls if they exist
    const sampleCalls = hasCallsCollection ? await Call.find().limit(5).lean() : [];
    
    return NextResponse.json({
      success: true,
      collections: collectionNames,
      hasCallsCollection,
      callCount,
      sampleCalls,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error in DB check:', error);
    return NextResponse.json(
      { error: 'Failed to check database', details: error.message },
      { status: 500 }
    );
  }
}
