import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import MemberApplication from '../../../models/member-register';
import Participant from '../../../models/participant';
import EventApplication from '../../../models/event-register';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await connectDB();

    const totalMembers = await User.countDocuments({ role: 'member' });
    const pendingMembers = await MemberApplication.countDocuments({ status: 'pending' });
    
    // Total member yang mendaftar event (dari EventApplication)
    const totalRegisteredMembers = await EventApplication.countDocuments();
    
    // Total member aktif (dari Participant dengan status approved - semua member yang telah mengikuti event)
    const totalActiveMembers = await Participant.countDocuments({ status: "approved" });

    res.status(200).json({
      totalMembers,
      pendingMembers,
      totalRegisteredMembers,
      totalActiveMembers
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: 'Server error' });
  }
}
