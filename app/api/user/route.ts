import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('GET /api/user - Starting request');
    
    // Get the session to identify the current user
    const session = await getServerSession(authOptions);
    console.log('GET /api/user - Session:', session ? 'Found' : 'Not found');

    // If no session, user is not authenticated
    if (!session || !session.user?.email) {
      console.log('GET /api/user - No session or email');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('GET /api/user - Connecting to MongoDB');
    // Connect to MongoDB
    await connectMongo();
    
    console.log('GET /api/user - Finding user with email:', session.user.email);
    // Find the user by email
    const user = await User.findOne({ email: session.user.email });

    // If user not found
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      stripeCustomerId: user.customerId,
      hasAccess: user.hasAccess,
      profile: user.profile,
      notifications: user.notifications,
      usage: user.usage,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Return a more detailed error message for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
