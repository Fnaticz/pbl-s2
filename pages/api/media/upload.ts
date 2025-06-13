import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Media from '../../../models/media';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  const { type, url, username } = req.body;

  if (!type || !url || !username) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const newMedia = await Media.create({ type, url, username });
  res.status(201).json(newMedia);
}
