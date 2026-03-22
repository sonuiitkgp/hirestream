import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

// Maps sectionType enum values to their corresponding Prisma delegate
function getSectionDelegate(sectionType: string) {
  const map: Record<string, unknown> = {
    EXPERIENCE: db.experience,
    PROJECT: db.project,
    INTERNSHIP: db.internship,
    ACADEMIC: db.academicBackground,
    EXTRA_CURRICULAR: db.extraCurricular,
    CODECHEF: db.codeChefProfile,
  };
  return map[sectionType] as
    | { findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>; update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown> }
    | undefined;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const suggestion = await db.suggestion.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Author can edit their own suggestion's text (only while PENDING)
  if (body.suggestedText !== undefined && suggestion.authorId === session.user.id) {
    if (suggestion.status !== "PENDING") {
      return NextResponse.json({ error: "Can only edit pending suggestions" }, { status: 400 });
    }
    const updated = await db.suggestion.update({
      where: { id },
      data: { suggestedText: body.suggestedText.trim() },
      include: { author: { select: { id: true, name: true, email: true, image: true } } },
    });
    return NextResponse.json({ suggestion: updated });
  }

  // Profile owner can accept/decline
  if (suggestion.profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Only profile owner can change status" }, { status: 403 });
  }

  const { status } = body;
  if (status !== "ACCEPTED" && status !== "DECLINED") {
    return NextResponse.json({ error: "status must be ACCEPTED or DECLINED" }, { status: 400 });
  }

  if (status === "DECLINED") {
    const updated = await db.suggestion.update({
      where: { id },
      data: { status },
      include: { author: { select: { id: true, name: true, email: true, image: true } } },
    });
    createNotification({
      recipientId: suggestion.authorId,
      actorId: session.user.id,
      type: "SUGGESTION_DECLINED",
      title: "Your suggestion was declined",
      body: suggestion.suggestedText.slice(0, 120),
      linkUrl: "/profile/suggestions",
      resourceId: id,
    }).catch(() => {});
    return NextResponse.json({ suggestion: updated });
  }

  // ACCEPTED — apply the suggestion to the actual profile field
  const { sectionType, sectionItemId, fieldName, suggestedText, startOffset, endOffset } = suggestion;

  // Profile-level fields (no sectionItemId)
  if (!sectionItemId) {
    const profile = await db.profile.findUnique({ where: { userId: suggestion.profile.userId } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const currentValue = (profile as Record<string, unknown>)[fieldName] as string | null;
    const newValue = applyTextChange(currentValue ?? "", suggestedText, startOffset, endOffset);

    const [updated] = await db.$transaction([
      db.suggestion.update({
        where: { id },
        data: { status },
        include: { author: { select: { id: true, name: true, email: true, image: true } } },
      }),
      db.profile.update({
        where: { id: profile.id },
        data: { [fieldName]: newValue },
      }),
    ]);
    createNotification({
      recipientId: suggestion.authorId,
      actorId: session.user.id,
      type: "SUGGESTION_ACCEPTED",
      title: "Your suggestion was accepted!",
      body: suggestion.suggestedText.slice(0, 120),
      linkUrl: "/profile/suggestions",
      resourceId: id,
    }).catch(() => {});
    return NextResponse.json({ suggestion: updated });
  }

  // Section-level fields
  const delegate = getSectionDelegate(sectionType);
  if (!delegate) {
    return NextResponse.json({ error: `Unknown sectionType: ${sectionType}` }, { status: 400 });
  }

  const sectionItem = await delegate.findUnique({ where: { id: sectionItemId } });
  if (!sectionItem) {
    return NextResponse.json({ error: "Section item not found" }, { status: 404 });
  }

  const currentValue = (sectionItem as Record<string, unknown>)[fieldName] as string | null;
  const newValue = applyTextChange(currentValue ?? "", suggestedText, startOffset, endOffset);

  const updated = await db.$transaction(async (tx) => {
    const s = await tx.suggestion.update({
      where: { id },
      data: { status },
      include: { author: { select: { id: true, name: true, email: true, image: true } } },
    });
    await delegate.update({
      where: { id: sectionItemId },
      data: { [fieldName]: newValue },
    });
    return s;
  });
  createNotification({
    recipientId: suggestion.authorId,
    actorId: session.user.id,
    type: "SUGGESTION_ACCEPTED",
    title: "Your suggestion was accepted!",
    body: suggestion.suggestedText.slice(0, 120),
    linkUrl: "/profile/suggestions",
    resourceId: id,
  }).catch(() => {});
  return NextResponse.json({ suggestion: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const suggestion = await db.suggestion.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (suggestion.authorId !== session.user.id && suggestion.profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.suggestion.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}

/**
 * If startOffset and endOffset are present, splice the suggestedText into the
 * original value at the given character range. Otherwise replace entirely.
 */
function applyTextChange(
  current: string,
  suggestedText: string,
  startOffset: number | null,
  endOffset: number | null,
): string {
  if (startOffset != null && endOffset != null) {
    return current.slice(0, startOffset) + suggestedText + current.slice(endOffset);
  }
  return suggestedText;
}
