import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import User from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🧪 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected');

    const users = await User.find({}).limit(3); // kecilkan query
    res.status(200).json({ users });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
}
