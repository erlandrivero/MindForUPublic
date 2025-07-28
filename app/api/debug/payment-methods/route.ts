import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { MongoClient } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    console.log('Starting debug payment-methods API route');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Connect to MongoDB directly to access the collections
    const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
    await mongoClient.connect();
    
    try {
      const database = mongoClient.db();
      
      // Get list of all collections
      const collections = await database.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      // Check clients collection for payment methods
      const clientsCollection = database.collection('clients');
      const clientsWithPaymentMethods = await clientsCollection.find({
        userId: user._id.toString(),
        'paymentMethods': { $exists: true, $ne: [] }
      }).toArray();
      
      // Check if there's a dedicated payment methods collection (capital M)
      let dedicatedPaymentMethods = [];
      if (collectionNames.includes('paymentMethods')) {
        const paymentMethodsCollection = database.collection('paymentMethods');
        dedicatedPaymentMethods = await paymentMethodsCollection.find({
          userId: user._id.toString()
        }).toArray();
      }
      
      // Check if there's a dedicated paymentmethods collection (lowercase)
      let lowercasePaymentMethods = [];
      if (collectionNames.includes('paymentmethods')) {
        const lowercaseCollection = database.collection('paymentmethods');
        lowercasePaymentMethods = await lowercaseCollection.find({
          userId: user._id.toString()
        }).toArray();
        
        // If no results by userId, try by email
        if (lowercasePaymentMethods.length === 0) {
          lowercasePaymentMethods = await lowercaseCollection.find({
            email: user.email
          }).toArray();
        }
      }
      
      return NextResponse.json({
        collections: collectionNames,
        clientsCount: clientsWithPaymentMethods.length,
        clientsWithPaymentMethods: clientsWithPaymentMethods.map(client => ({
          id: client._id,
          name: client.name,
          paymentMethodsCount: client.paymentMethods?.length || 0,
          paymentMethods: client.paymentMethods || []
        })),
        dedicatedPaymentMethodsCount: dedicatedPaymentMethods.length,
        dedicatedPaymentMethods,
        lowercasePaymentMethodsCount: lowercasePaymentMethods.length,
        lowercasePaymentMethods
      });
    } finally {
      await mongoClient.close();
    }
    
  } catch (error) {
    console.error('Debug payment-methods API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
