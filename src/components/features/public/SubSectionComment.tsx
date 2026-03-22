"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProfileFeedback } from "./ProfileFeedbackContext";

type Props = {
  profileId: string;
  sectionType: string;
  sectionItemId?: string;
  itemLabel: string;
  children: React.ReactNode;
};

export function SubSectionComment({
  profileId,
  sectionType,
  sectionItemId,
  itemLabel,
  children,
}: Props) {
  const { addItem, highlightedId } = useProfileFeedback();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const feedbackTarget = sectionItemId
    ? `${sectionType}-${sectionItemId}`
    : `${sectionType}-general`;
  const isHighlighted = highlightedId === feedbackTarget;

  async function handleSubmit() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, content: content.trim(), sectionType, sectionItemId }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.success("Comment submitted — it will appear once approved.");
        // Add to sidebar in real-time
        if (data.comment) {
          addItem({
            id: data.comment.id,
            kind: "comment",
            sectionType,
            sectionItemId,
            content: content.trim(),
            status: "PENDING",
            createdAt: new Date().toISOString(),
          });
        }
        setContent("");
        setShowForm(false);
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to submit comment.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      data-feedback-target={feedbackTarget}
      className={`rounded-md transition-all duration-300 ${
        isHighlighted ? "ring-2 ring-primary/40 bg-primary/5" : ""
      }`}
    >
      <div
        onClick={() => { if (!showForm) setShowForm(true); }}
        className="cursor-pointer group"
      >
        <div className="relative">
          {children}
          {!showForm && (
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 rounded-md bg-card border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground shadow-sm">
                <MessageSquare className="h-2.5 w-2.5" />
                Comment
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mt-2 rounded-lg border border-border bg-card p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Comment on {itemLabel}
          </p>
          <Textarea
            placeholder="Share your feedback…"
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving || !content.trim()}
            >
              <Send className="mr-1.5 h-3 w-3" />
              {saving ? "Submitting…" : "Submit"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setContent("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
