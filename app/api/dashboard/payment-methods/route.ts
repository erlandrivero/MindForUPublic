import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import { MongoClient } from 'mongodb';

export async function GET(_req: NextRequest) {
  try {
    console.log('Starting dashboard payment-methods API route');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`Fetching payment methods for user: ${user.email} (ID: ${user._id})`);
    
    // Initialize empty payment methods array
    const paymentMethods = [];
    
    // Connect to MongoDB directly to access the clients collection
    console.log('Connecting to MongoDB to query clients collection...');
    const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
    
    try {
      await mongoClient.connect();
      console.log('MongoDB connected successfully');
      
      const database = mongoClient.db();
      const clientsCollection = database.collection('clients');
      
      // Find clients with payment methods for this user
      // First try by userId
      let clients = await clientsCollection.find({
        userId: user._id.toString(),
        'paymentMethods': { $exists: true, $ne: [] }
      }).toArray();
      
      // If no results, try by email as fallback
      if (clients.length === 0) {
        console.log(`No clients found by userId, trying email: ${user.email}`);
        clients = await clientsCollection.find({
          email: user.email,
          'paymentMethods': { $exists: true, $ne: [] }
        }).toArray();
      }
      
      console.log(`Found ${clients.length} clients with payment methods for user ${user.email}`);
      
      // Build payment methods from client data
      for (const client of clients) {
        console.log(`Processing client: ${client.name || 'Unnamed'} (ID: ${client._id})`);
        
        if (Array.isArray(client.paymentMethods)) {
          console.log(`Client has ${client.paymentMethods.length} payment methods`);
          
          for (const pm of client.paymentMethods) {
            // Skip if missing critical data
            if (!pm.id) {
              console.log('Skipping payment method without ID');
              continue;
            }
            
            console.log(`Processing payment method: ${pm.id}`);
            
            // Extract card details if available
            const cardDetails = pm.card || {};
            
            paymentMethods.push({
              id: pm.id, // Use id directly for frontend compatibility
              stripePaymentMethodId: pm.id,
              type: pm.type || 'card',
              brand: pm.brand || cardDetails.brand || 'unknown',
              last4: pm.last4 || cardDetails.last4 || '****',
              expiryMonth: pm.expiryMonth || cardDetails.exp_month || 1,
              expiryYear: pm.expiryYear || cardDetails.exp_year || 2025,
              isDefault: pm.isDefault || false,
              billingDetails: pm.billingDetails || {},
              metadata: {
                clientId: client._id.toString(),
                clientName: client.name || 'Unknown Client'
              }
            });
          }
        } else {
          console.log('Client has no payment methods array');
        }
      }
      
      // If we have no payment methods, check if user has stripeCustomerId and try to fetch from there
      if (paymentMethods.length === 0 && user.stripeCustomerId) {
        console.log(`No payment methods found in clients collection, checking user.stripeCustomerId: ${user.stripeCustomerId}`);
        
        // Check if user has payment methods directly in their document
        if (user.paymentMethods && Array.isArray(user.paymentMethods) && user.paymentMethods.length > 0) {
          console.log(`Found ${user.paymentMethods.length} payment methods directly in user document`);
          
          for (const pm of user.paymentMethods) {
            if (!pm.id) continue;
            
            paymentMethods.push({
              id: pm.id,
              stripePaymentMethodId: pm.id,
              type: pm.type || 'card',
              brand: pm.brand || pm.card?.brand || 'unknown',
              last4: pm.last4 || pm.card?.last4 || '****',
              expiryMonth: pm.expiryMonth || pm.card?.exp_month || 1,
              expiryYear: pm.expiryYear || pm.card?.exp_year || 2025,
              isDefault: pm.isDefault || false
            });
          }
        }
      }
      
      // First check for a dedicated lowercase paymentmethods collection (as seen in MongoDB screenshot)
      if (paymentMethods.length === 0) {
        console.log('Checking for dedicated paymentmethods collection (lowercase)...');
        
        const collections = await database.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        if (collectionNames.includes('paymentmethods')) {
          console.log('Found paymentmethods collection (lowercase), querying...');
          
          const lowercaseCollection = database.collection('paymentmethods');
          const userId = user._id.toString();
          const userObjectId = user._id;
          
          console.log(`Searching paymentmethods collection with userId: ${userId}`);
          
          // Try to find payment methods with more flexible userId matching
          // This handles both string and ObjectId formats
          let storedLowercaseMethods = await lowercaseCollection.find({
            $or: [
              { userId: userId }, // userId as string
              { userId: userObjectId }, // userId as ObjectId
              { 'userId.$oid': userId } // userId as nested ObjectId format
            ]
          }).toArray();
          
          // If no results by userId, try by email
          if (storedLowercaseMethods.length === 0) {
            console.log(`No payment methods found by userId in paymentmethods, trying email: ${user.email}`);
            storedLowercaseMethods = await lowercaseCollection.find({
              email: user.email
            }).toArray();
          }
          
          // If still no results, try getting all payment methods and log them for debugging
          if (storedLowercaseMethods.length === 0) {
            console.log('No payment methods found by userId or email, checking all payment methods in collection');
            const allPaymentMethods = await lowercaseCollection.find({}).limit(5).toArray();
            console.log(`Found ${allPaymentMethods.length} total payment methods in collection`);
            if (allPaymentMethods.length > 0) {
              console.log('Sample payment method document structure:', JSON.stringify(allPaymentMethods[0], null, 2));
            }
          }
          
          console.log(`Found ${storedLowercaseMethods.length} payment methods in paymentmethods collection (lowercase)`);
          
          if (storedLowercaseMethods.length > 0) {
            for (const pm of storedLowercaseMethods) {
              console.log('Processing payment method from paymentmethods collection:', pm);
              paymentMethods.push({
                id: pm.id || pm.stripePaymentMethodId || pm._id.toString(),
                stripePaymentMethodId: pm.stripePaymentMethodId || pm.id,
                type: pm.type || 'card',
                brand: pm.brand || 'unknown',
                last4: pm.last4 || '****',
                expiryMonth: pm.expiryMonth || 1,
                expiryYear: pm.expiryYear || 2025,
                isDefault: pm.isDefault || false
              });
            }
          }
        }
      }
      
      // If still no payment methods, check if there's a dedicated paymentMethods collection (capital M)
      if (paymentMethods.length === 0) {
        console.log('Checking for dedicated paymentMethods collection (capital M)...');
        
        const collections = await database.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        if (collectionNames.includes('paymentMethods')) {
          console.log('Found paymentMethods collection (capital M), querying...');
          
          const paymentMethodsCollection = database.collection('paymentMethods');
          const storedPaymentMethods = await paymentMethodsCollection.find({
            userId: user._id.toString()
          }).toArray();
          
          console.log(`Found ${storedPaymentMethods.length} payment methods in paymentMethods collection`);
          
          if (storedPaymentMethods.length > 0) {
            for (const pm of storedPaymentMethods) {
              paymentMethods.push({
                id: pm.id || pm.stripePaymentMethodId || pm._id.toString(),
                stripePaymentMethodId: pm.stripePaymentMethodId || pm.id,
                type: pm.type || 'card',
                brand: pm.brand || 'unknown',
                last4: pm.last4 || '****',
                expiryMonth: pm.expiryMonth || 1,
                expiryYear: pm.expiryYear || 2025,
                isDefault: pm.isDefault || false
              });
            }
          }
        }
      }
      
      // Sort by default status first, then by most recently added
      paymentMethods.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      
      console.log(`Final payment methods count: ${paymentMethods.length}`);
      
      // Return the payment methods
      return NextResponse.json(paymentMethods);
    } catch (mongoError) {
      console.error('Error querying MongoDB for payment methods:', mongoError);
      return NextResponse.json(
        { error: 'Database error', details: mongoError.message },
        { status: 500 }
      );
    } finally {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
    
  } catch (error) {
    console.error('Dashboard payment-methods API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Refresh payment methods from clients collection
export async function POST(req: NextRequest) {
  try {
    console.log('Starting payment methods refresh (POST)');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Force refresh by calling GET handler
    return GET(req);
    
  } catch (error) {
    console.error('Payment methods refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
