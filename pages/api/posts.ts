import { connectDB } from '../../lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mongoose = await connectDB();
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    const posts = await mongoose.connection.db.collection("posts").find({}).toArray();
    res.status(200).json(posts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}
