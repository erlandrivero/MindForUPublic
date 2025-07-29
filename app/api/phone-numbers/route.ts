import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import vapi from '@/libs/vapi';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import PhoneNumber from '@/models/PhoneNumber';

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
    
    // Find phone numbers from MongoDB based on user context
    let phoneNumberQuery = {};
    
    // Special case for the main account
    if (session.user.email === 'erlandrivero@gmail.com') {
      // For the main account, show all phone numbers
      console.log('Using main account mode - showing all phone numbers');
    } else {
      // For other accounts, only show their own phone numbers
      phoneNumberQuery = { userId: user._id };
    }
    
    // Further filter for unassigned only if requested
    if (unassignedOnly) {
      phoneNumberQuery = { ...phoneNumberQuery, assistantId: { $exists: false } };
    }
    
    // Get phone numbers from MongoDB
    const phoneNumbers = await PhoneNumber.find(phoneNumberQuery)
      .populate('assistantId', 'name vapiAssistantId')
      .sort({ createdAt: -1 });
    
    console.log(`User email: ${session.user.email}`);
    console.log(`Total phone numbers found: ${phoneNumbers.length}`);
    
    // If no phone numbers found in MongoDB, try to run the migration
    if (phoneNumbers.length === 0) {
      console.log('No phone numbers found in MongoDB, checking Vapi directly');
      
      // Get phone numbers directly from Vapi as a fallback
      const vapiPhoneNumbers = await vapi.phoneNumbers.list();
      
      if (vapiPhoneNumbers && vapiPhoneNumbers.length > 0) {
        console.log(`Found ${vapiPhoneNumbers.length} phone numbers in Vapi, consider running migration script`);
      }
      
      // Return empty array with a note to run migration
      return NextResponse.json({
        success: true,
        phoneNumbers: [],
        note: 'No phone numbers found in database. Run migration script to import phone numbers.'
      });
    }

    return NextResponse.json({
      success: true,
      phoneNumbers: phoneNumbers.map(phone => ({
        id: phone.vapiPhoneNumberId,
        number: phone.number,
        assistantId: phone.vapiAssistantId,
        status: phone.status,
        name: phone.name,
        createdAt: phone.createdAt,
        updatedAt: phone.updatedAt
      }))
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
    
    // Connect to MongoDB
    await connectMongo();
    
    // Find the phone number in our database
    const phoneNumber = await PhoneNumber.findOne({ vapiPhoneNumberId: phoneNumberId });
    
    // Delete from Vapi
    await vapi.phoneNumbers.delete(phoneNumberId);
    
    // Delete from MongoDB if it exists
    if (phoneNumber) {
      await PhoneNumber.deleteOne({ vapiPhoneNumberId: phoneNumberId });
    }

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
