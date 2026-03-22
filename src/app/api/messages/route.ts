import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conversation.recruiterId !== session.user.id && conversation.candidateId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, email: true, image: true } } },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, content } = await req.json();
  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "conversationId and content required" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conversation.recruiterId !== session.user.id && conversation.candidateId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [message] = await db.$transaction([
    db.message.create({
      data: { conversationId, senderId: session.user.id, content: content.trim() },
      include: { sender: { select: { id: true, name: true, email: true, image: true } } },
    }),
    db.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
  ]);

  // Notify the other party
  const recipientId =
    conversation.recruiterId === session.user.id
      ? conversation.candidateId
      : conversation.recruiterId;
  const senderName = session.user.name ?? "Someone";
  createNotification({
    recipientId,
    actorId: session.user.id,
    type: "NEW_MESSAGE",
    title: `New message from ${senderName}`,
    body: content.trim().slice(0, 120),
    linkUrl: `/mailbox/${conversationId}`,
    resourceId: message.id,
  }).catch(() => {}); // fire-and-forget

  return NextResponse.json({ message });
}
