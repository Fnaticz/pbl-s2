import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import MemberApplication from '../../../models/member-register';
import Inbox from '../../../models/inbox';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { id, action } = req.body;

  try {
    await connectDB();

    const application = await MemberApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let message = '';

    if (action === 'accept') {
      const existingUser = await User.findOne({ username: application.username });

      if (existingUser) {
        existingUser.role = 'member';
        await existingUser.save();
      } else {
        await User.create({
          username: application.username,
          emailOrPhone: application.email,
          password: application.phone,
          address: application.address,
          role: 'member',
        });
      }

      await Inbox.create({
        from: 'Admin',
        to: application.username,
        type: 'admin',
        content: `Hello, ${application.username}! Your membership has been approved!`,
        date: new Date().toLocaleString(),
      });
      

      message = 'Accepted';
    } else if (action === 'reject') {
      await Inbox.create({
        from: 'Admin',
        to: application.username,
        type: 'admin',
        content: `Hello, ${application.username}! Sorry, your membership has been rejected.`,
        date: new Date().toLocaleString(),
      });

      message = 'Rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await MemberApplication.findByIdAndDelete(id);

    return res.status(200).json({ message });

  } catch (error) {
    console.error('Action error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
