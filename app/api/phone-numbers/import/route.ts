import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumber, name, assistantId } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Get Vapi API key
    const vapiApiKey = process.env.VAPI_PRIVATE_KEY;
    if (!vapiApiKey) {
      throw new Error('VAPI_PRIVATE_KEY not found in environment variables');
    }

    // Try to fetch available credentials from Vapi, with fallback
    let credentialId: string | null = null;
    
    try {
      console.log('Fetching available credentials from Vapi...');
      
      // Try the credentials endpoint
      const credentialsResponse = await fetch('https://api.vapi.ai/credential', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Credentials API response status:', credentialsResponse.status);
      
      if (credentialsResponse.ok) {
        const credentials = await credentialsResponse.json();
        console.log('Available credentials:', credentials);
        
        // For BYO, use the first available credential or a default one
        if (credentials && credentials.length > 0) {
          // Try to find a BYO credential first, otherwise use the first available
          const byoCredential = credentials.find((cred: any) => 
            cred.provider?.toLowerCase().includes('byo') ||
            cred.name?.toLowerCase().includes('byo')
          );
          
          credentialId = byoCredential ? byoCredential.id : credentials[0].id;
          console.log(`Using credential for BYO phone number:`, credentialId);
        } else {
          console.log('No credentials returned from Vapi API');
        }
      } else {
        const errorText = await credentialsResponse.text();
        console.log('Failed to fetch credentials from Vapi:', credentialsResponse.status, errorText);
      }
    } catch (credError) {
      console.log('Error fetching credentials:', credError);
    }
    
    // Fallback: Use environment variable if no credentials found via API
    if (!credentialId) {
      console.log('No credentials found via API, trying environment variable fallback...');
      credentialId = process.env.VAPI_DEFAULT_CREDENTIAL_ID || process.env.VAPI_BYO_CREDENTIAL_ID || null;
      if (credentialId) {
        console.log('Using fallback credential ID from environment:', credentialId);
      }
    }
    
    if (!credentialId) {
      return NextResponse.json(
        { 
          error: 'No phone number credentials configured. Please set up credentials in your Vapi dashboard first, or contact support for assistance.',
          details: 'This feature requires phone number provider credentials to be configured in Vapi.'
        },
        { status: 400 }
      );
    }

    try {
      console.log('Importing phone number:', phoneNumber);
      console.log('Processing BYO phone number');
      console.log('Using credential ID:', credentialId);
      
      // Import phone number via Vapi API
      console.log('Making direct HTTP call to Vapi import API...');
      
      const response = await fetch('https://api.vapi.ai/phone-number', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vapiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'byo-phone-number',
          number: phoneNumber,
          credentialId: credentialId,
          name: name || `BYO Number ${phoneNumber}`,
          assistantId: assistantId || undefined
        })
      });
      
      console.log('Vapi import API response status:', response.status);
      console.log('Vapi import API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Vapi import API error response:', errorText);
        throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
      }
      
      const importedPhoneNumber = await response.json();
      console.log('Phone number imported successfully:', importedPhoneNumber);

      return NextResponse.json({
        message: 'Phone number imported successfully',
        phoneNumber: {
          id: importedPhoneNumber.id,
          number: importedPhoneNumber.number,
          name: importedPhoneNumber.name,
          status: importedPhoneNumber.status,
          provider: 'twilio',
          assistantId: importedPhoneNumber.assistantId,
          credentialId: importedPhoneNumber.credentialId,
          createdAt: importedPhoneNumber.createdAt
        }
      }, { status: 201 });
    } catch (error: any) {
      console.error('Phone number import error:', error);
      
      let errorMessage = 'Failed to import phone number';
      if (error.message?.includes('credential')) {
        errorMessage = 'Invalid credentials. Please check your credential ID.';
      } else if (error.message?.includes('number')) {
        errorMessage = 'Invalid phone number format or number not available.';
      } else if (error.message?.includes('limit')) {
        errorMessage = 'Phone number import limit reached.';
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
