// pages/api/business/upload-images.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "30mb", // 🔧 Tingkatkan jika gambar besar
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id)
      return res.status(401).json({ message: "Login required" });

    const { images } = req.body;
    if (!Array.isArray(images) || images.length === 0)
      return res.status(400).json({ message: "No images provided" });

    const urls: string[] = [];

    for (const img of images) {
      const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) continue;
      const mime = match[1];
      const base64 = match[2];
      const buffer = Buffer.from(base64, "base64");

      // batasan ukuran 5MB agar aman ditaruh sebagai data URL
      if (buffer.length > 5_000_000) {
        return res.status(400).json({ message: "Image too large (>5MB)" });
      }

      // simpan langsung data URL supaya bisa diakses di deploy tanpa storage lokal
      urls.push(`data:${mime};base64:${base64}`);
    }

    return res.status(200).json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
}
