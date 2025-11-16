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

  const streamPromises: Promise<void>[] = [];



  const form = new IncomingForm({

    maxFileSize: 100 * 1024 * 1024,

    keepExtensions: true,

    multiples: true,

    // Paksa in-memory handling (penting untuk Netlify)

    allowEmptyFiles: false,



    // FIX UTAMA: SELALU SIMPAN DENGAN KEY newFilename

    fileWriteStreamHandler: (file) => {

      if (!file) {

        throw new Error("File is undefined in fileWriteStreamHandler");

      }

      const chunks: Buffer[] = [];

      const filename = (file as any).newFilename || (file as any).originalFilename || `file-${Date.now()}`;



      // Buat promise untuk tracking stream selesai

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

            fileBuffers.set(filename, buffer); // ← FIX

            next();

            resolveStream(); // Resolve promise setelah buffer tersimpan

          } catch (error: any) {

            next(error);

            rejectStream(error);

          }

        }

      });



      writable.on('error', (err) => {

        rejectStream(err);

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

      // Tunggu semua stream selesai sebelum proses file

      if (streamPromises.length > 0) {

        await Promise.all(streamPromises);

        // Tunggu sedikit lagi untuk memastikan buffer sudah tersimpan

        await new Promise(resolve => setTimeout(resolve, 100));

      }



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

        console.log(`Available buffers:`, Array.from(fileBuffers.keys()));



        const fileType = file.mimetype?.startsWith("video/")

          ? "video"

          : "image";



        const folder = fileType === "video" ? "videos" : "images";

        const fileName = `${Date.now()}-${file.originalFilename}`;

        const storagePath = `${folder}/${fileName}`;



        let fileBuffer: Buffer | undefined;



        // FIX UTAMA: selalu ambil dari key newFilename

        const filename = (file as any).newFilename || file.originalFilename || 'file';

        console.log(`Looking for buffer with key: ${filename}`);

        

        if (fileBuffers.has(filename)) {

          fileBuffer = fileBuffers.get(filename);

          console.log("Using in-memory buffer:", filename, `size: ${fileBuffer?.length} bytes`);

        } else if (file.filepath) {

          // fallback jika Formidable menyimpan ke disk (untuk Netlify)

          try {

            if (fs.existsSync(file.filepath)) {

              fileBuffer = fs.readFileSync(file.filepath);

              console.log("Fallback: using filesystem buffer from:", file.filepath);

            } else {

              console.warn(`File path does not exist: ${file.filepath}`);

              // Coba tunggu lagi dan cek buffer sekali lagi

              await new Promise(resolve => setTimeout(resolve, 200));

              if (fileBuffers.has(filename)) {

                fileBuffer = fileBuffers.get(filename);

                console.log("Got buffer after wait:", filename);

              }

            }

          } catch (fsError: any) {

            console.error("Error reading from filesystem:", fsError?.message);

          }

        }



        if (!fileBuffer) {

          console.error("Buffer missing for file:", {

            originalFilename: file.originalFilename,

            newFilename: (file as any).newFilename,

            filepath: file.filepath,

            availableKeys: Array.from(fileBuffers.keys())

          });

          continue;

        }



        try {

          const storageRef = ref(storage, storagePath);



          console.log(`Uploading to Firebase: ${storagePath}, size: ${fileBuffer.length} bytes`);

          await uploadBytes(storageRef, fileBuffer, {

            contentType: file.mimetype || undefined,

          });



          const downloadURL = await getDownloadURL(storageRef);

          console.log(`Upload successful: ${downloadURL}`);



          uploadResults.push({

            url: downloadURL,

            type: fileType,

          });

        } catch (firebaseError: any) {

          console.error(`Firebase upload error for ${file.originalFilename}:`, firebaseError?.message);

          console.error(`Firebase error stack:`, firebaseError?.stack);

          // Continue dengan file berikutnya

        }

      }



      if (uploadResults.length === 0) {

        return res.status(500).json({ message: "Failed to upload files to Firebase Storage" });

      }



      return res.status(200).json({ media: uploadResults });



    } catch (uploadError: any) {

      console.error("Upload to Firebase error:", uploadError);

      console.error("Error stack:", uploadError?.stack);

      console.error("Error details:", {

        message: uploadError?.message,

        code: uploadError?.code,

        name: uploadError?.name

      });

      return res.status(500).json({

        message: "Failed to upload to Firebase Storage",

        error: uploadError?.message || "Unknown error",

      });

    }

  });

}

