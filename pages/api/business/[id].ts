import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Business from "../../../models/business";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const business = await Business.findById(id);
      if (!business) return res.status(404).json({ message: "Not found" });
      return res.status(200).json(business);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Fetch business error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
