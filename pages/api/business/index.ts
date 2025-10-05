import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Business from "../../../models/business";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { method } = req;

  try {
    if (method === "GET") {
      const { userId, username } = req.query;

      // --- Validasi query ---
      if (!userId && !username) {
        return res.status(400).json({ message: "Missing userId or username" });
      }

      let businesses = [];

      // --- Ambil data dengan userId (preferensi baru) ---
      if (userId) {
        businesses = await Business.find({
          $or: [{ userId }, { userId: { $exists: false } }],
        }).sort({ createdAt: -1 });

        // --- Migrasi otomatis: tambahkan userId ke data lama yang belum punya ---
        const legacyBusinesses = await Business.find({
          userId: { $exists: false },
          username: { $exists: true },
        });

        for (const biz of legacyBusinesses) {
          // Hanya migrasikan jika username cocok dengan userId pemilik saat ini
          if (username && biz.username === username) {
            biz.userId = userId as string;
            await biz.save();
          }
        }
      }

      // --- Fallback jika userId tidak ada ---
      else if (username) {
        businesses = await Business.find({
          $or: [{ username }, { userId: { $exists: false } }],
        }).sort({ createdAt: -1 });
      }

      return res.status(200).json(businesses);
    }

    // --- POST: Tambah bisnis baru ---
    if (method === "POST") {
      const business = new Business(req.body);
      await business.save();
      return res.status(201).json({ message: "Business created", business });
    }

    // --- PUT: Update bisnis ---
    if (method === "PUT") {
      const { _id } = req.body;
      if (!_id) {
        return res.status(400).json({ message: "Business ID required" });
      }
      const updated = await Business.findByIdAndUpdate(_id, req.body, { new: true });
      return res.status(200).json({ message: "Business updated", business: updated });
    }

    // --- DELETE: Hapus bisnis ---
    if (method === "DELETE") {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Business ID required" });
      }
      await Business.findByIdAndDelete(id);
      return res.status(200).json({ message: "Business deleted" });
    }

    // --- Method tidak diizinkan ---
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err: any) {
    console.error("Business API error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
