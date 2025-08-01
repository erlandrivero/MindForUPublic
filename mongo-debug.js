// MongoDB debug script to check subscription data
const { MongoClient } = require('mongodb');

async function debugMongoDB() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Get all clients
    const clients = await db.collection('clients').find({}).toArray();
    console.log(Found  clients in database);
    
    // Log each client's subscription and purchase data
    clients.forEach((client, index) => {
      console.log(\nClient :);
      console.log(Email: );
      console.log(User ID: );
      
      // Log purchases
      if (client.purchases && client.purchases.length > 0) {
        console.log(Purchases: );
        client.purchases.forEach((purchase, pIndex) => {
          console.log(  Purchase :);
          console.log(    ID: );
          console.log(    Amount: );
          console.log(    Status: );
          console.log(    Created: );
          console.log(    CreatedAt: );
        });
        
        // Sort purchases by date and show the latest one
        const sortedPurchases = [...client.purchases].sort((a, b) => {
          const dateA = a.createdAt || a.created;
          const dateB = b.createdAt || b.created;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
        
        if (sortedPurchases.length > 0) {
          const latest = sortedPurchases[0];
          console.log('\n  Latest purchase by date:');
          console.log(    ID: );
          console.log(    Amount: );
          console.log(    Status: );
          console.log(    Created: );
          console.log(    CreatedAt: );
        }
        
        // Filter for paid purchases
        const paidPurchases = client.purchases.filter(p => p.payment_status === 'paid');
        console.log(\n  Paid purchases: );
        
        if (paidPurchases.length > 0) {
          // Sort paid purchases by date
          const sortedPaidPurchases = [...paidPurchases].sort((a, b) => {
            const dateA = a.createdAt || a.created;
            const dateB = b.createdAt || b.created;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          });
          
          const latestPaid = sortedPaidPurchases[0];
          console.log('\n  Latest paid purchase:');
          console.log(    ID: );
          console.log(    Amount: );
          console.log(    Status: );
          console.log(    Created: );
          console.log(    CreatedAt: );
        }
      } else {
        console.log('No purchases found');
      }
      
      // Log subscription data
      if (client.subscription) {
        console.log('\n  Subscription:');
        console.log(    ID: );
        console.log(    Status: );
        console.log(    Plan: );
        console.log(    Current Period End: );
      } else {
        console.log('\n  No subscription data found');
      }
    });
    
    // Check users collection for subscription data
    const users = await db.collection('users').find({}).toArray();
    console.log(\nFound  users in database);
    
    users.forEach((user, index) => {
      console.log(\nUser :);
      console.log(Email: );
      
      if (user.subscription) {
        console.log('  Subscription:');
        console.log(    Plan Name: );
        console.log(    Status: );
        console.log(    Plan Price: );
      } else {
        console.log('  No subscription data found');
      }
    });
    
    await client.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

debugMongoDB();
