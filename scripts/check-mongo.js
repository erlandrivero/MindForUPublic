// Simple script to check MongoDB collections
require('dotenv').config();
const mongoose = require('mongoose');

async function checkMongoDB() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in the database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check for any collections with version issues
    console.log('\nChecking for collections with potential version issues...');
    for (const collection of collections) {
      try {
        const sample = await mongoose.connection.db.collection(collection.name).findOne();
        if (sample) {
          console.log(`\nSample from ${collection.name}:`);
          console.log(JSON.stringify(sample, null, 2).substring(0, 500) + '...');
          
          if (sample.__v === undefined) {
            console.log(`⚠️ Collection '${collection.name}' has documents with undefined __v (version) field`);
          }
        }
      } catch (error) {
        console.error(`Error checking collection ${collection.name}:`, error);
      }
    }

    console.log('\nMongoDB check completed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the check
checkMongoDB();
