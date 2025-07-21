import type { NextApiRequest, NextApiResponse } from 'next';

import connectMongo from '@/libs/mongoose';
import Appointment from '@/models/Appointment';

// Store appointment in MongoDB
interface AppointmentDetails {
  date: string;
  time: string;
  service: string;
  assistant: string;
  intent: string;
  // Add other properties as needed based on actual usage
}

async function bookAppointment(caller: string, details: AppointmentDetails) {
  await connectMongo();
  const appointment = await Appointment.create({
    caller,
    assistant: details.assistant,
    intent: details.intent,
    details,
  });
  return { success: true, confirmationId: appointment._id };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { caller, assistant, intent, ...rest } = req.body;

      // Log incoming call details
      console.log('Incoming call webhook:', { caller, assistant, intent, rest });

      if (intent === 'book_appointment') {
        const result = await bookAppointment(caller, rest);
        res.status(200).json({ message: 'Appointment booked', confirmation: result });
      } else {
        res.status(200).json({ message: 'Incoming call received', assistant, intent });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: unknown) {
    console.error('Error handling incoming call webhook:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
}
