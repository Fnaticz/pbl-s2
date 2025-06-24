import type { NextApiRequest, NextApiResponse } from 'next';
import { writeFile } from 'fs/promises';
import { join } from 'path';
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
    const fileName = `${Date.now()}-${name}`;
    const filePath = join(process.cwd(), 'public/uploads', fileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${fileName}`;

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
