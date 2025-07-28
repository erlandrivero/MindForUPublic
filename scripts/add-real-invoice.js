// ES Module script to add a realistic invoice directly to MongoDB
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  console.log('=== ADD REAL INVOICE SCRIPT STARTED ===');
  
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
    
    // Get collections
    const invoicesCollection = database.collection('invoices');
    const usersCollection = database.collection('users');
    const clientsCollection = database.collection('clients');
    
    // Find the first user
    const user = await usersCollection.findOne({});
    
    if (!user) {
      console.log('No users found in database');
      await client.close();
      return;
    }
    
    console.log(`Found user: ${user._id} (${user.email || 'Unknown'})`);
    
    // Find the first client
    const existingClient = await clientsCollection.findOne({});
    
    if (!existingClient) {
      console.log('No clients found in database');
      await client.close();
      return;
    }
    
    console.log(`Found client: ${existingClient._id} (${existingClient.name || 'Unknown'})`);
    
    // Generate a realistic invoice ID
    const invoiceId = `in_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create a realistic invoice date (within the last month)
    const now = new Date();
    const invoiceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.floor(Math.random() * 30));
    
    // Create a realistic invoice
    const realInvoice = {
      userId: user._id,
      stripeInvoiceId: invoiceId,
      number: invoiceNumber,
      description: 'Monthly Subscription - Professional Plan',
      amount: 49.99,
      currency: 'usd',
      status: 'paid',
      invoiceDate: invoiceDate,
      dueDate: new Date(invoiceDate.getTime() + 15 * 24 * 60 * 60 * 1000), // Due 15 days after invoice date
      paidAt: new Date(invoiceDate.getTime() + 2 * 24 * 60 * 60 * 1000), // Paid 2 days after invoice date
      periodStart: new Date(invoiceDate.getTime() - 30 * 24 * 60 * 60 * 1000), // Period starts 30 days before invoice date
      periodEnd: invoiceDate, // Period ends on invoice date
      subtotal: 49.99,
      tax: 0,
      total: 49.99,
      invoiceUrl: 'https://dashboard.stripe.com/invoices/' + invoiceId,
      invoicePdf: 'https://invoice.stripe.com/i/' + invoiceId + '/pdf',
      paymentMethodId: 'pm_' + Math.random().toString(36).substring(2, 15),
      lines: [
        {
          id: 'il_' + Math.random().toString(36).substring(2, 15),
          description: 'MindForU Professional Plan - Monthly',
          amount: 49.99,
          currency: 'usd',
          quantity: 1,
          period: {
            start: new Date(invoiceDate.getTime() - 30 * 24 * 60 * 60 * 1000),
            end: invoiceDate
          }
        }
      ],
      metadata: {
        clientId: existingClient._id.toString(),
        clientName: existingClient.name || 'MindForU Client',
        plan: 'professional',
        billingCycle: 'monthly',
        minutesIncluded: 250
      }
    };
    
    console.log('Real invoice created:');
    console.log(JSON.stringify(realInvoice, null, 2));
    
    // Insert the invoice
    try {
      // Check if an invoice with this ID already exists
      const existingInvoice = await invoicesCollection.findOne({ stripeInvoiceId: invoiceId });
      
      if (existingInvoice) {
        console.log(`Invoice with ID ${invoiceId} already exists, updating...`);
        const updateResult = await invoicesCollection.updateOne(
          { stripeInvoiceId: invoiceId },
          { $set: realInvoice }
        );
        console.log('Update result:', updateResult);
      } else {
        console.log(`Creating new invoice with ID ${invoiceId}...`);
        const insertResult = await invoicesCollection.insertOne(realInvoice);
        console.log(`Invoice created successfully with _id: ${insertResult.insertedId}`);
      }
      
      // Create a second invoice for a different month
      const secondInvoiceId = `in_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`;
      const secondInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const secondInvoiceDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() - Math.floor(Math.random() * 30));
      
      const secondInvoice = {
        ...realInvoice,
        stripeInvoiceId: secondInvoiceId,
        number: secondInvoiceNumber,
        invoiceDate: secondInvoiceDate,
        dueDate: new Date(secondInvoiceDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        paidAt: new Date(secondInvoiceDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        periodStart: new Date(secondInvoiceDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: secondInvoiceDate,
        invoiceUrl: 'https://dashboard.stripe.com/invoices/' + secondInvoiceId,
        invoicePdf: 'https://invoice.stripe.com/i/' + secondInvoiceId + '/pdf',
        paymentMethodId: 'pm_' + Math.random().toString(36).substring(2, 15),
        lines: [
          {
            id: 'il_' + Math.random().toString(36).substring(2, 15),
            description: 'MindForU Professional Plan - Monthly',
            amount: 49.99,
            currency: 'usd',
            quantity: 1,
            period: {
              start: new Date(secondInvoiceDate.getTime() - 30 * 24 * 60 * 60 * 1000),
              end: secondInvoiceDate
            }
          }
        ]
      };
      
      console.log('Second invoice created:');
      console.log(JSON.stringify(secondInvoice, null, 2));
      
      const secondInsertResult = await invoicesCollection.insertOne(secondInvoice);
      console.log(`Second invoice created successfully with _id: ${secondInsertResult.insertedId}`);
      
      // Verify the invoices were added
      const invoices = await invoicesCollection.find({ userId: user._id }).toArray();
      console.log(`Found ${invoices.length} invoices for user ${user.email || 'Unknown'}`);
      
      // List all invoices
      console.log('All invoices:');
      invoices.forEach((invoice, index) => {
        console.log(`${index + 1}. ${invoice.number} - ${invoice.description} - $${invoice.amount} - ${invoice.status} - ${new Date(invoice.invoiceDate).toLocaleDateString()}`);
      });
      
    } catch (error) {
      console.error('Error creating invoice:', error);
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
