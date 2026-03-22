"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Loader2,
  ExternalLink,
  MessageCircle,
  MapPin,
  X,
} from "lucide-react";

type Match = {
  profileId: string;
  userId: string;
  shareToken: string;
  name: string | null;
  image: string | null;
  headline: string | null;
  location: string | null;
  score: number;
};

export function FindMatchesButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [open, setOpen] = useState(false);

  async function handleFind() {
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/matches`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to find matches");
        setOpen(false);
        return;
      }
      const data = await res.json();
      setMatches(data.matches);
    } catch {
      toast.error("Network error");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleMessage(userId: string) {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: userId }),
      });
      if (!res.ok) {
        toast.error("Could not open conversation");
        return;
      }
      const { id } = await res.json();
      router.push(`/mailbox/${id}`);
    } catch {
      toast.error("Network error");
    }
  }

  function scoreColor(score: number) {
    if (score >= 0.7) return "text-emerald-600 bg-emerald-500/10";
    if (score >= 0.5) return "text-amber-600 bg-amber-500/10";
    return "text-muted-foreground bg-muted";
  }

  return (
    <>
      <button
        onClick={handleFind}
        disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors"
        title="Find matching profiles"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Users className="h-4 w-4" />
        )}
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-xl border border-border bg-card shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold">Matching Profiles</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {matches
                    ? `${matches.length} profiles ranked by relevance`
                    : "Finding matches…"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : matches && matches.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No matching profiles found
                  </p>
                </div>
              ) : (
                matches?.map((m, i) => (
                  <div
                    key={m.profileId}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Rank */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/p/${m.shareToken}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {m.name ?? "Anonymous"}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${scoreColor(m.score)}`}
                        >
                          {(m.score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      {m.headline && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {m.headline}
                        </p>
                      )}
                      {m.location && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {m.location}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleMessage(m.userId)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors"
                      title="Send message"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
