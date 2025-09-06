import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  res.json({ MONGO_URI: process.env.MONGO_URI });
}
  