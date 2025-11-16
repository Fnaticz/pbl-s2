import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminStorage } from "../../../lib/firebaseAdmin";
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

  // Initialize adminStorage dengan error handling
  let adminStorage;
  try {
    adminStorage = getAdminStorage();
  } catch (initError: any) {
    console.error("Firebase Admin initialization error:", initError?.message);
    return res.status(500).json({ 
      message: "Server configuration error",
      error: initError?.message || "Firebase Admin Storage not available" 
    });
  }

  const fileBuffers: Map<string, Buffer> = new Map();
  const streamPromises: Promise<void>[] = [];

  const form = new IncomingForm({
    maxFileSize: 100 * 1024 * 1024,
    keepExtensions: true,
    multiples: true,
    allowEmptyFiles: false,

    fileWriteStreamHandler: (file) => {
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
            fileBuffers.set(filename, buffer);
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

        const fileType = file.mimetype?.startsWith("video/") ? "video" : "image";
        const folder = fileType === "video" ? "videos" : "images";
        const fileName = `${Date.now()}-${file.originalFilename}`;
        const storagePath = `${folder}/${fileName}`;

        const filename = (file as any).newFilename || file.originalFilename;
        let fileBuffer: Buffer | undefined;

        if (fileBuffers.has(filename)) {
          fileBuffer = fileBuffers.get(filename);
        } else if ([...fileBuffers.keys()].length === 1) {
          fileBuffer = [...fileBuffers.values()][0];
        } else if (file.filepath && fs.existsSync(file.filepath)) {
          fileBuffer = fs.readFileSync(file.filepath);
        }

        if (!fileBuffer) {
          console.error("Buffer missing for file:", file.originalFilename);
          continue;
        }

        try {
          const fileUpload = adminStorage.file(storagePath);
          
          await fileUpload.save(fileBuffer, {
            metadata: { contentType: file.mimetype || undefined },
          });

          const [downloadURL] = await fileUpload.getSignedUrl({
            action: "read",
            expires: new Date("2030-03-01"),
          });

          uploadResults.push({ url: downloadURL, type: fileType });
          console.log("Upload successful:", downloadURL);

        } catch (firebaseError: any) {
          console.error("Firebase upload error:", {
            message: firebaseError?.message,
            code: firebaseError?.code,
            stack: firebaseError?.stack,
            file: file.originalFilename
          });
        }
      }

      if (uploadResults.length === 0) {
        return res.status(500).json({ message: "Failed to upload files to Firebase Storage" });
      }

      return res.status(200).json({ media: uploadResults });
    } catch (uploadError: any) {
      console.error("Upload handler error:", {
        message: uploadError?.message,
        stack: uploadError?.stack,
        name: uploadError?.name
      });
      return res.status(500).json({
        message: "Failed to upload to Firebase Storage",
        error: uploadError?.message || "Unknown error",
      });
    }
  });
}
