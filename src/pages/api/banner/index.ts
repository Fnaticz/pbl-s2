import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Banner from '../../../models/banner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await connectDB();
    const banners = await Banner.find().sort({ uploadedAt: -1 });
    res.status(200).json(banners);
  } catch (err) {
    console.error('Fetch banner error:', err);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
}
