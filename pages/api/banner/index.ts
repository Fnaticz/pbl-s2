import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Banner from "../../../models/banner";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case "GET": {
      try {
        const banners = await Banner.find().sort({ uploadedAt: -1 });
        return res.status(200).json(banners);
      } catch (err) {
        return res.status(500).json({ message: "Failed to fetch banners" });
      }
    }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
