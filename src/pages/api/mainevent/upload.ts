import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import MainEvent from '../../../models/main-event';
import { uploadToCloudinary } from '../../../lib/cloudinary';

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
    const { title, date, location, name, desc, file } = req.body;

    // Validasi input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!date || typeof date !== "string" || date.trim().length === 0) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (!location || typeof location !== "string" || location.trim().length === 0) {
      return res.status(400).json({ message: "Location is required" });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!desc || typeof desc !== "string" || desc.trim().length === 0) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!file || typeof file !== "string") {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Validasi base64 image
    if (!file.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format. Must be base64 image data." });
    }

    // Upload ke Cloudinary
    try {
      const base64Data = file.split(",")[1];
      if (!base64Data) {
        return res.status(400).json({ message: "Invalid base64 format" });
      }
      
      const buffer = Buffer.from(base64Data, "base64");
      
      // Validasi ukuran (max 10MB)
      if (buffer.length > 10_000_000) {
        return res.status(400).json({ message: "Image is too large (max 10MB)" });
      }
      
      const cloudinaryResult = await uploadToCloudinary(
        buffer,
        "main-events",
        "image",
        `mainevent_${Date.now()}_${Math.random().toString(36).substring(7)}`
      );

      const newMainEvent = await MainEvent.create({
        title: title.trim(),
        date: date.trim(),
        location: location.trim(),
        name: name.trim(),
        desc: desc.trim(),
        imageUrl: cloudinaryResult.secureUrl,
        createdAt: new Date(),
      });

      return res.status(201).json(newMainEvent);
    } catch (uploadErr: any) {
      console.error("Main event upload to Cloudinary error:", uploadErr);
      return res.status(500).json({ 
        message: "Failed to upload image to storage",
        error: process.env.NODE_ENV === "development" ? uploadErr?.message : undefined
      });
    }
  } catch (err: any) {
    console.error("Main event upload error:", err);
    const errorMessage = err?.message || "Server error";
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined
    });
  }
}
