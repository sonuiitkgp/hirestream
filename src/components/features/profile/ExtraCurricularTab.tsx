"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trophy, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownDescription } from "@/components/ui/markdown-description";
import type { FullProfile } from "@/types";
import type { ExtraCurricular } from "@/generated/prisma/client";

const EMPTY_FORM = { activity: "", role: "", description: "" };

export function ExtraCurricularTab({ profile }: { profile: FullProfile }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ activity?: string }>({});

  async function handleSave() {
    if (!form.activity.trim()) { setErrors({ activity: "Activity name is required" }); return; }
    setSaving(true);
    const url = editingId ? `/api/profile/extra-curricular/${editingId}` : "/api/profile/extra-curricular";
    const body = editingId ? { ...form } : { ...form, profileId: profile.id };
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Activity saved.");
      setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({});
      router.refresh();
    } else {
      toast.error("Failed to save. Please try again.");
    }
  }

  function handleCancel() { setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({}); }

  function startEdit(ec: ExtraCurricular) {
    setAdding(true); setEditingId(ec.id);
    setForm({ activity: ec.activity, role: ec.role ?? "", description: ec.description ?? "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this activity?")) return;
    const res = await fetch(`/api/profile/extra-curricular/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); router.refresh(); }
    else toast.error("Failed to delete.");
  }

  return (
    <div className="section-clean space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Trophy className="h-3.5 w-3.5" />
          </span>
          <span>Extra Curricular</span>
        </h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding || editingId !== null}
          className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />Add
        </Button>
      </div>

      {adding && (
        <div className="form-clean space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {editingId ? "Edit Activity" : "New Activity"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input placeholder="Activity / Club" value={form.activity}
                onChange={e => { setForm(f => ({ ...f, activity: e.target.value })); setErrors({}); }}
                className={errors.activity ? "border-destructive" : ""} />
              {errors.activity && <p className="text-xs text-destructive">{errors.activity}</p>}
            </div>
            <Input placeholder="Your role (optional)" value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
          </div>
          <Textarea placeholder="Description" rows={2} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="px-5">
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-full">Cancel</Button>
          </div>
        </div>
      )}

      {profile.extraCurriculars.length === 0 && !adding && (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Trophy className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No activities added yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Add clubs, sports, or volunteer work</p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {profile.extraCurriculars.map((ec: ExtraCurricular) => (
          <div key={ec.id} className="card-clean p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-2.5 flex-1 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight">{ec.activity}</div>
                  {ec.role && <div className="mt-0.5 text-sm text-muted-foreground">{ec.role}</div>}
                  {ec.description && <MarkdownDescription content={ec.description} className="mt-1.5" />}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => startEdit(ec)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(ec.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
