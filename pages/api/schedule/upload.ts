import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Schedule from '../../../models/schedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { date, title, created } = req.body;
  if (!date || !title || !created) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  await connectDB();
  const schedule = await Schedule.create({ date, title, created });
  res.status(201).json(schedule);
}
