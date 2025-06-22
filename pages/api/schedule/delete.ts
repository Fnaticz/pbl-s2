import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Schedule from '../../../models/schedule';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Missing ID' });

  await connectDB();
  await Schedule.findByIdAndDelete(id);
  res.status(200).json({ message: 'Deleted' });
}
