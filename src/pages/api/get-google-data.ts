import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";

type Data = {
  email?: string;
  name?: string;
  avatar?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
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
    return res.status(200).json(data);
  } catch (error) {
    console.error("Get Google data error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

