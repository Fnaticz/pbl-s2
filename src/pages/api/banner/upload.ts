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

  try {
    await connectDB();
  } catch (err) {
    console.error("DB connect error:", err);
    return res.status(500).json({ message: "Database connection error" });
  }

  try {
    const { name, title, eventDate, location, file } = req.body;

    // Validasi input
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!eventDate || typeof eventDate !== "string" || eventDate.trim().length === 0) {
      return res.status(400).json({ message: "Event date is required" });
    }

    if (!location || typeof location !== "string" || location.trim().length === 0) {
      return res.status(400).json({ message: "Location is required" });
    }

    if (!file || typeof file !== "string") {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Validasi base64 image
    if (!file.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format. Must be base64 image data." });
    }

    const newBanner = await Banner.create({
      name: name.trim(),
      title: title.trim(),
      eventDate: eventDate.trim(),
      location: location.trim(),
      imageUrl: file,
      uploadedAt: new Date(),
    });

    res.status(201).json(newBanner);
  } catch (err: any) {
    console.error("Banner upload error:", err);
    const errorMessage = err?.message || "Server error";
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined
    });
  }
}
