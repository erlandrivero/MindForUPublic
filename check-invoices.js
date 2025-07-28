// Simple script to check MongoDB invoices
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkInvoices() {
  console.log('=== CHECKING MONGODB INVOICES ===');
  
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not found in environment variables');
      return;
    }
    
    console.log(`Using MongoDB URI: ${uri.substring(0, 20)}...`);
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check invoices collection
    const invoicesCollection = db.collection('invoices');
    const invoices = await invoicesCollection.find().toArray();
    console.log(`Found ${invoices.length} total invoices`);
    
    if (invoices.length > 0) {
      console.log('\n=== MOST RECENT INVOICE ===');
      const mostRecent = invoices[0];
      console.log(`ID: ${mostRecent._id}`);
      console.log(`stripeInvoiceId: ${mostRecent.stripeInvoiceId}`);
      console.log(`amount: ${mostRecent.amount}`);
      console.log(`status: ${mostRecent.status}`);
      console.log(`invoiceDate: ${mostRecent.invoiceDate}`);
      
      if (mostRecent.metadata) {
        console.log(`source: ${mostRecent.metadata.source || 'unknown'}`);
      }
    }
    
    // Check clients with purchases
    const clientsCollection = db.collection('clients');
    const clientsWithPurchases = await clientsCollection.find({
      'purchases': { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`\nFound ${clientsWithPurchases.length} clients with purchases`);
    
    if (clientsWithPurchases.length > 0) {
      console.log('\n=== CLIENT WITH PURCHASES ===');
      const client = clientsWithPurchases[0];
      console.log(`ID: ${client._id}`);
      console.log(`Name: ${client.name || 'Unknown'}`);
      console.log(`Email: ${client.email || 'Unknown'}`);
      console.log(`userId: ${client.userId || 'Missing'}`);
      console.log(`Purchases count: ${client.purchases.length}`);
      
      if (client.purchases.length > 0) {
        console.log('\n=== MOST RECENT PURCHASE ===');
        const purchase = client.purchases[0];
        console.log(`sessionId: ${purchase.sessionId}`);
        console.log(`amount_total: ${purchase.amount_total}`);
        console.log(`payment_status: ${purchase.payment_status}`);
        console.log(`created: ${purchase.created}`);
      }
    }
    
    // Close connection
    await client.close();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkInvoices().catch(console.error);
