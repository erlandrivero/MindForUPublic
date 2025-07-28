// Simple script to check Vapi API key
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = resolve(__dirname, '../.env.local');
config({ path: envPath });

console.log('=== Vapi API Key Check ===');

// Read the .env.local file directly to verify content
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Look for Vapi key variables
  const vapiPrivateKeyMatch = envContent.match(/VAPI_PRIVATE_KEY=([^\n]+)/);
  const vapiPublicKeyMatch = envContent.match(/NEXT_PUBLIC_VAPI_PUBLIC_KEY=([^\n]+)/);
  
  console.log('Direct file check:');
  console.log('VAPI_PRIVATE_KEY in file:', vapiPrivateKeyMatch ? 'Found' : 'Not found');
  console.log('NEXT_PUBLIC_VAPI_PUBLIC_KEY in file:', vapiPublicKeyMatch ? 'Found' : 'Not found');
  
  // Check if the keys are properly loaded in process.env
  console.log('\nEnvironment variables check:');
  console.log('VAPI_PRIVATE_KEY in process.env:', process.env.VAPI_PRIVATE_KEY ? 
    `Exists (first 4 chars): ${process.env.VAPI_PRIVATE_KEY.substring(0, 4)}...` : 'Missing');
  console.log('NEXT_PUBLIC_VAPI_PUBLIC_KEY in process.env:', process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? 
    `Exists (first 4 chars): ${process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY.substring(0, 4)}...` : 'Missing');
  
  // Check for other possible variable names that might be used
  console.log('\nChecking for alternative variable names:');
  const allVapiKeys = Object.keys(process.env).filter(key => 
    key.toLowerCase().includes('vapi') || 
    key.toLowerCase().includes('api_key')
  );
  
  if (allVapiKeys.length > 0) {
    console.log('Found these Vapi-related environment variables:');
    allVapiKeys.forEach(key => {
      const value = process.env[key];
      console.log(`- ${key}: ${value ? `Exists (first 4 chars): ${value.substring(0, 4)}...` : 'Empty'}`);
    });
  } else {
    console.log('No alternative Vapi-related environment variables found');
  }
  
} catch (error) {
  console.error('Error reading .env.local file:', error);
}

console.log('\n=== End of Check ===');
