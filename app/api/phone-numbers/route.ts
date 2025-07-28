import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import vapi from '@/libs/vapi';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    await connectMongo();
    
    // Find the current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(_req.url);
    const unassignedOnly = searchParams.get('unassigned') === 'true';
    
    // List all phone numbers from Vapi
    const phoneNumbers = await vapi.phoneNumbers.list();
    
    // Find all assistants belonging to this user
    const userAssistants = await Assistant.find({ userId: user._id });
    const userAssistantIds = userAssistants.map(assistant => assistant.vapiAssistantId);
    
    // Filter phone numbers based on user context
    let filteredPhoneNumbers;
    
    // Special case for the main account (temporary until all legacy data is migrated)
    if (session.user.email === 'erlandrivero@gmail.com') {
      // For the main account, show all phone numbers
      filteredPhoneNumbers = phoneNumbers || [];
      console.log('Using main account mode - showing all phone numbers');
    } else {
      // For other accounts, filter by user's assistants and metadata
      filteredPhoneNumbers = (phoneNumbers || []).filter((phone: any) => {
        // Check if phone number is assigned to one of the user's assistants
        if (phone.assistantId && userAssistantIds.includes(phone.assistantId)) {
          return true;
        }
        
        // Check if phone number has metadata with the user's ID or email
        if (phone.metadata) {
          // Check user ID first (more reliable)
          if (phone.metadata.userId === user._id.toString()) {
            return true;
          }
          
          // Fallback to email for legacy data
          if (phone.metadata.userEmail === session.user.email) {
            return true;
          }
        }
        
        // If no metadata or not matching, don't include
        return false;
      });
    }
    
    console.log(`User email: ${session.user.email}`);
    console.log(`Total phone numbers found: ${phoneNumbers?.length || 0}`);
    console.log(`Filtered phone numbers: ${filteredPhoneNumbers.length}`);
    console.log(`User assistants: ${userAssistantIds.length}`);
    
    // Further filter for unassigned only if requested
    if (unassignedOnly) {
      filteredPhoneNumbers = filteredPhoneNumbers.filter((phone: any) => !phone.assistantId);
    }

    return NextResponse.json({
      success: true,
      phoneNumbers: filteredPhoneNumbers.map((phone: any) => ({
        id: phone.id,
        number: phone.number,
        assistantId: phone.assistantId,
        status: phone.status,
        name: phone.name,
        createdAt: phone.createdAt,
        updatedAt: phone.updatedAt
      })) || []
    });

  } catch (error: any) {
    console.error('List phone numbers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone numbers' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(_req.url);
    const phoneNumberId = searchParams.get('id');

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: 'Phone number ID is required' },
        { status: 400 }
      );
    }

    await vapi.phoneNumbers.delete(phoneNumberId);

    return NextResponse.json({
      success: true,
      message: 'Phone number deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete phone number API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete phone number' },
      { status: 500 }
    );
  }
}
