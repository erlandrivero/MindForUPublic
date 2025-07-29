// Simple script to run the migration using Next.js environment
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting phone number migration script...');

// Run the migration script using next build environment
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    RUN_MIGRATION: 'true'
  }
});

console.log('Next.js server started with migration flag. Check server logs for migration progress.');
console.log('Press Ctrl+C to stop the server once migration is complete.');

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js server:', error);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js server process exited with code ${code}`);
});
