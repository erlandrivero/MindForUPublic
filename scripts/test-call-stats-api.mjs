// Test script for call-stats API
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

console.log('=== Call Stats API Test ===');

// Check API key
console.log('VAPI_PRIVATE_KEY:', process.env.VAPI_PRIVATE_KEY ? 
  `Exists (first 4 chars): ${process.env.VAPI_PRIVATE_KEY.substring(0, 4)}...` : 'Missing');

// Initialize Vapi client
const vapi = new VapiClient({
  token: process.env.VAPI_PRIVATE_KEY,
});

// Function to get assistants
async function getAssistants() {
  try {
    console.log('Fetching assistants...');
    const assistants = await vapi.assistants.list();
    
    // Check if assistants is an array directly or has a data property containing an array
    const assistantsArray = Array.isArray(assistants) ? assistants : (assistants?.data || []);
    
    console.log(`Found ${assistantsArray.length} assistants`);
    return assistantsArray;
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
    
    // Check if callLogs is an array directly or has a data property containing an array
    const callLogsArray = Array.isArray(callLogs) ? callLogs : (callLogs?.data || []);
    
    console.log(`Found ${callLogsArray.length} calls for assistant ${assistantId}`);
    return callLogsArray;
  } catch (error) {
    console.error(`Error fetching call logs for assistant ${assistantId}:`, error);
    return [];
  }
}

// Function to calculate call statistics
function calculateCallStats(callLogs) {
  // Get today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter calls for today
  const todayCalls = callLogs.filter(call => {
    const callDate = new Date(call.createdAt);
    return callDate.getDate() === today.getDate() &&
           callDate.getMonth() === today.getMonth() &&
           callDate.getFullYear() === today.getFullYear();
  });
  
  // Filter successful calls
  const successfulCalls = callLogs.filter(call => call.status === 'completed');
  
  // Calculate average duration
  let totalDuration = 0;
  callLogs.forEach(call => {
    totalDuration += call.duration || 0;
  });
  const avgDuration = callLogs.length > 0 ? totalDuration / callLogs.length : 0;
  
  // Calculate success rate
  const successRate = callLogs.length > 0 
    ? Math.round((successfulCalls.length / callLogs.length) * 100) 
    : 0;
  
  return {
    totalCalls: callLogs.length,
    callsToday: todayCalls.length,
    avgDuration: avgDuration,
    successRate: successRate,
    lastActiveTimestamp: callLogs.length > 0 ? new Date(callLogs[0].createdAt) : undefined
  };
}

// Main function
async function main() {
  try {
    // Get all assistants
    const assistants = await getAssistants();
    
    // If no assistants found, exit
    if (assistants.length === 0) {
      console.log('No assistants found');
      return;
    }
    
    // Initialize results object
    const results = {
      assistantStats: [],
      overallStats: {
        totalCalls: 0,
        callsToday: 0,
        avgSuccessRate: 0,
        avgDuration: 0
      },
      errors: []
    };
    
    // Get call logs for each assistant
    for (const assistant of assistants) {
      console.log(`\nProcessing assistant: ${assistant.name} (${assistant.id})`);
      const callLogs = await getCallLogs(assistant.id);
      
      // Calculate statistics
      const stats = calculateCallStats(callLogs);
      
      // Add to assistant stats
      results.assistantStats.push({
        assistantId: assistant.id,
        name: assistant.name,
        ...stats
      });
      
      // Update overall stats
      results.overallStats.totalCalls += stats.totalCalls;
      results.overallStats.callsToday += stats.callsToday;
    }
    
    // Calculate overall success rate and duration
    if (results.assistantStats.length > 0) {
      let totalSuccessRate = 0;
      let totalDuration = 0;
      let assistantsWithCalls = 0;
      
      results.assistantStats.forEach(stat => {
        if (stat.totalCalls > 0) {
          totalSuccessRate += stat.successRate;
          totalDuration += stat.avgDuration;
          assistantsWithCalls++;
        }
      });
      
      results.overallStats.avgSuccessRate = assistantsWithCalls > 0 
        ? Math.round(totalSuccessRate / assistantsWithCalls) 
        : 0;
        
      results.overallStats.avgDuration = assistantsWithCalls > 0 
        ? totalDuration / assistantsWithCalls 
        : 0;
    }
    
    // Print results
    console.log('\n=== Call Statistics Results ===');
    console.log(`Total Calls: ${results.overallStats.totalCalls}`);
    console.log(`Calls Today: ${results.overallStats.callsToday}`);
    console.log(`Average Success Rate: ${results.overallStats.avgSuccessRate}%`);
    console.log(`Average Duration: ${results.overallStats.avgDuration.toFixed(2)} seconds`);
    
    console.log('\nAssistant Statistics:');
    results.assistantStats.forEach(stat => {
      console.log(`\n${stat.name} (${stat.assistantId})`);
      console.log(`  Total Calls: ${stat.totalCalls}`);
      console.log(`  Calls Today: ${stat.callsToday}`);
      console.log(`  Success Rate: ${stat.successRate}%`);
      console.log(`  Average Duration: ${stat.avgDuration.toFixed(2)} seconds`);
      console.log(`  Last Active: ${stat.lastActiveTimestamp || 'Never'}`);
    });
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main().then(() => {
  console.log('\n=== End of Call Stats API Test ===');
}).catch(error => {
  console.error('Unhandled error:', error);
});
