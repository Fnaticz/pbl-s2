// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    serialize('session', '', {
      path: '/',
      maxAge: -1,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  );

  res.status(200).json({ message: 'Logged out' });
}
