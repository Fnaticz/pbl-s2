import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, name, avatar, register } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Missing required data" });
  }

  try {
    const googleData = JSON.stringify({
      email,
      name,
      avatar: avatar || "",
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

    // Redirect ke halaman register/google
    if (register === "true") {
      return res.redirect(
        302,
        `/register/google?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar || "")}`
      );
    }

    return res.status(200).json({ message: "Google data saved", success: true });
  } catch (error) {
    console.error("Capture Google data error:", error);
    return res.status(500).json({ message: "Internal server error", error: (error as Error).message });
  }
}

