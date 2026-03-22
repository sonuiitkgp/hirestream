"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const EMPTY = { title: "", description: "", location: "", remote: false, salaryMin: "", salaryMax: "", reqInput: "" };

export function CreateJobDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  function addReq() {
    const val = form.reqInput.trim();
    if (!val || requirements.includes(val)) return;
    setRequirements((r) => [...r, val]);
    setForm((f) => ({ ...f, reqInput: "" }));
  }

  async function handleSubmit() {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim(),
        requirements,
        location: form.location.trim() || null,
        remote: form.remote,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Job posted successfully.");
      setOpen(false);
      setForm(EMPTY);
      setRequirements([]);
      setErrors({});
      router.refresh();
    } else {
      toast.error("Failed to post job. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-9 gap-1.5 rounded-full px-5 text-sm font-semibold" />
        }
      >
        <Plus className="h-4 w-4" />
        Post Job
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Job Title</Label>
            <Input placeholder="e.g. Senior React Developer" value={form.title}
              onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors((v) => ({ ...v, title: undefined })); }}
              className={errors.title ? "border-destructive" : ""} />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea placeholder="Describe the role, responsibilities, and ideal candidate…" rows={4}
              value={form.description}
              onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); setErrors((v) => ({ ...v, description: undefined })); }}
              className={errors.description ? "border-destructive" : ""} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input placeholder="Add requirement (press Enter)" value={form.reqInput}
                onChange={(e) => setForm((f) => ({ ...f, reqInput: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addReq())} />
              <Button type="button" size="sm" variant="secondary" onClick={addReq} className="shrink-0">Add</Button>
            </div>
            {requirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {requirements.map((req) => (
                  <Badge key={req} variant="secondary" className="gap-1 pl-2.5">
                    {req}
                    <button onClick={() => setRequirements((r) => r.filter((x) => x !== req))}
                      className="rounded-full hover:bg-destructive/20 p-0.5 transition-colors">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Location</Label>
              <Input placeholder="e.g. Mumbai, India" value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="flex items-end gap-2 pb-0.5">
              <Checkbox id="remote" checked={form.remote}
                onCheckedChange={(v) => setForm((f) => ({ ...f, remote: !!v }))} />
              <Label htmlFor="remote" className="font-normal">Remote friendly</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Min Salary (₹/yr)</Label>
              <Input type="number" placeholder="e.g. 600000" value={form.salaryMin}
                onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Max Salary (₹/yr)</Label>
              <Input type="number" placeholder="e.g. 1200000" value={form.salaryMax}
                onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="rounded-full px-6">
              {saving ? "Posting…" : "Post Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
