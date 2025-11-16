import type { NextApiRequest, NextApiResponse } from "next";

import { storage } from "../../../lib/firebase";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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



  // Buffer tempat menyimpan file in-memory (scoped per request)

  const fileBuffers: Map<string, Buffer> = new Map();



  const form = new IncomingForm({

    maxFileSize: 100 * 1024 * 1024,

    keepExtensions: true,

    multiples: true,



    // FIX UTAMA: SELALU SIMPAN DENGAN KEY newFilename

    fileWriteStreamHandler: (file) => {

      if (!file) {

        throw new Error("File is undefined in fileWriteStreamHandler");

      }

      const chunks: Buffer[] = [];

      const filename = (file as any).newFilename || (file as any).originalFilename || `file-${Date.now()}`;



      const writable = new Writable({

        write(chunk, enc, next) {

          chunks.push(chunk);

          next();

        },

        final(next) {

          const buffer = Buffer.concat(chunks);

          fileBuffers.set(filename, buffer); // ← FIX

          next();

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



      const fileArray = Array.isArray(uploadedFiles)

        ? uploadedFiles

        : [uploadedFiles];



      const uploadResults: { url: string; type: "image" | "video" }[] = [];



      for (const file of fileArray) {

        if (!file) continue;



        console.log(`Processing file: ${file.originalFilename}`);



        const fileType = file.mimetype?.startsWith("video/")

          ? "video"

          : "image";



        const folder = fileType === "video" ? "videos" : "images";

        const fileName = `${Date.now()}-${file.originalFilename}`;

        const storagePath = `${folder}/${fileName}`;



        let fileBuffer: Buffer | undefined;



        // FIX UTAMA: selalu ambil dari key newFilename

        const filename = (file as any).newFilename || file.originalFilename || 'file';

        if (fileBuffers.has(filename)) {

          fileBuffer = fileBuffers.get(filename);

          console.log("Using in-memory buffer:", filename);

        } else if (file.filepath && fs.existsSync(file.filepath)) {

          // fallback jika Formidable menyimpan ke disk (jarang)

          fileBuffer = fs.readFileSync(file.filepath);

          console.log("Fallback: using filesystem buffer.");

        }



        if (!fileBuffer) {

          console.error("Buffer missing for:", file);

          continue;

        }



        const storageRef = ref(storage, storagePath);



        await uploadBytes(storageRef, fileBuffer, {

          contentType: file.mimetype || undefined,

        });



        const downloadURL = await getDownloadURL(storageRef);



        uploadResults.push({

          url: downloadURL,

          type: fileType,

        });

      }



      if (uploadResults.length === 0) {

        return res.status(500).json({ message: "Failed to upload files to Firebase Storage" });

      }



      return res.status(200).json({ media: uploadResults });



    } catch (uploadError: any) {

      console.error("Upload to Firebase error:", uploadError);

      return res.status(500).json({

        message: "Failed to upload to Firebase Storage",

        error: uploadError?.message,

      });

    }

  });

}

