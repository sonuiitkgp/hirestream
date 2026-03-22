"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type Candidate = {
  id: string;
  userId: string;
  shareToken: string;
  name: string | null;
  headline: string | null;
  location: string | null;
  score: number;
};

function MessageButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMessage() {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId: userId }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/mailbox/${data.id}`);
    } else {
      toast.error("Could not open conversation.");
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleMessage} disabled={loading} className="rounded-full">
      {loading ? "…" : "Message"}
    </Button>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400" :
    pct >= 60 ? "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400" :
                "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {pct}% match
    </span>
  );
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    let data;
    try {
      data = await res.json();
    } catch {
      setError("Search failed — server returned an invalid response.");
      setResults([]);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Search failed");
      setResults([]);
    } else {
      setResults(data.candidates ?? []);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder='e.g. "React dev with 3 years experience who likes open source"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? "Searching…" : "Search"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 pt-4 pb-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
          <div className="rounded-full bg-muted p-3">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No candidates found</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Try a different query or broaden your criteria</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{results.length} candidate{results.length !== 1 ? "s" : ""} found</p>
          {results.map((c, i) => (
            <Card key={c.id} className="transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-4 py-3 pt-3">
                {/* Rank */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </div>
                {/* Avatar */}
                <Avatar className="shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                    {(c.name ?? "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Info — clickable link to profile */}
                <Link href={`/p/${c.shareToken}`} className="flex-1 min-w-0 group" target="_blank">
                  <div className="font-medium group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {c.name ?? "Anonymous"}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                  {c.headline && (
                    <div className="text-sm text-muted-foreground truncate">{c.headline}</div>
                  )}
                  {c.location && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {c.location}
                    </div>
                  )}
                </Link>
                {/* Score + action */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ScoreBadge score={c.score} />
                  <MessageButton userId={c.userId} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
