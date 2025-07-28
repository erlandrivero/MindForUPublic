// Simple script to test the invoice API endpoint
import fetch from 'node-fetch';

async function testInvoiceApi() {
  console.log('=== TESTING INVOICE API ===');
  
  try {
    console.log('Sending POST request to invoice API...');
    const response = await fetch('http://localhost:3000/api/dashboard/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`API response status: ${response.status}`);
    
    const result = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.invoices && result.invoices.length > 0) {
      console.log(`Generated ${result.invoices.length} invoices`);
      console.log('First invoice:');
      console.log(JSON.stringify(result.invoices[0], null, 2));
    } else {
      console.log('No invoices were generated');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testInvoiceApi().catch(console.error);
