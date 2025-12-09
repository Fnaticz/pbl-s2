import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

type Data = {
  message: string;
  success?: boolean;
  error?: string;
  redirect?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, name, picture, error, register } = req.query;

  // Jika ada error dari NextAuth
  if (error === "not_registered" || error === "NOT_REGISTERED") {
    // Redirect ke register dengan message
    return res.redirect(302, `/register?google_error=not_registered`);
  }

  // Jika ini adalah register flow dan ada data Google
  if (register === "true" && email && name) {
    // Simpan data Google ke cookie
    const googleData = JSON.stringify({
      email: email as string,
      name: name as string,
      avatar: (picture as string) || "",
    });

    res.setHeader(
      "Set-Cookie",
      serialize("googleRegisterData", googleData, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 menit
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
    );

    // Redirect ke halaman register/google dengan data di query params
    return res.redirect(
      302,
      `/register/google?email=${encodeURIComponent(email as string)}&name=${encodeURIComponent(name as string)}&avatar=${encodeURIComponent((picture as string) || "")}`
    );
  }

  // Default redirect
  return res.redirect(302, "/register");
}

