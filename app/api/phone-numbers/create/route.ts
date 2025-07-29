import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import PhoneNumber from '@/models/PhoneNumber';

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _req.json();
    const { name, assistantId } = body;

    let phoneNumber = null;
    let phoneNumberError = null;
    
    try {
      console.log('Creating phone number via Vapi SDK (same pattern as assistants)');
      
      // Try HTTP API approach for free US phone numbers
      // Based on Vapi docs, free numbers might need different structure than BYO numbers
      const vapiApiKey = process.env.VAPI_PRIVATE_KEY;
      if (!vapiApiKey) {
        throw new Error('VAPI_PRIVATE_KEY not configured');
      }
      
      // Connect to MongoDB to get the user ID
      await connectMongo();
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        throw new Error('User not found');
      }
      
      const requestBody: any = {
        metadata: {
          userEmail: session.user.email,
          userId: user._id.toString() // Store user ID in metadata for filtering
        }
      };
      
      // Only add name if provided
      if (name) {
        requestBody.name = name;
      }
      
      // Add assistantId if provided
      if (assistantId) {
        requestBody.assistantId = assistantId;
      }
      
      console.log('Adding user email to metadata:', session.user.email);
      
      console.log('Creating free US phone number with HTTP API:', requestBody);
      
      const response = await fetch('https://api.vapi.ai/phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${vapiApiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error creating phone number:', data);
        throw new Error(`Vapi API error: ${response.status} - ${data.message || 'Failed to create phone number'}`);
      }
      
      // Save the phone number to MongoDB
      const newPhoneNumber = new PhoneNumber({
        vapiPhoneNumberId: data.id,
        number: data.number,
        name: data.name,
        status: data.status,
        areaCode: data.areaCode || 'Auto-selected',
        userId: user._id,
        metadata: {
          userId: user._id.toString(),
          userEmail: user.email
        }
      });
      
      await newPhoneNumber.save();
      console.log(`Phone number ${data.number} saved to MongoDB with ID ${newPhoneNumber._id}`);
      
      phoneNumber = {
        id: data.id,
        number: data.number,
        name: data.name,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        mongoId: newPhoneNumber._id
      };
      
      console.log('Phone number created successfully:', phoneNumber);
      
    } catch (phoneError: any) {
      console.error('Failed to create phone number:', phoneError);
      phoneNumberError = phoneError.message?.includes('limit') 
        ? 'Phone number limit reached (max 10 free numbers)'
        : phoneError.message?.includes('area code')
        ? 'Invalid area code or area code not available'
        : 'Failed to create phone number - this feature may need Vapi dashboard setup first';
    }
    
    if (phoneNumberError) {
      return NextResponse.json(
        { error: phoneNumberError },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      phoneNumber,
      message: 'Phone number created successfully'
    });

  } catch (error: any) {
    console.error('Create phone number API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
