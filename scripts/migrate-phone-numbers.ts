import dotenv from 'dotenv';
import { VapiClient } from '@vapi-ai/server-sdk';

// Define our own interface for Vapi phone numbers with additional fields
interface VapiPhoneNumber {
  id: string;
  number: string;
  name?: string;
  status?: string;
  assistantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  areaCode?: string;
  metadata?: {
    userId?: string;
    userEmail?: string;
    [key: string]: any;
  };
}
import mongoose from 'mongoose';
import User from '../models/User';
import PhoneNumber from '../models/PhoneNumber';
import Assistant from '../models/Assistant';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Vapi client
const vapi = new VapiClient({
  token: process.env.VAPI_PRIVATE_KEY!,
});

// Connect to MongoDB
async function connectToMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Main migration function
async function migratePhoneNumbers() {
  try {
    // Connect to MongoDB
    await connectToMongo();
    
    // Find the main user (erlandrivero@gmail.com)
    const mainUser = await User.findOne({ email: 'erlandrivero@gmail.com' });
    if (!mainUser) {
      throw new Error('Main user (erlandrivero@gmail.com) not found');
    }
    
    console.log(`Found main user: ${mainUser.email} (${mainUser._id})`);
    
    // Fetch all phone numbers from Vapi
    console.log('Fetching phone numbers from Vapi...');
    const vapiPhoneNumbers = await vapi.phoneNumbers.list();
    
    // Cast the response to our interface with metadata and areaCode
    const phoneNumbers = vapiPhoneNumbers as unknown as VapiPhoneNumber[];
    console.log(`Found ${vapiPhoneNumbers?.length || 0} phone numbers in Vapi`);
    
    if (!vapiPhoneNumbers || vapiPhoneNumbers.length === 0) {
      console.log('No phone numbers found in Vapi');
      process.exit(0);
    }
    
    // Get all assistants to match with phone numbers
    const assistants = await Assistant.find({});
    console.log(`Found ${assistants.length} assistants in database`);
    
    // Process each phone number
    for (const vapiPhone of phoneNumbers) {
      console.log(`Processing phone number: ${vapiPhone.number} (${vapiPhone.id})`);
      
      // Check if phone number already exists in our database
      const existingPhoneNumber = await PhoneNumber.findOne({ vapiPhoneNumberId: vapiPhone.id });
      
      if (existingPhoneNumber) {
        console.log(`Phone number ${vapiPhone.number} already exists in database, skipping`);
        continue;
      }
      
      // Determine the user ID for this phone number
      let userId = mainUser._id;
      let userEmail = mainUser.email;
      
      // Check metadata for user information
      if (vapiPhone.metadata && vapiPhone.metadata.userId) {
        // Try to find user by ID in metadata
        const metadataUser = await User.findById(vapiPhone.metadata.userId);
        if (metadataUser) {
          userId = metadataUser._id;
          userEmail = metadataUser.email;
          console.log(`Found user in metadata: ${userEmail}`);
        }
      } else if (vapiPhone.metadata && vapiPhone.metadata.userEmail) {
        // Try to find user by email in metadata
        const metadataUser = await User.findOne({ email: vapiPhone.metadata.userEmail });
        if (metadataUser) {
          userId = metadataUser._id;
          userEmail = metadataUser.email;
          console.log(`Found user by email in metadata: ${userEmail}`);
        }
      }
      
      // Find the assistant if this phone number is assigned to one
      let assistantId = undefined;
      if (vapiPhone.assistantId) {
        const assistant = assistants.find(a => a.vapiAssistantId === vapiPhone.assistantId);
        if (assistant) {
          assistantId = assistant._id;
          console.log(`Found matching assistant: ${assistant.name}`);
        }
      }
      
      // Create the phone number in our database
      const phoneNumber = new PhoneNumber({
        vapiPhoneNumberId: vapiPhone.id,
        number: vapiPhone.number,
        name: vapiPhone.name || `Phone Number ${vapiPhone.number}`,
        status: vapiPhone.status || 'active',
        areaCode: vapiPhone.areaCode,
        userId: userId,
        assistantId: assistantId,
        vapiAssistantId: vapiPhone.assistantId,
        metadata: vapiPhone.metadata || {},
        createdAt: vapiPhone.createdAt || new Date(),
        updatedAt: vapiPhone.updatedAt || new Date(),
      });
      
      await phoneNumber.save();
      console.log(`Saved phone number ${vapiPhone.number} to database, linked to user ${userEmail}`);
    }
    
    console.log('Migration completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migratePhoneNumbers();
