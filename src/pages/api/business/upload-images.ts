// pages/api/business/upload-images.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
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

    const userId = session.user.id;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "business", userId);
    fs.mkdirSync(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const img of images) {
      const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) continue;
      const ext = match[1].split("/")[1];
      const base64 = match[2];
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
      urls.push(`/uploads/business/${userId}/${fileName}`);
    }

    return res.status(200).json({ urls });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
}
