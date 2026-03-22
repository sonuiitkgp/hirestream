import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { embedText } from "@/lib/ai/embeddings";

type SearchRow = {
  id: string;
  user_id: string;
  share_token: string;
  headline: string | null;
  location: string | null;
  score: number;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length === 0) return NextResponse.json({ error: "Query is required" }, { status: 400 });
  if (q.length > 500) return NextResponse.json({ error: "Query too long" }, { status: 400 });

  try {
    const queryVector = await embedText(q);
    const vectorStr = `[${queryVector.join(",")}]`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (await (db as any).$queryRawUnsafe(
      `SELECT p.id, p."userId" as user_id, p."shareToken" as share_token,
              p.headline, p.location,
              1 - (p.embedding <=> $1::vector) as score
       FROM "Profile" p
       WHERE p.visibility = 'PUBLIC' AND p.embedding IS NOT NULL
       ORDER BY score DESC
       LIMIT 100`,
      vectorStr
    )) as SearchRow[];

    const userIds = rows.map((r) => r.user_id);
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = Object.fromEntries(
      users.map((u) => [u.id, u.name] as [string, string | null])
    );

    const candidates = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      shareToken: r.share_token,
      name: userMap[r.user_id] ?? null,
      headline: r.headline,
      location: r.location,
      score: Number(r.score),
    }));

    return NextResponse.json({ candidates });
  } catch {
    return NextResponse.json({ error: "Search failed. Please try again." }, { status: 500 });
  }
}
