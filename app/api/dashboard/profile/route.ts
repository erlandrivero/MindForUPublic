import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    // Find the user with all profile data
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user profile data
    const profileData = {
      id: user._id,
      name: user.name || '',
      email: user.email,
      image: user.image || '',
      phone: user.profile?.phone || '',
      company: user.profile?.company || '',
      address: user.profile?.address || '',
      city: user.profile?.city || '',
      state: user.profile?.state || '',
      country: user.profile?.country || 'United States',
      timezone: user.profile?.timezone || 'America/New_York',
      emailVerified: user.profile?.emailVerified || false,
      phoneVerified: user.profile?.phoneVerified || false,
      twoFactorEnabled: user.profile?.twoFactorEnabled || false,
      notifications: {
        emailNotifications: user.notifications?.emailNotifications ?? true,
        smsNotifications: user.notifications?.smsNotifications ?? false,
        callAlerts: user.notifications?.callAlerts ?? true,
        billingAlerts: user.notifications?.billingAlerts ?? true,
        marketingEmails: user.notifications?.marketingEmails ?? false
      },
      subscription: {
        planName: user.subscription?.planName || null,
        status: user.subscription?.status || 'inactive',
        currentPeriodStart: user.subscription?.currentPeriodStart || null,
        currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
        billingCycle: user.subscription?.billingCycle || 'monthly'
      },
      usage: {
        minutesUsed: user.usage?.minutesUsed || 0,
        minutesLimit: user.usage?.minutesLimit || 0,
        callsThisMonth: user.usage?.callsThisMonth || 0,
        lastResetDate: user.usage?.lastResetDate || new Date()
      }
    };

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('Profile GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _req.json();
    const { 
      name, 
      phone, 
      company, 
      address, 
      city, 
      state,
      country, 
      timezone,
      notifications 
    } = body;

    await connectMongo();

    // Find and update the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update basic profile fields
    if (name !== undefined) user.name = name;

    // Update profile nested object
    if (!user.profile) user.profile = {};
    if (phone !== undefined) user.profile.phone = phone;
    if (company !== undefined) user.profile.company = company;
    if (address !== undefined) user.profile.address = address;
    if (city !== undefined) user.profile.city = city;
    if (state !== undefined) user.profile.state = state;
    if (country !== undefined) user.profile.country = country;
    if (timezone !== undefined) user.profile.timezone = timezone;

    // Update notifications if provided
    if (notifications) {
      if (!user.notifications) user.notifications = {};
      Object.keys(notifications).forEach(key => {
        if (notifications[key] !== undefined) {
          user.notifications[key] = notifications[key];
        }
      });
    }

    // Save the updated user
    await user.save();

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.profile.phone,
        company: user.profile.company,
        address: user.profile.address,
        city: user.profile.city,
        state: user.profile.state,
        country: user.profile.country,
        timezone: user.profile.timezone
      }
    });

  } catch (error) {
    console.error('Profile PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH endpoint for specific profile updates (like notification preferences)
export async function PATCH(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await _req.json();
    const { type, data } = body;

    await connectMongo();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (type) {
      case 'notifications':
        if (!user.notifications) user.notifications = {};
        Object.assign(user.notifications, data);
        break;
        
      case 'security':
        if (!user.profile) user.profile = {};
        if (data.twoFactorEnabled !== undefined) {
          user.profile.twoFactorEnabled = data.twoFactorEnabled;
        }
        break;
        
      case 'verification':
        if (!user.profile) user.profile = {};
        if (data.emailVerified !== undefined) {
          user.profile.emailVerified = data.emailVerified;
        }
        if (data.phoneVerified !== undefined) {
          user.profile.phoneVerified = data.phoneVerified;
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid update type' },
          { status: 400 }
        );
    }

    await user.save();

    return NextResponse.json({
      message: `${type} updated successfully`,
      [type]: type === 'notifications' ? user.notifications : 
               type === 'security' ? { twoFactorEnabled: user.profile?.twoFactorEnabled } :
               type === 'verification' ? { 
                 emailVerified: user.profile?.emailVerified,
                 phoneVerified: user.profile?.phoneVerified 
               } : {}
    });

  } catch (error) {
    console.error('Profile PATCH API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
