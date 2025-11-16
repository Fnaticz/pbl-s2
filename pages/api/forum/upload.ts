import type { NextApiRequest, NextApiResponse } from "next";
import { storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import formidable, { File } from "formidable";
import fs from "fs";

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

  try {
    // Parse form dengan formidable
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      keepExtensions: true,
      multiples: true, // Support multiple files
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ message: "Upload error: " + err.message });
      }

      try {
        const uploadedFiles = files.file;
        const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles].filter(Boolean);

        if (fileArray.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadResults: { url: string; type: "image" | "video" }[] = [];

        // Upload setiap file ke Firebase Storage
        for (const file of fileArray) {
          if (!file) continue;

          const fileType = file.mimetype?.startsWith("video/") ? "video" : "image";
          const folder = fileType === "video" ? "videos" : "images";
          const fileName = `${Date.now()}-${file.originalFilename || "file"}`;
          const storagePath = `${folder}/${fileName}`;

          // Baca file dari sistem file
          const fileBuffer = fs.readFileSync(file.filepath);

          // Upload ke Firebase Storage
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, fileBuffer, {
            contentType: file.mimetype || undefined,
          });

          // Dapatkan download URL
          const downloadURL = await getDownloadURL(storageRef);

          uploadResults.push({
            url: downloadURL,
            type: fileType,
          });

          // Hapus file temporary
          fs.unlinkSync(file.filepath);
        }

        return res.status(200).json({ media: uploadResults });
      } catch (uploadError) {
        console.error("Upload to Firebase error:", uploadError);
        
        // Cleanup: hapus temporary files jika ada
        const uploadedFiles = files.file;
        const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles].filter(Boolean);
        fileArray.forEach((file) => {
          if (file && fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
          }
        });

        return res.status(500).json({ 
          message: "Failed to upload to Firebase Storage",
          error: uploadError instanceof Error ? uploadError.message : "Unknown error"
        });
      }
    });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ 
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

