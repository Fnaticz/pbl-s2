import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Business from '../../../models/business';
import Voucher from '../../../models/voucher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Ambil semua bisnis
    const businesses = await Business.find().sort({ createdAt: -1 });

    // Ambil semua voucher dan kelompokkan per businessId
    const vouchers = await Voucher.find();
    const vouchersByBusiness: Record<string, any[]> = {};

    vouchers.forEach((v) => {
      const bid = v.businessId?.toString();
      if (!bid) return;
      if (!vouchersByBusiness[bid]) vouchersByBusiness[bid] = [];
      vouchersByBusiness[bid].push(v);
    });

    // Gabungkan
    const result = businesses.map((b) => ({
      ...b.toObject(),
      vouchers: vouchersByBusiness[b._id.toString()] || [],
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Public business API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
