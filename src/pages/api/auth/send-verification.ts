import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from '../../../lib/mongodb';
import Verification from '../../../models/verification';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

type Data = {
  message: string;
  success?: boolean;
  error?: string;
};

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Generate verification code
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Code expires in 10 minutes

    // Delete old verification codes for this email
    await Verification.deleteMany({ email });

    // Create new verification code
    await Verification.create({
      email,
      code,
      expiresAt,
      verified: false,
    });

    // Send email - Priority: Resend > Gmail > SMTP > Dev Mode
    let emailSent = false;

    // Option 1: Resend (Recommended - Free & Easy)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
        
        const { data, error } = await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: 'Email Verification Code - Spartan',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Email Verification</h2>
              <p>Terima kasih telah mendaftar di Spartan. Gunakan kode verifikasi berikut untuk menyelesaikan pendaftaran:</p>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Kode ini akan kedaluwarsa dalam 10 menit.</p>
              <p style="color: #6b7280; font-size: 14px;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>
            </div>
          `,
        });

        if (error) {
          console.error('Resend error:', error);
          throw error;
        }

        if (data) {
          console.log(`Verification code sent via Resend to ${email}`);
          emailSent = true;
        }
      } catch (resendError: any) {
        console.error('Resend send error:', resendError);
        // Fallback to other methods
      }
    }

    // Option 2: Gmail Service (if Resend not available)
    if (!emailSent && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: email,
          subject: 'Email Verification Code - Spartan',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Email Verification</h2>
              <p>Terima kasih telah mendaftar di Spartan. Gunakan kode verifikasi berikut untuk menyelesaikan pendaftaran:</p>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Kode ini akan kedaluwarsa dalam 10 menit.</p>
              <p style="color: #6b7280; font-size: 14px;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification code sent via Gmail to ${email}`);
        emailSent = true;
      } catch (gmailError: any) {
        console.error('Gmail send error:', gmailError);
      }
    }

    // Option 3: SMTP Custom (if Gmail not available)
    if (!emailSent && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Email Verification Code - Spartan',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Email Verification</h2>
              <p>Terima kasih telah mendaftar di Spartan. Gunakan kode verifikasi berikut untuk menyelesaikan pendaftaran:</p>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Kode ini akan kedaluwarsa dalam 10 menit.</p>
              <p style="color: #6b7280; font-size: 14px;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification code sent via SMTP to ${email}`);
        emailSent = true;
      } catch (smtpError: any) {
        console.error('SMTP send error:', smtpError);
      }
    }

    // Option 4: Dev Mode (if no email service configured)
    if (!emailSent) {
      console.warn('Email configuration not found. Verification code:', code);
      // In development, just return the code
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          message: "Verification code generated (dev mode)",
          success: true,
          error: `DEV MODE - Code: ${code}`,
        });
      }
      return res.status(500).json({
        message: "Email service not configured. Please set RESEND_API_KEY, EMAIL_USER/EMAIL_PASSWORD, or SMTP configuration.",
      });
    }

    return res.status(200).json({
      message: "Verification code sent to email",
      success: true,
    });
  } catch (error: any) {
    console.error("Send verification error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error?.message || "Unknown error",
    });
  }
}

