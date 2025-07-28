// Comprehensive Vapi API test script
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { VapiClient } from '@vapi-ai/server-sdk';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = resolve(__dirname, '../.env.local');
config({ path: envPath });

console.log('=== Comprehensive Vapi API Test ===');

// Check API key
console.log('VAPI_PRIVATE_KEY:', process.env.VAPI_PRIVATE_KEY ? 
  `Exists (first 4 chars): ${process.env.VAPI_PRIVATE_KEY.substring(0, 4)}...` : 'Missing');

// Initialize Vapi client
const vapi = new VapiClient({
  token: process.env.VAPI_PRIVATE_KEY,
});

// Test various Vapi API endpoints
async function runTests() {
  try {
    console.log('\n1. Testing assistants.list() API:');
    const assistants = await vapi.assistants.list();
    console.log('Response type:', typeof assistants);
    console.log('Response structure:', JSON.stringify(assistants, null, 2).substring(0, 500) + '...');
    
    // Check if assistants is an array directly or has a data property containing an array
    const assistantsArray = Array.isArray(assistants) ? assistants : (assistants?.data || []);
    
    if (assistantsArray.length > 0) {
      console.log(`Found ${assistantsArray.length} assistants`);
      
      // Get the first assistant ID for further testing
      const firstAssistantId = assistantsArray[0].id;
      console.log(`First assistant ID: ${firstAssistantId}`);
      
      // Test getting a specific assistant
      console.log('\n2. Testing assistants.get() API:');
      const assistant = await vapi.assistants.get(firstAssistantId);
      console.log('Assistant details:', JSON.stringify(assistant, null, 2));
      
      // Test getting call logs for this assistant
      console.log('\n3. Testing calls.list() API for this assistant:');
      const callLogs = await vapi.calls.list({
        assistantId: firstAssistantId,
        limit: 10
      });
      
      console.log('Call logs response type:', typeof callLogs);
      console.log('Call logs structure:', JSON.stringify(callLogs, null, 2).substring(0, 500) + '...');
      
      // Check if callLogs is an array directly or has a data property containing an array
      const callLogsArray = Array.isArray(callLogs) ? callLogs : (callLogs?.data || []);
      
      if (callLogsArray.length > 0) {
        console.log(`Found ${callLogsArray.length} calls for assistant ${firstAssistantId}`);
      } else {
        console.log('No call logs found for this assistant');
      }
    } else {
      console.log('No assistants found in the Vapi account');
      
      // Try creating a test assistant
      console.log('\n4. Testing assistant creation:');
      try {
        const newAssistant = await vapi.assistants.create({
          name: "Test Assistant",
          model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            temperature: 0.7,
          },
          voice: {
            provider: "openai",
            voice: "alloy",
          },
          firstMessage: "Hello, I'm a test assistant.",
        });
        
        console.log('Successfully created test assistant:', JSON.stringify(newAssistant, null, 2));
      } catch (createError) {
        console.error('Error creating test assistant:', createError);
      }
    }
    
    // Test phone numbers API
    console.log('\n5. Testing phoneNumbers.list() API:');
    const phoneNumbers = await vapi.phoneNumbers.list();
    console.log('Phone numbers response:', JSON.stringify(phoneNumbers, null, 2).substring(0, 500) + '...');
    
    // Check if phoneNumbers is an array directly or has a data property containing an array
    const phoneNumbersArray = Array.isArray(phoneNumbers) ? phoneNumbers : (phoneNumbers?.data || []);
    
    if (phoneNumbersArray.length > 0) {
      console.log(`Found ${phoneNumbersArray.length} phone numbers`);
      // Log details of the first few phone numbers
      phoneNumbersArray.slice(0, 3).forEach((phone, index) => {
        console.log(`Phone ${index + 1}: ${phone.number} (${phone.id}) - Status: ${phone.status}`);
      });
    } else {
      console.log('No phone numbers found');
    }
    
  } catch (error) {
    console.error('Error running Vapi API tests:', error);
  }
}

// Run all tests
runTests().then(() => {
  console.log('\n=== End of Comprehensive Vapi API Test ===');
}).catch(error => {
  console.error('Unhandled error in tests:', error);
});
