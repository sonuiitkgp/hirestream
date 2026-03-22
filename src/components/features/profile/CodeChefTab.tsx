"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Code2, ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { FullProfile } from "@/types";

const starColors: Record<string, string> = {
  "1★": "text-zinc-400",
  "2★": "text-emerald-500",
  "3★": "text-blue-500",
  "4★": "text-violet-500",
  "5★": "text-yellow-500",
  "6★": "text-orange-500",
  "7★": "text-red-500",
};

export function CodeChefTab({ profile }: { profile: FullProfile }) {
  const router = useRouter();
  const cc = profile.codechefProfile;
  const [editing, setEditing] = useState(!cc);
  const [form, setForm] = useState({
    username: cc?.username ?? "",
    rating: cc?.rating?.toString() ?? "",
    maxRating: cc?.maxRating?.toString() ?? "",
    globalRank: cc?.globalRank?.toString() ?? "",
    solved: cc?.solved?.toString() ?? "",
    stars: cc?.stars ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ username?: string }>({});

  async function handleSave() {
    if (!form.username.trim()) { setErrors({ username: "Username is required" }); return; }
    setSaving(true);
    const res = await fetch("/api/profile/codechef", {
      method: cc ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username,
        rating: form.rating ? Number(form.rating) : null,
        maxRating: form.maxRating ? Number(form.maxRating) : null,
        globalRank: form.globalRank ? Number(form.globalRank) : null,
        solved: form.solved ? Number(form.solved) : null,
        stars: form.stars || null,
        profileId: profile.id,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("CodeChef profile saved.");
      setEditing(false); setErrors({});
      router.refresh();
    } else {
      toast.error("Failed to save. Please try again.");
    }
  }

  if (!cc && !editing) return null;

  return (
    <div className="section-clean space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Code2 className="h-3.5 w-3.5" />
          </span>
          <span>CodeChef Profile</span>
        </h2>
        {cc && !editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all">
            <Pencil className="h-3 w-3" />Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="form-clean space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {cc ? "Edit CodeChef Profile" : "Add CodeChef Profile"}
          </p>
          <div className="space-y-1">
            <Input placeholder="CodeChef username" value={form.username}
              onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setErrors({}); }}
              className={errors.username ? "border-destructive" : ""} />
            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" min="0" placeholder="Current rating" value={form.rating}
              onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} />
            <Input type="number" min="0" placeholder="Max rating" value={form.maxRating}
              onChange={e => setForm(f => ({ ...f, maxRating: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input type="number" min="0" placeholder="Global rank" value={form.globalRank}
              onChange={e => setForm(f => ({ ...f, globalRank: e.target.value }))} />
            <Input type="number" min="0" placeholder="Problems solved" value={form.solved}
              onChange={e => setForm(f => ({ ...f, solved: e.target.value }))} />
            <Input placeholder="Stars (e.g. 4★)" value={form.stars}
              onChange={e => setForm(f => ({ ...f, stars: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="px-5">
              {saving ? "Saving…" : "Save"}
            </Button>
            {cc && (
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setErrors({}); }} className="rounded-full">
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : cc && (
        <div className="card-clean p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground text-2xl font-bold">
                {cc.username[0]?.toUpperCase()}
              </div>
              {cc.stars && (
                <span className={`absolute -bottom-1 -right-1 text-sm font-bold ${starColors[cc.stars] ?? "text-muted-foreground"}`}>
                  {cc.stars}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold">{cc.username}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {cc.rating && (
                  <div className="flex flex-col items-center rounded-xl bg-muted px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">Rating</span>
                    <span className="text-sm text-primary font-bold">{cc.rating}</span>
                  </div>
                )}
                {cc.maxRating && (
                  <div className="flex flex-col items-center rounded-xl bg-muted px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">Max</span>
                    <span className="text-sm font-semibold">{cc.maxRating}</span>
                  </div>
                )}
                {cc.solved && (
                  <div className="flex flex-col items-center rounded-xl bg-muted px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">Solved</span>
                    <span className="text-sm font-semibold">{cc.solved}</span>
                  </div>
                )}
                {cc.globalRank && (
                  <div className="flex flex-col items-center rounded-xl bg-muted px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">Rank</span>
                    <span className="text-sm font-semibold">#{cc.globalRank}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <a href={`https://www.codechef.com/users/${cc.username}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors w-fit">
              <ExternalLink className="h-3.5 w-3.5" />
              View on CodeChef
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
