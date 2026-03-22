"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  profileId: string;
  sectionType: string;
  sectionItemId?: string;
  fieldName: string;
  currentValue: string;
};

export function SuggestButton({
  profileId,
  sectionType,
  sectionItemId,
  fieldName,
  currentValue,
}: Props) {
  const [open, setOpen] = useState(false);
  const [suggestedText, setSuggestedText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!suggestedText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          sectionType,
          sectionItemId,
          fieldName,
          originalText: currentValue,
          suggestedText: suggestedText.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Suggestion submitted for review.");
        setSuggestedText("");
        setOpen(false);
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to submit suggestion.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        title="Suggest an edit"
      >
        <PenLine className="h-3 w-3" />
        <span className="hidden sm:inline">Suggest</span>
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Suggest an edit to this {fieldName}
        </p>
        <button
          onClick={() => {
            setOpen(false);
            setSuggestedText("");
          }}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="rounded-md bg-muted/50 px-3 py-2">
        <p className="text-xs text-muted-foreground mb-1">Current:</p>
        <p className="text-sm text-foreground/70 line-clamp-3">{currentValue}</p>
      </div>
      <Textarea
        placeholder="Your suggested text…"
        rows={3}
        value={suggestedText}
        onChange={(e) => setSuggestedText(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={saving || !suggestedText.trim()}
        >
          {saving ? "Submitting…" : "Submit Suggestion"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setSuggestedText("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
