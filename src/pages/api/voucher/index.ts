import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Voucher from '../../../models/voucher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { method } = req;

  try {
    if (method === "GET") {
      const { businessId } = req.query;
      const vouchers = await Voucher.find(businessId ? { businessId, stock: {$gt: 0}, expiryDate: { $gte: new Date() } } : {});
      return res.status(200).json(vouchers);
    }

    if (method === "POST") {
      const voucher = new Voucher(req.body);
      await voucher.save();
      return res.status(201).json({ message: "Voucher created", voucher });
    }

    if (method === "PUT") {
      const { _id } = req.body;
      if (!_id) return res.status(400).json({ message: "Voucher ID required" });

      const updated = await Voucher.findByIdAndUpdate(_id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: "Voucher not found" });

      return res.status(200).json({ message: "Voucher updated", voucher: updated });
    }

    if (method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "Voucher ID required" });

      const deleted = await Voucher.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ message: "Voucher not found" });

      return res.status(200).json({ message: "Voucher deleted" });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error("Voucher API error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
