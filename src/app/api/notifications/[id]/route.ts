import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Mark a single notification as read
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const notification = await db.notification.findUnique({ where: { id } });
  if (!notification || notification.recipientId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });

  return NextResponse.json(updated);
}

// Delete a notification
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const notification = await db.notification.findUnique({ where: { id } });
  if (!notification || notification.recipientId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.notification.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
