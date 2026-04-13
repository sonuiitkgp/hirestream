import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { embedText } from "@/lib/ai/embeddings";

type MatchRow = {
  id: string;
  user_id: string;
  share_token: string;
  headline: string | null;
  location: string | null;
  score: number;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await db.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.recruiterId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build the job text for embedding (same format as when the job was created)
  const jobText = [job.title, job.description, job.requirements.join(", "), job.location]
    .filter(Boolean)
    .join("\n");

  let vectorStr: string;
  try {
    const vector = await embedText(jobText);
    vectorStr = `[${vector.join(",")}]`;
  } catch {
    return NextResponse.json(
      { error: "Failed to generate embedding — try again later" },
      { status: 503 }
    );
  }

  // Find profiles ranked by cosine similarity to the job
  const rows = (await (db as any).$queryRaw(
    Prisma.sql`SELECT p.id, p."userId" as user_id, p."shareToken" as share_token,
            p.headline, p.location,
            1 - (p.embedding <=> ${vectorStr}::vector) as score
     FROM "Profile" p
     WHERE p.visibility = 'PUBLIC' AND p.embedding IS NOT NULL
     ORDER BY score DESC
     LIMIT 50`
  )) as MatchRow[];

  // Fetch user names
  const userIds = rows.map((r) => r.user_id);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, image: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const matches = rows.map((r) => ({
    profileId: r.id,
    userId: r.user_id,
    shareToken: r.share_token,
    name: userMap[r.user_id]?.name ?? userMap[r.user_id]?.email ?? null,
    image: userMap[r.user_id]?.image ?? null,
    headline: r.headline,
    location: r.location,
    score: Number(r.score),
  }));

  return NextResponse.json({ matches });
}
