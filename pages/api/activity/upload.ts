import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import Activity from '@/models/activity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, name, desc, imageUrl } = req.body;
  if (!title || !name || !desc || !imageUrl) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await connectDB();
    const newActivity = await Activity.create({ title, name, desc, imageUrl });
    res.status(201).json(newActivity);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
