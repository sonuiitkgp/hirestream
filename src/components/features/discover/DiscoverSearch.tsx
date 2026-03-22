"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, MapPin, MessageCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type Candidate = {
  id: string;
  userId: string;
  name: string | null;
  headline: string | null;
  location: string | null;
  shareToken: string;
  score: number;
};

function MessageButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMessage(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: userId }),
      });
      if (res.ok) {
        const { id } = await res.json();
        router.push(`/mailbox/${id}`);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors"
      title="Send message"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
    </button>
  );
}

function CandidateCard({ c, rank, currentUserId }: { c: Candidate; rank: number; currentUserId: string }) {
  const initials = (c.name ?? "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const pct = Math.round(c.score * 100);
  const isOwn = c.userId === currentUserId;
  return (
    <Link href={`/p/${c.shareToken}`} className="block group">
    <div className="card-clean p-4 flex items-center gap-4 cursor-pointer group-hover:border-border transition-colors">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {rank}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{c.name ?? "Anonymous"}</div>
        {c.headline && <div className="text-sm text-muted-foreground truncate">{c.headline}</div>}
        {c.location && <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {pct > 0 && (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            pct >= 80 ? "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400" :
            pct >= 60 ? "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400" :
                        "bg-muted text-muted-foreground border-border"
          }`}>
            {pct}% match
          </span>
        )}
        {!isOwn && <MessageButton userId={c.userId} />}
      </div>
    </div>
    </Link>
  );
}

export function DiscoverSearch({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  // Load default (similarity to own profile) on mount
  useEffect(() => {
    loadResults("");
  }, []);

  async function loadResults(q: string) {
    setLoading(true);
    const url = q ? `/api/discover?q=${encodeURIComponent(q)}` : "/api/discover";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setResults(data.candidates ?? []);
    }
    setLoading(false);
  }

  function handleSearch() {
    setSearched(true);
    loadResults(query);
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by skills, interests, or describe who you're looking for…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading && searched ? "Searching…" : "Search"}
        </Button>
      </div>

      {!searched && !loading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-muted-foreground" />
          Showing profiles most similar to yours
        </p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card-clean p-4 flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Compass className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No profiles found</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {searched ? "Try a different search" : "Upload your resume to get personalized recommendations"}
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((c, i) => (
            <CandidateCard key={c.id} c={c} rank={i + 1} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
