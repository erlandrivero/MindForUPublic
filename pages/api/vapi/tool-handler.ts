import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppointmentsForUser } from '../../../models/Appointment';

const WEBHOOK_SECRET = process.env.VAPI_TOOL_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    // Webhook secret validation
    const providedSecret = req.headers['x-vapi-secret'] || req.body.secret;
    if (!WEBHOOK_SECRET || providedSecret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret' });
    }
    const { tool, parameters } = req.body;
    if (tool.function.name === 'lookup_appointment') {
      const { phoneNumber, date } = parameters;
      const appointments = await getAppointmentsForUser(phoneNumber, date);
      if (!appointments || appointments.length === 0) {
        return res.json({ result: "You have no appointments for that date." });
      }
      return res.json({
        result: `You have ${appointments.length} appointment(s) on ${date}.`
      });
    }
    res.status(400).json({ error: 'Unknown tool' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
}
