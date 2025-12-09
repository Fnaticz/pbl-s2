import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/mongodb";
import User from "../../models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const { googleId, email, username, address, avatar } = req.body;

    if (!googleId || !email || !username) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    let user = await User.findOne({ emailOrPhone: email });

    if (user) {
      return res.status(200).json({
        message: "Akun sudah ada, langsung login",
        user
      });
    }

    const newUser = await User.create({
      username,
      emailOrPhone: email,
      avatar: avatar || "",
      address: address || "",
      googleId,
      password: null,
      role: "guest",
    });

    return res.status(201).json({
      message: "Akun Google berhasil dibuat",
      user: newUser
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
