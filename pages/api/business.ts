import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/mongodb";
import Business from "../../models/business";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { method } = req;

  try {
    switch (method) {
      case "GET": {
        const { owner } = req.query;
        if (!owner) return res.status(400).json({ message: "Owner required" });
        const businesses = await Business.find({ owner });
        return res.status(200).json(businesses);
      }
      case "POST": {
        const { owner, name, description, category, coverImage } = req.body;
        if (!owner || !name || !description || !category) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        const business = await Business.create({ owner, name, description, category, coverImage });
        return res.status(201).json(business);
      }
      case "PUT": {
        const { id, ...updates } = req.body;
        const updated = await Business.findByIdAndUpdate(id, updates, { new: true });
        return res.status(200).json(updated);
      }
      case "DELETE": {
        const { id } = req.query;
        await Business.findByIdAndDelete(id);
        return res.status(200).json({ message: "Business deleted" });
      }
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
