import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Business from "../../../models/business";
import Voucher from "../../../models/voucher";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Business ID is required" });
      }

      // 🔹 Ambil data bisnis
      const business = await Business.findById(id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      // 🔹 Ambil semua voucher aktif milik bisnis ini
      const vouchers = await Voucher.find({ businessId: id }).sort({ createdAt: -1 });

      // 🔹 Gabungkan dalam satu response
      return res.status(200).json({
        ...business.toObject(),
        vouchers,
      });
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("Fetch business detail error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
