import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const cookies = parse(req.headers.cookie || "");
    const googleData = cookies.googleRegisterData;

    if (!googleData) {
      return res.status(404).json({ message: "Google data not found" });
    }

    const data = JSON.parse(googleData);

    return res.status(200).json({
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      googleId: data.googleId,
    });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}
