import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateProfileEmbedding } from "@/lib/ai/profile-embedding";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, techStack, url, repoUrl, profileId } = await req.json();

  const profile = await db.profile.findFirst({ where: { id: profileId, userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const project = await db.project.create({
    data: { profileId, name, description: description || null, techStack: techStack ?? [], url: url || null, repoUrl: repoUrl || null },
  });

  await generateProfileEmbedding(profileId);

  return NextResponse.json(project, { status: 201 });
}
