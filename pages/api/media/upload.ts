import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Media from "../../../models/media";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "POST") {
      const { type, url, username } = req.body;

      if (!type || !url || !username) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newMedia = await Media.create({ type, url, username });
      return res.status(201).json(newMedia);
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Upload media error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
