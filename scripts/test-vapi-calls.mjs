// Simple script to test Vapi call logs API
import { config } from 'dotenv';
import { VapiClient } from '@vapi-ai/server-sdk';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

// Log the API key (first 4 chars only)
console.log('VAPI_PRIVATE_KEY:', process.env.VAPI_PRIVATE_KEY ? 
  `Exists (first 4 chars): ${process.env.VAPI_PRIVATE_KEY.substring(0, 4)}` : 'Missing');

// Initialize Vapi client
const vapi = new VapiClient({
  token: process.env.VAPI_PRIVATE_KEY,
});

// Function to get assistants
async function getAssistants() {
  try {
    console.log('Fetching assistants...');
    const assistants = await vapi.assistants.list();
    console.log('Assistants response:', JSON.stringify(assistants, null, 2));
    return assistants;
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return [];
  }
}

// Function to get call logs for an assistant
async function getCallLogs(assistantId) {
  try {
    console.log(`Fetching call logs for assistant: ${assistantId}`);
    const callLogs = await vapi.calls.list({
      assistantId: assistantId,
      limit: 100,
    });
    console.log('Call logs response:', JSON.stringify(callLogs, null, 2));
    return callLogs;
  } catch (error) {
    console.error(`Error fetching call logs for assistant ${assistantId}:`, error);
    return [];
  }
}

// Main function
async function main() {
  try {
    // Get all assistants
    const assistants = await getAssistants();
    
    // If no assistants found, exit
    if (!assistants || !assistants.data || assistants.data.length === 0) {
      console.log('No assistants found');
      return;
    }
    
    // Get call logs for each assistant
    for (const assistant of assistants.data) {
      console.log(`\nProcessing assistant: ${assistant.name} (${assistant.id})`);
      const callLogs = await getCallLogs(assistant.id);
      
      // Log the number of calls
      const calls = callLogs?.data || [];
      console.log(`Found ${calls.length} calls for assistant ${assistant.name}`);
      
      // Log details of each call
      if (calls.length > 0) {
        calls.forEach((call, index) => {
          console.log(`\nCall ${index + 1}:`);
          console.log(`  ID: ${call.id}`);
          console.log(`  Status: ${call.status}`);
          console.log(`  Duration: ${call.duration || 0} seconds`);
          console.log(`  Created At: ${call.createdAt}`);
        });
      }
    }
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main().catch(console.error);
