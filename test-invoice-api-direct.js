// Direct test script for invoice API with authentication
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config();
}

async function testInvoiceApi() {
  console.log('=== DIRECT INVOICE API TEST ===');
  
  try {
    // Connect to MongoDB to check initial state
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
    const invoicesCollection = db.collection('invoices');
    
    // Count invoices before API call
    const initialCount = await invoicesCollection.countDocuments();
    console.log(`Initial invoice count: ${initialCount}`);
    
    // Get initial invoices for comparison
    const initialInvoices = await invoicesCollection.find().toArray();
    console.log(`Initial invoices: ${initialInvoices.length}`);
    
    // Check clients with purchases
    const clientsCollection = db.collection('clients');
    const clientsWithPurchases = await clientsCollection.find({
      'purchases': { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`Found ${clientsWithPurchases.length} clients with purchases`);
    
    if (clientsWithPurchases.length > 0) {
      const client = clientsWithPurchases[0];
      console.log(`Client ID: ${client._id}`);
      console.log(`Client email: ${client.email || 'Unknown'}`);
      console.log(`Client userId: ${client.userId || 'Missing'}`);
      console.log(`Purchases count: ${client.purchases.length}`);
    }
    
    // Create a simple server to receive the API response
    console.log('Creating test server to handle API response...');
    
    // Directly call the API endpoint with fetch
    console.log('Calling invoice API directly...');
    
    // First, try to get a session cookie by accessing the dashboard
    console.log('Getting session cookie...');
    const dashboardResponse = await fetch('http://localhost:3000/dashboard');
    const cookies = dashboardResponse.headers.get('set-cookie');
    
    if (!cookies) {
      console.log('No cookies received from dashboard, continuing without authentication');
    } else {
      console.log('Received cookies from dashboard');
    }
    
    // Call the invoice API with cookies if available
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
    }
    
    console.log('Sending POST request to invoice API...');
    const response = await fetch('http://localhost:3000/api/dashboard/invoices', {
      method: 'POST',
      headers
    });
    
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      console.log('API call failed with error:');
      const errorText = await response.text();
      console.log(errorText);
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    // Check MongoDB again for new invoices
    const finalInvoices = await invoicesCollection.find().toArray();
    console.log(`Final invoice count: ${finalInvoices.length}`);
    console.log(`New invoices created: ${finalInvoices.length - initialInvoices.length}`);
    
    // Get the most recent invoice
    if (finalInvoices.length > initialInvoices.length) {
      // Find invoices that weren't in the initial set
      const newInvoices = finalInvoices.filter(finalInv => 
        !initialInvoices.some(initInv => initInv._id.toString() === finalInv._id.toString())
      );
      
      console.log(`Found ${newInvoices.length} new invoices`);
      
      if (newInvoices.length > 0) {
        console.log('New invoice:');
        console.log(JSON.stringify(newInvoices[0], null, 2));
      }
    } else {
      console.log('No new invoices were created');
    }
    
    await client.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testInvoiceApi().catch(console.error);
