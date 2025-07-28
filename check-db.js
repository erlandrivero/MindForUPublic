const { MongoClient } = require('mongodb');

async function checkDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('mindforu');
    
    // Check clients with payment methods
    const clientsWithPayments = await db.collection('clients').countDocuments({
      'paymentMethods': { $exists: true, $ne: [] }
    });
    console.log(`Found ${clientsWithPayments} clients with payment methods`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', '));
    
    // Check if we have any payment methods directly stored
    if (collections.some(c => c.name === 'paymentMethods')) {
      const paymentMethodsCount = await db.collection('paymentMethods').countDocuments();
      console.log(`Found ${paymentMethodsCount} documents in paymentMethods collection`);
    } else {
      console.log('No paymentMethods collection found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabase();
