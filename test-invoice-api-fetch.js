// Simple script to test the invoice API using fetch
// This script uses ES modules syntax

import * as http from 'http';

console.log('Testing invoice API GET endpoint...');

// Options for the HTTP request
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/dashboard/invoices',
  method: 'GET'
};

// Make the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  // A chunk of data has been received
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // The whole response has been received
  res.on('end', () => {
    console.log('RESPONSE DATA:');
    try {
      const parsedData = JSON.parse(data);
      console.log(`Received ${Array.isArray(parsedData) ? parsedData.length : 0} invoices`);
      console.log(JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
      console.log('Raw data:', data);
    }
  });
});

// Handle errors
req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// End the request
req.end();
