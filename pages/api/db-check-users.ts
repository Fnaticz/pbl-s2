// pages/api/db-check-users.ts
import { connectDB } from '../../lib/mongodb';
import User from '../../models/user';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    const users = await User.find({}).limit(5);
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ DB check error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
}
