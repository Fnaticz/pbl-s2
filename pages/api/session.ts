// pages/api/session.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';

type SessionData = {
  username: string;
  email?: string;
  role: string;
};

type ResponseData = 
  | { message: string }
  | SessionData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const cookies = parse(req.headers.cookie || '');
  let session: SessionData | null = null;

  try {
    session = cookies.session ? JSON.parse(cookies.session) : null;
  } catch {
    return res.status(400).json({ message: 'Invalid session data' });
  }

  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  return res.status(200).json({
    username: session.username,
    email: session.email,
    role: session.role,
  });
}
