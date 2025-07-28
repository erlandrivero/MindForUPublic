// Direct MongoDB test script
// This script tests MongoDB connection and collection operations
// without relying on environment variables

import { MongoClient } from 'mongodb';
import fs from 'fs';

// Function to log output to both console and file
function log(message) {
  const logMessage = `${new Date().toISOString()} - ${message}`;
  console.log(logMessage);
  fs.appendFileSync('./mongodb-test-log.txt', logMessage + '\n');
}

// Initialize log file
fs.writeFileSync('./mongodb-test-log.txt', `MongoDB Test Log - ${new Date().toISOString()}\n\n`);

// MongoDB connection test
async function testMongoDB() {
  log('Starting MongoDB connection test...');
  
  // Ask for MongoDB URI input if not provided
  // Try to load from .env.local file if exists
  let mongoURI;
  try {
    if (fs.existsSync('./.env.local')) {
      const envContent = fs.readFileSync('./.env.local', 'utf8');
      const envLines = envContent.split('\n');
      for (const line of envLines) {
        if (line.startsWith('MONGODB_URI=')) {
          mongoURI = line.substring('MONGODB_URI='.length).trim();
          if (mongoURI.startsWith('"') && mongoURI.endsWith('"')) {
            mongoURI = mongoURI.substring(1, mongoURI.length - 1);
          }
          break;
        }
      }
    }
  } catch (err) {
    log(`Error reading .env.local file: ${err.message}`);
  }
  
  // Fallback to command line argument or default
  mongoURI = mongoURI || process.argv[2] || 'mongodb+srv://your-mongodb-uri';
  log(`Using MongoDB URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials in logs
  
  const client = new MongoClient(mongoURI);
  
  try {
    log('Attempting to connect to MongoDB...');
    await client.connect();
    log('Successfully connected to MongoDB');
    
    const db = client.db();
    log(`Connected to database: ${db.databaseName}`);
    
    // List all collections
    log('Listing collections...');
    const collections = await db.listCollections().toArray();
    log(`Found ${collections.length} collections:`);
    collections.forEach(collection => {
      log(`- ${collection.name}`);
    });
    
    // Check if clients and invoices collections exist
    const clientsCollectionExists = collections.some(collection => collection.name === 'clients');
    const invoicesCollectionExists = collections.some(collection => collection.name === 'invoices');
    log(`Clients collection exists: ${clientsCollectionExists}`);
    log(`Invoices collection exists: ${invoicesCollectionExists}`);
    
    // Check invoices collection if it exists
    if (invoicesCollectionExists) {
      const invoicesCollection = db.collection('invoices');
      
      // Count documents
      const invoiceCount = await invoicesCollection.countDocuments();
      log(`Invoices collection contains ${invoiceCount} documents`);
      
      // Find the old test invoice (the one with in_mdlzj55h3tw94 ID)
      const oldInvoice = await invoicesCollection.findOne({ stripeInvoiceId: "in_mdlzj55h3tw94" });
      if (oldInvoice) {
        log(`Found old test invoice with ID: ${oldInvoice._id}`);
        log(`Old test invoice details: ${JSON.stringify(oldInvoice, null, 2)}`);
      } else {
        log(`Old test invoice not found`);
      }
      
      // Sample all invoices
      if (invoiceCount > 0) {
        const invoiceSamples = await invoicesCollection.find().toArray();
        log(`All invoices (${invoiceSamples.length}):`);
        invoiceSamples.forEach((doc, i) => {
          // Sanitize the document to hide sensitive info
          const sanitized = { ...doc };
          if (sanitized._id) sanitized._id = sanitized._id.toString();
          log(`Invoice ${i + 1}: ${JSON.stringify(sanitized, null, 2)}`);
        });
      }
    }
    
    // Test operations on clients collection
    if (clientsCollectionExists) {
      const clientsCollection = db.collection('clients');
      
      // Count documents
      const count = await clientsCollection.countDocuments();
      log(`Clients collection contains ${count} documents`);
      
      // Check for documents with purchases
      const purchaseCount = await clientsCollection.countDocuments({
        'purchases': { $exists: true, $ne: [] }
      });
      log(`Clients with purchases: ${purchaseCount}`);
      
      // Sample a few documents
      if (count > 0) {
        const samples = await clientsCollection.find().limit(3).toArray();
        log(`Sample documents (up to 3):`);
        samples.forEach((doc, i) => {
          // Sanitize the document to hide sensitive info
          const sanitized = { ...doc };
          if (sanitized._id) sanitized._id = sanitized._id.toString();
          log(`Document ${i + 1}: ${JSON.stringify(sanitized, null, 2)}`);
        });
      }
      
      // Test inserting a document
      log('Testing document insertion...');
      const testDoc = {
        clientId: 'test-client-' + Date.now(),
        stripeCustomerId: 'test-stripe-customer-' + Date.now(),
        email: 'test@example.com',
        name: 'Test Client',
        purchases: [{
          sessionId: 'test-session-' + Date.now(),
          amount_total: 1000,
          currency: 'usd',
          payment_status: 'paid',
          created: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await clientsCollection.insertOne(testDoc);
      log(`Document inserted with ID: ${insertResult.insertedId}`);
      
      // Verify the document was inserted
      const inserted = await clientsCollection.findOne({ _id: insertResult.insertedId });
      log(`Retrieved inserted document: ${JSON.stringify(inserted, null, 2)}`);
      
      // Clean up - delete the test document
      log('Cleaning up - deleting test document...');
      const deleteResult = await clientsCollection.deleteOne({ _id: insertResult.insertedId });
      log(`Deleted ${deleteResult.deletedCount} document(s)`);
    } else {
      // Create clients collection if it doesn't exist
      log('Clients collection does not exist. Creating it...');
      await db.createCollection('clients');
      log('Clients collection created');
      
      // Test inserting a document into the new collection
      const clientsCollection = db.collection('clients');
      const testDoc = {
        clientId: 'test-client-' + Date.now(),
        stripeCustomerId: 'test-stripe-customer-' + Date.now(),
        email: 'test@example.com',
        name: 'Test Client',
        purchases: [{
          sessionId: 'test-session-' + Date.now(),
          amount_total: 1000,
          currency: 'usd',
          payment_status: 'paid',
          created: new Date()
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await clientsCollection.insertOne(testDoc);
      log(`Document inserted with ID: ${insertResult.insertedId}`);
      
      // Verify the document was inserted
      const inserted = await clientsCollection.findOne({ _id: insertResult.insertedId });
      log(`Retrieved inserted document: ${JSON.stringify(inserted, null, 2)}`);
      
      // Clean up - delete the test document
      log('Cleaning up - deleting test document...');
      const deleteResult = await clientsCollection.deleteOne({ _id: insertResult.insertedId });
      log(`Deleted ${deleteResult.deletedCount} document(s)`);
    }
    
    log('MongoDB test completed successfully');
    return true;
  } catch (error) {
    log(`ERROR: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    return false;
  } finally {
    await client.close();
    log('MongoDB connection closed');
  }
}

// Run the test
testMongoDB()
  .then(success => {
    log(`Test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`Unhandled error: ${error}`);
    process.exit(1);
  });
