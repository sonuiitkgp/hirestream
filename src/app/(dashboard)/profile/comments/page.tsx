import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { CommentCard } from "@/components/features/profile/CommentCard";

export default async function CommentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/profile");

  const comments = await db.comment.findMany({
    where: { profileId: profile.id },
    include: {
      author: { select: { id: true, name: true, email: true, image: true } },
      history: { orderBy: { editedAt: "desc" } },
      _count: { select: { history: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Profile Comments</h1>
          <p className="text-xs text-muted-foreground">
            {comments.length} comment{comments.length !== 1 ? "s" : ""} received
          </p>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No comments yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Feedback from peers will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c as any}
              currentUserId={session.user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
