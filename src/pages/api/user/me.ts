import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]"; // sesuaikan path
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // batas upload avatar base64
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // cek session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // kalau kamu pakai emailOrPhone, pastikan properti itu memang ada di session
    const identifier = session.user.emailOrPhone;
    if (!identifier) {
      return res.status(400).json({ message: "Invalid session data" });
    }

    await connectDB();

    // cari user di database
    const user = await User.findOne({ emailOrPhone: identifier }).select(
      "_id username address role avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("User fetch error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
