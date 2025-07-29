// Script to check MongoDB collections and their structure
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

    // Check if 'uploads' directory exists in the database
    const uploadsExists = collections.some(collection => collection.name === 'uploads');
    console.log(`\nUploads collection exists: ${uploadsExists}`);

    // Check if 'phonenumbers' collection exists and examine its structure
    const phoneNumbersExists = collections.some(collection => collection.name === 'phonenumbers');
    console.log(`PhoneNumbers collection exists: ${phoneNumbersExists}`);

    if (phoneNumbersExists) {
      // Get a sample document from phonenumbers collection
      const phoneNumbersSample = await mongoose.connection.db.collection('phonenumbers').findOne();
      console.log('\nSample phone number document:');
      console.log(JSON.stringify(phoneNumbersSample, null, 2));
    }

    // Check for any collections with version issues
    console.log('\nChecking for collections with potential version issues...');
    for (const collection of collections) {
      try {
        const sample = await mongoose.connection.db.collection(collection.name).findOne();
        if (sample && sample.__v === undefined) {
          console.log(`Collection '${collection.name}' has documents with undefined __v (version) field`);
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
