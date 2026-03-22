import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const [userCount, profileCount, jobCount, messageCount, recentUsers] = await Promise.all([
    db.user.count(),
    db.profile.count(),
    db.job.count(),
    db.message.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ userCount, profileCount, jobCount, messageCount, recentUsers });
}
