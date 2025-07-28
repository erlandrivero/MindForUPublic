// Direct script to fetch phone numbers from Vapi API
import * as dotenv from 'dotenv';
dotenv.config();

const fetchVapiPhoneNumbers = async () => {
  try {
    const vapiApiKey = process.env.VAPI_PRIVATE_KEY;
    
    if (!vapiApiKey) {
      console.error('Error: VAPI_PRIVATE_KEY not found in environment variables');
      return;
    }
    
    console.log('Fetching phone numbers directly from Vapi API...');
    
    const response = await fetch('https://api.vapi.ai/phone-number', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
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
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Execute the function
fetchVapiPhoneNumbers();
