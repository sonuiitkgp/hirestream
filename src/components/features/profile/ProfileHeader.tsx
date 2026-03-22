"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  Globe,
  Link2,
  Download,
  Share2,
  Upload,
  AlertTriangle,
  MapPin,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { FullProfile } from "@/types";

const visibilityConfig = {
  PUBLIC: {
    label: "Public",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  },
  PRIVATE: {
    label: "Private link",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  },
  HIDDEN: {
    label: "Hidden",
    color: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  },
};

function hasExistingData(profile: FullProfile): boolean {
  return (
    profile.experiences.length > 0 ||
    profile.projects.length > 0 ||
    profile.internships.length > 0 ||
    profile.academicBgs.length > 0 ||
    profile.extraCurriculars.length > 0 ||
    profile.codechefProfile !== null
  );
}

export function ProfileHeader({ profile }: { profile: FullProfile }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile.user.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const initials = (profile.user.name ?? profile.user.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const vis = visibilityConfig[profile.visibility];
  function validUrl(val: string | null | undefined): string | null {
    const s = val?.trim();
    if (!s || s.toLowerCase() === "not provided") return null;
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    if (s.includes(".")) return `https://${s}`;
    return null;
  }
  const linkedin = validUrl(profile.linkedin);
  const github = validUrl(profile.github);
  const website = validUrl(profile.website);
  const hasSocials = !!(linkedin || github || website);

  async function handleSaveName() {
    const trimmed = nameValue.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/profile/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        toast.success("Name updated.");
        setEditingName(false);
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? "Failed to update name.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSavingName(false);
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (hasExistingData(profile)) {
      setPendingFile(file);
      setShowWarning(true);
    } else {
      doUpload(file, false);
    }
  }

  async function doUpload(file: File, replace: boolean) {
    setShowWarning(false);
    setPendingFile(null);
    setUploading(true);
    toast.loading("Parsing resume…", { id: "upload" });
    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("replace", String(replace));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Resume uploaded and profile updated.", { id: "upload" });
        router.refresh();
      } else {
        toast.error(body.error ?? "Upload failed. Please try again.", { id: "upload" });
      }
    } catch {
      toast.error("Network error — could not reach server.", { id: "upload" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Dialog
        open={showWarning}
        onOpenChange={(open) => {
          if (!open) {
            setShowWarning(false);
            setPendingFile(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Replace existing profile data?
            </DialogTitle>
            <DialogDescription>
              Your profile already has data. Uploading a new resume will{" "}
              <strong>delete and replace</strong> all existing sections. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => {
                setShowWarning(false);
                setPendingFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => pendingFile && doUpload(pendingFile, false)}
            >
              Keep existing, add only new
            </Button>
            <Button
              variant="destructive"
              onClick={() => pendingFile && doUpload(pendingFile, true)}
            >
              Replace everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Avatar + identity */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 ring-1 ring-border">
              <AvatarImage src={profile.user.image ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {editingName ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") { setEditingName(false); setNameValue(profile.user.name ?? ""); }
                    }}
                    className="h-8 w-48 text-base font-semibold"
                    autoFocus
                    disabled={savingName}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName || !nameValue.trim()}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameValue(profile.user.name ?? ""); }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center gap-1.5">
                  <h1 className="text-xl font-semibold text-foreground">
                    {profile.user.name ?? "Unnamed User"}
                  </h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    title="Edit name"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
              {profile.headline && (
                <p className="mt-0.5 max-w-sm truncate text-sm text-muted-foreground">
                  {profile.headline}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${vis.color}`}
                >
                  {vis.label}
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Link2 className="h-4 w-4" />
                </Button>
              </a>
            )}
            {github && (
              <a href={github} target="_blank" rel="noreferrer">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <GitBranch className="h-4 w-4" />
                </Button>
              </a>
            )}
            {website && (
              <a href={website} target="_blank" rel="noreferrer">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                </Button>
              </a>
            )}
            {hasSocials && <div className="mx-0.5 h-5 w-px bg-border" />}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              disabled={uploading}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {uploading ? "Uploading…" : "Upload Resume"}
            </Button>
            <a href="/profile/print" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download PDF
              </Button>
            </a>
            <a href={`/p/${profile.shareToken}`} target="_blank" rel="noreferrer">
              <Button size="sm">
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Share Profile
              </Button>
            </a>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
