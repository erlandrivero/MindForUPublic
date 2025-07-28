// Test script to call the invoice API GET endpoint
import { config } from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
config({ path: '.env.local' });

async function testInvoiceApiGet() {
  console.log('Testing invoice API GET endpoint...');
  
  try {
    // Call the invoice API GET endpoint
    const response = await fetch('http://localhost:3000/api/dashboard/invoices');
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    if (!response.ok) {
      console.error('Error response from API:', response.status, response.statusText);
      return;
    }
    
    // Parse the response as JSON
    const data = await response.json();
    
    console.log('Response data:', JSON.stringify(data, null, 2));
    console.log(`Received ${Array.isArray(data) ? data.length : 0} invoices from API`);
    
    // If we have invoices, log the first one
    if (Array.isArray(data) && data.length > 0) {
      console.log('First invoice:', JSON.stringify(data[0], null, 2));
    }
  } catch (error) {
    console.error('Error calling invoice API:', error);
  }
}

// Run the test
testInvoiceApiGet();
