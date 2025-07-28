// Test script for detailed call logs
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import vapi from '../libs/vapi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('=== Detailed Call Logs Test ===');
console.log('VAPI_PRIVATE_KEY:', process.env.VAPI_PRIVATE_KEY ? 'Exists (first 4 chars): ' + process.env.VAPI_PRIVATE_KEY.substring(0, 4) : 'Missing');

// Using pre-initialized vapi client from libs/vapi.js
console.log('Using vapi client from libs/vapi.js');

async function testCallDetails() {
  try {
    console.log('Fetching assistants...');
    
    // Get all assistants
    const assistantsResponse = await vapi.assistants.list();
    const assistants = Array.isArray(assistantsResponse) ? assistantsResponse : (assistantsResponse?.data || []);
    
    console.log(`Found ${assistants.length} assistants\n`);
    
    // Process each assistant
    for (const assistant of assistants) {
      console.log(`Processing assistant: ${assistant.name} (${assistant.id})`);
      
      // Fetch call logs for this assistant
      console.log(`Fetching call logs for assistant: ${assistant.id}`);
      const callLogsResponse = await vapi.calls.list({
        assistantId: assistant.id,
        limit: 100,
      });
      
      // Extract the data array from the response
      const callLogs = Array.isArray(callLogsResponse) ? callLogsResponse : (callLogsResponse?.data || []);
      
      console.log(`Found ${callLogs.length} calls for assistant ${assistant.id}\n`);
      
      if (callLogs.length > 0) {
        console.log('=== DETAILED CALL LOG ANALYSIS ===');
        
        // Analyze each call
        callLogs.forEach((call, index) => {
          console.log(`\nCall #${index + 1}:`);
          console.log(`ID: ${call.id}`);
          console.log(`Status: ${call.status}`);
          console.log(`Created At: ${call.createdAt}`);
          console.log(`Duration: ${call.duration !== undefined ? call.duration : 'undefined'} seconds`);
          console.log(`Duration Type: ${typeof call.duration}`);
          
          // Check for other duration-related fields
          const callKeys = Object.keys(call);
          const durationRelatedKeys = callKeys.filter(key => key.toLowerCase().includes('duration') || key.toLowerCase().includes('time'));
          
          if (durationRelatedKeys.length > 0) {
            console.log('Other duration-related fields:');
            durationRelatedKeys.forEach(key => {
              console.log(`  ${key}: ${call[key]}`);
            });
          }
          
          // Check for metadata that might contain duration info
          if (call.metadata) {
            console.log('Metadata:');
            console.log(JSON.stringify(call.metadata, null, 2));
          }
          
          console.log('---');
        });
      }
      
      console.log('\n' + '-'.repeat(50) + '\n');
    }
    
  } catch (error) {
    console.error('Error testing call details:', error);
  }
}

// Run the test
testCallDetails();
