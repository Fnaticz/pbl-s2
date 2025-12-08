import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import User from '../../models/user';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';

type Data = {
  message: string;
  success?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    console.info('Connecting to MongoDB...');
    await connectDB();
    console.info('MongoDB connected');

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const sessionData = JSON.stringify({
      username: user.username,
      role: user.role,
    });

    res.setHeader(
      'Set-Cookie',
      serialize('session', sessionData, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      })
    );

    return res.status(200).json({ message: 'Login successful', success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
}
