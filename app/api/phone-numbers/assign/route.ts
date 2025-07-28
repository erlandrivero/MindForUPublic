import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
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
      // Get phone number from Vapi
      let phoneNumber;
      try {
        phoneNumber = await vapi.phoneNumbers.get(phoneNumberId);
        if (!phoneNumber) {
          console.error('Phone number not found in Vapi account');
          return NextResponse.json({ 
            error: 'Phone number not found in your Vapi account', 
            details: 'You need to create phone numbers via the Vapi dashboard first.'
          }, { status: 404 });
        }
      } catch (error: any) {
        console.error('Error fetching phone number from Vapi:', error);
        return NextResponse.json({ 
          error: 'Failed to fetch phone number from Vapi', 
          details: 'This may be due to no phone numbers existing in your Vapi account. Please create phone numbers via the Vapi dashboard first.'
        }, { status: 500 });
      }

      // Update the phone number in Vapi to assign it to the assistant
      await vapi.phoneNumbers.update(phoneNumberId, {
        assistantId: assistant.vapiAssistantId,
        name: `${assistant.name} Phone Line`
      });

      // Update the assistant in our database
      assistant.phoneNumber = {
        id: phoneNumber.id,
        number: phoneNumber.number,
        status: phoneNumber.status,
        // Use type assertion to handle potential areaCode property
        // The Vapi API might return areaCode but TypeScript definitions might be outdated
        ...(((phoneNumber as any).areaCode) ? { areaCode: (phoneNumber as any).areaCode } : {})
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
