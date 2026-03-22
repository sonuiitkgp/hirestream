"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MarkdownDescription } from "@/components/ui/markdown-description";
import type { FullProfile } from "@/types";
import type { AcademicBackground } from "@/generated/prisma/client";

const EMPTY_FORM = { institution: "", degree: "", field: "", startYear: "", endYear: "", gpa: "", current: false, description: "" };

export function AcademicTab({ profile }: { profile: FullProfile }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM> & { gpa?: string }>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.institution.trim()) e.institution = "Institution is required";
    if (!form.degree.trim()) e.degree = "Degree is required";
    if (!form.field.trim()) e.field = "Field of study is required";
    if (!form.startYear) e.startYear = "Start year is required";
    const currentYear = new Date().getFullYear();
    if (form.startYear && (Number(form.startYear) < 1900 || Number(form.startYear) > currentYear + 10))
      e.startYear = "Enter a valid year";
    if (form.gpa && (Number(form.gpa) < 0 || Number(form.gpa) > 10))
      e.gpa = "GPA must be between 0 and 10";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const url = editingId ? `/api/profile/academic/${editingId}` : "/api/profile/academic";
    const sharedBody = {
      ...form,
      startYear: Number(form.startYear),
      endYear: form.current ? null : Number(form.endYear) || null,
      gpa: form.gpa ? Number(form.gpa) : null,
    };
    const body = editingId ? sharedBody : { ...sharedBody, profileId: profile.id };
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Academic entry saved.");
      setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({});
      router.refresh();
    } else {
      toast.error("Failed to save. Please try again.");
    }
  }

  function handleCancel() { setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({}); }

  function startEdit(acad: AcademicBackground) {
    setEditingId(acad.id); setAdding(true);
    setForm({ institution: acad.institution, degree: acad.degree, field: acad.field, startYear: acad.startYear.toString(), endYear: acad.endYear?.toString() ?? "", gpa: acad.gpa?.toString() ?? "", current: acad.current, description: acad.description ?? "" });
    setErrors({});
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this academic entry?")) return;
    const res = await fetch(`/api/profile/academic/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Deleted."); router.refresh(); }
    else toast.error("Failed to delete.");
  }

  return (
    <div className="section-clean space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-3.5 w-3.5" />
          </span>
          <span>Academic Background</span>
        </h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding || editingId !== null}
          className="h-8 gap-1.5">
          <Plus className="h-3.5 w-3.5" />Add
        </Button>
      </div>

      {adding && (
        <div className="form-clean space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {editingId ? "Edit Academic Entry" : "New Academic Entry"}
          </p>
          <div className="space-y-1">
            <Input placeholder="Institution" value={form.institution}
              onChange={e => { setForm(f => ({ ...f, institution: e.target.value })); setErrors(v => ({ ...v, institution: undefined })); }}
              className={errors.institution ? "border-destructive" : ""} />
            {errors.institution && <p className="text-xs text-destructive">{errors.institution}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Input placeholder="Degree (e.g. B.Tech)" value={form.degree}
                onChange={e => { setForm(f => ({ ...f, degree: e.target.value })); setErrors(v => ({ ...v, degree: undefined })); }}
                className={errors.degree ? "border-destructive" : ""} />
              {errors.degree && <p className="text-xs text-destructive">{errors.degree}</p>}
            </div>
            <div className="space-y-1">
              <Input placeholder="Field of study" value={form.field}
                onChange={e => { setForm(f => ({ ...f, field: e.target.value })); setErrors(v => ({ ...v, field: undefined })); }}
                className={errors.field ? "border-destructive" : ""} />
              {errors.field && <p className="text-xs text-destructive">{errors.field}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 items-start">
            <div className="space-y-1">
              <Input type="number" placeholder="Start year" value={form.startYear}
                onChange={e => { setForm(f => ({ ...f, startYear: e.target.value })); setErrors(v => ({ ...v, startYear: undefined })); }}
                className={errors.startYear ? "border-destructive" : ""} />
              {errors.startYear && <p className="text-xs text-destructive">{errors.startYear}</p>}
            </div>
            <Input type="number" placeholder="End year" value={form.endYear} disabled={form.current}
              onChange={e => setForm(f => ({ ...f, endYear: e.target.value }))} />
            <div className="space-y-1">
              <Input type="number" step="0.01" placeholder="GPA" value={form.gpa}
                onChange={e => { setForm(f => ({ ...f, gpa: e.target.value })); setErrors(v => ({ ...v, gpa: undefined })); }}
                className={errors.gpa ? "border-destructive" : ""} />
              {errors.gpa && <p className="text-xs text-destructive">{errors.gpa}</p>}
            </div>
            <div className="flex items-center gap-2 pt-1.5">
              <Checkbox id="acad-current" checked={form.current}
                onCheckedChange={(v) => setForm(f => ({ ...f, current: !!v }))} />
              <Label htmlFor="acad-current" className="text-sm font-normal">Ongoing</Label>
            </div>
          </div>
          <Textarea placeholder="Description / achievements" rows={2} value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving} className="px-5">
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-full">Cancel</Button>
          </div>
        </div>
      )}

      {profile.academicBgs.length === 0 && !adding && (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No academic background added yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Add your education details</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {profile.academicBgs.map((acad: AcademicBackground) => (
          <div key={acad.id} className="card-clean p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight">{acad.degree} in {acad.field}</div>
                  <div className="text-sm text-muted-foreground">{acad.institution}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted/60 px-2 py-0.5">
                      {acad.startYear} – {acad.current ? "Ongoing" : (acad.endYear ?? "—")}
                    </span>
                    {acad.current && <Badge variant="secondary" className="text-xs">Ongoing</Badge>}
                    {acad.gpa && <Badge variant="outline" className="text-xs">GPA {acad.gpa}</Badge>}
                  </div>
                  {acad.description && <MarkdownDescription content={acad.description} className="mt-2" />}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => startEdit(acad)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(acad.id)}
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
