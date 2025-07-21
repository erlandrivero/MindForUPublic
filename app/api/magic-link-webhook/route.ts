import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';

export async function POST(request: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }

    // Extract user data from the session
    const userData = {
      user: {
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        id: session.user.id || '',
      },
      signInMethod: 'magic_link',
      timestamp: new Date().toISOString(),
      source: 'nextauth_magic_link',
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    console.log('Magic link sign-in detected:', {
      email: userData.user.email,
      name: userData.user.name,
      timestamp: userData.timestamp
    });

    // Send to n8n webhook for lead enrichment
    const n8nWebhookUrl = process.env.N8N_MAGIC_LINK_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      console.error('N8N_MAGIC_LINK_WEBHOOK_URL not configured');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    try {
      const webhookResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!webhookResponse.ok) {
        throw new Error(`n8n webhook failed: ${webhookResponse.status}`);
      }

      const webhookResult = await webhookResponse.json();
      console.log('Successfully sent to n8n webhook:', webhookResult);

      return NextResponse.json({
        success: true,
        message: 'Magic link sign-in processed and sent for enrichment',
        user: {
          email: userData.user.email,
          name: userData.user.name
        }
      });

    } catch (webhookError) {
      console.error('Failed to send to n8n webhook:', webhookError);
      
      // Still return success to the user, but log the webhook failure
      return NextResponse.json({
        success: true,
        message: 'Magic link sign-in processed',
        warning: 'Lead enrichment webhook failed',
        user: {
          email: userData.user.email,
          name: userData.user.name
        }
      });
    }

  } catch (error) {
    console.error('Magic link webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for webhook verification/testing
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Magic Link Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
    webhookUrl: process.env.N8N_MAGIC_LINK_WEBHOOK_URL ? 'configured' : 'not configured'
  });
}
