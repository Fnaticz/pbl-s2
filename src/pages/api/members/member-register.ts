import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import mongoose from 'mongoose';
import MemberApplication from '../../../models/member-register'; // pastikan nama file model benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // ✅ pastikan user login
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Login required" });
    }

    const { name, address, phone, hobby, vehicleType, vehicleSpec } = req.body;

    // ✅ cek apakah user sudah pernah daftar jadi member
    const existing = await MemberApplication.findOne({ userId: new mongoose.Types.ObjectId(session.user.id)});
    if (existing) {
      return res.status(400).json({ message: "You already applied for membership" });
    }

    // ✅ buat data member baru
    const member = await MemberApplication.create({
      userId: session.user.id,                  // relasi ke User
      username: session.user.username,          // ambil dari session
      emailOrPhone: session.user.emailOrPhone,  // ambil dari session
      name,
      address,
      phone,
      hobby,
      vehicleType,
      vehicleSpec,
      status: "pending",
    });

    return res.status(201).json(member);
  } catch (err) {
    console.error("Error registering member:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
