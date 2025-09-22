import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Activity from "../../../models/activity";

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

  const { title, name, desc, images } = req.body;

  if (!title || !name || !desc || !images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await connectDB();

    const newActivity = await Activity.create({
      title,
      name,
      desc,
      images,
      createdAt: new Date(),
    });

    res.status(201).json(newActivity);
  } catch (err) {
    console.error("Activity upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
