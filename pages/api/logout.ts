import { serialize } from 'cookie';

export default function handler(req: any, res: any) {
  res.setHeader('Set-Cookie', serialize('session', '', {
    path: '/',
    maxAge: -1
  }));
  res.status(200).json({ message: 'Logged out' });
}
