// pages/api/events/event-register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import mongoose from "mongoose";
import EventApplication from '../../../models/event-register';
import Participant from '../../../models/participant';
import Point from '../../../models/point';
import MainEvent from '../../../models/main-event';
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
  },
};

function parseBase64Image(dataString: string) {
  const matches = dataString.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) return null;
  const mime = matches[1];
  const ext = mime.split("/")[1];
  const buffer = Buffer.from(matches[2], "base64");
  return { ext, buffer };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connect error:", err);
    return res.status(500).json({ message: "Database connection error" });
  }

  // POST -> user register
  if (req.method === "POST") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.id) {
        return res.status(401).json({ message: "Login required" });
      }
      if (session.user.role !== "member") {
        return res.status(403).json({ message: "Only members can register for events" });
      }

      const existing = await EventApplication.findOne({ userId: new mongoose.Types.ObjectId(session.user.id) }); if (existing) { return res.status(400).json({ message: "You already applied for this event" }); }

      // ambil main event terbaru
      const mainEvent = await MainEvent.findOne().sort({ createdAt: -1 });
      if (!mainEvent) {
        return res.status(404).json({ message: "Main event not found" });
      }

      // ✅ cek apakah user sudah accepted untuk event ini
      const existingAccepted = await Participant.findOne({
        userId: session.user.id,
        title: mainEvent.title,
        status: "approved",
      });

      if (existingAccepted) {
        return res.status(400).json({ message: "You are already registered and accepted for this event." });
      }

      const {
        userId,
        driverName,
        coDriverName,
        carName,
        driverPhone,
        coDriverPhone,
        policeNumber,
        address,
        teamName,
        paymentStatus,
        paymentProof,
      } = req.body;

      if (
        !userId ||
        !driverName ||
        !carName ||
        !driverPhone ||
        !policeNumber ||
        !teamName ||
        !paymentProof
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // handle bukti pembayaran
      let paymentProofFilename: string | null = null;
      if (paymentProof && typeof paymentProof === "string") {
        if (paymentProof.startsWith("data:image")) {
          const parsed = parseBase64Image(paymentProof);
          if (!parsed) {
            return res.status(400).json({ message: "Invalid payment proof image" });
          }

          if (parsed.buffer.length > 4_000_000) {
            return res.status(400).json({ message: "Payment proof image too large" });
          }

          const uploadDir = path.join(process.cwd(), "public", "uploads", "payments");
          await fs.promises.mkdir(uploadDir, { recursive: true });

          const filename = `${session.user.id}-${Date.now()}.${parsed.ext}`;
          const filepath = path.join(uploadDir, filename);
          await fs.promises.writeFile(filepath, parsed.buffer);

          paymentProofFilename = `/uploads/payments/${filename}`;
        } else {
          paymentProofFilename = paymentProof;
        }
      }

      const registration = await EventApplication.create({
        userId: session.user.id,
        username: session.user.username,
        emailOrPhone: session.user.emailOrPhone,
        title: mainEvent.title,
        driverName,
        coDriverName,
        carName,
        driverPhone,
        coDriverPhone,
        policeNumber,
        address,
        teamName,
        paymentStatus: paymentStatus === "paid" ? "paid" : "unpaid",
        paymentProof: paymentProofFilename,
        status: "pending",
      });

      return res.status(201).json({ message: "Registration submitted", registration });
    } catch (err) {
      console.error("Event register error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // PUT -> admin update registration status
  if (req.method === "PUT") {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user?.id) {
        return res.status(401).json({ message: "Login required" });
      }
      if (session.user.role !== "admin") {
        return res.status(403).json({ message: "Only admin can update registrations" });
      }

      const { registrationId, status } = req.body;
      if (!registrationId || !["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid request" });
      }

      const reg = await EventApplication.findById(registrationId);
      if (!reg) return res.status(404).json({ message: "Registration not found" });

      if (reg.status === status) {
        return res.status(200).json({ message: "No change", registration: reg });
      }

      reg.status = status;
      await reg.save();

      // award points jika diterima
      if (status === "approved") {
        try {
          const pointAward = 50;
          const existingPoint = await Point.findOne({ userId: reg.userId });
          if (existingPoint) {
            existingPoint.point = (existingPoint.point || 0) + pointAward;
            existingPoint.history.push({ eventName: reg.teamName || reg.title, earned: pointAward });
            await existingPoint.save();
          } else {
            await Point.create({
              userId: reg.userId,
              point: pointAward,
              history: [{ eventName: reg.teamName || reg.title, earned: pointAward }],
            });
          }
        } catch (err) {
          console.error("Point award error:", err);
        }
      }

      return res.status(200).json({ message: "Registration updated", registration: reg });
    } catch (err) {
      console.error("Event update error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
