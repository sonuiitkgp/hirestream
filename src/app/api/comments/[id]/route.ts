import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await db.comment.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Status change: only profile owner
  if (body.status !== undefined) {
    if (comment.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Only profile owner can change status" }, { status: 403 });
    }
    const updated = await db.comment.update({
      where: { id },
      data: { status: body.status },
    });
    if (body.status === "ACCEPTED" || body.status === "DECLINED") {
      const type = body.status === "ACCEPTED" ? "COMMENT_ACCEPTED" : "COMMENT_DECLINED";
      createNotification({
        recipientId: comment.authorId,
        actorId: session.user.id,
        type,
        title: body.status === "ACCEPTED"
          ? "Your comment was accepted!"
          : "Your comment was declined",
        body: comment.content.slice(0, 120),
        linkUrl: "/profile/comments",
        resourceId: id,
      }).catch(() => {});
    }
    return NextResponse.json({ comment: updated });
  }

  // Content edit: only comment author, save history first
  if (body.content !== undefined) {
    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Only comment author can edit content" }, { status: 403 });
    }
    await db.commentHistory.create({
      data: { commentId: id, previousContent: comment.content },
    });
    const updated = await db.comment.update({
      where: { id },
      data: { content: body.content.trim() },
    });
    return NextResponse.json({ comment: updated });
  }

  return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comment = await db.comment.findUnique({
    where: { id },
    include: { profile: { select: { userId: true } } },
  });
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (comment.authorId !== session.user.id && comment.profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.comment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
