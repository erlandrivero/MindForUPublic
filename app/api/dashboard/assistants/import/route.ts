import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';
import vapi from '@/libs/vapi';

export async function POST(_req: NextRequest) {
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

    // Get all existing assistants for this user from our database
    const existingAssistants = await Assistant.find({ userId: user._id });
    const existingVapiIds = existingAssistants.map(a => a.vapiAssistantId);

    // Fetch all assistants from Vapi
    const vapiAssistantsResponse = await vapi.assistants.list();

    // Filter out assistants that are already in our database
    const newVapiAssistants = vapiAssistantsResponse.data.filter(
      (vapiAssistant: any) => !existingVapiIds.includes(vapiAssistant.id)
    );

    if (newVapiAssistants.length === 0) {
      return NextResponse.json({
        message: 'No new assistants found to import',
        imported: 0
      });
    }

    // Import new assistants
    const importedAssistants = [];
    for (const vapiAssistant of newVapiAssistants) {
      try {
        // Extract assistant type from the first system message if available
        let assistantType = 'general';
        if (vapiAssistant.tools?.some((tool: any) => tool.type === 'code_interpreter')) {
          assistantType = 'coding';
        } else if (vapiAssistant.tools?.some((tool: any) => tool.type === 'retrieval')) {
          assistantType = 'knowledge_base';
        }
        
        // Extract description from system message if available
        let description = '';
        if (vapiAssistant.instructions) {
          description = vapiAssistant.instructions.substring(0, 200);
        }

        // Check if this assistant has a phone number assigned
        let phoneNumber = null;
        try {
          const phoneNumbersResponse = await vapi.phoneNumbers.list();
          const assignedPhoneNumber = phoneNumbersResponse.data.find(
            (phone: any) => phone.assistantId === vapiAssistant.id
          );
          
          if (assignedPhoneNumber) {
            phoneNumber = {
              id: assignedPhoneNumber.id,
              number: assignedPhoneNumber.number,
              status: assignedPhoneNumber.status,
              areaCode: assignedPhoneNumber.areaCode
            };
          }
        } catch (phoneErr) {
          console.error('Error fetching phone numbers:', phoneErr);
        }

        // Create new assistant in our database
        const newAssistant = new Assistant({
          userId: user._id,
          vapiAssistantId: vapiAssistant.id,
          name: vapiAssistant.name,
          description: description,
          type: assistantType,
          status: 'active',
          configuration: {
            voice: vapiAssistant.voice?.voiceId || 'alloy',
            model: vapiAssistant.model || 'gpt-4'
          },
          phoneNumber: phoneNumber,
          statistics: {
            totalCalls: 0,
            callsToday: 0,
            avgDuration: 0,
            successRate: 0
          },
          imported: true
        });

        await newAssistant.save();
        importedAssistants.push({
          id: newAssistant._id,
          name: newAssistant.name,
          vapiAssistantId: newAssistant.vapiAssistantId,
          phoneNumber: phoneNumber
        });
      } catch (importError) {
        console.error(`Failed to import assistant ${vapiAssistant.id}:`, importError);
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${importedAssistants.length} assistants`,
      imported: importedAssistants.length,
      assistants: importedAssistants
    });

  } catch (error) {
    console.error('Import assistants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
