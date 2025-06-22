import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Banner from '../../../models/banner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, imageUrl } = req.body;

  if (!name || !imageUrl) return res.status(400).json({ message: 'Missing fields' });

  try {
    await connectDB();
    const banner = await Banner.create({ name, imageUrl });
    res.status(201).json(banner);
  } catch (err) {
    console.error('Banner upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
