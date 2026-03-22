import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, profile: { select: { id: true } } },
  });

  if (!user) {
    return NextResponse.json({ completed: false });
  }

  // User has completed onboarding if they're a recruiter, or a job seeker with a profile
  const completed = user.role === "RECRUITER" || user.role === "ADMIN" || !!user.profile;
  return NextResponse.json({ completed, role: user.role });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = await req.json();
  if (role !== "JOB_SEEKER" && role !== "RECRUITER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Update the user's role and add to roles array
  await db.user.update({
    where: { id: session.user.id },
    data: { role, roles: [role] },
  });

  // Create a profile for job seekers if they don't have one
  if (role === "JOB_SEEKER") {
    const existing = await db.profile.findUnique({
      where: { userId: session.user.id },
    });
    if (!existing) {
      await db.profile.create({ data: { userId: session.user.id } });
    }
  }

  return NextResponse.json({ ok: true });
}
