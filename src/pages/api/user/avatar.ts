import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username } = req.query;
    
    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "Username required" });
    }

    await connectDB();

    const user = await User.findOne({ username }).select("avatar username");

    if (!user) {
      return res.status(200).json({ avatar: null, username });
    }

    return res.status(200).json({ 
      avatar: user.avatar || null, 
      username: user.username 
    });
  } catch (error) {
    console.error("Avatar fetch error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

