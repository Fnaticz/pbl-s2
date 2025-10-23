import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import EventApplication from "../../../models/event-register";
import Business from "../../../models/business";
import Point from "../../../models/point";
import Participant from "../../../models/participant";
import { use } from "react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId )
    return res.status(400).json({ message: "Missing userId or username" });

  try {
    await connectDB();

    // Hitung total event yang diikuti user
    const totalEvents = await Participant.countDocuments({ userId });

    // Hitung total business milik user berdasarkan username
    const totalBusinesses = userId
      ? await Business.countDocuments({ userId })
      : 0;

    // Ambil total points user
    const userPoints = await Point.findOne({ userId });
    const totalPoints = userPoints?.points || 0;

    return res.status(200).json({
      totalEvents,
      totalBusinesses,
      totalPoints,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
