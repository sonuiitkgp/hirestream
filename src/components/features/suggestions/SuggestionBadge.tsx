"use client";

import { useState } from "react";
import { MessageSquareDiff, ChevronDown, ChevronUp } from "lucide-react";

type Suggestion = {
  id: string;
  sectionType: string;
  fieldName: string;
  originalText: string;
  suggestedText: string;
  status: string;
  createdAt: string | Date;
  author: { name: string | null; email: string };
};

export function SuggestionBadge({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const [expanded, setExpanded] = useState(false);
  const pending = suggestions.filter((s) => s.status === "PENDING");
  const total = suggestions.length;

  if (total === 0) return null;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <MessageSquareDiff className="h-3.5 w-3.5" />
        {pending.length > 0 ? (
          <span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{pending.length}</span>
            {" pending"}
            {total > pending.length && (
              <span className="text-muted-foreground"> · {total} total</span>
            )}
          </span>
        ) : (
          <span>{total} suggestion{total !== 1 ? "s" : ""}</span>
        )}
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {suggestions.slice(0, 5).map((s) => (
            <div
              key={s.id}
              className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {s.author.name ?? s.author.email}
                  </span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {s.sectionType.replace(/_/g, " ")} · {s.fieldName}
                  </span>
                </div>
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
              <div className="flex items-start gap-2">
                <span className="line-through text-red-500 dark:text-red-400 flex-1 line-clamp-1">
                  {s.originalText}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex-1 line-clamp-1">
                  {s.suggestedText}
                </span>
              </div>
            </div>
          ))}
          {suggestions.length > 5 && (
            <a
              href="/profile/suggestions"
              className="inline-block text-xs text-primary hover:underline"
            >
              View all {suggestions.length} suggestions →
            </a>
          )}
          {suggestions.length <= 5 && pending.length > 0 && (
            <a
              href="/profile/suggestions"
              className="inline-block text-xs text-primary hover:underline"
            >
              Review suggestions →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
