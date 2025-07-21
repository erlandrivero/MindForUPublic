import type { NextApiRequest, NextApiResponse } from 'next';

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
    if (tool.function.name === 'lookup_order') {
      const { orderNumber } = parameters;
      // TODO: Replace with real DB lookup
      if (orderNumber === '12345') {
        return res.json({
          result: `Your order #12345 is shipped. Expected delivery: July 15. Tracking: 1Z999AA10123456784`
        });
      } else {
        return res.json({ result: `Order #${orderNumber} not found.` });
      }
    }
    res.status(400).json({ error: 'Unknown tool' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
}
