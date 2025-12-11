import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Media from '../../../models/media';
import formidable, { File } from "formidable";
import fs from "fs";
import { uploadToCloudinary } from '../../../lib/cloudinary';

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
    multiples: true, 
    maxFileSize: 100 * 1024 * 1024, // 100MB
    keepExtensions: true 
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Upload error" });
    }

    try {
      //File handling - support multiple files
      const uploaded = files.file;
      const fileArray: File[] = Array.isArray(uploaded) ? uploaded : (uploaded ? [uploaded] : []);

      if (fileArray.length === 0) {
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

      // Upload semua file
      const uploadPromises = fileArray.map(async (file) => {
        // Baca file sebagai buffer
        let fileBuffer: Buffer;
        if (file.filepath) {
          fileBuffer = fs.readFileSync(file.filepath);
        } else {
          throw new Error("File path not found");
        }

        // Upload ke Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
          fileBuffer,
          "gallery",
          type,
          `gallery_${Date.now()}_${username}_${Math.random().toString(36).substring(7)}`
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

        return newMedia;
      });

      const uploadedMedia = await Promise.all(uploadPromises);

      // Return array jika multiple, single object jika satu file (backward compatibility)
      return res.status(201).json(fileArray.length === 1 ? uploadedMedia[0] : uploadedMedia);
    } catch (error: any) {
      console.error("Save media error:", error);
      return res.status(500).json({ 
        message: "Server error",
        error: error?.message || "Unknown error"
      });
    }
  });
}
