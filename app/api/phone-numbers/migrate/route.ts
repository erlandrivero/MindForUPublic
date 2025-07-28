import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import vapi from '@/libs/vapi';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import Assistant from '@/models/Assistant';

// Define interfaces for better type safety
interface PhoneNumber {
  id: string;
  number: string;
  assistantId?: string;
  metadata?: {
    userId?: string;
    userEmail?: string;
    [key: string]: any;
  };
}

interface MigrationResult {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
  details: Array<{
    number: string;
    status: 'updated' | 'skipped' | 'error';
    reason?: string;
    userId?: string;
    userEmail?: string;
    error?: string;
  }>;
}

/**
 * This API route is for migrating legacy phone numbers to include proper user metadata.
 * It should only be accessible by admin users.
 * It will:
 * 1. Get all phone numbers from Vapi
 * 2. For each phone number, check if it's assigned to an assistant
 * 3. If assigned, find the assistant in our database and update the phone number metadata with the user ID
 * 4. If not assigned, it will be left as-is (admin can manually assign later)
 */
export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin users (erlandrivero@gmail.com for now)
    if (session.user.email !== 'erlandrivero@gmail.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectMongo();
    
    // Get all phone numbers from Vapi
    const phoneNumbersResponse = await vapi.phoneNumbers.list();
    const phoneNumbers = phoneNumbersResponse as unknown as PhoneNumber[];
    console.log(`Found ${phoneNumbers?.length || 0} phone numbers to process`);
    
    const results: MigrationResult = {
      total: phoneNumbers?.length || 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: []
    };
    
    // Process each phone number
    for (const phone of phoneNumbers || []) {
      try {
        // Skip if phone number already has userId metadata
        if (phone.metadata?.userId) {
          console.log(`Phone ${phone.number} already has userId metadata, skipping`);
          results.skipped++;
          results.details.push({
            number: phone.number,
            status: 'skipped',
            reason: 'already has userId metadata'
          });
          continue;
        }
        
        // If phone is assigned to an assistant, find the assistant and its user
        if (phone.assistantId) {
          // Find the assistant in our database
          const assistant = await Assistant.findOne({ vapiAssistantId: phone.assistantId });
          
          if (assistant) {
            // Find the user for this assistant
            const user = await User.findById(assistant.userId);
            
            if (user) {
              // Update the phone number metadata with user information
              await vapi.phoneNumbers.update(phone.id, {
                // Cast to any to bypass TypeScript limitations with the Vapi SDK
                // The SDK may not have proper TypeScript definitions for metadata
                metadata: {
                  userId: user._id.toString(),
                  userEmail: user.email
                }
              } as any);
              
              console.log(`Updated phone ${phone.number} with user ${user.email} (${user._id})`);
              results.updated++;
              results.details.push({
                number: phone.number,
                status: 'updated',
                userId: user._id.toString(),
                userEmail: user.email
              });
              continue;
            }
          }
        }
        
        // If we get here, the phone number is either unassigned or we couldn't find the user
        console.log(`Phone ${phone.number} is unassigned or user not found, skipping`);
        results.skipped++;
        results.details.push({
          number: phone.number,
          status: 'skipped',
          reason: phone.assistantId ? 'assistant or user not found' : 'unassigned'
        });
        
      } catch (error) {
        console.error(`Error processing phone ${phone.number}:`, error);
        results.errors++;
        results.details.push({
          number: phone.number,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed: ${results.updated} updated, ${results.skipped} skipped, ${results.errors} errors`,
      results
    });
    
  } catch (error) {
    console.error('Phone number migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate phone numbers' },
      { status: 500 }
    );
  }
}
