// pages/api/members/action.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import MemberApplication from '../../../models/member-register';
import bcrypt from 'bcryptjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method !== 'POST') return res.status(405).end();
  
    const { id, action } = req.body;
  
    try {
      await connectDB();
  
      const application = await MemberApplication.findById(id);
      if (!application) return res.status(404).json({ message: 'Application not found' });
  
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
  
        await MemberApplication.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Accepted' });
      }
  
      if (action === 'reject') {
        await MemberApplication.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Rejected' });
      }
  
      res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
      console.error('Action error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }