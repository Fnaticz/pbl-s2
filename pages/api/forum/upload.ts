import type { NextApiRequest, NextApiResponse } from "next";
import { storage } from "../../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { IncomingForm, File } from "formidable";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false, // Biarkan formidable yang handle
    sizeLimit: "100mb", // Untuk video besar
  },
};

// Helper function untuk convert stream ke buffer
const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Simpan file buffers di memory
  const fileBuffers: Map<string, Buffer> = new Map();

  // Parse form dengan formidable - gunakan fileWriteStreamHandler untuk in-memory
  const form = new IncomingForm({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    keepExtensions: true,
    multiples: true, // Support multiple files
    fileWriteStreamHandler: (file?: any) => {
      const chunks: Buffer[] = [];
      const filename = (file as any)?.newFilename || (file as any)?.originalFilename || `file-${Date.now()}`;
      const writable = new (require('stream').Writable)({
        write(chunk: Buffer, encoding: string, callback: Function) {
          chunks.push(chunk);
          callback();
        },
        final(callback: Function) {
          const buffer = Buffer.concat(chunks);
          fileBuffers.set(filename, buffer);
          callback();
        }
      });
      return writable;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Upload error: " + err.message });
    }

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
          console.log(`Processing file: ${file.originalFilename}, size: ${file.size}, type: ${file.mimetype}`);

          const fileType = file.mimetype?.startsWith("video/") ? "video" : "image";
          const folder = fileType === "video" ? "videos" : "images";
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalFilename || "file"}`;
          const storagePath = `${folder}/${fileName}`;

          let fileBuffer: Buffer | undefined;

          // Tunggu sedikit untuk memastikan fileWriteStreamHandler selesai
          await new Promise(resolve => setTimeout(resolve, 100));

          // Cek apakah buffer sudah tersedia di memory (dari fileWriteStreamHandler)
          const filename = file.newFilename || file.originalFilename || 'file';
          if (fileBuffers.has(filename)) {
            fileBuffer = fileBuffers.get(filename);
            console.log(`Using in-memory buffer for ${file.originalFilename}`);
          } else if (file.filepath) {
            // Fallback ke filesystem jika diperlukan (untuk Netlify compatibility)
            const fs = require('fs');
            try {
              if (fs.existsSync(file.filepath)) {
                fileBuffer = fs.readFileSync(file.filepath);
                console.log(`Using filesystem buffer for ${file.originalFilename}`);
              } else {
                console.error(`File path does not exist: ${file.filepath}`);
                // Coba tunggu lagi untuk fileWriteStreamHandler
                await new Promise(resolve => setTimeout(resolve, 500));
                if (fileBuffers.has(filename)) {
                  fileBuffer = fileBuffers.get(filename);
                  console.log(`Got in-memory buffer after wait for ${file.originalFilename}`);
                }
              }
            } catch (e) {
              console.error(`Error reading file from filesystem:`, e);
            }
          }

          if (!fileBuffer) {
            console.error(`Cannot get buffer for file: ${file.originalFilename}, available buffers:`, Array.from(fileBuffers.keys()));
            continue;
          }

          console.log(`File buffer size: ${fileBuffer.length} bytes`);
          console.log(`Uploading to Firebase Storage: ${storagePath}`);

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
        } catch (fileError: any) {
          console.error(`Error processing file ${file.originalFilename}:`, fileError);
          console.error(`Error stack:`, fileError?.stack);
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
    } catch (uploadError: any) {
      console.error("Upload to Firebase error:", uploadError);
      console.error("Error stack:", uploadError?.stack);
      
      return res.status(500).json({ 
        message: "Failed to upload to Firebase Storage",
        error: uploadError instanceof Error ? uploadError.message : "Unknown error"
      });
    }
  });
}

