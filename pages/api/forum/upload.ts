import type { NextApiRequest, NextApiResponse } from "next";
import { adminStorage } from "../../../lib/firebaseAdmin";
import { IncomingForm } from "formidable";
import { Writable } from "stream";
import fs from "fs";

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

  const fileBuffers: Map<string, Buffer> = new Map();
  const streamPromises: Promise<void>[] = [];

  const form = new IncomingForm({
    maxFileSize: 100 * 1024 * 1024,
    keepExtensions: true,
    multiples: true,
    allowEmptyFiles: false,

    fileWriteStreamHandler: (file) => {
      if (!file) throw new Error("File undefined");

      const chunks: Buffer[] = [];
      const filename = (file as any).newFilename; 

      let resolveStream: () => void;
      let rejectStream: (err: Error) => void;

      const streamPromise = new Promise<void>((resolve, reject) => {
        resolveStream = resolve;
        rejectStream = reject;
      });

      streamPromises.push(streamPromise);

      const writable = new Writable({
        write(chunk, enc, next) {
          chunks.push(chunk);
          next();
        },
        final(next) {
          try {
            const buffer = Buffer.concat(chunks);
            fileBuffers.set(filename, buffer); // ← FIX FINAL (KUNCI)
            next();
            resolveStream();
          } catch (error: any) {
            next(error);
            rejectStream(error);
          }
        }
      });

      writable.on("error", (err) => rejectStream(err));
      return writable;
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Upload error: " + err.message });
    }

    try {
      if (streamPromises.length > 0) {
        await Promise.all(streamPromises);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const uploadedFiles = files.file;
      if (!uploadedFiles) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
      const uploadResults: { url: string; type: "image" | "video" }[] = [];

      for (const file of fileArray) {
        if (!file) continue;

        console.log("Processing:", file.originalFilename);
        console.log("Available buffer keys:", Array.from(fileBuffers.keys()));

        const fileType = file.mimetype?.startsWith("video/") ? "video" : "image";
        const folder = fileType === "video" ? "videos" : "images";
        const fileName = `${Date.now()}-${file.originalFilename}`;
        const storagePath = `${folder}/${fileName}`;

        // FIX UTAMA —> KEY BUFFER SELALU newFilename
        const filename = (file as any).newFilename;
        let fileBuffer: Buffer | undefined;

        console.log("Looking for buffer with key:", filename);

        if (fileBuffers.has(filename)) {
          fileBuffer = fileBuffers.get(filename);
          console.log("✔ Using in-memory buffer", filename, fileBuffer?.length);
        } else if (file.filepath && fs.existsSync(file.filepath)) {
          fileBuffer = fs.readFileSync(file.filepath);
          console.log("✔ Using filesystem file");
        }

        if (!fileBuffer) {
          console.error("❌ Buffer missing:", {
            original: file.originalFilename,
            newFilename: filename,
            filepath: file.filepath,
            keys: Array.from(fileBuffers.keys()),
          });
          continue;
        }

        try {
          const fileUpload = adminStorage.file(storagePath);
          
          await fileUpload.save(fileBuffer, {
            metadata: { contentType: file.mimetype || undefined },
          });

          const [downloadURL] = await fileUpload.getSignedUrl({
            action: "read",
            expires: "03-01-2030",
          });

          uploadResults.push({ url: downloadURL, type: fileType });
          console.log("✔ Uploaded:", downloadURL);

        } catch (firebaseError: any) {
          console.error("Firebase upload failed:", firebaseError?.message);
        }
      }

      if (uploadResults.length === 0) {
        return res.status(500).json({ message: "Failed to upload files to Firebase Storage" });
      }

      return res.status(200).json({ media: uploadResults });
    } catch (uploadError: any) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({
        message: "Failed to upload to Firebase Storage",
        error: uploadError?.message,
      });
    }
  });
}
