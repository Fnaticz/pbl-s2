import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import mongoose from 'mongoose';

const MemberApplicationSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  address: String,
  phone: String,
  hobby: String,
  vehicleType: String,
  vehicleSpec: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

const MemberApplication = mongoose.models.MemberApplication || mongoose.model('MemberApplication', MemberApplicationSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await connectDB();
    const saved = await MemberApplication.create(req.body);
    res.status(201).json({ message: 'Application submitted', data: saved });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
