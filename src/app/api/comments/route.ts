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
  // Profile owner sees all; others only see ACCEPTED
  const isOwner = profile.userId === session.user.id;

  const comments = await db.comment.findMany({
    where: {
      profileId,
      parentId: null,
      ...(isOwner ? {} : { status: "ACCEPTED" }),
    },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      replies: {
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
          history: { orderBy: { editedAt: "desc" } },
        },
        orderBy: { createdAt: "asc" },
      },
      history: { orderBy: { editedAt: "desc" } },
      _count: { select: { history: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ comments, isOwner });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { profileId, sectionType, sectionItemId, content, parentId } = await req.json();
  if (!profileId || !content?.trim() || !sectionType) {
    return NextResponse.json({ error: "profileId, sectionType, and content required" }, { status: 400 });
  }

  const profile = await db.profile.findUnique({ where: { id: profileId } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  if (profile.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot comment on your own profile" }, { status: 403 });
  }

  // Map generic sectionItemId to the correct FK field
  const itemFk: Record<string, string | null> = {
    experienceId: null,
    projectId: null,
    internshipId: null,
    academicId: null,
    extraCurId: null,
    codechefId: null,
  };
  if (sectionItemId) {
    const fkMap: Record<string, string> = {
      EXPERIENCE: "experienceId",
      PROJECT: "projectId",
      INTERNSHIP: "internshipId",
      ACADEMIC: "academicId",
      EXTRA_CURRICULAR: "extraCurId",
      CODECHEF: "codechefId",
    };
    const fkField = fkMap[sectionType];
    if (fkField) itemFk[fkField] = sectionItemId;
  }

  const comment = await db.comment.create({
    data: {
      profileId,
      authorId: session.user.id,
      content: content.trim(),
      sectionType,
      parentId: parentId ?? null,
      status: "PENDING",
      ...itemFk,
    },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  const commenterName = session.user.name ?? "Someone";

  // Notify profile owner about the new comment
  createNotification({
    recipientId: profile.userId,
    actorId: session.user.id,
    type: "NEW_COMMENT",
    title: `${commenterName} commented on your profile`,
    body: content.trim().slice(0, 120),
    linkUrl: "/profile/comments",
    resourceId: comment.id,
  }).catch(() => {});

  // If this is a reply, also notify the parent comment author
  if (parentId) {
    const parent = await db.comment.findUnique({ where: { id: parentId }, select: { authorId: true } });
    if (parent && parent.authorId !== session.user.id) {
      createNotification({
        recipientId: parent.authorId,
        actorId: session.user.id,
        type: "COMMENT_REPLY",
        title: `${commenterName} replied to your comment`,
        body: content.trim().slice(0, 120),
        linkUrl: "/profile/comments",
        resourceId: comment.id,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ comment }, { status: 201 });
}
