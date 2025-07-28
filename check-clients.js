// Script to check for clients with transactions
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Initialize dotenv
dotenv.config();

// Get current file directory (ES modules equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable not set');
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check clients collection
    const clients = await db.collection('clients').find({
      'transactions': { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`Found ${clients.length} clients with transactions`);
    
    if (clients.length > 0) {
      console.log('Sample client:');
      const sampleClient = clients[0];
      console.log(`- Name: ${sampleClient.name || 'Unknown'}`);
      console.log(`- ID: ${sampleClient._id}`);
      console.log(`- userId: ${sampleClient.userId}`);
      console.log(`- Transactions: ${sampleClient.transactions ? sampleClient.transactions.length : 0}`);
      
      if (sampleClient.transactions && sampleClient.transactions.length > 0) {
        console.log('Sample transaction:');
        const sampleTransaction = sampleClient.transactions[0];
        console.log(JSON.stringify(sampleTransaction, null, 2));
      }
    }
    
    // Check invoices collection
    const invoices = await db.collection('invoices').find({}).toArray();
    console.log(`Found ${invoices.length} invoices in the invoices collection`);
    
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

run().catch(console.error);
