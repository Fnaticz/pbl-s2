import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Point from "../../../models/point";
import EventApplication from "../../../models/event-register";
import Participant from "../../../models/participant";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const { userId } = req.query;

  if (!userId || typeof userId !== "string")
    return res.status(400).json({ message: "Missing userId" });

  try {
    await connectDB();

    const events = await Participant.find({ userId }).sort({ date: -1 });
    const pointsData = await Point.findOne({ userId });

    return res.status(200).json({
      events: events.map((e) => ({
        eventName: e.title,
        date: e.date,
        pointsEarned: e.pointsReward || 50,
      })),
      totalPoints: pointsData?.points || 0,
    });
  } catch (err) {
    console.error("History API Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
