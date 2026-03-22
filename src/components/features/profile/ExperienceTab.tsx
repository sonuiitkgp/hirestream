"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase, Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MarkdownDescription } from "@/components/ui/markdown-description";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { FullProfile } from "@/types";
import type { Experience } from "@/generated/prisma/client";

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function toDateInput(d: Date | string | null | undefined) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

const EMPTY_FORM = {
  company: "", role: "", startDate: "", endDate: "", current: false, description: "", location: "",
};

export function ExperienceTab({ profile }: { profile: FullProfile }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.company.trim()) e.company = "Company is required";
    if (!form.role.trim()) e.role = "Role is required";
    if (!form.startDate) e.startDate = "Start date is required";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const url = editingId ? `/api/profile/experience/${editingId}` : "/api/profile/experience";
    const body = editingId ? { ...form } : { ...form, profileId: profile.id };
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Experience saved.");
      setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({});
      router.refresh();
    } else {
      toast.error("Failed to save. Please try again.");
    }
  }

  function handleCancel() {
    setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({});
  }

  function startEdit(exp: Experience) {
    setEditingId(exp.id); setAdding(true);
    setForm({ company: exp.company, role: exp.role, startDate: toDateInput(exp.startDate), endDate: toDateInput(exp.endDate), current: exp.current, description: exp.description ?? "", location: exp.location ?? "" });
    setErrors({});
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this experience entry?")) return;
    const res = await fetch(`/api/profile/experience/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); router.refresh(); }
    else toast.error("Failed to delete.");
  }

  return (
    <div className="section-clean space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="h-3.5 w-3.5" />
          </span>
          <span>Work Experience</span>
        </h2>
        <Button
          size="sm"
          onClick={() => setAdding(true)}
          disabled={adding || editingId !== null}
          className="h-8 gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {/* Form */}
      {adding && (
        <div className="form-clean space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {editingId ? "Edit Experience" : "New Experience"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input placeholder="Company" value={form.company}
                onChange={e => { setForm(f => ({ ...f, company: e.target.value })); setErrors(v => ({ ...v, company: undefined })); }}
                className={errors.company ? "border-destructive" : ""} />
              {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
            </div>
            <div className="space-y-1">
              <Input placeholder="Role / Title" value={form.role}
                onChange={e => { setForm(f => ({ ...f, role: e.target.value })); setErrors(v => ({ ...v, role: undefined })); }}
                className={errors.role ? "border-destructive" : ""} />
              {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 items-start">
            <div className="space-y-1">
              <Input type="date" value={form.startDate}
                onChange={e => { setForm(f => ({ ...f, startDate: e.target.value })); setErrors(v => ({ ...v, startDate: undefined })); }}
                className={errors.startDate ? "border-destructive" : ""} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>
            <Input type="date" value={form.endDate} disabled={form.current}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            <div className="flex items-center gap-2 pt-1.5">
              <Checkbox id="exp-current" checked={form.current}
                onCheckedChange={(v) => setForm(f => ({ ...f, current: !!v, endDate: "" }))} />
              <Label htmlFor="exp-current" className="text-sm font-normal">Current</Label>
            </div>
          </div>
          <Input placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <Textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="px-5">
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-full">Cancel</Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {profile.experiences.length === 0 && !adding && (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No experience added yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Add your work history to strengthen your profile</p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {profile.experiences.map((exp: Experience) => (
          <div key={exp.id} className="card-clean p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight">{exp.role}</div>
                  <div className="text-sm text-muted-foreground">{exp.company}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted/60 px-2 py-0.5">
                      {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                    {exp.current && <Badge variant="secondary" className="text-xs">Current</Badge>}
                    {exp.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {exp.location}</span>}
                  </div>
                  {exp.description && <MarkdownDescription content={exp.description} className="mt-2" />}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => startEdit(exp)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(exp.id)}
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
