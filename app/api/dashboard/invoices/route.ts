import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

// Utility function to create a valid session object for development mode
// Prefixed with underscore to indicate it's intentionally unused in this file but kept for future use
function _createDevSession(email: string): Session {
  return {
    user: { id: 'dev-user', email },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}
import connectMongo from '@/libs/mongoose';
import mongoose from 'mongoose';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import { MongoClient } from 'mongodb';

export async function GET(_req: NextRequest) {
  try {
    console.log('Starting dashboard invoices API route');
    
    let session = await getServerSession(authOptions);
    
    // In development mode, allow unauthenticated requests for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session?.user?.email) {
      console.log('No valid session found');
      
      if (isDevelopment) {
        console.log('Development mode: proceeding without authentication');
        // Use a default test email for development
        session = { 
          user: { id: 'dev-user', email: 'erlandrivero@gmail.com' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      } else {
        console.log('Production mode: authentication required');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    console.log(`Authenticated user: ${session.user.email}`);
    console.log('Connecting to MongoDB...');
    await connectMongo();
    console.log('MongoDB connection established');

    console.log(`Finding user with email: ${session.user.email}`);
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log(`Found user: ${user._id} (${user.email})`);

    // First, check if we have any invoices in the Invoice collection
    console.log(`Checking for invoices in Invoice collection for user ${user.email} (${user._id})`);
    
    // Use more flexible query for userId
    const invoices = await Invoice.find({
      $or: [
        { userId: user._id }, // As ObjectId
        { userId: user._id.toString() }, // As string
        { 'userId.$oid': user._id.toString() } // As nested ObjectId
      ]
    })
    .sort({ invoiceDate: -1 }) // Sort by date, newest first
    .lean(); // Convert to plain JavaScript objects
    
    console.log(`Found ${invoices.length} invoices in MongoDB for user ${user.email}`);
    
    // If no invoices found in MongoDB, try to build them from client transactions
    if (invoices.length === 0) {
      console.log('No invoices found in MongoDB, building from client transactions...');
      
      // Connect to MongoDB directly to access the clients collection
      const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
      await mongoClient.connect();
      
      try {
        const database = mongoClient.db();
        const clientsCollection = database.collection('clients');
        
        // Find transactions for this user with flexible userId matching
        const userId = user._id.toString();
        const userObjectId = user._id;
        
        console.log(`Searching for transactions with userId: ${userId}`);
        
        // Use $or to handle different userId formats (string, ObjectId, nested ObjectId)
        const transactions = await clientsCollection.find({
          $or: [
            { userId: userId }, // userId as string
            { userId: userObjectId }, // userId as ObjectId
            { 'userId.$oid': userId } // userId as nested ObjectId format
          ],
          'transactions': { $exists: true, $ne: [] }
        }).toArray();
        
        console.log(`Found ${transactions.length} clients with transactions for user ${user.email}`);
        
        // Build invoices from transaction data
        // Variable not used but kept for clarity in code structure
        const _tempInvoices = [];
        const savedInvoices = [];
        
        console.log(`Processing transactions from ${transactions.length} clients`);
        
        for (const client of transactions) {
          console.log(`Processing client: ${client.name || 'Unknown'} (${client._id})`);
          
          if (Array.isArray(client.transactions)) {
            console.log(`Found ${client.transactions.length} transactions for client`);
            
            for (const transaction of client.transactions) {
              // Skip if missing critical data
              if (!transaction.id || !transaction.date) {
                console.log('Skipping transaction with missing id or date');
                continue;
              }
              
              console.log(`Processing transaction: ${transaction.id}`);
              
              // Format date properly
              let invoiceDate;
              try {
                invoiceDate = new Date(transaction.date);
                if (isNaN(invoiceDate.getTime())) {
                  console.log(`Invalid date format: ${transaction.date}, using current date`);
                  invoiceDate = new Date();
                }
              } catch (e) {
                console.log(`Error parsing date: ${e.message}, using current date`);
                invoiceDate = new Date();
              }
              
              // Create invoice object
              const invoiceData = {
                _id: new mongoose.Types.ObjectId(), // Add _id for MongoDB
                userId: user._id,
                stripeInvoiceId: transaction.id,
                number: transaction.reference || `INV-${transaction.id.substring(0, 8)}`,
                description: transaction.description || `Payment - ${client.name || 'Client'}`,
                amount: transaction.amount || 0,
                total: transaction.amount || 0, // Required by the Invoice model
                currency: transaction.currency || 'usd',
                status: transaction.status || 'paid',
                invoiceDate: invoiceDate,
                invoiceUrl: transaction.receiptUrl || '',
                invoicePdf: transaction.receiptPdf || '',
                metadata: {
                  clientId: client._id.toString(),
                  clientName: client.name || 'Unknown Client',
                  source: 'client_transaction'
                }
              };
              
              console.log('Created invoice data:');
              console.log(JSON.stringify(invoiceData, null, 2));
              
              invoices.push(invoiceData);
              console.log(`Added invoice for transaction ${transaction.id}`);
              
              // Try to save to MongoDB Invoice collection
              try {
                // Check if this invoice already exists
                console.log(`Checking if invoice with stripeInvoiceId ${transaction.id} already exists...`);
                const existingInvoice = await Invoice.findOne({ stripeInvoiceId: transaction.id });
                
                if (!existingInvoice) {
                  console.log('No existing invoice found, creating new one...');
                  // Create new invoice document
                  const newInvoice = new Invoice(invoiceData);
                  
                  try {
                    console.log('Validating invoice before save...');
                    await newInvoice.validate();
                    console.log('Invoice validation passed');
                  } catch (validationError) {
                    console.error('Invoice validation failed:', validationError);
                    continue; // Skip this invoice
                  }
                  
                  console.log('Saving invoice to MongoDB...');
                  await newInvoice.save();
                  savedInvoices.push(newInvoice);
                  console.log(`Saved invoice ${transaction.id} to MongoDB with _id: ${newInvoice._id}`);
                } else {
                  console.log(`Existing invoice found with _id: ${existingInvoice._id}, updating...`);
                  // Update existing invoice
                  await Invoice.findByIdAndUpdate(existingInvoice._id, invoiceData);
                  savedInvoices.push(existingInvoice);
                  console.log(`Updated existing invoice ${transaction.id} in MongoDB`);
                }
              } catch (saveError) {
                console.error(`Error saving invoice ${transaction.id} to MongoDB:`, saveError);
              }
            }
          } else {
            console.log('No transactions array found for client');
          }
        }
        
        // Sort by date, newest first
        invoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
        
        console.log(`Built ${invoices.length} invoices from client transactions`);
        console.log(`Saved/updated ${savedInvoices.length} invoices in MongoDB`);
        
        // Double-check that invoices were actually saved
        console.log('Verifying invoices were saved to MongoDB...');
        const savedInvoicesCheck = await Invoice.find({ userId: user._id }).lean();
        console.log(`Found ${savedInvoicesCheck.length} invoices in MongoDB after save operation`);
        
        return NextResponse.json({ 
          message: 'Invoices refreshed and saved to MongoDB successfully',
          invoices,
          savedCount: savedInvoices.length,
          verifiedCount: savedInvoicesCheck.length
        });
      } finally {
        await mongoClient.close();
        console.log('MongoDB client connection closed');
      }
    }
    
    return NextResponse.json({ invoices });
    
  } catch (error) {
    console.error('Error syncing invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Refresh invoices from clients collection and store in MongoDB
export async function POST(_req: NextRequest) {
  try {
    console.log('=== INVOICE API POST ROUTE STARTED ===');
    console.log('Checking authentication...');
    
    let session = await getServerSession(authOptions);
    
    // In development mode, allow unauthenticated requests for testing
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session?.user?.email) {
      console.log('No valid session found');
      
      if (isDevelopment) {
        console.log('Development mode: proceeding without authentication');
        // Use a default test email for development
        session = { 
          user: { id: 'dev-user', email: 'erlandrivero@gmail.com' },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
      } else {
        console.log('Production mode: authentication required');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log(`Authenticated user: ${session.user.email}`);
    console.log('Connecting to MongoDB...');
    await connectMongo();
    console.log('MongoDB connection established');

    console.log(`Finding user with email: ${session.user.email}`);
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log(`Found user: ${user._id} (${user.email})`);

    // Connect to MongoDB directly to access the clients collection
    console.log('Connecting to MongoDB client directly...');
    console.log(`MONGODB_URI defined: ${!!process.env.MONGODB_URI}`);
    const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
    await mongoClient.connect();
    console.log('Direct MongoDB connection established');
    
    try {
      const database = mongoClient.db();
      console.log(`Connected to database: ${database.databaseName}`);
      
      const clientsCollection = database.collection('clients');
      console.log('Accessed clients collection');
      
      // Find transactions for this user with flexible userId matching
      const userId = user._id.toString();
      const userObjectId = user._id;
      
      console.log(`Searching for clients with userId: ${userId}`);
      console.log('Query criteria:');
      
      // Use $and to combine conditions properly
      // First, find ALL clients with purchases/transactions regardless of userId
      const allClientsWithPurchases = await clientsCollection.find({
        $or: [
          { 'purchases': { $exists: true, $ne: [] } },
          { 'transactions': { $exists: true, $ne: [] } }
        ]
      }).toArray();
      
      console.log(`Found ${allClientsWithPurchases.length} total clients with purchases/transactions`);
      
      // Then filter to find those that match this user (by userId or email)
      const clients = allClientsWithPurchases.filter(client => {
        // Check if client has matching userId
        if (client.userId && 
            (client.userId.toString() === userId || 
             client.userId === userId || 
             (client.userId.$oid && client.userId.$oid === userId))) {
          return true;
        }
        
        // Check if client email matches user email
        if (client.email && client.email === user.email) {
          return true;
        }
        
        // If we get here, this client doesn't match the current user
        return false;
      });
      
      // If no clients found for this user, try a broader search by email domain
      if (clients.length === 0 && user.email) {
        const emailDomain = user.email.split('@')[1];
        console.log(`No clients found for user. Trying broader search by email domain: ${emailDomain}`);
        
        // Add any clients with matching email domain
        allClientsWithPurchases.forEach(client => {
          if (client.email && client.email.includes(`@${emailDomain}`)) {
            clients.push(client);
          }
        });
      }
      
      console.log(`Found ${clients.length} clients with purchases/transactions for user ${user.email}`);
      
      // Also check if there are any clients at all for this user
      const allClients = await clientsCollection.find({
        $or: [
          { userId: userId },
          { userId: userObjectId },
          { 'userId.$oid': userId },
          { email: user.email } // Also check by email as a fallback
        ]
      }).toArray();
      
      console.log(`Total clients for user (with or without transactions): ${allClients.length}`);
      if (allClients.length > 0) {
        console.log('Sample client data structure:');
        const sampleClient = allClients[0];
        console.log(`- ID: ${sampleClient._id}`);
        console.log(`- Name: ${sampleClient.name || 'Unknown'}`);
        console.log(`- userId type: ${typeof sampleClient.userId}`);
        console.log(`- userId value: ${sampleClient.userId}`);
        console.log(`- Has transactions array: ${Array.isArray(sampleClient.transactions)}`);
        if (Array.isArray(sampleClient.transactions)) {
          console.log(`- Transactions count: ${sampleClient.transactions.length}`);
        }
        console.log(`- Has purchases array: ${Array.isArray(sampleClient.purchases)}`);
        if (Array.isArray(sampleClient.purchases)) {
          console.log(`- Purchases count: ${sampleClient.purchases.length}`);
        }
      }
      
      // Build invoices from purchases and transaction data
      const invoices = [];
      const savedInvoices = [];
      
      for (const client of clients) {
        console.log(`Processing client: ${client.name || 'Unknown'} (${client._id})`);
        console.log(`Client userId: ${client.userId}`);
        
        // Process purchases array (from webhook handler)
        if (Array.isArray(client.purchases)) {
          console.log(`Found ${client.purchases.length} purchases for client`);
          
          for (const purchase of client.purchases) {
            console.log('Purchase data:');
            console.log(JSON.stringify(purchase, null, 2));
            
            // Skip if missing critical data
            if (!purchase.sessionId) {
              console.log('Skipping purchase with missing sessionId');
              continue;
            }
            
            console.log(`Processing purchase: ${purchase.sessionId}`);
            
            // Format date properly
            let invoiceDate;
            try {
              invoiceDate = purchase.created || new Date();
              console.log(`Using date: ${invoiceDate.toISOString()}`);
              if (isNaN(invoiceDate.getTime())) {
                console.log(`Invalid date format, using current date`);
                invoiceDate = new Date();
              }
            } catch (e) {
              console.log(`Error parsing date: ${e.message}, using current date`);
              invoiceDate = new Date();
            }
            
            // Create invoice object
            const invoiceData = {
              userId: user._id,
              stripeInvoiceId: purchase.sessionId,
              number: `INV-${purchase.sessionId.substring(0, 8)}`,
              description: `Payment - ${client.name || 'Client'}`,
              amount: purchase.amount_total ? purchase.amount_total / 100 : 0, // Convert from cents
              total: purchase.amount_total ? purchase.amount_total / 100 : 0, // Required by the Invoice model
              currency: purchase.currency || 'usd',
              status: purchase.payment_status || 'paid',
              invoiceDate: invoiceDate,
              metadata: {
                clientId: client._id.toString(),
                clientName: client.name || 'Unknown Client',
                source: 'client_purchase'
              }
            };
            
            console.log('Created invoice data from purchase:');
            console.log(JSON.stringify(invoiceData, null, 2));
            
            invoices.push(invoiceData);
            console.log(`Added invoice for purchase ${purchase.sessionId}`);
            
            // Try to save to MongoDB Invoice collection
            try {
              // Check if this invoice already exists
              console.log(`Checking if invoice with stripeInvoiceId ${purchase.sessionId} already exists...`);
              const existingInvoice = await Invoice.findOne({ stripeInvoiceId: purchase.sessionId });
              
              if (!existingInvoice) {
                console.log('No existing invoice found, creating new one...');
                // Create new invoice document
                const newInvoice = new Invoice(invoiceData);
                
                try {
                  console.log('Validating invoice before save...');
                  await newInvoice.validate();
                  console.log('Invoice validation passed');
                } catch (validationError) {
                  console.error('Invoice validation failed:', validationError);
                  continue; // Skip this invoice
                }
                
                console.log('Saving invoice to MongoDB...');
                await newInvoice.save();
                savedInvoices.push(newInvoice);
                console.log(`Saved invoice ${purchase.sessionId} to MongoDB with _id: ${newInvoice._id}`);
              } else {
                console.log(`Existing invoice found with _id: ${existingInvoice._id}, updating...`);
                // Update existing invoice
                await Invoice.findByIdAndUpdate(existingInvoice._id, invoiceData);
                savedInvoices.push(existingInvoice);
                console.log(`Updated existing invoice ${purchase.sessionId} in MongoDB`);
              }
            } catch (saveError) {
              console.error(`Error saving invoice ${purchase.sessionId} to MongoDB:`, saveError);
            }
          }
        }
        
        // Also process transactions array (legacy)
        if (Array.isArray(client.transactions)) {
          console.log(`Found ${client.transactions.length} transactions for client`);
          
          for (const transaction of client.transactions) {
            console.log('Transaction data:');
            console.log(JSON.stringify(transaction, null, 2));
            
            // Skip if missing critical data
            if (!transaction.id || !transaction.date) {
              console.log('Skipping transaction with missing id or date');
              continue;
            }
            
            console.log(`Processing transaction: ${transaction.id}`);
            
            // Format date properly
            let invoiceDate;
            try {
              invoiceDate = new Date(transaction.date);
              console.log(`Parsed date: ${invoiceDate.toISOString()}`);
              if (isNaN(invoiceDate.getTime())) {
                console.log(`Invalid date format: ${transaction.date}, using current date`);
                invoiceDate = new Date();
              }
            } catch (e) {
              console.log(`Error parsing date: ${e.message}, using current date`);
              invoiceDate = new Date();
            }
            
            // Create invoice object
            const invoiceData = {
              userId: user._id,
              stripeInvoiceId: transaction.id,
              number: transaction.reference || `INV-${transaction.id.substring(0, 8)}`,
              description: transaction.description || `Payment - ${client.name || 'Client'}`,
              amount: transaction.amount || 0,
              total: transaction.amount || 0, // Required by the Invoice model
              currency: transaction.currency || 'usd',
              status: transaction.status || 'paid',
              invoiceDate: invoiceDate,
              invoiceUrl: transaction.receiptUrl || '',
              invoicePdf: transaction.receiptPdf || '',
              metadata: {
                clientId: client._id.toString(),
                clientName: client.name || 'Unknown Client',
                source: 'client_transaction'
              }
            };
            
            console.log('Created invoice data:');
            console.log(JSON.stringify(invoiceData, null, 2));
            
            invoices.push(invoiceData);
            console.log(`Added invoice for transaction ${transaction.id}`);
            
            // Try to save to MongoDB Invoice collection
            try {
              // Check if this invoice already exists
              console.log(`Checking if invoice with stripeInvoiceId ${transaction.id} already exists...`);
              const existingInvoice = await Invoice.findOne({ stripeInvoiceId: transaction.id });
              
              if (!existingInvoice) {
                console.log('No existing invoice found, creating new one...');
                // Create new invoice document
                const newInvoice = new Invoice(invoiceData);
                
                try {
                  console.log('Validating invoice before save...');
                  await newInvoice.validate();
                  console.log('Invoice validation passed');
                } catch (validationError) {
                  console.error('Invoice validation failed:', validationError);
                  continue; // Skip this invoice
                }
                
                console.log('Saving invoice to MongoDB...');
                await newInvoice.save();
                savedInvoices.push(newInvoice);
                console.log(`Saved invoice ${transaction.id} to MongoDB with _id: ${newInvoice._id}`);
              } else {
                console.log(`Existing invoice found with _id: ${existingInvoice._id}, updating...`);
                // Update existing invoice
                await Invoice.findByIdAndUpdate(existingInvoice._id, invoiceData);
                savedInvoices.push(existingInvoice);
                console.log(`Updated existing invoice ${transaction.id} in MongoDB`);
              }
            } catch (saveError) {
              console.error(`Error saving invoice ${transaction.id} to MongoDB:`, saveError);
            }
          }
        } else {
          console.log('No transactions array found for client');
        }
      }
      
      // Sort by date, newest first
      invoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
      
      console.log(`Built ${invoices.length} invoices from client transactions`);
      console.log(`Saved/updated ${savedInvoices.length} invoices in MongoDB`);
      
      // Double-check that invoices were actually saved
      console.log('Verifying invoices were saved to MongoDB...');
      const savedInvoicesCheck = await Invoice.find({ userId: user._id }).lean();
      console.log(`Found ${savedInvoicesCheck.length} invoices in MongoDB after save operation`);
      
      return NextResponse.json({ 
        message: 'Invoices refreshed and saved to MongoDB successfully',
        invoices,
        savedCount: savedInvoices.length,
        verifiedCount: savedInvoicesCheck.length
      });
    } finally {
      await mongoClient.close();
      console.log('MongoDB client connection closed');
    }
    
  } catch (error) {
    console.error('Error syncing invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
