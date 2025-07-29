import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
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
    
    const results: any = {
      collections: collections.map(c => c.name),
      issues: [],
      fixedDocuments: []
    };

    // Check each collection for version issues
    for (const collection of collections) {
      try {
        // Find documents with undefined __v field
        const docsWithIssues = await mongoose.connection.db
          .collection(collection.name)
          .find({ __v: { $exists: false } })
          .limit(100)
          .toArray();
        
        if (docsWithIssues.length > 0) {
          results.issues.push({
            collection: collection.name,
            documentsWithIssues: docsWithIssues.length,
            sampleIds: docsWithIssues.slice(0, 5).map(doc => doc._id)
          });
          
          // Fix the issues by adding __v: 0
          const updateResult = await mongoose.connection.db
            .collection(collection.name)
            .updateMany(
              { __v: { $exists: false } },
              { $set: { __v: "0" } } // Set as string "0" to ensure it's a string
            );
          
          results.fixedDocuments.push({
            collection: collection.name,
            matched: updateResult.matchedCount,
            modified: updateResult.modifiedCount
          });
        }
      } catch (error: any) {
        results.issues.push({
          collection: collection.name,
          error: error.message
        });
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('MongoDB version fix error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
