import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import { MongoClient } from 'mongodb';

export async function GET(_req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB directly
    console.log('Connecting to MongoDB to check Stripe transactions...');
    const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
    
    try {
      await mongoClient.connect();
      console.log('MongoDB connected successfully');
      
      const database = mongoClient.db();
      
      // Get all collections to verify they exist
      const collections = await database.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      // Check clients collection for transactions
      const results: any = {
        collections: collectionNames,
        clientsExists: collectionNames.includes('clients'),
        email: session.user.email,
        clientsCount: 0,
        clientsWithPurchases: 0,
        totalPurchases: 0,
        recentPurchases: [],
        webhookLogsCount: 0,
        recentWebhookLogs: []
      };
      
      // Check clients collection if it exists
      if (results.clientsExists) {
        const clientsCollection = database.collection('clients');
        
        // Count total clients
        results.clientsCount = await clientsCollection.countDocuments();
        
        // Count clients with purchases
        results.clientsWithPurchases = await clientsCollection.countDocuments({
          'purchases': { $exists: true, $ne: [] }
        });
        
        // Get recent clients with purchases
        const recentClients = await clientsCollection.find({
          'purchases': { $exists: true, $ne: [] }
        }).sort({ updatedAt: -1 }).limit(5).toArray();
        
        // Calculate total purchases across all clients
        let totalPurchases = 0;
        for (const client of recentClients) {
          if (Array.isArray(client.purchases)) {
            totalPurchases += client.purchases.length;
            
            // Add recent purchases to results
            for (const purchase of client.purchases) {
              results.recentPurchases.push({
                clientId: client.clientId || client._id,
                clientEmail: client.email,
                sessionId: purchase.sessionId,
                amount: purchase.amount_total,
                status: purchase.payment_status,
                date: purchase.created
              });
            }
          }
        }
        
        results.totalPurchases = totalPurchases;
      }
      
      // Check if we have a webhook_logs collection to see if webhooks are being received
      if (collectionNames.includes('webhook_logs')) {
        const webhookLogsCollection = database.collection('webhook_logs');
        
        // Count webhook logs
        results.webhookLogsCount = await webhookLogsCollection.countDocuments();
        
        // Get recent webhook logs
        results.recentWebhookLogs = await webhookLogsCollection.find({})
          .sort({ timestamp: -1 })
          .limit(5)
          .toArray();
      }
      
      return NextResponse.json(results);
    } catch (mongoError: any) {
      console.error('Error querying MongoDB for Stripe transactions:', mongoError);
      return NextResponse.json(
        { error: 'Database error', details: mongoError.message },
        { status: 500 }
      );
    } finally {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
    
  } catch (error: any) {
    console.error('Stripe debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to debug Stripe transactions', 
      message: error.message
    }, { status: 500 });
  }
}
