import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import MainEvent from '../../../models/main-event';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await connectDB();
    const mainevent = await MainEvent.find().sort({ createdAt: -1 });
    res.status(200).json(mainevent);
  } catch (err) {
    console.error('Fetch main event error:', err);
    res.status(500).json({ message: 'Failed to fetch main event' });
  }
}
