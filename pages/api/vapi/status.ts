import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      console.log('Call status webhook:', req.body);
      res.status(200).json({ message: 'Call status update received' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling call status webhook:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : error });
  }
}

