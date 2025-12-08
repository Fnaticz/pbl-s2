import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Finance from '../../../models/finance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectDB();
  const records = await Finance.find().sort({ date: -1 });
  res.status(200).json(records);
}
