import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Verification from '../../../models/verification';
import User from '../../../models/user';

type Data = {
  message: string;
  success?: boolean;
  verified?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    // Find verification record
    const verification = await Verification.findOne({
      email,
      code,
      verified: false,
    });

    if (!verification) {
      return res.status(400).json({
        message: "Invalid or expired verification code",
        verified: false,
      });
    }

    // Check if code is expired
    if (new Date() > verification.expiresAt) {
      await Verification.deleteOne({ _id: verification._id });
      return res.status(400).json({
        message: "Verification code has expired",
        verified: false,
      });
    }

    // Mark as verified
    verification.verified = true;
    await verification.save();

    // Update user emailVerified status
    await User.updateOne(
      { emailOrPhone: email },
      { emailVerified: true }
    );

    return res.status(200).json({
      message: "Email verified successfully",
      success: true,
      verified: true,
    });
  } catch (error: any) {
    console.error("Verify code error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error?.message || "Unknown error",
      verified: false,
    });
  }
}

