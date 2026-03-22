"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MessageSquareDiff,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProfileFeedback, type FeedbackItem } from "./ProfileFeedbackContext";

export function FeedbackSidebar() {
  const router = useRouter();
  const { items, highlightedId, setHighlightedId } = useProfileFeedback();
  const [visible, setVisible] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "suggestions" | "comments">("all");
  const sidebarRef = useRef<HTMLDivElement>(null);

  const suggestions = items.filter((i) => i.kind === "suggestion");
  const comments = items.filter((i) => i.kind === "comment");

  const filtered =
    activeTab === "suggestions"
      ? suggestions
      : activeTab === "comments"
        ? comments
        : items;

  const pending = filtered.filter((i) => i.status === "PENDING");
  const resolved = filtered.filter((i) => i.status !== "PENDING");
  const totalPending = items.filter((i) => i.status === "PENDING").length;

  // Build a target key for mapping to profile sections
  function targetKey(item: FeedbackItem): string {
    if (item.sectionItemId) return `${item.sectionType}-${item.sectionItemId}`;
    return `${item.sectionType}-${item.fieldName ?? "general"}`;
  }

  // Scroll to and highlight target element
  const scrollToTarget = useCallback(
    (item: FeedbackItem) => {
      const key = targetKey(item);
      const el = document.querySelector(`[data-feedback-target="${key}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(key);
        setTimeout(() => setHighlightedId(null), 2000);
      }
    },
    [setHighlightedId],
  );

  async function handleWithdraw(item: FeedbackItem) {
    setLoading(item.id);
    try {
      const endpoint =
        item.kind === "suggestion"
          ? `/api/suggestions/${item.id}`
          : `/api/comments/${item.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        toast.success(
          item.kind === "suggestion"
            ? "Suggestion withdrawn."
            : "Comment deleted.",
        );
        router.refresh();
      } else {
        toast.error("Failed to withdraw.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleEdit(item: FeedbackItem) {
    if (!editText.trim()) return;
    setLoading(item.id);
    try {
      const endpoint =
        item.kind === "suggestion"
          ? `/api/suggestions/${item.id}`
          : `/api/comments/${item.id}`;
      const body =
        item.kind === "suggestion"
          ? { suggestedText: editText.trim() }
          : { content: editText.trim() };
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Updated.");
        setEditingId(null);
        setEditText("");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to update.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(null);
    }
  }

  if (items.length === 0) return null;

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
          {totalPending > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {totalPending}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className="fixed right-0 top-14 bottom-0 w-[272px] border-l border-border bg-card overflow-y-auto z-30"
    >
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquareDiff className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">My Feedback</span>
          {totalPending > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {totalPending}
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

      {/* Tabs */}
      <div className="sticky top-[41px] bg-card border-b border-border flex">
        {(["all", "suggestions", "comments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {tab === "all" && ` (${items.length})`}
            {tab === "suggestions" && ` (${suggestions.length})`}
            {tab === "comments" && ` (${comments.length})`}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="p-2 space-y-2">
        {pending.length > 0 && (
          <>
            <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pending
            </p>
            {pending.map((item) => (
              <FeedbackItemCard
                key={item.id}
                item={item}
                editingId={editingId}
                editText={editText}
                loading={loading}
                highlightedId={highlightedId}
                targetKey={targetKey(item)}
                onHover={(hovering) =>
                  setHighlightedId(hovering ? targetKey(item) : null)
                }
                onClick={() => scrollToTarget(item)}
                onStartEdit={(id, text) => {
                  setEditingId(id);
                  setEditText(text);
                }}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditText("");
                }}
                onEditTextChange={setEditText}
                onSaveEdit={() => handleEdit(item)}
                onWithdraw={() => handleWithdraw(item)}
              />
            ))}
          </>
        )}
        {resolved.length > 0 && (
          <>
            <p className="px-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Resolved
            </p>
            {resolved.map((item) => (
              <FeedbackItemCard
                key={item.id}
                item={item}
                editingId={editingId}
                editText={editText}
                loading={loading}
                highlightedId={highlightedId}
                targetKey={targetKey(item)}
                onHover={(hovering) =>
                  setHighlightedId(hovering ? targetKey(item) : null)
                }
                onClick={() => scrollToTarget(item)}
                onStartEdit={(id, text) => {
                  setEditingId(id);
                  setEditText(text);
                }}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditText("");
                }}
                onEditTextChange={setEditText}
                onSaveEdit={() => handleEdit(item)}
                onWithdraw={() => handleWithdraw(item)}
              />
            ))}
          </>
        )}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No {activeTab === "all" ? "feedback" : activeTab} yet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Connector Arrow ── */

function ConnectorArrow({
  sidebarItemRef,
  targetKey,
  visible,
}: {
  sidebarItemRef: React.RefObject<HTMLDivElement | null>;
  targetKey: string;
  visible: boolean;
}) {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setPath(null);
      return;
    }

    function calculate() {
      const sidebarEl = sidebarItemRef.current;
      const targetEl = document.querySelector(
        `[data-feedback-target="${targetKey}"]`,
      );
      if (!sidebarEl || !targetEl) {
        setPath(null);
        return;
      }

      const sRect = sidebarEl.getBoundingClientRect();
      const tRect = targetEl.getBoundingClientRect();

      // Start from left edge of sidebar item, middle vertically
      const sx = sRect.left;
      const sy = sRect.top + sRect.height / 2;

      // End at right edge of target element, middle vertically
      const ex = tRect.right;
      const ey = tRect.top + tRect.height / 2;

      // Cubic bezier curve bowing to the right
      const cpOffset = 40;
      const d = `M ${sx} ${sy} C ${sx - cpOffset} ${sy}, ${ex + cpOffset} ${ey}, ${ex} ${ey}`;
      setPath(d);
    }

    calculate();
    window.addEventListener("scroll", calculate, true);
    window.addEventListener("resize", calculate);
    return () => {
      window.removeEventListener("scroll", calculate, true);
      window.removeEventListener("resize", calculate);
    };
  }, [visible, targetKey, sidebarItemRef]);

  if (!path || !visible) return null;

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-20"
      style={{ width: "100vw", height: "100vh" }}
    >
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.5"
      />
      {/* Arrow head at the end */}
      <circle
        cx={path.split(" ").slice(-2)[0]}
        cy={path.split(" ").slice(-1)[0]}
        r="3"
        fill="hsl(var(--primary))"
        opacity="0.5"
      />
    </svg>
  );
}

/* ── Individual Card ── */

function FeedbackItemCard({
  item,
  editingId,
  editText,
  loading,
  highlightedId,
  targetKey,
  onHover,
  onClick,
  onStartEdit,
  onCancelEdit,
  onEditTextChange,
  onSaveEdit,
  onWithdraw,
}: {
  item: FeedbackItem;
  editingId: string | null;
  editText: string;
  loading: string | null;
  highlightedId: string | null;
  targetKey: string;
  onHover: (hovering: boolean) => void;
  onClick: () => void;
  onStartEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onSaveEdit: () => void;
  onWithdraw: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isEditing = editingId === item.id;
  const isLoading = loading === item.id;
  const isPending = item.status === "PENDING";
  const isHovered = highlightedId === targetKey;

  return (
    <>
      <ConnectorArrow
        sidebarItemRef={cardRef}
        targetKey={targetKey}
        visible={isHovered}
      />
      <div
        ref={cardRef}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onClick}
        className={`rounded-md border bg-background p-2.5 text-xs space-y-1.5 cursor-pointer transition-all duration-200 ${
          isHovered
            ? "border-primary/50 shadow-sm ring-1 ring-primary/20"
            : "border-border hover:border-primary/30"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {item.kind === "suggestion" ? (
              <MessageSquareDiff className="h-2.5 w-2.5" />
            ) : (
              <MessageSquare className="h-2.5 w-2.5" />
            )}
            {item.sectionType.replace(/_/g, " ")}
            {item.fieldName ? ` · ${item.fieldName}` : ""}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              item.status === "PENDING"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                : item.status === "ACCEPTED"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
            }`}
          >
            {item.status}
          </span>
        </div>

        {/* Content */}
        {item.kind === "suggestion" ? (
          <>
            <p className="line-through text-red-500/70 dark:text-red-400/70 line-clamp-2">
              {item.originalText}
            </p>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveEdit();
                    }}
                    disabled={isLoading || !editText.trim()}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px] px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelEdit();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-emerald-600 dark:text-emerald-400 line-clamp-2">
                {item.suggestedText}
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground line-clamp-3">{item.content}</p>
        )}

        {/* Actions */}
        {isPending && !isEditing && (
          <div className="flex items-center gap-1 pt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(
                  item.id,
                  item.kind === "suggestion"
                    ? (item.suggestedText ?? "")
                    : (item.content ?? ""),
                );
              }}
              disabled={isLoading}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Pencil className="h-2.5 w-2.5" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWithdraw();
              }}
              disabled={isLoading}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-2.5 w-2.5" />
              Withdraw
            </button>
          </div>
        )}
      </div>
    </>
  );
}
