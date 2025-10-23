import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import EventApplication from '../../../models/event-register';
import Participant from '../../../models/participant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await connectDB();

    const allEvents = await EventApplication.find().sort({ date: -1 }).lean();

    // pisahkan berdasarkan status
    const pending = allEvents.filter((e) => e.status === "pending" || e.paymentStatus !== "approved");
    const approved = await Participant.find({ role: 'member' });

    res.status(200).json({ pending, approved });
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
}
