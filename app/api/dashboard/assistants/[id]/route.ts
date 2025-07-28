import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';

// PATCH - Update assistant (status, configuration, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    await connectMongo();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the assistant and verify ownership
    const assistant = await Assistant.findOne({ 
      _id: id, 
      userId: user._id 
    });

    if (!assistant) {
      return NextResponse.json({ 
        error: 'Assistant not found or access denied' 
      }, { status: 404 });
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'name', 'description', 'configuration'];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Special handling for status changes
    if (updates.status) {
      const validStatuses = ['active', 'inactive', 'training'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be: active, inactive, or training' 
        }, { status: 400 });
      }

      // TODO: In the future, integrate with Vapi API to actually activate/deactivate
      // For now, we'll just update the database status
      console.log(`Assistant ${assistant.name} status changing: ${assistant.status} → ${updates.status}`);
    }

    // Apply updates
    Object.assign(assistant, updates);
    assistant.updatedAt = new Date();
    
    await assistant.save();

    return NextResponse.json({
      message: 'Assistant updated successfully',
      assistant: {
        id: assistant._id,
        name: assistant.name,
        description: assistant.description,
        status: assistant.status,
        type: assistant.type,
        configuration: assistant.configuration,
        updatedAt: assistant.updatedAt
      }
    });

  } catch (error) {
    console.error('Update assistant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete assistant
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await connectMongo();

    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find and delete the assistant (verify ownership)
    const assistant = await Assistant.findOneAndDelete({ 
      _id: id, 
      userId: user._id 
    });

    if (!assistant) {
      return NextResponse.json({ 
        error: 'Assistant not found or access denied' 
      }, { status: 404 });
    }

    // TODO: In the future, also delete from Vapi API
    console.log(`Assistant ${assistant?.name || 'Unknown'} deleted by user ${user.email}`);

    return NextResponse.json({
      message: 'Assistant deleted successfully'
    });

  } catch (error) {
    console.error('Delete assistant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
