// Script to import a phone number from Vapi dashboard to MindForU
// Usage: node import-vapi-number.js YOUR_VAPI_API_KEY PHONE_NUMBER_ID

// Get API key and phone number ID from command line arguments
const apiKey = process.argv[2];
const phoneNumberId = process.argv[3];

if (!apiKey || !phoneNumberId) {
  console.error('Error: Please provide your Vapi API key and phone number ID as command line arguments');
  console.error('Usage: node import-vapi-number.js YOUR_VAPI_API_KEY PHONE_NUMBER_ID');
  process.exit(1);
}

console.log('Importing phone number from Vapi dashboard...');

// Make the API request to get phone number details
fetch(`https://api.vapi.ai/phone-number/${phoneNumberId}`, {
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
.then(phoneNumber => {
  console.log('\nPhone Number Details:');
  console.log('====================\n');
  console.log(`ID: ${phoneNumber.id}`);
  console.log(`Number: ${phoneNumber.number}`);
  console.log(`Name: ${phoneNumber.name || 'Not set'}`);
  console.log(`Status: ${phoneNumber.status}`);
  console.log(`Assistant ID: ${phoneNumber.assistantId || 'Not assigned'}`);
  console.log(`Provider: ${phoneNumber.provider || 'Standard'}`);
  console.log(`Created: ${new Date(phoneNumber.createdAt).toLocaleString()}`);
  
  console.log('\nTo import this number into MindForU, use the following API call:');
  console.log('==================================================================\n');
  console.log(`curl -X POST http://localhost:3000/api/phone-numbers/import \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"phoneNumberId": "${phoneNumber.id}"}'`);
  
  console.log('\nOr use the Phone Number Manager in the MindForU dashboard to import it.');
})
.catch(error => {
  console.error('Error:', error.message);
});
