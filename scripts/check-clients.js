// ES Module script to check clients collection for transactions
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
  console.log('=== CHECK CLIENTS COLLECTION SCRIPT STARTED ===');
  
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
    
    // Count all clients
    const clientCount = await clientsCollection.countDocuments({});
    console.log(`Total clients in collection: ${clientCount}`);
    
    // Find clients with transactions
    const clientsWithTransactions = await clientsCollection.find({
      transactions: { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`Clients with transactions: ${clientsWithTransactions.length}`);
    
    if (clientsWithTransactions.length > 0) {
      console.log('\nClients with transactions:');
      clientsWithTransactions.forEach((client, index) => {
        console.log(`\n--- Client ${index + 1} ---`);
        console.log(`ID: ${client._id}`);
        console.log(`User ID: ${client.userId}`);
        console.log(`Name: ${client.name || 'Unknown'}`);
        console.log(`Email: ${client.email || 'Unknown'}`);
        console.log(`Transaction count: ${client.transactions?.length || 0}`);
        
        if (client.transactions && client.transactions.length > 0) {
          console.log('\nLatest transaction:');
          const latestTransaction = client.transactions[client.transactions.length - 1];
          console.log(JSON.stringify(latestTransaction, null, 2));
        }
      });
    } else {
      console.log('\nNo clients with transactions found.');
    }
    
    // Close the connection
    await client.close();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main().catch(console.error);
