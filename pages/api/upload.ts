// src/pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const uploadDir = path.join(process.cwd(), '/public/uploads')
  fs.mkdirSync(uploadDir, { recursive: true })

  const form = new IncomingForm({ uploadDir, keepExtensions: true, multiples: true })

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message })

    const uploadedFiles = Array.isArray(files.file) ? files.file : [files.file]
    const urls = uploadedFiles
      .filter((file): file is NonNullable<typeof file> => file != null)
      .map((file) => ({
        url: `/uploads/${path.basename(file.filepath)}`,
        type: file.mimetype?.startsWith('video') ? 'video' : 'image',
      }))
    return res.status(200).json({ urls })
  })
}
