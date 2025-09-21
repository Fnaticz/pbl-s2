import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Business from "../../../models/business";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { method } = req;

  try {
    if (method === "GET") {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ message: "Username required" });
      }
      const businesses = await Business.find({ username });
      return res.status(200).json(businesses);
    }

    if (method === "POST") {
      const business = new Business(req.body);
      await business.save();
      return res.status(201).json({ message: "Business created", business });
    }

    if (method === "PUT") {
      const { _id } = req.body;
      if (!_id) {
        return res.status(400).json({ message: "Business ID required" });
      }
      const updated = await Business.findByIdAndUpdate(_id, req.body, { new: true });
      return res.status(200).json({ message: "Business updated", business: updated });
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Business ID required" });
      }
      await Business.findByIdAndDelete(id);
      return res.status(200).json({ message: "Business deleted" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Business API error:", err.message);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
    console.error("Business API unknown error:", err);
    return res.status(500).json({ message: "Unknown server error" });
  }
}
