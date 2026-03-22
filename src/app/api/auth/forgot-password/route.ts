import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({ ok: true });

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    // User doesn't exist — silently succeed to prevent enumeration
    return successResponse;
  }

  const isOAuthOnly = !user.password;

  // Delete any existing tokens for this email
  await db.passwordResetToken.deleteMany({ where: { email: user.email } });

  // Generate a secure token (expires in 1 hour)
  const token = randomBytes(32).toString("hex");
  await db.passwordResetToken.create({
    data: {
      email: user.email,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  // Send the reset email
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const subject = isOAuthOnly
    ? "Set a password for your HireStream account"
    : "Reset your HireStream password";
  const heading = isOAuthOnly ? "Set Your Password" : "Password Reset";
  const body = isOAuthOnly
    ? "You signed in with Google and don't have a password yet. Click the button below to set one — this will let you also log in with your email and password:"
    : "We received a request to reset your password. Click the button below to set a new one:";
  const buttonText = isOAuthOnly ? "Set Password" : "Reset Password";

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HireStream" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="background: #0f172a; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; font-size: 18px;">${heading}</h2>
            <p style="margin: 4px 0 0; opacity: 0.7; font-size: 13px;">HireStream</p>
          </div>
          <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
              Hi ${user.name ?? "there"},
            </p>
            <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">
              ${body}
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
              ${buttonText}
            </a>
            <p style="margin: 20px 0 0; font-size: 12px; color: #94a3b8;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
              If the button doesn't work, copy and paste this URL into your browser:<br/>
              <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }

  return successResponse;
}
