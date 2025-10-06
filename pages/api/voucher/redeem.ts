import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Voucher from "../../../models/voucher";
import Point from "../../../models/point";
import VoucherRedemption from "../../../models/voucher-redemption";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { userId, voucherId } = req.body;
  if (!userId || !voucherId) return res.status(400).json({ message: "Missing userId or voucherId" });

  try {
    await connectDB();

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) return res.status(404).json({ message: "Voucher not found" });
    if (voucher.stock <= 0) return res.status(400).json({ message: "Voucher out of stock" });

    const userPoints = await Point.findOne({ userId });
    if (!userPoints || userPoints.points < voucher.pointsRequired) {
      return res.status(400).json({ message: "Not enough points" });
    }

    // --- update poin dan stok (simple, tanpa transaction untuk kompatibilitas) ---
    userPoints.points -= voucher.pointsRequired;
    await userPoints.save();

    voucher.stock -= 1;
    await voucher.save();

    // simpan redemption
    const redemption = await VoucherRedemption.create({
      userId,
      voucherId,
      businessId: voucher.businessId,
      pointsUsed: voucher.pointsRequired,
      redeemedAt: new Date(),
      status: "active",
    });

    // populate agar langsung balikkan title & business name
    const populated = await VoucherRedemption.findById(redemption._id)
      .populate({ path: "voucherId", select: "title" })
      .populate({ path: "businessId", select: "name" });

    return res.status(200).json({
      message: "Voucher redeemed successfully",
      redemption: {
        id: populated._id,
        voucherTitle: populated.voucherId?.title || "",
        businessName: populated.businessId?.name || "",
        pointsUsed: populated.pointsUsed,
        redeemedAt: populated.redeemedAt,
        status: populated.status,
      },
    });
  } catch (err) {
    console.error("Redeem API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
