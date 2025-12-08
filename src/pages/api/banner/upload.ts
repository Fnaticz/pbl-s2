import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Banner from '../../../models/banner';

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

  const { name, title, eventDate, location, file } = req.body;

  if (!name || !title || !eventDate || !location || !file) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await connectDB();

    const newBanner = await Banner.create({
      name,
      title,
      eventDate,
      location,
      imageUrl: file,
      uploadedAt: new Date(),
    });

    res.status(201).json(newBanner);
  } catch (err) {
    console.error("Banner upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
