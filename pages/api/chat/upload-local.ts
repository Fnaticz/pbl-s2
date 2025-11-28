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
        // Debug: Log struktur files
        console.log("Files received:", {
          hasFile: !!files.file,
          isArray: Array.isArray(files.file),
          fileKeys: Object.keys(files),
        });

        if (!files.file) {
          console.error("No files in request");
          return res.status(400).json({ 
            message: "No files uploaded",
            details: "Please select at least one file"
          });
        }

        const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file];
        const uploadResults: { url: string; type: "image" | "video" }[] = [];

        // Ekstensi yang diizinkan
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv', '.wmv'];

        for (const file of uploadedFiles) {
          if (!file) {
            console.warn("Skipping null/undefined file");
            continue;
          }

          console.log("Processing file:", {
            originalFilename: file.originalFilename,
            mimetype: file.mimetype,
            filepath: file.filepath,
            size: file.size,
          });

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
            console.warn(`Skipping invalid file type - mimetype: ${file.mimetype}, ext: ${ext}, filename: ${originalName}`);
            continue;
          }

          // Pastikan file path ada
          if (!file.filepath || !fs.existsSync(file.filepath)) {
            console.warn("File path not found or file doesn't exist:", {
              filepath: file.filepath,
              originalFilename: file.originalFilename,
            });
            continue;
          }

          // Generate unique filename
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const finalExt = ext || (fileType === "video" ? ".mp4" : ".jpg");
          const fileName = `${timestamp}-${randomStr}${finalExt}`;
          
          // Move file to final location
          const finalPath = path.join(uploadDir, fileName);
          
          try {
            fs.renameSync(file.filepath, finalPath);
            console.log(`File moved successfully: ${originalName} -> ${fileName}`);
          } catch (moveError: any) {
            console.error("Error moving file:", {
              from: file.filepath,
              to: finalPath,
              error: moveError?.message,
            });
            continue;
          }

          // Generate URL
          const url = `/uploads/chat-media/${fileName}`;
          uploadResults.push({ url, type: fileType });
          
          console.log(`Upload successful: ${url} (type: ${fileType})`);
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

