import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import MainEvent from '../../../models/main-event';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { title, date, location, name, desc, file } = req.body;

  if (!title || !date || !location || !name || !desc || !file) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await connectDB();

    const newMainEvent = await MainEvent.create({
      title,
      date,
      location,
      name,
      desc,
      imageUrl: file,
      createdAt: new Date(),
    });

    res.status(201).json(newMainEvent);
  } catch (err) {
    console.error("Main event upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
