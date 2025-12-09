import type { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import { serialize } from "cookie";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Missing Google token" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ message: "Google token invalid" });
    }

    const googleData = {
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      googleId: payload.sub,
    };

    res.setHeader(
      "Set-Cookie",
      serialize("googleRegisterData", JSON.stringify(googleData), {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
    );

    return res.status(200).json({
      message: "Google data verified & saved",
      success: true,
      google: googleData,
    });

  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
