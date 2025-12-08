import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Media from "../../../models/media";
import formidable, { File } from "formidable";
import fs from "fs";
import { uploadToCloudinary } from "../../../lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "100mb",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const form = formidable({ 
    multiples: false, 
    maxFileSize: 100 * 1024 * 1024, // 100MB
    keepExtensions: true 
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Upload error" });
    }

    try {
      //File handling
      let file: File | undefined;
      const uploaded = files.file;

      if (Array.isArray(uploaded)) {
        file = uploaded[0];
      } else {
        file = uploaded as File | undefined;
      }

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      //String handling (username & type)
      let username: string | undefined;
      let type: string | undefined;

      if (Array.isArray(fields.username)) {
        username = fields.username[0];
      } else {
        username = fields.username as string | undefined;
      }

      if (Array.isArray(fields.type)) {
        type = fields.type[0];
      } else {
        type = fields.type as string | undefined;
      }

      if (!username || !type) {
        return res.status(400).json({ message: "Missing username or type" });
      }

      // Validasi type
      if (type !== "image" && type !== "video") {
        return res.status(400).json({ message: "Invalid type. Must be 'image' or 'video'" });
      }

      // Baca file sebagai buffer
      let fileBuffer: Buffer;
      if (file.filepath) {
        fileBuffer = fs.readFileSync(file.filepath);
      } else {
        return res.status(400).json({ message: "File path not found" });
      }

      // Upload ke Cloudinary
      const cloudinaryResult = await uploadToCloudinary(
        fileBuffer,
        "gallery",
        type,
        `gallery_${Date.now()}_${username}`
      );

      // Simpan media ke DB dengan URL Cloudinary
      const newMedia = await Media.create({
        type,
        url: cloudinaryResult.secureUrl,
        username,
        cloudinaryPublicId: cloudinaryResult.publicId, // Simpan public ID untuk delete nanti
      });

      // Hapus file lokal setelah upload ke Cloudinary
      if (file.filepath && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }

      return res.status(201).json(newMedia);
    } catch (error: any) {
      console.error("Save media error:", error);
      return res.status(500).json({ 
        message: "Server error",
        error: error?.message || "Unknown error"
      });
    }
  });
}
