// Test script to debug invoice data in MongoDB
import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables
config({ path: '.env.local' });

async function debugInvoices() {
  console.log('Starting invoice debug script');
  
  // Connect to MongoDB directly
  console.log('Connecting to MongoDB...');
  const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
  
  try {
    await mongoClient.connect();
    console.log('MongoDB connected successfully');
    
    const database = mongoClient.db();
    
    // Check if invoices collection exists
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Available collections:', collectionNames);
    
    if (!collectionNames.includes('invoices')) {
      console.log('ERROR: invoices collection does not exist!');
      return;
    }
    
    // Query invoices collection
    const invoicesCollection = database.collection('invoices');
    const invoices = await invoicesCollection.find({}).toArray();
    
    console.log(`Found ${invoices.length} invoices in the collection`);
    
    // Print details of each invoice
    for (const invoice of invoices) {
      console.log('\n--- Invoice Details ---');
      console.log('ID:', invoice._id);
      console.log('stripeInvoiceId:', invoice.stripeInvoiceId);
      console.log('userId:', invoice.userId);
      console.log('amount:', invoice.amount);
      console.log('status:', invoice.status);
      console.log('invoiceDate:', invoice.invoiceDate);
      console.log('number:', invoice.number);
      
      // Check if invoice has all required fields for UI display
      const requiredFields = ['stripeInvoiceId', 'amount', 'status', 'invoiceDate'];
      const missingFields = requiredFields.filter(field => !invoice[field]);
      
      if (missingFields.length > 0) {
        console.log('WARNING: Invoice is missing required fields:', missingFields);
      }
    }
    
    // Now check the clients collection for users with purchases/transactions
    console.log('\n\nChecking clients collection for purchase/transaction data...');
    const clientsCollection = database.collection('clients');
    
    // Find clients with purchases or transactions
    const clientsWithPurchases = await clientsCollection.find({
      $or: [
        { 'purchases': { $exists: true, $ne: [] } },
        { 'transactions': { $exists: true, $ne: [] } }
      ]
    }).toArray();
    
    console.log(`Found ${clientsWithPurchases.length} clients with purchases/transactions`);
    
    for (const client of clientsWithPurchases) {
      console.log('\n--- Client with Purchases ---');
      console.log('Client ID:', client._id);
      console.log('Name:', client.name || 'Unknown');
      console.log('Email:', client.email || 'No email');
      console.log('userId:', client.userId || 'No userId');
      
      // Count purchases and transactions
      const purchaseCount = Array.isArray(client.purchases) ? client.purchases.length : 0;
      const transactionCount = Array.isArray(client.transactions) ? client.transactions.length : 0;
      
      console.log(`Purchases: ${purchaseCount}, Transactions: ${transactionCount}`);
      
      // Check if this client's purchases have corresponding invoices
      if (purchaseCount > 0) {
        for (const purchase of client.purchases) {
          console.log('\n  Purchase:', purchase.id || purchase._id || 'No ID');
          console.log('  Amount:', purchase.amount || 'No amount');
          console.log('  Status:', purchase.status || 'No status');
          console.log('  Date:', purchase.date || purchase.created || 'No date');
          
          // Check if this purchase has a corresponding invoice
          const matchingInvoice = invoices.find(inv => 
            inv.stripeInvoiceId === purchase.id || 
            inv.metadata?.purchaseId === purchase.id
          );
          
          if (matchingInvoice) {
            console.log('  ✅ Has matching invoice:', matchingInvoice._id);
          } else {
            console.log('  ❌ No matching invoice found');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error in invoice debug script:', error);
  } finally {
    await mongoClient.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the debug function
debugInvoices();
