// Direct script to check Vapi phone numbers using API key from .env.local
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

console.log('Using Vapi API key from .env.local file');
console.log('Fetching phone numbers from Vapi API...');

// Make the API request
try {
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
