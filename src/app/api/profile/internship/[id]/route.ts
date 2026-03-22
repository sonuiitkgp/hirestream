import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toBool } from "@/lib/utils";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

async function getOwned(id: string, userId: string) {
  return db.internship.findFirst({ where: { id, profile: { userId } } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const owned = await getOwned(id, session.user.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { company, role, startDate, endDate, current, description, location, stipend } = await req.json();
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
  const updated = await db.internship.update({
    where: { id },
    data: {
      company, role, current: toBool(current),
      description: description || null, location: location || null,
      stipend: stipend || null,
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
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
  await db.internship.delete({ where: { id } });
  await generateProfileEmbedding(owned.profileId);
  return NextResponse.json({ success: true });
}
