import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  let vectorStr: string | null = null;

  if (q) {
    // Embed the search query
    try {
      const { embedText } = await import("@/lib/ai/embeddings");
      const vector = await embedText(q);
      vectorStr = `[${vector.join(",")}]`;
    } catch {
      // Embedding failed — fall through to text search
    }
  } else {
    // Use own profile embedding as the query vector
    try {
      const ownProfile = (await (db as any).$queryRaw(
        Prisma.sql`SELECT embedding::text FROM "Profile" WHERE "userId" = ${session.user.id} AND embedding IS NOT NULL`
      )) as { embedding: string }[];
      if (ownProfile[0]?.embedding) {
        vectorStr = ownProfile[0].embedding;
      }
    } catch {
      // Own embedding not available — fall through to recent profiles
    }
  }

  if (!vectorStr) {
    // Fallback: text-based search if we have a query, otherwise recent profiles
    if (q) {
      const profiles = await db.profile.findMany({
        where: {
          visibility: "PUBLIC",
          userId: { not: session.user.id },
          OR: [
            { headline: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { experiences: { some: { OR: [
              { role: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ] } } },
            { projects: { some: { OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { techStack: { has: q } },
            ] } } },
            { academicBgs: { some: { OR: [
              { institution: { contains: q, mode: "insensitive" } },
              { degree: { contains: q, mode: "insensitive" } },
              { field: { contains: q, mode: "insensitive" } },
            ] } } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, email: true } } },
      });
      return NextResponse.json({
        candidates: profiles.map((p) => ({
          id: p.userId,
          userId: p.userId,
          name: p.user.name,
          headline: p.headline,
          location: p.location,
          shareToken: p.shareToken,
          score: 0,
        })),
      });
    }

    // No query — return most recently updated public profiles (exclude self)
    const profiles = await db.profile.findMany({
      where: {
        visibility: "PUBLIC",
        userId: { not: session.user.id },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json({
      candidates: profiles.map((p) => ({
        id: p.userId,
        name: p.user.name,
        headline: p.headline,
        location: p.location,
        shareToken: p.shareToken,
        score: 0,
      })),
    });
  }

  // Vector similarity search
  type Row = { userId: string; name: string | null; headline: string | null; location: string | null; shareToken: string; score: number };
  const rows = (await (db as any).$queryRaw(
    Prisma.sql`SELECT p."userId", u.name, p.headline, p.location, p."shareToken",
            1 - (p.embedding <=> ${vectorStr}::vector) AS score
     FROM "Profile" p
     JOIN "User" u ON u.id = p."userId"
     WHERE p.visibility = 'PUBLIC'
       AND p."userId" != ${session.user.id}
       AND p.embedding IS NOT NULL
     ORDER BY score DESC
     LIMIT 20`
  )) as Row[];

  return NextResponse.json({
    candidates: rows.map((r) => ({
      id: r.userId,
      userId: r.userId,
      name: r.name,
      headline: r.headline,
      location: r.location,
      shareToken: r.shareToken,
      score: Number(r.score),
    })),
  });
}
