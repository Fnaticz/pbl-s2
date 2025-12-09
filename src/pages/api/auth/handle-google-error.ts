import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';

// Temporary in-memory storage untuk data Google
const googleDataStore = new Map<string, { email: string; name: string; avatar: string; timestamp: number }>();

// Cleanup old entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of googleDataStore.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      googleDataStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Export function untuk menyimpan data Google
export function saveGoogleDataForRegister(state: string, email: string, name: string, avatar: string) {
  googleDataStore.set(state, { email, name, avatar, timestamp: Date.now() });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { error, register, state, email } = req.query;

  // Jika ini adalah error dari Google login/register
  if (error === "not_registered" || error === "AccessDenied" || error) {
    // Cek apakah ini register flow
    const isRegister = register === "true" || (state?.toString().includes("register=true") ?? false);
    
    // Coba ambil data Google dari temporary store
    let googleData: { email: string; name: string; avatar: string } | null = null;
    
    // Coba ambil berdasarkan state dulu
    if (state) {
      const stored = googleDataStore.get(state as string);
      if (stored) {
        googleData = { email: stored.email, name: stored.name, avatar: stored.avatar };
        googleDataStore.delete(state as string);
      }
    }
    
    // Jika tidak ada, coba ambil berdasarkan email (fallback)
    if (!googleData && email) {
      const stored = googleDataStore.get(`email_${email}`);
      if (stored) {
        googleData = { email: stored.email, name: stored.name, avatar: stored.avatar };
        googleDataStore.delete(`email_${email}`);
      }
    }
    
    // Jika tidak ada di store, cek cookie
    if (!googleData) {
      const cookies = req.headers.cookie?.split("; ") || [];
      const googleCookie = cookies.find((c) => c.startsWith("googleRegisterData="));
      if (googleCookie) {
        try {
          const cookieValue = googleCookie.split("=").slice(1).join("=");
          const decoded = decodeURIComponent(cookieValue);
          googleData = JSON.parse(decoded);
        } catch (e) {
          console.error("Error parsing Google cookie:", e);
        }
      }
    }

    // Jika ada data Google dan ini register flow
    if (googleData && isRegister) {
      // Cek apakah email sudah terdaftar (untuk register flow, ini seharusnya tidak terjadi)
      // Tapi kita cek untuk memastikan
      try {
        await connectDB();
        const existingUser = await User.findOne({ emailOrPhone: googleData.email });
        if (existingUser) {
          // Jika sudah terdaftar, redirect ke register dengan error
          return res.redirect(302, `/register?google_error=already_registered&email=${encodeURIComponent(googleData.email)}`);
        }
      } catch (dbError) {
        console.error("Error checking existing user:", dbError);
      }

      // Simpan data ke cookie untuk digunakan di halaman register/google
      const googleDataStr = JSON.stringify(googleData);
      res.setHeader(
        "Set-Cookie",
        serialize("googleRegisterData", googleDataStr, {
          path: "/",
          httpOnly: true,
          maxAge: 60 * 10,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        })
      );

      // Redirect ke halaman register/google dengan data
      return res.redirect(
        302,
        `/register/google?email=${encodeURIComponent(googleData.email)}&name=${encodeURIComponent(googleData.name)}&avatar=${encodeURIComponent(googleData.avatar)}`
      );
    }

    // Untuk login flow atau jika tidak ada data, redirect ke login dengan error
    return res.redirect(302, `/login?error=not_registered`);
  }

  // Default redirect
  return res.redirect(302, "/register");
}
