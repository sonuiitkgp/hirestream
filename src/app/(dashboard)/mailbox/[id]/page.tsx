import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ConversationView } from "@/components/features/messaging/ConversationView";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      recruiter: { select: { id: true, name: true, email: true } },
      candidate: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, email: true, image: true } } },
      },
    },
  });

  if (!conversation) redirect("/mailbox");
  if (conversation.recruiterId !== session.user.id && conversation.candidateId !== session.user.id) {
    redirect("/mailbox");
  }

  // Mark received messages as read
  await db.message.updateMany({
    where: { conversationId: id, senderId: { not: session.user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const other = conversation.recruiterId === session.user.id ? conversation.candidate : conversation.recruiter;

  return (
    <div className="mx-auto max-w-3xl flex flex-col h-[calc(100vh-3.5rem-2rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-1 py-3 shrink-0">
        <Link href="/mailbox" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Mailbox
        </Link>
        <div className="mx-2 h-4 w-px bg-border/60" />
        <div>
          <p className="text-sm font-semibold">{other.name ?? other.email}</p>
          <p className="text-xs text-muted-foreground">{other.email}</p>
        </div>
      </div>
      {/* Messages + send form */}
      <ConversationView
        conversationId={id}
        currentUserId={session.user.id}
        initialMessages={conversation.messages as any}
      />
    </div>
  );
}
