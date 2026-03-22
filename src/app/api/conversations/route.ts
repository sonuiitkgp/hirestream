import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { candidateId } = await req.json();
  if (!candidateId) return NextResponse.json({ error: "candidateId required" }, { status: 400 });
  if (candidateId === session.user.id) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  const other = await db.user.findUnique({ where: { id: candidateId } });
  if (!other) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Normalize participant order so the unique constraint catches both directions
  const [participantA, participantB] =
    session.user.id < candidateId
      ? [session.user.id, candidateId]
      : [candidateId, session.user.id];

  const conversation = await db.conversation.upsert({
    where: { recruiterId_candidateId: { recruiterId: participantA, candidateId: participantB } },
    create: { recruiterId: participantA, candidateId: participantB },
    update: {},
  });
  return NextResponse.json({ id: conversation.id });
}
