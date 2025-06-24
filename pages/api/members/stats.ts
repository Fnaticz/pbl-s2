import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import MemberApplication from '../../../models/member-register'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await connectDB();

    const totalMembers = await User.countDocuments({ role: 'member' });
    const pendingMembers = await MemberApplication.countDocuments({ status: 'pending' });

    res.status(200).json({
      totalMembers,
      pendingMembers
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: 'Server error' });
  }
}
