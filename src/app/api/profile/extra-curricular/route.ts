import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { activity, role, description, profileId } = await req.json();

  if (!activity?.trim()) return NextResponse.json({ error: "Activity is required" }, { status: 400 });

  const profile = await db.profile.findFirst({ where: { id: profileId, userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const ec = await db.extraCurricular.create({
    data: { profileId, activity, role: role || null, description: description || null },
  });

  await generateProfileEmbedding(profileId);

  return NextResponse.json(ec, { status: 201 });
}
