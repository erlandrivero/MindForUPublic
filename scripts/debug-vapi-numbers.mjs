// Debug script for Vapi phone numbers API
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract the VAPI_PRIVATE_KEY
const vapiKeyMatch = envContent.match(/VAPI_PRIVATE_KEY=([^\r\n]+)/);
const vapiApiKey = vapiKeyMatch ? vapiKeyMatch[1] : null;

if (!vapiApiKey) {
  console.error('Error: VAPI_PRIVATE_KEY not found in .env.local file');
  process.exit(1);
}

console.log('Using Vapi API key:', vapiApiKey);
console.log('Fetching phone numbers from Vapi API with detailed debugging...');

// Make the API request with detailed debugging
async function debugVapiAPI() {
  try {
    // First, check account info to verify API key works
    console.log('\n1. Checking API key validity and account info...');
    const accountResponse = await fetch('https://api.vapi.ai/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.error(`Account API error: ${accountResponse.status} - ${errorText}`);
    } else {
      const accountData = await accountResponse.json();
      console.log('Account info:', JSON.stringify(accountData, null, 2));
    }
    
    // Now fetch phone numbers with full response logging
    console.log('\n2. Fetching phone numbers with full response...');
    const response = await fetch('https://api.vapi.ai/phone-number', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...response.headers]), null, 2));
    
    const responseText = await response.text();
    console.log('Raw response body:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('\n3. Parsed response data:', JSON.stringify(data, null, 2));
      
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
        console.log('No phone numbers found in the API response.');
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
    }
    
    // Try a different endpoint version as a test
    console.log('\n4. Trying alternative endpoint as a test...');
    const altResponse = await fetch('https://api.vapi.ai/v1/phone-number', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Alternative endpoint status:', altResponse.status);
    const altText = await altResponse.text();
    console.log('Alternative endpoint response:', altText);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Execute the function
debugVapiAPI();
