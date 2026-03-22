import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toBool } from "@/lib/utils";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

async function getOwned(id: string, userId: string) {
  return db.academicBackground.findFirst({ where: { id, profile: { userId } } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const owned = await getOwned(id, session.user.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { institution, degree, field, startYear, endYear, gpa, current, description } = await req.json();
  const updated = await db.academicBackground.update({
    where: { id },
    data: {
      institution, degree, field, current: toBool(current),
      startYear: Number(startYear),
      endYear: endYear ? Number(endYear) : null,
      gpa: gpa ? Number(gpa) : null,
      description: description || null,
    },
  });
  await generateProfileEmbedding(owned.profileId);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const owned = await getOwned(id, session.user.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.academicBackground.delete({ where: { id } });
  await generateProfileEmbedding(owned.profileId);
  return NextResponse.json({ success: true });
}
