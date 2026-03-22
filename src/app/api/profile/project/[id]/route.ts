import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

async function getOwned(id: string, userId: string) {
  return db.project.findFirst({ where: { id, profile: { userId } } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const owned = await getOwned(id, session.user.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { name, description, techStack, url, repoUrl } = await req.json();
  const stack = Array.isArray(techStack) ? techStack : (techStack as string).split(",").map((t: string) => t.trim()).filter(Boolean);
  const updated = await db.project.update({
    where: { id },
    data: { name, description: description || null, techStack: stack, url: url || null, repoUrl: repoUrl || null },
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
  await db.project.delete({ where: { id } });
  await generateProfileEmbedding(owned.profileId);
  return NextResponse.json({ success: true });
}
