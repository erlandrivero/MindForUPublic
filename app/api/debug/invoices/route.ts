import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import connectMongo from '@/libs/mongoose';
// Removed unused import: import User from '@/models/User';
import Invoice from '@/models/Invoice';

// Debug API route to check and create invoices
export async function GET(
  _req: NextRequest,
  { params: _params }: { params: Record<string, never> }
) {
  try {
    console.log('=== DEBUG INVOICES API GET ROUTE STARTED ===');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log(`MONGODB_URI defined: ${!!process.env.MONGODB_URI}`);
    await connectMongo();
    console.log('MongoDB connection established');
    
    // Connect directly to MongoDB for raw collection access
    const mongoClient = new MongoClient(process.env.MONGODB_URI || '');
    await mongoClient.connect();
    
    try {
      const database = mongoClient.db();
      console.log(`Connected to database: ${database.databaseName}`);
      
      // Check existing invoices
      const invoicesCollection = database.collection('invoices');
      const invoicesCount = await invoicesCollection.countDocuments();
      console.log(`Found ${invoicesCount} invoices in MongoDB`);
      
      // Check clients with transactions
      const clientsCollection = database.collection('clients');
      const clientsWithTransactions = await clientsCollection.find({
        'transactions': { $exists: true, $ne: [] }
      }).toArray();
      
      console.log(`Found ${clientsWithTransactions.length} clients with transactions`);
      
      // Sample the first client with transactions
      let sampleClientData = null;
      let sampleTransactions: Array<{id?: string; date?: string; amount?: number; currency?: string; status?: string}> = [];
      
      if (clientsWithTransactions.length > 0) {
        const sampleClient = clientsWithTransactions[0];
        sampleClientData = {
          _id: sampleClient._id,
          name: sampleClient.name || 'Unknown',
          userId: sampleClient.userId,
          userIdType: typeof sampleClient.userId,
          transactionsCount: sampleClient.transactions?.length || 0
        };
        
        if (Array.isArray(sampleClient.transactions) && sampleClient.transactions.length > 0) {
          sampleTransactions = sampleClient.transactions.slice(0, 2).map(t => ({
            id: t.id,
            date: t.date,
            amount: t.amount,
            currency: t.currency,
            status: t.status
          }));
        }
      }
      
      // Check Invoice model schema
      const invoiceSchema = Invoice.schema.obj;
      const invoiceSchemaFields = Object.keys(invoiceSchema);
      
      // Return debug info
      return NextResponse.json({
        status: 'success',
        mongodbUri: process.env.MONGODB_URI ? 'defined' : 'undefined',
        databaseName: database.databaseName,
        collections: {
          invoices: {
            count: invoicesCount
          },
          clients: {
            totalCount: await clientsCollection.countDocuments(),
            withTransactionsCount: clientsWithTransactions.length
          }
        },
        sampleClientData,
        sampleTransactions,
        invoiceModel: {
          schemaFields: invoiceSchemaFields
        }
      });
    } finally {
      await mongoClient.close();
      console.log('MongoDB client connection closed');
    }
  } catch (error) {
    console.error('Error in debug invoices API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Debug API to create a test invoice
export async function POST(_req: NextRequest) {
  try {
    console.log('=== DEBUG INVOICES API POST ROUTE STARTED ===');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectMongo();
    console.log('MongoDB connection established');
    
    // Get the request body if any
    let requestBody = {};
    try {
      requestBody = await _req.json();
      console.log('Request body:', requestBody);
    } catch (__e) {
      console.log('No request body provided, using default test data');
    }
    
    // Create a unique ID for this test
    const uniqueId = 'test_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // Create a test invoice with proper validation
    const testInvoiceData = {
      userId: new ObjectId(), // Random ObjectId for testing
      stripeInvoiceId: uniqueId, // Ensure uniqueness
      number: 'INV-TEST-' + uniqueId.substring(0, 8),
      description: 'Test Invoice',
      amount: 100,
      total: 100, // Required field
      currency: 'usd',
      status: 'paid', // Must be one of: "draft", "open", "paid", "uncollectible", "void"
      invoiceDate: new Date(),
      metadata: {
        source: 'debug_api',
        testId: uniqueId
      },
      ...requestBody // Override with any provided values
    };
    
    console.log('Creating test invoice with data:', JSON.stringify(testInvoiceData, null, 2));
    const testInvoice = new Invoice(testInvoiceData);
    
    // Validate the invoice
    try {
      console.log('Validating test invoice...');
      await testInvoice.validate();
      console.log('Test invoice validation passed');
    } catch (validationError) {
      console.error('Test invoice validation failed:', validationError);
      
      // Extract detailed validation errors
      const validationErrors: Record<string, {message?: string; kind?: string; path?: string; value?: any}> = {};
      if (validationError.errors) {
        Object.keys(validationError.errors).forEach(key => {
          validationErrors[key] = {
            message: validationError.errors[key].message,
            kind: validationError.errors[key].kind,
            path: validationError.errors[key].path,
            value: validationError.errors[key].value
          };
        });
      }
      
      return NextResponse.json({
        error: 'Validation error',
        message: validationError.message,
        validationErrors
      }, { status: 400 });
    }
    
    // Save the invoice
    try {
      console.log('Saving test invoice to MongoDB...');
      await testInvoice.save();
      console.log(`Test invoice saved successfully with _id: ${testInvoice._id}`);
      
      return NextResponse.json({
        status: 'success',
        message: 'Test invoice created successfully',
        invoice: testInvoice.toObject()
      });
    } catch (saveError) {
      console.error('Error saving invoice to MongoDB:', saveError);
      
      // Check for duplicate key error
      if (saveError.code === 11000) {
        return NextResponse.json({
          error: 'Duplicate key error',
          message: 'An invoice with this ID already exists',
          details: saveError.message,
          keyPattern: saveError.keyPattern
        }, { status: 409 });
      }
      
      // Other MongoDB errors
      return NextResponse.json({
        error: 'MongoDB error',
        message: saveError.message,
        code: saveError.code
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating test invoice:', error);
    return NextResponse.json({
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
