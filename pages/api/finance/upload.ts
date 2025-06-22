import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Finance from '../../../models/finance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { description, amount, date } = req.body;
  if (!description || !amount || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  await connectDB();
  const record = await Finance.create({ description, amount, date });
  res.status(201).json(record);
}
