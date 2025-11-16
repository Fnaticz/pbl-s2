import type { NextApiRequest, NextApiResponse } from "next";
import { storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: false, // Biarkan formidable yang handle
    sizeLimit: "100mb", // Untuk video besar
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Buat directory untuk temporary files menggunakan os.tmpdir() yang lebih kompatibel
  const uploadDir = path.join(os.tmpdir(), "forum-uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Parse form dengan formidable
  const form = formidable({
    uploadDir: uploadDir,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    keepExtensions: true,
    multiples: true, // Support multiple files
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      console.error("Error details:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      return res.status(500).json({ message: "Upload error: " + err.message });
    }

    console.log("Files received:", Object.keys(files));

    try {
      const uploadedFiles = files.file;
      if (!uploadedFiles) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles].filter(Boolean);

      if (fileArray.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadResults: { url: string; type: "image" | "video" }[] = [];

      // Upload setiap file ke Firebase Storage
      for (const file of fileArray) {
        if (!file) continue;

        try {
          // Pastikan file ada
          if (!fs.existsSync(file.filepath)) {
            console.error(`File not found: ${file.filepath}`);
            continue;
          }

          console.log(`Processing file: ${file.originalFilename}, size: ${file.size}, type: ${file.mimetype}`);

          const fileType = file.mimetype?.startsWith("video/") ? "video" : "image";
          const folder = fileType === "video" ? "videos" : "images";
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalFilename || "file"}`;
          const storagePath = `${folder}/${fileName}`;

          console.log(`Uploading to Firebase Storage: ${storagePath}`);

          // Baca file dari sistem file
          const fileBuffer = fs.readFileSync(file.filepath);
          console.log(`File buffer size: ${fileBuffer.length} bytes`);

          // Upload ke Firebase Storage
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, fileBuffer, {
            contentType: file.mimetype || undefined,
          });

          console.log(`Upload successful, getting download URL...`);

          // Dapatkan download URL
          const downloadURL = await getDownloadURL(storageRef);
          console.log(`Download URL obtained: ${downloadURL}`);

          // Pastikan tidak ada undefined
          if (downloadURL && fileType) {
            uploadResults.push({
              url: String(downloadURL),
              type: fileType,
            });
          }

          // Hapus file temporary
          try {
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
            }
          } catch (unlinkError) {
            console.error("Error deleting temp file:", unlinkError);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.originalFilename}:`, fileError);
          // Cleanup file ini
          try {
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
            }
          } catch (unlinkError) {
            // Ignore
          }
          // Continue dengan file berikutnya
        }
      }

      // Filter hasil untuk memastikan tidak ada undefined
      const cleanResults = uploadResults.filter(item => item && item.url && item.type);
      
      if (cleanResults.length === 0) {
        return res.status(500).json({ 
          message: "Failed to upload files to Firebase Storage",
        });
      }

      return res.status(200).json({ media: cleanResults });
    } catch (uploadError) {
      console.error("Upload to Firebase error:", uploadError);
      
      // Cleanup: hapus temporary files jika ada
      try {
        const uploadedFiles = files.file;
        if (uploadedFiles) {
          const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles].filter(Boolean);
          fileArray.forEach((file) => {
            if (file && fs.existsSync(file.filepath)) {
              try {
                fs.unlinkSync(file.filepath);
              } catch (e) {
                // Ignore
              }
            }
          });
        }
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }

      return res.status(500).json({ 
        message: "Failed to upload to Firebase Storage",
        error: uploadError instanceof Error ? uploadError.message : "Unknown error"
      });
    }
  });
}

