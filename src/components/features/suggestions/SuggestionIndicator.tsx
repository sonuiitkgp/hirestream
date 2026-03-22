"use client";

import { useState } from "react";
import { MessageSquareDiff } from "lucide-react";

type Suggestion = {
  id: string;
  originalText: string;
  suggestedText: string;
  fieldName: string;
  startOffset?: number | null;
  endOffset?: number | null;
  status: string;
  author: { name: string | null; email: string };
  createdAt: string | Date;
};

export function SuggestionIndicator({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const [expanded, setExpanded] = useState(false);
  const pending = suggestions.filter((s) => s.status === "PENDING");

  if (pending.length === 0) return null;

  return (
    <div className="mt-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
      >
        <MessageSquareDiff className="h-3 w-3" />
        {pending.length} pending suggestion{pending.length !== 1 ? "s" : ""}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {pending.map((s) => (
            <div
              key={s.id}
              className="rounded-md border border-border bg-muted/50 p-2.5 text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium">
                  {s.author.name ?? s.author.email}
                </span>
                <span className="text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <p className="line-through text-red-500 dark:text-red-400">
                  {s.originalText}
                </p>
                <p className="text-emerald-600 dark:text-emerald-400">
                  {s.suggestedText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
