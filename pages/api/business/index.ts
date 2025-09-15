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

      const business = await Business.findOne({ username });
      return res.status(200).json(business || {});
    }

    if (method === "POST") {
      const { username, ...rest } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username required" });
      }

      const business = await Business.create({ username, ...rest });
      return res.status(201).json({ message: "Business created", business });
    }

    if (method === "PUT") {
      const { username, ...updates } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username required" });
      }

      const business = await Business.findOneAndUpdate({ username }, updates, { new: true });
      return res.status(200).json({ message: "Business updated", business });
    }

    if (method === "DELETE") {
      const { username } = req.query;
      if (!username) {
        return res.status(400).json({ message: "Username required" });
      }

      await Business.findOneAndDelete({ username });
      return res.status(200).json({ message: "Business deleted" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
