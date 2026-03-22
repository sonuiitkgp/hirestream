import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "profileId required" }, { status: 400 });

  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = profile.userId === session.user.id;

  const suggestions = await db.suggestion.findMany({
    where: {
      profileId,
      // Owner sees all suggestions; non-owner sees only their own
      ...(isOwner ? {} : { authorId: session.user.id }),
    },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ suggestions, isOwner });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileId, sectionType, sectionItemId, fieldName, originalText, suggestedText, startOffset, endOffset } =
    await req.json();

  if (!profileId || !sectionType || !fieldName || !originalText || !suggestedText) {
    return NextResponse.json(
      { error: "profileId, sectionType, fieldName, originalText, and suggestedText are required" },
      { status: 400 },
    );
  }

  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot suggest on your own profile" }, { status: 403 });
  }

  const suggestion = await db.suggestion.create({
    data: {
      profileId,
      authorId: session.user.id,
      sectionType,
      sectionItemId: sectionItemId ?? null,
      fieldName,
      originalText,
      suggestedText,
      startOffset: startOffset ?? null,
      endOffset: endOffset ?? null,
      status: "PENDING",
    },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const suggesterName = session.user.name ?? "Someone";
  createNotification({
    recipientId: profile.userId,
    actorId: session.user.id,
    type: "NEW_SUGGESTION",
    title: `${suggesterName} suggested an edit on your profile`,
    body: suggestedText.slice(0, 120),
    linkUrl: "/profile/suggestions",
    resourceId: suggestion.id,
  }).catch(() => {});

  return NextResponse.json({ suggestion }, { status: 201 });
}
