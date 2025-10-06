import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../../lib/mongodb";
import Media from "../../../models/media";
import formidable, { File } from "formidable";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // penting! biar formidable yang handle
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const form = formidable({ multiples: false, uploadDir: path.join(process.cwd(), "/public/uploads"), keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Upload error" });
    }

    try {
      // ✅ File handling
      let file: File | undefined;
      const uploaded = files.file;

      if (Array.isArray(uploaded)) {
        file = uploaded[0];
      } else {
        file = uploaded as File | undefined;
      }

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // ✅ String handling (username & type)
      let username: string | undefined;
      let type: string | undefined;

      if (Array.isArray(fields.username)) {
        username = fields.username[0];
      } else {
        username = fields.username as string | undefined;
      }

      if (Array.isArray(fields.type)) {
        type = fields.type[0];
      } else {
        type = fields.type as string | undefined;
      }

      if (!username || !type) {
        return res.status(400).json({ message: "Missing username or type" });
      }

      // ✅ Simpan media ke DB
      const relativePath = "/uploads/" + file.newFilename;

      const newMedia = await Media.create({
        type,
        url: relativePath,
        username,
      });

      return res.status(201).json(newMedia);
    } catch (error) {
      console.error("Save media error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });


}
