import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { connectDB } from '../../lib/mongodb';
import User from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method Not Allowed" });

  try {
    await connectDB();

    const { username, password, email, avatar, address } = req.body;

    if (!username || !password || !email)
      return res.status(400).json({ message: "Incomplete data" });

    // Cek apakah email sudah terdaftar
    const exists = await User.findOne({ emailOrPhone: email });
    if (exists) {
      return res.status(400).json({ message: "Akun dengan email ini sudah terdaftar. Silakan login dengan Google atau gunakan email lain." });
    }

    // Cek apakah username sudah digunakan
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username sudah digunakan. Silakan pilih username lain." });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      emailOrPhone: email,
      password: hashed,
      avatar,
      address: address || "",
      role: "guest",
    });

    res.status(201).json({ message: "Register Google berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
