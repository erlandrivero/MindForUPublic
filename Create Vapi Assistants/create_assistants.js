import fs from 'fs/promises';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically load dotenv and read .env.local
const dotenv = await import('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const VAPI_API_KEY = process.env.VAPI_API_KEY || process.env.NEXT_PUBLIC_VAPI_API_KEY;
if (!VAPI_API_KEY) {
  console.error('Vapi API key not found in .env.local. Please set VAPI_API_KEY or NEXT_PUBLIC_VAPI_API_KEY.');
  process.exit(1);
}

const assistantFiles = [
  { file: 'mindfor_customer_service_assistant (1).json', name: 'Customer Service' },
  { file: 'mindfor_sales_lead_qualification (1).json', name: 'Sales Qualification' },
  { file: 'mindfor_ecommerce_assistant (1).json', name: 'E-commerce' },
  { file: 'mindfor_appointment_scheduling (1).json', name: 'Appointment Scheduling' }
];

async function createAssistant(config, name) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(config);
    const options = {
      hostname: 'api.vapi.ai',
      port: 443,
      path: '/assistant',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 201 || response.id) {
            resolve({ name, id: response.id, response });
          } else {
            reject(new Error(`Failed to create ${name}: ${body}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', (error) => { reject(error); });
    req.write(data);
    req.end();
  });
}

async function createAllAssistants() {
  console.log('Creating MindForU assistants...\n');
  const results = [];
  for (const { file, name } of assistantFiles) {
    try {
      const config = JSON.parse(await fs.readFile(path.join(__dirname, file), 'utf-8'));
      console.log(`Creating ${name}...`);
      const result = await createAssistant(config, name);
      results.push(result);
      console.log(`${name} Assistant ID: ${result.id}\n`);
    } catch (err) {
      console.error(`Error creating ${name}:`, err.message);
    }
  }
  console.log('\nAssistant IDs for your React component:');
  results.forEach(r => console.log(`${r.name}: ${r.id}`));
}

createAllAssistants().catch(console.error);
