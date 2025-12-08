// pages/api/db-check.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uri = process.env.MONGO_URI!;
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    res.status(200).json({ status: "connected" });
  } catch (err) {
    res.status(500).json({ status: "failed", error: (err as Error).message });
  }
}
