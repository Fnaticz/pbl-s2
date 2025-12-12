import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Activity from '../../../models/activity';
import { uploadToCloudinary } from '../../../lib/cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectDB();
  } catch (err) {
    console.error("DB connect error:", err);
    return res.status(500).json({ message: "Database connection error" });
  }

  try {
    const { title, name, desc, images } = req.body;

    console.log("Activity upload request received:", {
      hasTitle: !!title,
      hasName: !!name,
      hasDesc: !!desc,
      imagesCount: images?.length || 0,
      imagesType: Array.isArray(images) ? "array" : typeof images
    });

    // Validasi input
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!desc || typeof desc !== "string" || desc.trim().length === 0) {
      return res.status(400).json({ message: "Description is required" });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Upload semua images ke Cloudinary
    const uploadedImageUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (typeof img !== "string") {
        return res.status(400).json({ message: `Image ${i + 1} is not a string` });
      }
      if (!img.startsWith("data:image")) {
        return res.status(400).json({ message: `Image ${i + 1} is invalid. Must be base64 image data (data:image/...).` });
      }
      
      try {
        // Parse base64
        const base64Data = img.split(",")[1];
        if (!base64Data) {
          return res.status(400).json({ message: `Image ${i + 1} has invalid base64 format` });
        }
        
        const buffer = Buffer.from(base64Data, "base64");
        
        // Validasi ukuran (max 10MB per image)
        if (buffer.length > 10_000_000) {
          return res.status(400).json({ message: `Image ${i + 1} is too large (max 10MB)` });
        }
        
        // Upload ke Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          buffer,
          "activities",
          "image",
          `activity_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`
        );
        
        uploadedImageUrls.push(cloudinaryResult.secureUrl);
      } catch (uploadErr: any) {
        console.error(`Failed to upload image ${i + 1}:`, uploadErr);
        return res.status(500).json({ 
          message: `Failed to upload image ${i + 1}`,
          error: process.env.NODE_ENV === "development" ? uploadErr?.message : undefined
        });
      }
    }

    const activityName = name || "activity";

    console.log("Creating activity with:", {
      title: title.trim(),
      name: activityName.trim(),
      descLength: desc.trim().length,
      imagesCount: uploadedImageUrls.length
    });

    const newActivity = await Activity.create({
      title: title.trim(),
      name: activityName.trim(),
      desc: desc.trim(),
      images: uploadedImageUrls,
      createdAt: new Date(),
    });

    console.log("Activity created successfully:", newActivity._id);

    res.status(201).json(newActivity);
  } catch (err: any) {
    console.error("Activity upload error details:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      code: err?.code
    });
    
    // Handle specific MongoDB errors
    if (err?.name === "ValidationError") {
      return res.status(400).json({ 
        message: "Validation error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
    
    const errorMessage = err?.message || "Server error";
    return res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined
    });
  }
}
