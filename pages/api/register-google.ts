import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connectDB } from "../../lib/mongodb";
import User from "../../models/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    await connectDB();

    const { username, password, email, avatar } = req.body;

    if (!username || !password || !email)
      return res.status(400).json({ message: "Incomplete data" });

    const exists = await User.findOne({ emailOrPhone: email });
    if (exists)
      return res.status(400).json({ message: "Akun sudah terdaftar" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      emailOrPhone: email,
      password: hashed,
      avatar,
      role: "guest",
    });

    res.status(201).json({ message: "Register Google berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
