// Simple test script for Vapi phone numbers
// Run with: node test-vapi-numbers.js YOUR_VAPI_API_KEY

// Get API key from command line argument
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Error: Please provide your Vapi API key as a command line argument');
  console.error('Usage: node test-vapi-numbers.js YOUR_VAPI_API_KEY');
  process.exit(1);
}

console.log('Fetching phone numbers from Vapi API...');

// Make the API request
fetch('https://api.vapi.ai/phone-number', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`Vapi API error: ${response.status} - ${text}`);
    });
  }
  return response.json();
})
.then(data => {
  if (data && data.results && data.results.length > 0) {
    console.log('\nPhone Numbers from Vapi:');
    console.log('=======================\n');
    
    data.results.forEach((phone, index) => {
      console.log(`Phone #${index + 1}:`);
      console.log(`  ID: ${phone.id}`);
      console.log(`  Number: ${phone.number}`);
      console.log(`  Name: ${phone.name || 'Not set'}`);
      console.log(`  Status: ${phone.status}`);
      console.log(`  Assistant ID: ${phone.assistantId || 'Not assigned'}`);
      console.log(`  Provider: ${phone.provider || 'Standard'}`);
      console.log(`  Created: ${new Date(phone.createdAt).toLocaleString()}`);
      console.log('');
    });
    
    console.log(`Total phone numbers: ${data.results.length}`);
  } else {
    console.log('No phone numbers found in your Vapi account.');
  }
})
.catch(error => {
  console.error('Error:', error.message);
});
