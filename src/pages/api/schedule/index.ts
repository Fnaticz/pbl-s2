import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Schedule from '../../../models/schedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectDB();
  const schedules = await Schedule.find().sort({ date: 1 });
  res.status(200).json(schedules);
}
