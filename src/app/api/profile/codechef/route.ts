import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, rating, maxRating, globalRank, solved, stars, profileId } = await req.json();

  if (!username?.trim()) return NextResponse.json({ error: "Username is required" }, { status: 400 });

  const profile = await db.profile.findFirst({ where: { id: profileId, userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cc = await db.codeChefProfile.create({
    data: { profileId, username, rating, maxRating, globalRank, solved, stars },
  });

  await generateProfileEmbedding(profileId);

  return NextResponse.json(cc, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, rating, maxRating, globalRank, solved, stars, profileId } = await req.json();

  const profile = await db.profile.findFirst({ where: { id: profileId, userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cc = await db.codeChefProfile.update({
    where: { profileId },
    data: { username, rating, maxRating, globalRank, solved, stars, updatedAt: new Date() },
  });

  await generateProfileEmbedding(profileId);

  return NextResponse.json(cc);
}
