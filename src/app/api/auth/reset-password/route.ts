import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid reset link." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // Find the token
  const resetToken = await db.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  if (resetToken.expires < new Date()) {
    // Token expired — clean up
    await db.passwordResetToken.delete({ where: { id: resetToken.id } });
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }

  // Find the user
  const user = await db.user.findUnique({ where: { email: resetToken.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Hash and update password
  const hashed = await bcrypt.hash(password, 12);
  await db.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  // Delete all reset tokens for this email
  await db.passwordResetToken.deleteMany({ where: { email: resetToken.email } });

  return NextResponse.json({ ok: true });
}
