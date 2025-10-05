import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import VoucherRedemption from "../../../models/voucher-redemption";
import Voucher from "../../../models/voucher";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    await connectDB();

    const redemptions = await VoucherRedemption.find({ userId })
      .populate({
        path: "voucherId",
        model: "Voucher",
        select: "title expiryDate",
      })
      .populate({
        path: "businessId",
        model: "Business",
        select: "name",
      })
      .sort({ redeemedAt: -1 });

    const now = new Date();

    const updatedRedemptions = await Promise.all(
      redemptions.map(async (r) => {
        let status = r.status;
        let expiryDate: Date | null = null;
        let voucherTitle = "Unknown";
        let businessName = "Unknown";

        const voucher = r.voucherId ? await Voucher.findById(r.voucherId) : null;

        if (!voucher) {
          // voucher sudah dihapus → set status deleted
          if (r.status !== "deleted") {
            r.status = "deleted";
            await r.save();
          }
          status = "deleted";
        } else {
          voucherTitle = voucher.title;
          expiryDate = voucher.expiryDate ? new Date(voucher.expiryDate) : null;
          businessName = r.businessId?.name || "Unknown";

          // jika expiry date sudah lewat → expired
          if (expiryDate && expiryDate < now && r.status !== "expired") {
            r.status = "expired";
            await r.save();
            status = "expired";
          }
        }

        return {
          id: r._id,
          voucherTitle,
          businessName,
          pointsUsed: r.pointsUsed,
          redeemedAt: r.redeemedAt,
          expiryDate: expiryDate ? expiryDate.toISOString() : null,
          status,
        };
      })
    );

    return res.status(200).json({ redemptions: updatedRedemptions });
  } catch (err) {
    console.error("Voucher redemption fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
