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
  if (req.method !== "POST") return res.status(405).end();

  const { title, name, desc, files } = req.body;

  if (!title || !name || !desc || !files || !Array.isArray(files)) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    await connectDB();

    const newActivity = await Activity.create({
      title,
      name,
      desc,
      images: files,
      createdAt: new Date(),
    });

    res.status(201).json(newActivity);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error" });
  }
}
