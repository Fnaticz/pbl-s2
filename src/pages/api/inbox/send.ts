import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../../lib/mongodb';
import Inbox from '../../../models/inbox';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sender, recipient, message } = req.body;

  if (!sender || !recipient || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connectDB();
    const newMsg = await Inbox.create({ sender, recipient, message });
    res.status(201).json(newMsg);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: 'Server error' });
  }
}
