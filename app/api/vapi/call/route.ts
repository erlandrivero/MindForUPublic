import { NextRequest, NextResponse } from 'next/server';
import { getServerSession as _getServerSession } from 'next-auth';
import { authOptions as _authOptions } from '@/libs/next-auth';

export async function POST(_req: NextRequest) {
  try {
    console.log('[VAPI PROXY] Starting call request...');
    
    // TODO: Re-enable authentication after testing
    // const session = await getServerSession(authOptions);
    // console.log('[VAPI PROXY] Session check:', { hasSession: !!session, userEmail: session?.user?.email });
    // 
    // if (!session?.user?.email) {
    //   console.log('[VAPI PROXY] No valid session found');
    //   return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    // }

    const body = await _req.json();
    const { assistantId, ...callOptions } = body;

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      );
    }

    // Check Vapi API key
    const vapiKey = process.env.VAPI_PRIVATE_KEY;
    console.log('[VAPI PROXY] API Key check:', {
      hasKey: !!vapiKey,
      keyPrefix: vapiKey ? vapiKey.substring(0, 10) + '...' : 'MISSING',
      assistantId
    });

    if (!vapiKey) {
      console.error('[VAPI PROXY] VAPI_PRIVATE_KEY is missing from environment variables');
      return NextResponse.json(
        { error: 'Vapi API key not configured' },
        { status: 500 }
      );
    }

    // Proxy the call to Vapi API
    console.log('[VAPI PROXY] Making request to Vapi API...');
    const vapiResponse = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId,
        ...callOptions
      }),
    });

    console.log('[VAPI PROXY] Vapi API response status:', vapiResponse.status);

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error('Vapi API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create call', details: errorText },
        { status: vapiResponse.status }
      );
    }

    const callData = await vapiResponse.json();
    
    return NextResponse.json(callData);

  } catch (error) {
    console.error('Vapi proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
