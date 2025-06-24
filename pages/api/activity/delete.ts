import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Activity from '../../../models/activity';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Missing ID' });

  try {
    await connectDB();
    await Activity.findByIdAndDelete(id);
    res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete' });
  }
}
