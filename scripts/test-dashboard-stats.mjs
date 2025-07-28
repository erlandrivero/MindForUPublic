// Test script for dashboard stats API
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('=== Dashboard Stats API Test ===');
console.log('VAPI_PRIVATE_KEY:', process.env.VAPI_PRIVATE_KEY ? 'Exists (first 4 chars): ' + process.env.VAPI_PRIVATE_KEY.substring(0, 4) : 'Missing');

async function testDashboardStats() {
  try {
    // Create a simple fetch request to the dashboard stats API
    const response = await fetch('http://localhost:3000/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Dashboard Stats API Response:');
    console.log(JSON.stringify(data, null, 2));

    // Display stats breakdown
    if (data.stats && Array.isArray(data.stats)) {
      console.log('\nStats Breakdown:');
      data.stats.forEach(stat => {
        console.log(`- ${stat.name}: ${stat.value} (${stat.change})`);
      });
    }

    // Display recent activity
    if (data.recentActivity && Array.isArray(data.recentActivity)) {
      console.log('\nRecent Activity:');
      data.recentActivity.forEach(activity => {
        console.log(`- ${activity.message} (${activity.time})`);
      });
    }

  } catch (error) {
    console.error('Error testing dashboard stats API:', error);
  }
}

// Run the test
testDashboardStats();
