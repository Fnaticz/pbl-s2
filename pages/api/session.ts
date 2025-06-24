import { parse } from 'cookie';

export default async function handler(req: any, res: any) {
  const cookies = parse(req.headers.cookie || '');
  const session = cookies.session ? JSON.parse(cookies.session) : null;
  if (!session) return res.status(401).json({ message: 'Not logged in' });

  return res.status(200).json({
    username: session.username,
    email: session.email, // kalau email disimpan
    role: session.role
  });
}
