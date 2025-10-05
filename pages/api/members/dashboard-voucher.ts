import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Voucher from "../../../models/voucher";
import Business from "../../../models/business";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const { userId } = req.query;

  if (!userId || typeof userId !== "string")
    return res.status(400).json({ message: "Missing userId" });

  try {
    await connectDB();

    const userBusinesses = await Business.find({ userId });
    const vouchers = await Voucher.find({ businessId: { $in: userBusinesses.map((b) => b._id) } });

    return res.status(200).json({ vouchers });
  } catch (err) {
    console.error("Vouchers API Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
