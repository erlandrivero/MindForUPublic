import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import vapi from '@/libs/vapi';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import Call from '@/models/Call';

// Define interfaces for better type safety
interface PhoneNumberMetadata {
  userEmail: string;
  userId: string;
  [key: string]: string;
}

interface PhoneNumberCreateParams {
  name: string;
  assistantId: string;
  metadata: PhoneNumberMetadata;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongo();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all assistants for the user
    const assistants = await Assistant.find({ userId: user._id }).sort({ createdAt: -1 });

    // Get today's date for daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Enhance assistants with real-time call data
    const enhancedAssistants = await Promise.all(
      assistants.map(async (assistant) => {
        // Get today's calls for this assistant
        const todaysCalls = await Call.countDocuments({
          assistantId: assistant._id,
          createdAt: { $gte: today }
        });

        // Get recent call for last active time
        const lastCall = await Call.findOne({
          assistantId: assistant._id
        }).sort({ createdAt: -1 });

        // Calculate average duration from recent calls
        const avgDurationData = await Call.aggregate([
          { $match: { assistantId: assistant._id } },
          {
            $group: {
              _id: null,
              avgDuration: { $avg: '$duration' },
              totalCalls: { $sum: 1 },
              successfulCalls: { $sum: { $cond: [{ $eq: ['$outcome', 'successful'] }, 1, 0] } }
            }
          }
        ]);

        const stats = avgDurationData[0] || {
          avgDuration: 0,
          totalCalls: 0,
          successfulCalls: 0
        };

        const successRate = stats.totalCalls > 0 
          ? (stats.successfulCalls / stats.totalCalls * 100)
          : 0;

        return {
          id: assistant._id,
          name: assistant.name,
          description: assistant.description,
          status: assistant.status,
          type: assistant.type,
          callsToday: todaysCalls,
          totalCalls: stats.totalCalls,
          avgDuration: formatDuration(stats.avgDuration),
          successRate: Math.round(successRate * 10) / 10,
          lastActive: lastCall ? getTimeAgo(lastCall.createdAt) : 'Never',
          createdAt: assistant.createdAt.toISOString().split('T')[0],
          vapiAssistantId: assistant.vapiAssistantId,
          configuration: assistant.configuration,
          phoneNumber: assistant.phoneNumber
        };
      })
    );

    // Calculate overall stats
    const totalAssistants = assistants.length;
    const activeAssistants = assistants.filter(a => a.status === 'active').length;
    const totalCallsToday = enhancedAssistants.reduce((sum, a) => sum + a.callsToday, 0);
    const avgSuccessRate = enhancedAssistants.length > 0
      ? enhancedAssistants.reduce((sum, a) => sum + a.successRate, 0) / enhancedAssistants.length
      : 0;

    const stats = {
      totalAssistants,
      activeAssistants,
      totalCallsToday,
      avgSuccessRate: Math.round(avgSuccessRate * 10) / 10
    };

    return NextResponse.json({
      assistants: enhancedAssistants,
      stats
    });

  } catch (error) {
    console.error('Assistants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, type, configuration, createPhoneNumber = true, areaCode = '555' } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create assistant in Vapi first
    let vapiAssistantId: string;
    
    try {
      console.log('Creating assistant in Vapi with config:', { name, type, configuration });
      
      // Create the assistant in Vapi
      const vapiAssistant = await vapi.assistants.create({
        name,
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are ${name}, a helpful ${type.replace('_', ' ')} assistant. ${description || ''}`
            }
          ]
        },
        voice: {
          provider: 'openai',
          voiceId: configuration?.voice || 'alloy'
        },
        firstMessage: `Hello! I'm ${name}, your ${type.replace('_', ' ')} assistant. How can I help you today?`
      });
      
      vapiAssistantId = vapiAssistant.id;
      console.log('Vapi assistant created successfully with ID:', vapiAssistantId);
      
    } catch (vapiError) {
      console.error('Failed to create assistant in Vapi:', vapiError);
      return NextResponse.json(
        { error: 'Failed to create assistant in Vapi. Please check your API configuration.' },
        { status: 500 }
      );
    }

    // Create phone number if requested
    let phoneNumber = null;
    let phoneNumberError = null;
    
    if (createPhoneNumber) {
      try {
        console.log('Creating phone number for assistant:', vapiAssistantId);
        
        // Create free Vapi phone number
        // Note: The Vapi SDK doesn't have complete TypeScript definitions
        // We need to use type assertions to work around this limitation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vapiPhoneNumber = await vapi.phoneNumbers.create({
          name: `${name} Phone Line`,
          assistantId: vapiAssistantId,
          metadata: {
            userEmail: session.user.email,
            userId: user._id.toString() // Store user ID in metadata for filtering
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        
        phoneNumber = {
          id: vapiPhoneNumber.id,
          number: vapiPhoneNumber.number,
          status: vapiPhoneNumber.status
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
    }

    // Create new assistant
    const assistant = new Assistant({
      userId: user._id,
      vapiAssistantId,
      name,
      description: description || '',
      type,
      status: 'inactive',
      configuration: configuration || {},
      phoneNumber: phoneNumber,
      statistics: {
        totalCalls: 0,
        callsToday: 0,
        avgDuration: 0,
        successRate: 0
      }
    });

    await assistant.save();

    const response: any = {
      message: 'Assistant created successfully',
      assistant: {
        id: assistant._id,
        name: assistant.name,
        description: assistant.description,
        status: assistant.status,
        type: assistant.type,
        vapiAssistantId: assistant.vapiAssistantId,
        phoneNumber: phoneNumber
      }
    };

    if (phoneNumberError) {
      response.warning = `Assistant created but phone number failed: ${phoneNumberError}`;
    }

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Create assistant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatDuration(seconds: number): string {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}
