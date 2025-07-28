// Debug script to check clients and invoices collections
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables from .env.local if it exists
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config();
}

async function debugInvoiceGeneration() {
  console.log('=== INVOICE GENERATION DEBUG ===');
  console.log('Checking MongoDB connection and collections...');
  
  // Get MongoDB URI from environment or use default
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindforu';
  console.log(`Using MongoDB URI: ${uri.substring(0, 20)}...`);
  
  try {
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db();
    
    // Check clients collection
    const clientsCollection = db.collection('clients');
    const clientsCount = await clientsCollection.countDocuments();
    console.log(`Total clients in database: ${clientsCount}`);
    
    // Check clients with purchases
    const clientsWithPurchases = await clientsCollection.find({
      'purchases': { $exists: true, $ne: [] }
    }).toArray();
    console.log(`Clients with purchases array: ${clientsWithPurchases.length}`);
    
    // Check clients with transactions
    const clientsWithTransactions = await clientsCollection.find({
      'transactions': { $exists: true, $ne: [] }
    }).toArray();
    console.log(`Clients with transactions array: ${clientsWithTransactions.length}`);
    
    // Sample data from clients
    if (clientsWithPurchases.length > 0) {
      console.log('\n=== SAMPLE CLIENT WITH PURCHASES ===');
      const sample = clientsWithPurchases[0];
      console.log(`Client ID: ${sample._id}`);
      console.log(`Name: ${sample.name || 'Unknown'}`);
      console.log(`Email: ${sample.email || 'Unknown'}`);
      console.log(`userId: ${sample.userId}`);
      console.log(`Purchases count: ${sample.purchases.length}`);
      
      if (sample.purchases.length > 0) {
        console.log('\n=== SAMPLE PURCHASE DATA ===');
        console.log(JSON.stringify(sample.purchases[0], null, 2));
      }
    }
    
    if (clientsWithTransactions.length > 0) {
      console.log('\n=== SAMPLE CLIENT WITH TRANSACTIONS ===');
      const sample = clientsWithTransactions[0];
      console.log(`Client ID: ${sample._id}`);
      console.log(`Name: ${sample.name || 'Unknown'}`);
      console.log(`Email: ${sample.email || 'Unknown'}`);
      console.log(`userId: ${sample.userId}`);
      console.log(`Transactions count: ${sample.transactions.length}`);
      
      if (sample.transactions.length > 0) {
        console.log('\n=== SAMPLE TRANSACTION DATA ===');
        console.log(JSON.stringify(sample.transactions[0], null, 2));
      }
    }
    
    // Check invoices collection
    const invoicesCollection = db.collection('invoices');
    const invoicesCount = await invoicesCollection.countDocuments();
    console.log(`\nTotal invoices in database: ${invoicesCount}`);
    
    // Get recent invoices
    const recentInvoices = await invoicesCollection.find()
      .sort({ invoiceDate: -1 })
      .limit(5)
      .toArray();
    
    console.log(`Recent invoices: ${recentInvoices.length}`);
    
    if (recentInvoices.length > 0) {
      console.log('\n=== RECENT INVOICES ===');
      recentInvoices.forEach((invoice, index) => {
        console.log(`\nInvoice ${index + 1}:`);
        console.log(`ID: ${invoice._id}`);
        console.log(`stripeInvoiceId: ${invoice.stripeInvoiceId}`);
        console.log(`userId: ${invoice.userId}`);
        console.log(`amount: ${invoice.amount}`);
        console.log(`status: ${invoice.status}`);
        console.log(`invoiceDate: ${invoice.invoiceDate}`);
      });
    }
    
    // Test invoice API endpoint
    console.log('\n=== TESTING INVOICE API ENDPOINT ===');
    console.log('To test the invoice API endpoint, run:');
    console.log('curl -X POST http://localhost:3000/api/dashboard/invoices');
    console.log('or visit http://localhost:3000/api/dashboard/invoices in your browser');
    
    await client.close();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugInvoiceGeneration().catch(console.error);
