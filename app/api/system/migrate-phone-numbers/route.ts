import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import PhoneNumber from '@/models/PhoneNumber';
import Assistant from '@/models/Assistant';
import vapi from '@/libs/vapi';

// Main migration function
async function migratePhoneNumbers() {
  console.log('Starting phone number migration...');
  
  try {
    // Connect to MongoDB
    await connectMongo();
    
    // Check if we already have phone numbers in MongoDB
    const existingPhoneNumbersCount = await PhoneNumber.countDocuments();
    console.log(`Found ${existingPhoneNumbersCount} existing phone numbers in MongoDB`);
    
    // If we already have phone numbers, skip migration
    if (existingPhoneNumbersCount > 0) {
      console.log('Migration skipped: Phone numbers already exist in MongoDB');
      return {
        success: true,
        message: 'Migration skipped: Phone numbers already exist in MongoDB',
        count: existingPhoneNumbersCount
      };
    }
    
    // Fetch all phone numbers from Vapi
    console.log('Fetching phone numbers from Vapi...');
    const phoneNumbers = await vapi.phoneNumbers.list();
    
    if (!phoneNumbers || phoneNumbers.length === 0) {
      console.log('No phone numbers found in Vapi');
      return {
        success: true,
        message: 'No phone numbers found in Vapi',
        count: 0
      };
    }
    
    console.log(`Found ${phoneNumbers.length} phone numbers in Vapi`);
    
    // Find the main user (default owner for phone numbers without metadata)
    const mainUser = await User.findOne({ email: 'erlandrivero@gmail.com' });
    if (!mainUser) {
      throw new Error('Main user not found');
    }
    
    // Import each phone number
    const importedPhoneNumbers = [];
    
    for (const phone of phoneNumbers) {
      try {
        // Find user based on metadata if available
        let userId = mainUser._id;
        
        // Check if phone number has metadata with user info
        if ((phone as any).metadata) {
          if ((phone as any).metadata.userId) {
            // Try to find user by ID first
            const metadataUser = await User.findById((phone as any).metadata.userId);
            if (metadataUser) {
              userId = metadataUser._id;
            }
          } else if ((phone as any).metadata.userEmail) {
            // Fall back to email
            const emailUser = await User.findOne({ email: (phone as any).metadata.userEmail });
            if (emailUser) {
              userId = emailUser._id;
            }
          }
        }
        
        // Find assistant if this phone number is assigned to one
        let assistantId = undefined;
        if (phone.assistantId) {
          const assistant = await Assistant.findOne({ vapiAssistantId: phone.assistantId });
          if (assistant) {
            assistantId = assistant._id;
          }
        }
        
        // Create the phone number in MongoDB
        const newPhoneNumber = new PhoneNumber({
          vapiPhoneNumberId: phone.id,
          number: phone.number,
          name: phone.name,
          status: phone.status,
          userId: userId,
          vapiAssistantId: phone.assistantId,
          assistantId: assistantId,
          areaCode: (phone as any).areaCode,
          metadata: (phone as any).metadata || {}
        });
        
        await newPhoneNumber.save();
        importedPhoneNumbers.push(newPhoneNumber);
        
        console.log(`Imported phone number: ${phone.number}`);
      } catch (error) {
        console.error(`Error importing phone number ${phone.number}:`, error);
      }
    }
    
    console.log(`Successfully imported ${importedPhoneNumbers.length} phone numbers`);
    
    return {
      success: true,
      message: `Successfully imported ${importedPhoneNumbers.length} phone numbers`,
      count: importedPhoneNumbers.length
    };
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users to run the migration
    if (!session?.user?.email || session.user.email !== 'erlandrivero@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await migratePhoneNumbers();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}
