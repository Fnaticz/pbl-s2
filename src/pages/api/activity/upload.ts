import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Activity from '../../../models/activity';

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
    const { title, name, desc, images } = req.body;

    // Validasi input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!desc || typeof desc !== "string" || desc.trim().length === 0) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Validasi setiap image adalah base64 string
    for (let i = 0; i < images.length; i++) {
      if (typeof images[i] !== "string" || !images[i].startsWith("data:image")) {
        return res.status(400).json({ message: `Image ${i + 1} is invalid. Must be base64 image data.` });
      }
    }

    const activityName = name || "activity";

    const newActivity = await Activity.create({
      title: title.trim(),
      name: activityName.trim(),
      desc: desc.trim(),
      images,
      createdAt: new Date(),
    });

    res.status(201).json(newActivity);
  } catch (err: any) {
    console.error("Activity upload error:", err);
    const errorMessage = err?.message || "Server error";
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined
    });
  }
}
