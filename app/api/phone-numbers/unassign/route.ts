import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import vapi from '@/libs/vapi';

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _req.json();
    const { phoneNumberId } = body;

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the assistant with this phone number
    // First try to find by phoneNumber.id
    let assistant = await Assistant.findOne({ 
      userId: user._id,
      'phoneNumber.id': phoneNumberId
    });
    
    // If not found, try to find by direct assistantId from Vapi
    if (!assistant) {
      try {
        // Get the phone number details from Vapi
        // Using get method instead of retrieve
        const phoneNumber = await vapi.phoneNumbers.get(phoneNumberId);
        
        if (phoneNumber && phoneNumber.assistantId) {
          // Try to find the assistant by Vapi assistantId
          assistant = await Assistant.findOne({
            userId: user._id,
            vapiAssistantId: phoneNumber.assistantId
          });
        }
      } catch (vapiError) {
        console.error('Error retrieving phone number from Vapi:', vapiError);
      }
    }

    // If still not found, update the phone number in Vapi anyway
    if (!assistant) {
      try {
        // Update the phone number in Vapi to remove the assistant assignment
        // Use null with 'as any' type casting to properly unassign in Vapi
        await vapi.phoneNumbers.update(phoneNumberId, {
          assistantId: null as any,
          name: `Unassigned Phone Number`
        });
        
        return NextResponse.json({
          success: true,
          message: 'Phone number unassigned successfully (no local assistant found)',
        });
      } catch (vapiError: any) {
        console.error('Vapi API error:', vapiError);
        return NextResponse.json(
          { error: `Failed to unassign phone number: ${vapiError.message}` },
          { status: 500 }
        );
      }
    }

    try {
      // Update the phone number in Vapi to remove the assistant assignment
      // Use null with 'as any' type casting to properly unassign in Vapi
      await vapi.phoneNumbers.update(phoneNumberId, {
        assistantId: null as any,
        name: `Unassigned Phone Number`
      });

      // Update the assistant in our database
      assistant.phoneNumber = undefined;
      await assistant.save();

      return NextResponse.json({
        success: true,
        message: 'Phone number unassigned successfully',
        assistant: {
          id: assistant._id,
          name: assistant.name
        }
      });

    } catch (vapiError: any) {
      console.error('Vapi API error:', vapiError);
      return NextResponse.json(
        { error: `Failed to unassign phone number: ${vapiError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Unassign phone number API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
