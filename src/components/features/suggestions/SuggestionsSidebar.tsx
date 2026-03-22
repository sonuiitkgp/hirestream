"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MessageSquareDiff,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Suggestion = {
  id: string;
  sectionType: string;
  fieldName: string;
  originalText: string;
  suggestedText: string;
  status: string;
  createdAt: string | Date;
};

export function SuggestionsSidebar({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  const pending = suggestions.filter((s) => s.status === "PENDING");
  const resolved = suggestions.filter((s) => s.status !== "PENDING");

  async function handleWithdraw(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Suggestion withdrawn.");
        router.refresh();
      } else {
        toast.error("Failed to withdraw suggestion.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleEdit(id: string) {
    if (!editText.trim()) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestedText: editText.trim() }),
      });
      if (res.ok) {
        toast.success("Suggestion updated.");
        setEditingId(null);
        setEditText("");
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to update.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(null);
    }
  }

  // Collapsed toggle
  if (!visible) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30">
        <button
          onClick={() => setVisible(true)}
          className="flex items-center gap-1 rounded-l-lg border border-r-0 border-border bg-card px-2 py-3 shadow-sm hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <MessageSquareDiff className="h-3.5 w-3.5 text-primary" />
          {pending.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {pending.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[272px] border-l border-border bg-card overflow-y-auto z-30">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquareDiff className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">My Suggestions</span>
          {pending.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {pending.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Suggestions list */}
      <div className="p-2 space-y-2">
        {pending.length > 0 && (
          <>
            <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pending
            </p>
            {pending.map((s) => (
              <SuggestionItem
                key={s.id}
                suggestion={s}
                editingId={editingId}
                editText={editText}
                loading={loading}
                onStartEdit={(id, text) => {
                  setEditingId(id);
                  setEditText(text);
                }}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditText("");
                }}
                onEditTextChange={setEditText}
                onSaveEdit={handleEdit}
                onWithdraw={handleWithdraw}
              />
            ))}
          </>
        )}
        {resolved.length > 0 && (
          <>
            <p className="px-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Resolved
            </p>
            {resolved.map((s) => (
              <SuggestionItem
                key={s.id}
                suggestion={s}
                editingId={editingId}
                editText={editText}
                loading={loading}
                onStartEdit={(id, text) => {
                  setEditingId(id);
                  setEditText(text);
                }}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditText("");
                }}
                onEditTextChange={setEditText}
                onSaveEdit={handleEdit}
                onWithdraw={handleWithdraw}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SuggestionItem({
  suggestion: s,
  editingId,
  editText,
  loading,
  onStartEdit,
  onCancelEdit,
  onEditTextChange,
  onSaveEdit,
  onWithdraw,
}: {
  suggestion: Suggestion;
  editingId: string | null;
  editText: string;
  loading: string | null;
  onStartEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onSaveEdit: (id: string) => void;
  onWithdraw: (id: string) => void;
}) {
  const isEditing = editingId === s.id;
  const isLoading = loading === s.id;
  const isPending = s.status === "PENDING";

  return (
    <div className="rounded-md border border-border bg-background p-2.5 text-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {s.sectionType.replace(/_/g, " ")} · {s.fieldName}
        </span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            s.status === "PENDING"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
              : s.status === "ACCEPTED"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
          }`}
        >
          {s.status}
        </span>
      </div>

      {/* Original text */}
      <p className="line-through text-red-500/70 dark:text-red-400/70 line-clamp-2">
        {s.originalText}
      </p>

      {/* Suggested text or edit form */}
      {isEditing ? (
        <div className="space-y-1.5">
          <Textarea
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            rows={2}
            className="text-xs"
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() => onSaveEdit(s.id)}
              disabled={isLoading || !editText.trim()}
            >
              <Check className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[11px] px-2"
              onClick={onCancelEdit}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-emerald-600 dark:text-emerald-400 line-clamp-2">
          {s.suggestedText}
        </p>
      )}

      {/* Actions for pending suggestions */}
      {isPending && !isEditing && (
        <div className="flex items-center gap-1 pt-0.5">
          <button
            onClick={() => onStartEdit(s.id, s.suggestedText)}
            disabled={isLoading}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Pencil className="h-2.5 w-2.5" />
            Edit
          </button>
          <button
            onClick={() => onWithdraw(s.id)}
            disabled={isLoading}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-2.5 w-2.5" />
            Withdraw
          </button>
        </div>
      )}
    </div>
  );
}
