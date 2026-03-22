"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Trash2, ArrowRight } from "lucide-react";

type Suggestion = {
  id: string;
  sectionType: string;
  fieldName: string;
  originalText: string;
  suggestedText: string;
  startOffset?: number | null;
  endOffset?: number | null;
  status: string;
  createdAt: string | Date;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export function SuggestionCard({
  suggestion,
}: {
  suggestion: Suggestion;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const statusStyles: Record<string, string> = {
    PENDING:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800",
    ACCEPTED:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    DECLINED:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
  };

  async function handleAction(status: "ACCEPTED" | "DECLINED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(
          status === "ACCEPTED"
            ? "Suggestion accepted — profile updated."
            : "Suggestion declined."
        );
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to update suggestion.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this suggestion?")) return;
    setLoading(true);
    const res = await fetch(`/api/suggestions/${suggestion.id}`, {
      method: "DELETE",
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Suggestion deleted.");
      router.refresh();
    } else toast.error("Failed to delete.");
  }

  const authorName = suggestion.author.name ?? suggestion.author.email;
  const initials = authorName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card-clean p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            {initials}
          </div>
          <div>
            <span className="text-sm font-medium">{authorName}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(suggestion.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[suggestion.status] ?? ""}`}
          >
            {suggestion.status}
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {suggestion.sectionType.replace(/_/g, " ")}
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {suggestion.fieldName}
          </span>
        </div>
      </div>

      {/* Diff view */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex-1 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5">Original</p>
          <p className="text-sm text-red-700 dark:text-red-400 line-through">
            {suggestion.originalText}
          </p>
        </div>
        <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground mt-5 shrink-0" />
        <div className="flex-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5">Suggested</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            {suggestion.suggestedText}
          </p>
        </div>
      </div>

      {/* Actions */}
      {suggestion.status === "PENDING" && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() => handleAction("ACCEPTED")}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
          >
            <Check className="h-3 w-3" /> Accept
          </button>
          <button
            onClick={() => handleAction("DECLINED")}
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
