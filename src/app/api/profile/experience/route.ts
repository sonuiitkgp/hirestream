import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toBool } from "@/lib/utils";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { company, role, startDate, endDate, current, description, location, profileId } = body;

  // Verify ownership
  const profile = await db.profile.findFirst({ where: { id: profileId, userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const experience = await db.experience.create({
    data: {
      profileId,
      company,
      role,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      current: toBool(current),
      description: description || null,
      location: location || null,
    },
  });

  await generateProfileEmbedding(profileId);

  return NextResponse.json(experience, { status: 201 });
}
