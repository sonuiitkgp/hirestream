"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderOpen, Pencil, Trash2, Plus, ExternalLink, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MarkdownDescription } from "@/components/ui/markdown-description";
import type { FullProfile } from "@/types";
import type { Project } from "@/generated/prisma/client";

const EMPTY_FORM = { name: "", description: "", techStack: "", url: "", repoUrl: "" };

function isValidUrl(url: string) {
  if (!url) return true;
  try { new URL(url); return true; } catch { return false; }
}

export function ProjectsTab({ profile }: { profile: FullProfile }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; url?: string; repoUrl?: string }>({});
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const e: { name?: string; url?: string; repoUrl?: string } = {};
    if (!form.name.trim()) e.name = "Project name is required";
    if (form.url && !isValidUrl(form.url)) e.url = "Enter a valid URL (include https://)";
    if (form.repoUrl && !isValidUrl(form.repoUrl)) e.repoUrl = "Enter a valid URL (include https://)";
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const url = editingId ? `/api/profile/project/${editingId}` : "/api/profile/project";
    const techStack = form.techStack.split(",").map((t) => t.trim()).filter(Boolean);
    const body = editingId ? { ...form, techStack } : { ...form, techStack, profileId: profile.id };
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Project saved.");
      setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({});
      router.refresh();
    } else {
      toast.error("Failed to save. Please try again.");
    }
  }

  function handleCancel() {
    setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({});
  }

  function startEdit(proj: Project) {
    setEditingId(proj.id); setAdding(true);
    setForm({ name: proj.name, description: proj.description ?? "", techStack: proj.techStack.join(", "), url: proj.url ?? "", repoUrl: proj.repoUrl ?? "" });
    setErrors({});
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/profile/project/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); router.refresh(); }
    else toast.error("Failed to delete.");
  }

  return (
    <div className="section-clean space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderOpen className="h-3.5 w-3.5" />
          </span>
          <span>Projects</span>
        </h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding || editingId !== null}
          className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />Add
        </Button>
      </div>

      {adding && (
        <div className="form-clean space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {editingId ? "Edit Project" : "New Project"}
          </p>
          <div className="space-y-1">
            <Input placeholder="Project name" value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors({}); }}
              className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <Textarea placeholder="Description" rows={3} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <Input placeholder="Tech stack (comma-separated: React, Node.js, Postgres)" value={form.techStack}
            onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input placeholder="Live URL (https://...)" value={form.url}
                onChange={e => { setForm(f => ({ ...f, url: e.target.value })); setErrors(v => ({ ...v, url: undefined })); }}
                className={errors.url ? "border-destructive" : ""} />
              {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
            </div>
            <div className="space-y-1">
              <Input placeholder="Repo URL (https://...)" value={form.repoUrl}
                onChange={e => { setForm(f => ({ ...f, repoUrl: e.target.value })); setErrors(v => ({ ...v, repoUrl: undefined })); }}
                className={errors.repoUrl ? "border-destructive" : ""} />
              {errors.repoUrl && <p className="text-xs text-destructive">{errors.repoUrl}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="px-5">
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-full">Cancel</Button>
          </div>
        </div>
      )}

      {profile.projects.length === 0 && !adding && (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No projects added yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Showcase your work by adding a project</p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {profile.projects.map((proj: Project) => (
          <div key={proj.id} className="card-clean p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2.5 flex-1 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight truncate">{proj.name}</div>
                  {proj.description && (
                    <MarkdownDescription content={proj.description} className="mt-1" />
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => startEdit(proj)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(proj.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {proj.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {proj.techStack.map((t: string) => (
                  <Badge key={t} variant="secondary"
                    className="text-xs rounded-md">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            {(proj.url || proj.repoUrl) && (
              <div className="flex gap-2 pt-1 border-t border-border">
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                    <ExternalLink className="h-3 w-3" />Live
                  </a>
                )}
                {proj.repoUrl && (
                  <a href={proj.repoUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <GitBranch className="h-3 w-3" />Repo
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
