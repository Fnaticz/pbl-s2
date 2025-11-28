import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "100mb",
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Buat folder chat-media jika belum ada
  const uploadDir = path.join(process.cwd(), "public", "uploads", "chat-media");
  fs.mkdirSync(uploadDir, { recursive: true });

  // Ekstensi yang diizinkan
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v'];

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ 
        message: "Upload error", 
        error: err.message 
      });
    }

    try {
      if (!files.file) {
        console.error("No files in request. Files object keys:", Object.keys(files));
        return res.status(400).json({ 
          message: "No files uploaded",
          details: "Please select at least one file"
        });
      }

      const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
      const uploadResults: { url: string; type: "image" | "video" }[] = [];

      for (const file of uploadedFiles) {
        if (!file || !file.filepath) {
          console.warn("Skipping invalid file:", file);
          continue;
        }

        // Validasi tipe file - gunakan mimetype atau fallback ke ekstensi
        const originalName = file.originalFilename || "file";
        const ext = path.extname(originalName).toLowerCase();
        
        let fileType: "image" | "video" | null = null;
        
        // Cek berdasarkan mimetype terlebih dahulu
        if (file.mimetype) {
          if (file.mimetype.startsWith("image/")) {
            fileType = "image";
          } else if (file.mimetype.startsWith("video/")) {
            fileType = "video";
          }
        }
        
        // Fallback: cek berdasarkan ekstensi jika mimetype tidak tersedia atau tidak valid
        if (!fileType && ext) {
          if (imageExts.includes(ext)) {
            fileType = "image";
          } else if (videoExts.includes(ext)) {
            fileType = "video";
          }
        }

        if (!fileType) {
          console.warn(`Skipping invalid file type - mimetype: ${file.mimetype || 'undefined'}, ext: ${ext || 'undefined'}, filename: ${originalName}`);
          continue;
        }

        // Gunakan basename dari filepath (formidable sudah simpan di uploadDir dengan keepExtensions)
        const fileName = path.basename(file.filepath);

        // Generate URL
        const url = `/uploads/chat-media/${fileName}`;
        uploadResults.push({ url, type: fileType });
      }

      if (uploadResults.length === 0) {
        return res.status(400).json({ 
          message: "No valid files were uploaded",
          details: "Please ensure files are images or videos"
        });
      }

      return res.status(200).json({ 
        media: uploadResults,
        message: `Successfully uploaded ${uploadResults.length} file(s)`
      });
    } catch (uploadError: any) {
      console.error("Upload handler error:", uploadError);
      return res.status(500).json({
        message: "Failed to process upload",
        error: uploadError?.message || "Unknown error",
      });
    }
  });
}

