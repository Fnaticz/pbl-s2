// pages/api/banner/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { connectDB } from '../../../lib/mongodb';
import Banner from '../../../models/banner';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, file } = req.body;

  if (!name || !file) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await connectDB();

    const buffer = Buffer.from(file.split(',')[1], 'base64');
    const filePath = join(process.cwd(), 'public/uploads', name);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${name}`;
    const newBanner = await Banner.create({
      name,
      imageUrl,
      uploadedAt: new Date(),
    });

    res.status(201).json(newBanner);
  } catch (err) {
    console.error('Banner upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
