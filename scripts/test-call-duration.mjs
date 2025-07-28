// Simple test script for call durations
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { VapiClient } from '@vapi-ai/server-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('=== Call Duration Test ===');
console.log('VAPI_PRIVATE_KEY:', process.env.VAPI_PRIVATE_KEY ? 'Exists (first 4 chars): ' + process.env.VAPI_PRIVATE_KEY.substring(0, 4) : 'Missing');

// Initialize Vapi client directly with the API key
const vapi = new VapiClient({
  token: process.env.VAPI_PRIVATE_KEY,
});

async function testCallDurations() {
  try {
    console.log('Fetching assistants...');
    
    // Get all assistants
    const assistantsResponse = await vapi.assistants.list();
    const assistants = Array.isArray(assistantsResponse) ? assistantsResponse : assistantsResponse?.data || [];
    
    console.log(`Found ${assistants.length} assistants\n`);
    
    // Process each assistant
    for (const assistant of assistants) {
      console.log(`Processing assistant: ${assistant.name} (${assistant.id})`);
      
      // Fetch call logs for this assistant
      console.log(`Fetching call logs for assistant: ${assistant.id}`);
      const callLogsResponse = await vapi.calls.list({
        assistantId: assistant.id,
        limit: 10,
      });
      
      // Extract the data array from the response
      const callLogs = Array.isArray(callLogsResponse) ? callLogsResponse : callLogsResponse?.data || [];
      
      console.log(`Found ${callLogs.length} calls for assistant ${assistant.id}\n`);
      
      if (callLogs.length > 0) {
        console.log('Call details:');
        
        // Print full call objects for inspection
        callLogs.forEach((call, index) => {
          console.log(`\nCall #${index + 1}:`);
          console.log(JSON.stringify(call, null, 2));
          
          // Specifically check duration field
          console.log(`Duration: ${call.duration !== undefined ? call.duration : 'undefined'} (type: ${typeof call.duration})`);
        });
      }
      
      console.log('\n' + '-'.repeat(50) + '\n');
    }
    
  } catch (error) {
    console.error('Error testing call durations:', error);
  }
}

// Run the test
testCallDurations();
