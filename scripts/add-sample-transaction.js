// ES Module script to add a sample transaction to an existing client
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  console.log('=== ADD SAMPLE TRANSACTION SCRIPT STARTED ===');
  
  // Check if MongoDB URI is available
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable not set');
    return;
  }
  
  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('MongoDB connection established');
    
    const database = client.db();
    console.log(`Connected to database: ${database.databaseName}`);
    
    // Get the clients collection
    const clientsCollection = database.collection('clients');
    
    // Find the first client
    const existingClient = await clientsCollection.findOne({});
    
    if (!existingClient) {
      console.log('No clients found in database');
      await client.close();
      return;
    }
    
    console.log(`Found client: ${existingClient._id} (${existingClient.name || 'Unknown'})`);
    console.log(`Client userId: ${existingClient.userId}`);
    
    // Create a sample transaction
    const sampleTransaction = {
      id: 'sample_transaction_' + Date.now(),
      date: new Date().toISOString(),
      amount: 99.99,
      currency: 'usd',
      status: 'paid',
      description: 'Sample Transaction for Testing',
      reference: 'REF-' + Date.now().toString().substring(7),
      receiptUrl: 'https://example.com/receipt',
      receiptPdf: 'https://example.com/receipt.pdf'
    };
    
    console.log('Sample transaction created:');
    console.log(JSON.stringify(sampleTransaction, null, 2));
    
    // Check if client already has transactions array
    const hasTransactions = Array.isArray(existingClient.transactions);
    console.log(`Client already has transactions array: ${hasTransactions}`);
    
    // Update the client with the new transaction
    const updateResult = await clientsCollection.updateOne(
      { _id: existingClient._id },
      { 
        $set: { 
          updatedAt: new Date() 
        },
        $push: { 
          transactions: sampleTransaction 
        } 
      },
      { upsert: false }
    );
    
    console.log('Update result:');
    console.log(JSON.stringify(updateResult, null, 2));
    
    if (updateResult.modifiedCount === 1) {
      console.log('Successfully added sample transaction to client');
      
      // Verify the transaction was added
      const updatedClient = await clientsCollection.findOne({ _id: existingClient._id });
      
      if (Array.isArray(updatedClient.transactions) && updatedClient.transactions.length > 0) {
        console.log(`Client now has ${updatedClient.transactions.length} transaction(s)`);
        console.log('Latest transaction:');
        console.log(JSON.stringify(updatedClient.transactions[updatedClient.transactions.length - 1], null, 2));
      } else {
        console.log('Transaction was not added correctly');
      }
    } else {
      console.log('Failed to add transaction to client');
    }
    
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main().catch(console.error);
