import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import EventApplication from "../../../models/event-register";
import Business from "../../../models/business";
import Point from "../../../models/point";
import Participant from "../../../models/participant";
import User from "../../../models/user";
import mongoose from "mongoose";

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

    // Data untuk chart - event participation per bulan (6 bulan terakhir)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyEvents = await Participant.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId as string) } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      totalEvents,
      totalBusinesses,
      totalPoints,
      monthlyEvents: monthlyEvents.map(m => ({ month: m._id, count: m.count }))
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
