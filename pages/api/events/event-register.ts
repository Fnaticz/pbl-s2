import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from 'mongoose';
import EventApplication from "../../../models/event-register";
import MemberApplication from "../../../models/member-register";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // ✅ cek login
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Login required" });
    }

    // ✅ pastikan role member
    if (session.user.role !== "member") {
      return res.status(403).json({ message: "Only members can register for events" });
    }

    const existing = await EventApplication.findOne({ userId: new mongoose.Types.ObjectId(session.user.id)});
        if (existing) {
          return res.status(400).json({ message: "You already applied for this event" });
        }

    const { driverName, coDriverName, carName, driverPhone, coDriverPhone, policeNumber, address, teamName } = req.body;

    // ✅ buat event baru
    const event = await EventApplication.create({
      userId: session.user.id,
      username: session.user.username,
      emailOrPhone: session.user.emailOrPhone,
      driverName,
      coDriverName,
      carName,
      driverPhone,
      coDriverPhone,
      policeNumber,
      address,
      teamName,
      status: "pending",
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Error registering event:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
