import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

export default async function MailboxPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ recruiterId: session.user.id }, { candidateId: session.user.id }],
    },
    include: {
      recruiter: { select: { name: true, email: true } },
      candidate: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Mailbox</h1>
          <p className="text-xs text-muted-foreground">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Your conversations will appear here</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const isRecruiter = conv.recruiterId === session.user.id;
            const other = isRecruiter ? conv.candidate : conv.recruiter;
            const lastMsg = conv.messages[0];
            const unread = lastMsg && !lastMsg.readAt && lastMsg.senderId !== session.user.id;
            const initials = (other.name ?? other.email).split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

            return (
              <Link key={conv.id} href={`/mailbox/${conv.id}`} className="block group">
                <div className="card-clean p-4 flex items-center gap-4 cursor-pointer">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                      {initials}
                    </div>
                    {unread && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-violet-500 ring-2 ring-background" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold truncate ${unread ? "text-foreground" : "text-foreground/80"}`}>
                        {other.name ?? other.email}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${unread ? "text-foreground/70 font-medium" : "text-muted-foreground"}`}>
                      {lastMsg?.content ?? "No messages yet"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
