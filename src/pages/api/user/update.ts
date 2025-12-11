// pages/api/user/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import Business from '../../../models/business';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // support base64 up to ~10MB; sesuaikan
    },
  },
};

function parseBase64Image(dataString: string) {
  // returns { ext, buffer }
  const matches = dataString.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return null;
  const mime = matches[1]; // e.g. image/png
  const ext = mime.split("/")[1]; // png
  const buffer = Buffer.from(matches[2], "base64");
  return { ext, buffer };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    console.log("📩 Incoming update body:", Object.keys(req.body)); // debug keys only

    const { userId, username, address, avatar } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validasi username
    if (username && username.trim().length < 3) {
      return res.status(400).json({ message: "Username too short" });
    }

    // ✅ Handle avatar reset
    if (avatar === null) {
      existingUser.avatar = null;
    }

    // Jika avatar dikirim sebagai base64 (data:image...), simpan langsung string agar bisa dipakai di deploy tanpa file lokal
    if (avatar && typeof avatar === "string" && avatar.startsWith("data:image")) {
      const parsed = parseBase64Image(avatar);
      if (!parsed) return res.status(400).json({ message: "Invalid image data" });

      // check size limit (2MB)
      if (parsed.buffer.length > 2_000_000) {
        return res.status(400).json({ message: "Avatar too large" });
      }

      // simpan base64 langsung
      existingUser.avatar = avatar;
    } else if (avatar === null) {
      // user wants to remove avatar
      existingUser.avatar = undefined;
    } else if (avatar && typeof avatar === "string") {
      // If avatar is already a filename (short string), just save it
      existingUser.avatar = avatar;
    }

    const oldUsername = existingUser.username;

    if (username) existingUser.username = username;
    if (address) existingUser.address = address;

    await existingUser.save();

    if (username && username !== oldUsername) {
      await Business.updateMany(
        { username: oldUsername },
        { $set: { username } }
      );
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: existingUser._id,
        username: existingUser.username,
        address: existingUser.address,
        role: existingUser.role,
        avatar: existingUser.avatar, // nama file atau undefined
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
