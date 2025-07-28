// Test script to verify MongoDB connection and collection creation
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Connect to MongoDB and test collection creation
async function testMongoDBConnection() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db();
    console.log(`Connected to database: ${db.databaseName}`);
    
    // List all collections
    console.log('Listing existing collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if clients collection exists
    const clientsCollectionExists = collections.some(collection => collection.name === 'clients');
    console.log(`Clients collection exists: ${clientsCollectionExists}`);
    
    // Create a test document in the clients collection
    console.log('Attempting to insert a test document into clients collection...');
    const testDocument = {
      name: 'Test Client',
      email: 'test@example.com',
      stripeCustomerId: 'test_stripe_customer_id',
      purchases: [
        {
          amount: 1000,
          currency: 'usd',
          date: new Date(),
          description: 'Test Purchase',
          stripeSessionId: 'test_session_id',
          stripePaymentIntentId: 'test_payment_intent_id'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('clients').insertOne(testDocument);
    console.log(`Document inserted with _id: ${result.insertedId}`);
    
    // Verify the document was inserted
    const insertedDocument = await db.collection('clients').findOne({ _id: result.insertedId });
    console.log('Retrieved inserted document:');
    console.log(JSON.stringify(insertedDocument, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB or performing operations:');
    console.error(error);
    return false;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testMongoDBConnection()
  .then(success => {
    console.log(`Test ${success ? 'completed successfully' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
