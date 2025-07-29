import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import PhoneNumber from '@/models/PhoneNumber';
import vapi from '@/libs/vapi';

// Maximum number of phone numbers allowed per user
const MAX_PHONE_NUMBERS_PER_USER = 3;

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _req.json();
    const { phoneNumberId, assistantId } = body;

    if (!phoneNumberId || !assistantId) {
      return NextResponse.json(
        { error: 'Phone number ID and assistant ID are required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the assistant and verify it belongs to the user
    const assistant = await Assistant.findOne({ 
      _id: assistantId,
      userId: user._id
    });

    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }

    // Verify the assistant is active
    if (assistant.status !== 'active') {
      return NextResponse.json(
        { error: 'Only active assistants can be assigned to phone numbers' },
        { status: 400 }
      );
    }

    // Check if the assistant is already assigned to another phone number
    const assistantWithPhone = await Assistant.findOne({
      'phoneNumber.id': { $exists: true, $ne: null },
      vapiAssistantId: assistant.vapiAssistantId
    });

    if (assistantWithPhone && assistantWithPhone._id.toString() !== assistant._id.toString()) {
      return NextResponse.json(
        { error: 'This assistant is already assigned to another phone number' },
        { status: 400 }
      );
    }

    // Check if user has reached the maximum number of phone numbers
    const userPhoneNumberCount = await Assistant.countDocuments({
      userId: user._id,
      'phoneNumber.id': { $exists: true, $ne: null }
    });

    if (userPhoneNumberCount >= MAX_PHONE_NUMBERS_PER_USER && !assistant.phoneNumber?.id) {
      return NextResponse.json(
        { error: `You can only have ${MAX_PHONE_NUMBERS_PER_USER} phone numbers per account` },
        { status: 400 }
      );
    }

    try {
      // Find the phone number in our MongoDB database
      let phoneNumberDoc = await PhoneNumber.findOne({ vapiPhoneNumberId: phoneNumberId });
      
      if (!phoneNumberDoc) {
        console.error('Phone number not found in MongoDB');
        // Try to get it from Vapi as a fallback
        try {
          const vapiPhoneNumber = await vapi.phoneNumbers.get(phoneNumberId);
          if (!vapiPhoneNumber) {
            return NextResponse.json({ 
              error: 'Phone number not found in your account', 
              details: 'The phone number could not be found in the database or Vapi.'
            }, { status: 404 });
          }
          
          // If found in Vapi but not in MongoDB, create it in MongoDB
          const newPhoneNumber = new PhoneNumber({
            vapiPhoneNumberId: vapiPhoneNumber.id,
            number: vapiPhoneNumber.number,
            name: vapiPhoneNumber.name,
            status: vapiPhoneNumber.status,
            userId: user._id,
            // Use type assertion for potentially missing fields in the Vapi type
            areaCode: (vapiPhoneNumber as any).areaCode,
            metadata: (vapiPhoneNumber as any).metadata || { userId: user._id.toString(), userEmail: user.email }
          });
          
          await newPhoneNumber.save();
          console.log(`Created missing phone number in MongoDB: ${newPhoneNumber.number}`);
          
          // Use the newly created phone number document
          phoneNumberDoc = newPhoneNumber;
        } catch (error: any) {
          console.error('Error fetching phone number from Vapi:', error);
          return NextResponse.json({ 
            error: 'Failed to fetch phone number', 
            details: 'The phone number could not be found in the database or Vapi.'
          }, { status: 500 });
        }
      }

      // Update the phone number in Vapi to assign it to the assistant
      await vapi.phoneNumbers.update(phoneNumberId, {
        assistantId: assistant.vapiAssistantId,
        name: `${assistant.name} Phone Line`
      });
      
      // Update the phone number in MongoDB
      phoneNumberDoc.vapiAssistantId = assistant.vapiAssistantId;
      phoneNumberDoc.assistantId = assistant._id;
      phoneNumberDoc.name = `${assistant.name} Phone Line`;
      await phoneNumberDoc.save();

      // Update the assistant in our database
      assistant.phoneNumber = {
        id: phoneNumberDoc.vapiPhoneNumberId,
        number: phoneNumberDoc.number,
        status: phoneNumberDoc.status,
        areaCode: phoneNumberDoc.areaCode
      };

      await assistant.save();

      return NextResponse.json({
        success: true,
        message: 'Phone number assigned successfully',
        assistant: {
          id: assistant._id,
          name: assistant.name,
          phoneNumber: assistant.phoneNumber
        }
      });

    } catch (vapiError: any) {
      console.error('Vapi API error:', vapiError);
      return NextResponse.json(
        { error: `Failed to assign phone number: ${vapiError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Assign phone number API error:', error);
    
    // Provide more specific error messages based on the error
    if (error.message?.includes('not found') || error.message?.includes('No phone')) {
      return NextResponse.json(
        { 
          error: 'Phone number not found', 
          details: 'You need to create phone numbers via the Vapi dashboard first.'
        },
        { status: 404 }
      );
    } else if (error.message?.includes('limit')) {
      return NextResponse.json(
        { 
          error: 'Phone number limit reached', 
          details: 'You have reached the maximum number of phone numbers allowed.'
        },
        { status: 400 }
      );
    } else if (error.message?.includes('unauthorized') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized access to Vapi API', 
          details: 'Please check your Vapi API key configuration.'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
