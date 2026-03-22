import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = (await req.json()) as { role: string };
  if (role !== "JOB_SEEKER" && role !== "RECRUITER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { roles: true, profile: { select: { id: true } } },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const targetRole = role as Role;

  // ADMIN role can only be switched to, not added
  if (targetRole === "ADMIN" && !user.roles.includes("ADMIN")) {
    return NextResponse.json({ error: "Cannot add admin role" }, { status: 403 });
  }

  const isNewRole = !user.roles.includes(targetRole);

  // Add the role if user doesn't have it yet, and switch active role
  const updatedRoles = isNewRole ? [...user.roles, targetRole] : user.roles;

  await db.user.update({
    where: { id: session.user.id },
    data: { role: targetRole, roles: updatedRoles },
  });

  // Create profile on-demand when switching to JOB_SEEKER for the first time
  if (targetRole === "JOB_SEEKER" && !user.profile) {
    await db.profile.create({ data: { userId: session.user.id } });
  }

  return NextResponse.json({ ok: true, role: targetRole, roles: updatedRoles });
}
