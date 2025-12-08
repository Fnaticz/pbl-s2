import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Activity from '../../../models/activity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await connectDB();
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.status(200).json(activities);
  } catch (err) {
    console.error('Fetch activity error:', err);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
}
