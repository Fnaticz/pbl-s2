import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Banner from "../../../models/banner";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, file, title, eventDate, locationUrl } = req.body;

  if (!name || !file) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await connectDB();

    const newBanner = await Banner.create({
      name,
      imageUrl: file,
      uploadedAt: new Date(),
      title: title || "",
      eventDate: eventDate ? new Date(eventDate) : null,
      locationUrl: locationUrl || "",
    });

    res.status(201).json(newBanner);
  } catch (err) {
    console.error("Banner upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
