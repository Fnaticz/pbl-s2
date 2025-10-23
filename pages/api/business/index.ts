// pages/api/business/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import Business from "../../../models/business";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.id;
    const username = session.user.username || "Unknown User";

    // ✅ GET all businesses for user
    if (req.method === "GET") {
      const businesses = await Business.find({ userId }).sort({ createdAt: -1 }).lean();
      return res.status(200).json(businesses);
    }

    // ✅ POST: create new business
    if (req.method === "POST") {
      const {
        name,
        category,
        description,
        address,
        phone,
        facebook,
        instagram,
        whatsapp,
        maps,
        slideshow,
      } = req.body;

      if (!name || !category || !description) {
        return res.status(400).json({ message: "Name, category, and description required" });
      }

      const newBusiness = new Business({
        userId,
        username,
        name,
        category,
        description,
        address,
        phone,
        facebook,
        instagram,
        whatsapp,
        maps,
        slideshow: Array.isArray(slideshow) ? slideshow : [],
      });

      await newBusiness.save();

      // ✅ langsung kirim hasil .toObject() supaya _id pasti ada
      return res.status(201).json(newBusiness.toObject());
    }

    // ✅ PUT: update existing
    if (req.method === "PUT") {
      const { _id, ...updateData } = req.body;
      if (!_id) return res.status(400).json({ message: "Missing _id" });

      const business = await Business.findById(_id);
      if (!business) return res.status(404).json({ message: "Business not found" });

      if (business.userId.toString() !== userId)
        return res.status(403).json({ message: "Forbidden" });

      Object.assign(business, updateData);
      await business.save();

      return res.status(200).json(business.toObject());
    }

    // ✅ DELETE: hapus via body.id atau query.id
    if (req.method === "DELETE") {
      const id = (req.query.id as string) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ message: "Missing id" });

      const business = await Business.findById(id);
      if (!business) return res.status(404).json({ message: "Business not found" });

      if (business.userId.toString() !== userId)
        return res.status(403).json({ message: "Forbidden" });

      await Business.findByIdAndDelete(id);
      return res.status(200).json({ message: "Business deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Business API error:", err);
    return res.status(500).json({ message: "Server error", error: String(err) });
  }
}
