import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Media from "../../../models/media";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const media = await Media.find().sort({ createdAt: -1 });
      return res.status(200).json(media);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Fetch media error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
