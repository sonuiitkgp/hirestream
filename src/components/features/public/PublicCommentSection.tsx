"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Send, Reply } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SECTION_TYPES = [
  { value: "EXPERIENCE", label: "Experience" },
  { value: "PROJECT", label: "Projects" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "ACADEMIC", label: "Education" },
  { value: "EXTRA_CURRICULAR", label: "Extra Curricular" },
  { value: "CODECHEF", label: "CodeChef" },
];

type CommentAuthor = { name: string | null; email: string };

type CommentReply = {
  id: string;
  content: string;
  createdAt: Date | string;
  author: CommentAuthor;
};

type Comment = {
  id: string;
  content: string;
  sectionType: string;
  createdAt: Date | string;
  author: CommentAuthor;
  replies?: CommentReply[];
};

function CommentItem({
  comment,
  profileId,
  canComment,
}: {
  comment: Comment;
  profileId: string;
  canComment: boolean;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const [replies, setReplies] = useState<CommentReply[]>(comment.replies ?? []);

  const authorName = comment.author.name ?? comment.author.email;
  const initials = authorName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleReply() {
    if (!replyContent.trim()) return;
    setReplying(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        content: replyContent.trim(),
        sectionType: comment.sectionType,
        parentId: comment.id,
      }),
    });
    setReplying(false);
    if (res.ok) {
      const data = await res.json();
      setReplies((prev) => [...prev, data.comment]);
      setReplyContent("");
      setShowReply(false);
      toast.success("Reply submitted — it will appear once approved.");
    } else {
      toast.error("Failed to submit reply.");
    }
  }

  return (
    <div className="card-clean p-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{authorName}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <span className="inline-block mt-0.5 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {comment.sectionType.replace(/_/g, " ")}
          </span>
          <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
            {comment.content}
          </p>
          {canComment && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Reply form */}
      {showReply && (
        <div className="ml-11 space-y-2">
          <Textarea
            placeholder="Write a reply…"
            rows={2}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReply}
              disabled={replying || !replyContent.trim()}
            >
              {replying ? "Submitting…" : "Submit Reply"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowReply(false);
                setReplyContent("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-11 space-y-2 border-l-2 border-border pl-4">
          {replies.map((reply) => {
            const rName = reply.author.name ?? reply.author.email;
            const rInitials = rName
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={reply.id} className="flex gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                  {rInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{rName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-foreground/80">
                    {reply.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PublicCommentSection({
  profileId,
  acceptedComments,
  canComment,
}: {
  profileId: string;
  acceptedComments: Comment[];
  canComment: boolean;
}) {
  const [content, setContent] = useState("");
  const [sectionType, setSectionType] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!content.trim() || !sectionType) return;
    setSaving(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, content: content.trim(), sectionType }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(
        "Review submitted! It will appear once accepted by the profile owner."
      );
      setContent("");
      setSectionType("");
      setSubmitted(true);
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error ?? "Failed to submit review.");
    }
  }

  return (
    <div className="section-clean space-y-5">
      <h2 className="flex items-center gap-2.5 text-base font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-3.5 w-3.5" />
        </span>
        Peer Reviews
      </h2>

      {/* Add review form */}
      {canComment && !submitted && (
        <div className="form-clean space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Leave a Review
          </p>
          <Select
            value={sectionType}
            onValueChange={(v) => {
              if (v !== null) setSectionType(v);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Which section are you reviewing?" />
            </SelectTrigger>
            <SelectContent>
              {SECTION_TYPES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Share your feedback on this person's profile…"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            onClick={handleSubmit}
            disabled={saving || !content.trim() || !sectionType}
            size="sm"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {saving ? "Submitting…" : "Submit Review"}
          </Button>
        </div>
      )}

      {submitted && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-400">
          Review submitted — it will appear once approved by the profile owner.
        </div>
      )}

      {/* Accepted comments with threading */}
      {acceptedComments.length === 0 ? (
        <div className="empty-state">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {acceptedComments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              profileId={profileId}
              canComment={canComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
