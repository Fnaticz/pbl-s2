import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import VoucherRedemption from "../../../models/voucher-redemption";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  const { userId } = req.query;
  if (!userId || typeof userId !== "string")
    return res.status(400).json({ message: "Missing userId" });

  try {
    await connectDB();
    const last = await VoucherRedemption.findOne({ userId }).sort({ redeemedAt: -1 });
    if (!last) return res.status(200).json({ lastRedeemAt: null });
    return res.status(200).json({ lastRedeemAt: last.redeemedAt });
  } catch (err) {
    console.error("Last redeem API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
