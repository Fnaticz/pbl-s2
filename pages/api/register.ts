import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import User from '../../models/user';
import bcrypt from 'bcryptjs';

type Data = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, emailOrPhone, password, address } = req.body;

  if (!username || !emailOrPhone || !password || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await connectDB();

    //buat cek user dan emailnyaa
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const existingEmail = await User.findOne({ emailOrPhone });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email or phone already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      emailOrPhone,
      password: hashedPassword,
      address,
      role: 'guest',
    });
    

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Register error:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
