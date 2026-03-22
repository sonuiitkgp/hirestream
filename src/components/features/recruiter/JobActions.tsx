"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Power } from "lucide-react";

export function JobActions({ jobId, isActive }: { jobId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    if (res.ok) { toast.success(isActive ? "Job deactivated." : "Job activated."); router.refresh(); }
    else toast.error("Failed to update job.");
  }

  async function handleDelete() {
    if (!confirm("Delete this job posting?")) return;
    setLoading(true);
    const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) { toast.success("Job deleted."); router.refresh(); }
    else toast.error("Failed to delete job.");
  }

  return (
    <div className="flex shrink-0 gap-1">
      <button onClick={toggleActive} disabled={loading}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive ? "text-emerald-500 hover:bg-emerald-500/10" : "text-muted-foreground hover:bg-muted"}`}
        title={isActive ? "Deactivate" : "Activate"}>
        <Power className="h-4 w-4" />
      </button>
      <button onClick={handleDelete} disabled={loading}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        title="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
