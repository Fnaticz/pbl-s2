import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

type Data = {
  message: string;
  success?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, name, avatar } = req.body;

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

    return res.status(200).json({ message: "Google data saved", success: true });
  } catch (error) {
    console.error("Save Google data error:", error);
    return res.status(500).json({ message: "Internal server error", error: (error as Error).message });
  }
}

