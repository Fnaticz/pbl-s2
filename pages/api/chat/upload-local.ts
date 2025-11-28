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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Buat folder chat-media jika belum ada
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat-media");
    fs.mkdirSync(uploadDir, { recursive: true });

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
        const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
        const uploadResults: { url: string; type: "image" | "video" }[] = [];

        for (const file of uploadedFiles) {
          if (!file) continue;

          // Validasi tipe file
          const fileType = file.mimetype?.startsWith("video/") ? "video" : "image";
          if (!file.mimetype?.startsWith("image/") && !file.mimetype?.startsWith("video/")) {
            console.warn(`Skipping invalid file type: ${file.mimetype}`);
            continue;
          }

          // Generate unique filename
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const originalName = file.originalFilename || "file";
          const ext = path.extname(originalName) || (fileType === "video" ? ".mp4" : ".jpg");
          const fileName = `${timestamp}-${randomStr}${ext}`;
          
          // Move file to final location
          const finalPath = path.join(uploadDir, fileName);
          
          // Jika file sudah di temp directory, pindahkan
          if (file.filepath && fs.existsSync(file.filepath)) {
            fs.renameSync(file.filepath, finalPath);
          } else {
            // Jika file belum ada, skip
            console.warn("File path not found:", file.originalFilename);
            continue;
          }

          // Generate URL
          const url = `/uploads/chat-media/${fileName}`;
          uploadResults.push({ url, type: fileType });
          
          console.log(`Upload successful: ${url}`);
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
        console.error("Upload handler error:", {
          message: uploadError?.message,
          stack: uploadError?.stack,
        });
        return res.status(500).json({
          message: "Failed to process upload",
          error: uploadError?.message || "Unknown error",
        });
      }
    });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error?.message || "Unknown error",
    });
  }
}

