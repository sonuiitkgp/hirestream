import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toBool } from "@/lib/utils";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { institution, degree, field, startYear, endYear, gpa, current, description, profileId } = await req.json();

  const profile = await db.profile.findFirst({ where: { id: profileId, userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const acad = await db.academicBackground.create({
    data: {
      profileId, institution, degree, field,
      startYear: Number(startYear),
      endYear: endYear ? Number(endYear) : null,
      gpa: gpa ? Number(gpa) : null,
      current: toBool(current),
      description: description || null,
    },
  });

  await generateProfileEmbedding(profileId);

  return NextResponse.json(acad, { status: 201 });
}
