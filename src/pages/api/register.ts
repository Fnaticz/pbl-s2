// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import User from '../../models/user';
import bcrypt from 'bcryptjs';

type Data = {
  message: string;
  success?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password, role, emailOrPhone, address } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await connectDB();

    // Check if username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(409).json({ 
        message: 'Username sudah terdaftar. Silakan gunakan username lain.',
        success: false 
      });
    }

    // Check if email/phone already exists
    if (emailOrPhone) {
      const existingUserByEmail = await User.findOne({ emailOrPhone });
      if (existingUserByEmail) {
        return res.status(409).json({ 
          message: 'Email atau nomor telepon sudah terdaftar. Silakan gunakan email/nomor lain.',
          success: false 
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
      role,
      emailOrPhone,
      address
    });

    return res.status(201).json({ 
      message: 'Registrasi berhasil! Silakan login.',
      success: true 
    });
  } catch (error) {
    console.error('Register error:', (error as Error).message);
    
    // Check for duplicate key error (MongoDB)
    if ((error as any).code === 11000) {
      const field = Object.keys((error as any).keyPattern)[0];
      if (field === 'username') {
        return res.status(409).json({ 
          message: 'Username sudah terdaftar. Silakan gunakan username lain.',
          success: false 
        });
      } else if (field === 'emailOrPhone') {
        return res.status(409).json({ 
          message: 'Email atau nomor telepon sudah terdaftar. Silakan gunakan email/nomor lain.',
          success: false 
        });
      }
    }
    
    return res.status(500).json({ 
      message: 'Terjadi kesalahan server. Silakan coba lagi.',
      success: false 
    });
  }
}
