import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectDB } from "../../../lib/mongodb";
import VoucherRedemption from "../../../models/voucher-redemption";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    await connectDB();
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) return res.status(401).json({ message: "Login required" });

    const userId = session.user.id;

    const last = await VoucherRedemption.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
      
    res.status(200).json({ last });
  } catch (err) {
    console.error("Last redeem API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
