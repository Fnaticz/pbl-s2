// pages/api/activity/upload.ts
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { connectDB } from '../../../lib/mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import Activity from '../../../models/activity';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, name, desc, file } = req.body;
  if (!title || !name || !desc || !file) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await connectDB();
    const ext = name.split('.').pop();
    const allowedTypes = ['png', 'jpg', 'jpeg', 'webp'];
    if (!ext || !allowedTypes.includes(ext.toLowerCase())) {
      return res.status(400).json({ message: 'File type not allowed' });
    }
    
    const fileName = `${Date.now()}.${ext}`;
    const filePath = join(process.cwd(), 'public/uploads', fileName);
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    await writeFile(filePath, buffer);
    const imageUrl = `/uploads/${fileName}`;
    const newActivity = await Activity.create({
      title,
      name,
      desc,
      imageUrl,
      createdAt: new Date()
    });

    res.status(201).json(newActivity);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
