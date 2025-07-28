// ES Module script to check and create invoices in MongoDB
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Setup ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  console.log('=== INVOICE CHECK SCRIPT STARTED ===');
  
  // Check if MongoDB URI is available
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable not set');
    console.log('Checking for .env.local file...');
    
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      console.log('.env.local file exists');
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('Contents:');
      console.log(envContent);
    } else {
      console.log('.env.local file does not exist');
    }
    
    // Set a placeholder URI without credentials for testing
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
    console.log('Created placeholder MONGODB_URI for testing (will fail to connect)');
  }
  
  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  console.log(`MONGODB_URI defined: ${!!process.env.MONGODB_URI}`);
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('MongoDB connection established');
    
    const database = client.db();
    console.log(`Connected to database: ${database.databaseName}`);
    
    // Check existing collections
    const collections = await database.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check invoices collection
    const invoicesCollection = database.collection('invoices');
    const invoicesCount = await invoicesCollection.countDocuments();
    console.log(`Found ${invoicesCount} invoices in MongoDB`);
    
    if (invoicesCount > 0) {
      const sampleInvoice = await invoicesCollection.findOne({});
      console.log('Sample invoice:');
      console.log(JSON.stringify(sampleInvoice, null, 2));
    }
    
    // Check clients with transactions
    const clientsCollection = database.collection('clients');
    const clientsWithTransactions = await clientsCollection.find({
      'transactions': { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`Found ${clientsWithTransactions.length} clients with transactions`);
    
    // Sample the first client with transactions
    if (clientsWithTransactions.length > 0) {
      const sampleClient = clientsWithTransactions[0];
      console.log('Sample client with transactions:');
      console.log(`- ID: ${sampleClient._id}`);
      console.log(`- Name: ${sampleClient.name || 'Unknown'}`);
      console.log(`- userId: ${sampleClient.userId}`);
      console.log(`- userId type: ${typeof sampleClient.userId}`);
      
      if (Array.isArray(sampleClient.transactions)) {
        console.log(`- Transactions count: ${sampleClient.transactions.length}`);
        
        if (sampleClient.transactions.length > 0) {
          console.log('Sample transaction:');
          const sampleTransaction = sampleClient.transactions[0];
          console.log(JSON.stringify(sampleTransaction, null, 2));
          
          // Try to create an invoice from this transaction
          console.log('Attempting to create an invoice from this transaction...');
          
          // Format date properly
          let invoiceDate;
          try {
            invoiceDate = new Date(sampleTransaction.date);
            if (isNaN(invoiceDate.getTime())) {
              console.log(`Invalid date format: ${sampleTransaction.date}, using current date`);
              invoiceDate = new Date();
            }
          } catch (e) {
            console.log(`Error parsing date: ${e.message}, using current date`);
            invoiceDate = new Date();
          }
          
          // Create a unique ID for this test
          const uniqueId = 'test_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
          
          // Create invoice object
          const invoiceData = {
            userId: sampleClient.userId,
            stripeInvoiceId: uniqueId,
            number: `INV-${uniqueId.substring(0, 8)}`,
            description: sampleTransaction.description || `Payment - ${sampleClient.name || 'Client'}`,
            amount: sampleTransaction.amount || 0,
            total: sampleTransaction.amount || 0,
            currency: sampleTransaction.currency || 'usd',
            status: sampleTransaction.status || 'paid',
            invoiceDate: invoiceDate,
            invoiceUrl: sampleTransaction.receiptUrl || '',
            invoicePdf: sampleTransaction.receiptPdf || '',
            metadata: {
              clientId: sampleClient._id.toString(),
              clientName: sampleClient.name || 'Unknown Client',
              source: 'check_script'
            }
          };
          
          console.log('Invoice data:');
          console.log(JSON.stringify(invoiceData, null, 2));
          
          // Insert the invoice
          try {
            const result = await invoicesCollection.insertOne(invoiceData);
            console.log(`Invoice created successfully with _id: ${result.insertedId}`);
          } catch (error) {
            console.error('Error creating invoice:', error.message);
          }
        }
      }
    } else {
      console.log('No clients with transactions found');
      
      // Check if there are any clients at all
      const allClients = await clientsCollection.countDocuments();
      console.log(`Total clients in database: ${allClients}`);
    }
    
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Run the script
main().catch(console.error);
