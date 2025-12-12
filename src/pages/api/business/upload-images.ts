// pages/api/business/upload-images.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { uploadToCloudinary } from '../../../lib/cloudinary';

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
    const errors: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      
      if (typeof img !== "string") {
        errors.push(`Image ${i + 1} is not a valid string`);
        continue;
      }

      const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) {
        errors.push(`Image ${i + 1} is not a valid base64 image`);
        continue;
      }

      const base64 = match[2];
      
      try {
        const buffer = Buffer.from(base64, "base64");

        // batasan ukuran 10MB
        if (buffer.length > 10_000_000) {
          errors.push(`Image ${i + 1} is too large (>10MB)`);
          continue;
        }

        // Upload ke Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          buffer,
          "business",
          "image",
          `business_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`
        );
        
        urls.push(cloudinaryResult.secureUrl);
      } catch (err) {
        errors.push(`Image ${i + 1} failed to upload: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    if (urls.length === 0) {
      return res.status(400).json({ 
        message: "No valid images processed", 
        errors: errors.length > 0 ? errors : undefined 
      });
    }

    if (errors.length > 0) {
      // Return success but with warnings
      return res.status(200).json({ 
        urls, 
        warnings: errors 
      });
    }

    return res.status(200).json({ urls });
  } catch (err: any) {
    console.error("Upload error:", err);
    const errorMessage = err?.message || "Upload failed";
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined
    });
  }
}
