import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";
import { createNotifications } from "@/lib/notifications";
import { notifyAdminNewUser } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!["JOB_SEEKER", "RECRUITER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role as Role,
        roles: [role as Role],
        // Auto-create empty profile for job seekers
        ...(role === "JOB_SEEKER" && {
          profile: { create: {} },
        }),
      },
    });

    // Notify all admins (in-app + email) in background
    notifyAdminsOfNewUser(user.id, user.name, user.email, role).catch(() => {});

    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

async function notifyAdminsOfNewUser(
  newUserId: string,
  name: string | null,
  email: string,
  role: string,
) {
  const roleName = role.replace("_", " ");
  const displayName = name || email;

  // Find all admin users
  const admins = await db.user.findMany({
    where: { roles: { has: "ADMIN" } },
    select: { id: true },
  });

  // In-app notifications to all admins
  if (admins.length > 0) {
    await createNotifications(
      admins.map((admin) => ({
        recipientId: admin.id,
        actorId: newUserId,
        type: "NEW_USER" as const,
        title: `New ${roleName} joined`,
        body: `${displayName} (${email}) registered as a ${roleName}.`,
        linkUrl: "/admin/users",
      })),
    );
  }

  // Email notification
  await notifyAdminNewUser({ name, email, role });
}
