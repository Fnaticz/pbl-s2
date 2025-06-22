// pages/api/members/list.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import MemberApplication from '../../../models/member-register';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await connectDB();

    const pending = await MemberApplication.find({ status: 'pending' });
    const approved = await User.find({ role: 'member' });

    res.status(200).json({ pending, approved });
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
}
