import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") ?? "20"),
    50
  );
  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";

  const where = {
    recipientId: session.user.id,
    ...(unreadOnly ? { readAt: null } : {}),
  };

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      actor: { select: { id: true, name: true, image: true } },
    },
  });

  const hasMore = notifications.length > limit;
  if (hasMore) notifications.pop();

  const unreadCount = await db.notification.count({
    where: { recipientId: session.user.id, readAt: null },
  });

  return NextResponse.json({
    notifications,
    unreadCount,
    nextCursor: hasMore ? notifications[notifications.length - 1]?.id : null,
  });
}
