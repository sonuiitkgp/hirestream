"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProfileFeedback } from "@/components/features/public/ProfileFeedbackContext";

type Props = {
  profileId: string;
  sectionType: string;
  sectionItemId?: string;
  fieldName: string;
  fullText: string;
};

/**
 * Split text into sentences, preserving whitespace between them.
 */
function splitSentences(text: string): { text: string; start: number }[] {
  const parts: { text: string; start: number }[] = [];
  // Split on sentence-ending punctuation followed by space, or on newlines
  const regex = /[^.!?\n]+[.!?]*[\s]*/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const t = match[0];
    if (t.trim()) {
      parts.push({ text: t, start: match.index });
    }
  }
  if (parts.length === 0 && text.trim()) {
    parts.push({ text, start: 0 });
  }
  return parts;
}

export function TextSelectionSuggest({
  profileId,
  sectionType,
  sectionItemId,
  fieldName,
  fullText,
}: Props) {
  const { addItem, highlightedId } = useProfileFeedback();
  const containerRef = useRef<HTMLDivElement>(null);
  const feedbackTarget = sectionItemId
    ? `${sectionType}-${sectionItemId}`
    : `${sectionType}-${fieldName}`;
  const isHighlighted = highlightedId === feedbackTarget;

  const [selection, setSelection] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
    rect: DOMRect;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [suggestedText, setSuggestedText] = useState("");
  const [saving, setSaving] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const sentences = useMemo(() => splitSentences(fullText), [fullText]);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) {
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    const range = sel.getRangeAt(0);
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    const startIdx = fullText.indexOf(selectedText);
    if (startIdx === -1) return;

    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setSelection({
      text: selectedText,
      startOffset: startIdx,
      endOffset: startIdx + selectedText.length,
      rect: new DOMRect(
        rect.left - containerRect.left,
        rect.bottom - containerRect.top,
        rect.width,
        rect.height
      ),
    });
  }, [fullText]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        selection &&
        !showForm &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSelection(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selection, showForm]);

  function handleSuggestClick() {
    if (!selection) return;
    setSuggestedText(selection.text);
    setShowForm(true);
  }

  function handleSentenceClick(sentence: { text: string; start: number }) {
    const trimmed = sentence.text.trim();
    setSelection({
      text: trimmed,
      startOffset: sentence.start,
      endOffset: sentence.start + trimmed.length,
      rect: new DOMRect(0, 0, 0, 0), // not used for sentence click
    });
    setSuggestedText(trimmed);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!suggestedText.trim() || !selection) return;
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
          originalText: selection.text,
          suggestedText: suggestedText.trim(),
          startOffset: selection.startOffset,
          endOffset: selection.endOffset,
        }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.success("Suggestion submitted for review.");
        // Add to sidebar in real-time
        if (data.suggestion) {
          addItem({
            id: data.suggestion.id,
            kind: "suggestion",
            sectionType,
            fieldName,
            sectionItemId,
            originalText: selection.text,
            suggestedText: suggestedText.trim(),
            status: "PENDING",
            createdAt: new Date().toISOString(),
          });
        }
        setSuggestedText("");
        setShowForm(false);
        setSelection(null);
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

  function handleCancel() {
    setShowForm(false);
    setSelection(null);
    setSuggestedText("");
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-md transition-all duration-300 ${
        isHighlighted ? "ring-2 ring-primary/40 bg-primary/5" : ""
      }`}
      data-feedback-target={feedbackTarget}
      onMouseUp={handleMouseUp}
    >
      {/* Render text with sentence-level hover highlighting */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {sentences.map((s, i) => (
          <span
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => handleSentenceClick(s)}
            className={`transition-colors duration-150 rounded-sm cursor-pointer ${
              hoveredIdx === i
                ? "bg-primary/10 text-foreground"
                : ""
            }`}
          >
            {s.text}
          </span>
        ))}
      </p>

      {/* Floating suggest button (for text selection) */}
      {selection && !showForm && selection.rect.width > 0 && (
        <div
          className="absolute z-50"
          style={{
            left: selection.rect.left + selection.rect.width / 2 - 60,
            top: selection.rect.top + selection.rect.height + 4,
          }}
        >
          <button
            onClick={handleSuggestClick}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md hover:bg-muted transition-colors"
          >
            <PenLine className="h-3 w-3 text-primary" />
            Suggest edit
          </button>
        </div>
      )}

      {/* Inline suggestion form */}
      {showForm && selection && (
        <div className="mt-3 rounded-lg border border-primary/20 bg-card p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Suggest a change
          </p>
          <div className="rounded-md bg-red-50 dark:bg-red-950/30 px-3 py-2 border border-red-200 dark:border-red-900">
            <p className="text-xs text-muted-foreground mb-0.5">Original:</p>
            <p className="text-sm line-through text-red-600 dark:text-red-400">
              {selection.text}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Suggested:</p>
            <Textarea
              value={suggestedText}
              onChange={(e) => setSuggestedText(e.target.value)}
              rows={2}
              className="border-emerald-200 dark:border-emerald-900 focus-visible:ring-emerald-500/20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={saving || !suggestedText.trim()}
            >
              {saving ? "Submitting…" : "Submit"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
