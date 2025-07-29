import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import mongoose from 'mongoose';

export async function GET(_req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    await connectMongo();
    
    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Prepare results
    const results: any = {
      collections: collections.map(c => c.name),
      samples: {},
      versionIssues: []
    };

    // Check each collection for version issues and get samples
    for (const collection of collections) {
      try {
        const sample = await mongoose.connection.db.collection(collection.name).findOne();
        if (sample) {
          // Store a sample document (limited to avoid large responses)
          results.samples[collection.name] = JSON.parse(
            JSON.stringify(sample, (key, value) => {
              // Limit string length to 100 chars
              if (typeof value === 'string' && value.length > 100) {
                return value.substring(0, 100) + '...';
              }
              return value;
            })
          );
          
          // Check for version field issues
          if (sample.__v === undefined) {
            results.versionIssues.push({
              collection: collection.name,
              issue: 'undefined __v field'
            });
          }
        }
      } catch (error: any) {
        results.samples[collection.name] = { error: error.message };
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('MongoDB check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
