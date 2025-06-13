import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Media from '../../../models/media';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const media = await Media.find().sort({ createdAt: -1 });
  res.status(200).json(media);
}
