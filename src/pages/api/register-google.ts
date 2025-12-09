import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "../../lib/mongodb";
import User from "../../models/user";
import Verification from "../../models/verification";
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification code function
async function sendVerificationCode(email: string): Promise<boolean> {
  try {
    await connectDB();

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

    // Option 1: Resend (Recommended)
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

        if (!error && data) {
          console.log(`Verification code sent via Resend to ${email}`);
          emailSent = true;
        }
      } catch (resendError) {
        console.error('Resend send error:', resendError);
      }
    }

    // Option 2: Gmail Service
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
      } catch (gmailError) {
        console.error('Gmail send error:', gmailError);
      }
    }

    // Option 3: SMTP Custom
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
      } catch (smtpError) {
        console.error('SMTP send error:', smtpError);
      }
    }

    // If email not sent, code is still saved in DB, user can request new code
    if (!emailSent) {
      console.warn(`Email service not configured. Verification code saved for ${email}: ${code}`);
    }

    return emailSent;
  } catch (error) {
    console.error('Error in sendVerificationCode:', error);
    return false;
  }
}

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

    // Check if user already exists by email or googleId
    let user = await User.findOne({ 
      $or: [
        { emailOrPhone: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        await user.save();
      }
      
      return res.status(400).json({
        message: "Akun sudah terdaftar. Silakan login dengan Google."
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username sudah digunakan. Silakan pilih username lain." });
    }

    const newUser = await User.create({
      username,
      emailOrPhone: email,
      avatar: avatar || "",
      address: address || "",
      googleId,
      password: null,
      role: "guest",
      emailVerified: false,
    });

    // Send verification code after registration
    await sendVerificationCode(email);

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil. Silakan verifikasi email Anda.",
      redirect: `/verify-email?email=${encodeURIComponent(email)}`
    });
    
  } catch (error: any) {
    console.error("Register Google error:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'username') {
        return res.status(400).json({ message: "Username sudah digunakan. Silakan pilih username lain." });
      }
      if (field === 'emailOrPhone') {
        return res.status(400).json({ message: "Email sudah terdaftar. Silakan login." });
      }
      if (field === 'googleId') {
        return res.status(400).json({ message: "Akun Google sudah terdaftar. Silakan login." });
      }
    }
    
    return res.status(500).json({ message: "Server error. Silakan coba lagi." });
  }
}
