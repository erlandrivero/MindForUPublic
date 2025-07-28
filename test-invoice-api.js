// Test script to trigger the invoice API and check results
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config();
}

async function testInvoiceApi() {
  console.log('=== INVOICE API TEST ===');
  
  try {
    // First, check MongoDB for current invoices
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindforu';
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const invoicesCollection = db.collection('invoices');
    
    // Count invoices before API call
    const initialCount = await invoicesCollection.countDocuments();
    console.log(`Initial invoice count: ${initialCount}`);
    
    // Call the invoice API to trigger invoice generation
    console.log('Calling invoice API...');
    // Use the development mode flag to bypass authentication
    const response = await fetch('http://localhost:3000/api/dashboard/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dev_mode: true  // Enable development mode to bypass authentication
      })
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response status text: ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check MongoDB again for new invoices
    const finalCount = await invoicesCollection.countDocuments();
    console.log(`Final invoice count: ${finalCount}`);
    console.log(`New invoices created: ${finalCount - initialCount}`);
    
    // Get the most recent invoice
    if (finalCount > initialCount) {
      const latestInvoice = await invoicesCollection.find().sort({ _id: -1 }).limit(1).toArray();
      console.log('Latest invoice:');
      console.log(JSON.stringify(latestInvoice[0], null, 2));
    }
    
    await client.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testInvoiceApi().catch(console.error);
