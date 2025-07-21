import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, url, host } = await request.json();

    console.log('Magic link request:', { email, url: url ? 'present' : 'missing', host });

    if (!email || !url) {
      console.error('Missing required fields:', { email: !!email, url: !!url });
      return NextResponse.json(
        { error: 'Email and URL are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create a beautiful magic link email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign in to MindForU</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${process.env.NEXTAUTH_URL}/icon.png" alt="MindForU" style="height: 50px; width: auto;">
            <h1 style="color: #18C5C2; margin: 20px 0;">Sign in to MindForU</h1>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 10px; padding: 30px; margin: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 25px;">
              Click the button below to sign in to your MindForU account. This link will expire in 24 hours for security.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="background: linear-gradient(135deg, #18C5C2 0%, #1A7F6B 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 50px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(24, 197, 194, 0.3);">
                🔐 Sign in to MindForU
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; font-size: 12px; color: #666;">
              ${url}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999;">
              This email was sent to ${email}. If you didn't request this, you can safely ignore it.
            </p>
            <p style="font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} MindForU. Transform your business with AI.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send the magic link email using Resend
    const { data, error } = await resend.emails.send({
      from: 'MindForU <onboarding@resend.dev>',
      to: [email],
      subject: '🔐 Sign in to MindForU - Magic Link',
      html: emailHtml,
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    console.log('Magic link email sent successfully:', data?.id);
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Magic link email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
