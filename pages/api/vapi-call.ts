import type { NextApiRequest, NextApiResponse } from 'next';

// Load your Vapi secret API key from environment variables
const VAPI_SECRET_KEY = process.env.VAPI_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!VAPI_SECRET_KEY) {
    return res.status(500).json({ error: 'Vapi secret key not configured on server' });
  }

  const { assistant, variables, phone } = req.body;

  if (!assistant && !phone) {
    return res.status(400).json({ error: 'Missing assistant ID or phone number' });
  }

  try {
    const payload = phone
      ? { phone } // Direct phone call (only phone property)
      : { assistant, variables };

    const vapiRes = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_SECRET_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await vapiRes.json();
    if (!vapiRes.ok) {
      return res.status(vapiRes.status).json({ error: data.error || 'Vapi API error', details: data });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to call Vapi API', details: String(e) });
  }
}
