"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Trash2, Pencil, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Author = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

type HistoryEntry = {
  id: string;
  previousContent: string;
  editedAt: Date | string;
};

type Comment = {
  id: string;
  content: string;
  sectionType: string;
  status: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  author: Author;
  history?: HistoryEntry[];
  _count?: { history: number };
};

export function CommentCard({
  comment,
  currentUserId,
}: {
  comment: Comment;
  currentUserId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showHistory, setShowHistory] = useState(false);

  const isAuthor = currentUserId === comment.author.id;
  const hasHistory = (comment._count?.history ?? comment.history?.length ?? 0) > 0;

  const statusStyles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800",
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    DECLINED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  };

  async function updateStatus(status: "ACCEPTED" | "DECLINED") {
    setLoading(true);
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success(`Comment ${status.toLowerCase()}.`);
      router.refresh();
    } else toast.error("Failed to update comment.");
  }

  async function handleEdit() {
    if (!editContent.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent.trim() }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Comment updated.");
      setEditing(false);
      router.refresh();
    } else toast.error("Failed to update comment.");
  }

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    setLoading(true);
    const res = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Comment deleted.");
      router.refresh();
    } else toast.error("Failed to delete.");
  }

  const initials = (comment.author.name ?? comment.author.email)
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card-clean p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">
                {comment.author.name ?? comment.author.email}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[comment.status] ?? "bg-muted text-muted-foreground"}`}
              >
                {comment.status}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {comment.sectionType.replace(/_/g, " ")}
              </span>
              {hasHistory && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <History className="h-3 w-3" />
                  Edited
                </button>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
              {isAuthor && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={loading || !editContent.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
              {comment.content}
            </p>
          )}

          {/* Edit history */}
          {showHistory && comment.history && comment.history.length > 0 && (
            <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Edit History
              </p>
              {comment.history.map((h) => (
                <div
                  key={h.id}
                  className="border-l-2 border-border pl-3 py-1"
                >
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.editedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {h.previousContent}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions for pending */}
      {comment.status === "PENDING" && (
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border">
          <button
            onClick={() => updateStatus("ACCEPTED")}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
          >
            <Check className="h-3 w-3" /> Accept
          </button>
          <button
            onClick={() => updateStatus("DECLINED")}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
          >
            <X className="h-3 w-3" /> Decline
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
