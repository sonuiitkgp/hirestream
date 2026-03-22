import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Briefcase, MapPin, Wifi, DollarSign } from "lucide-react";
import { CreateJobDialog } from "@/components/features/recruiter/CreateJobDialog";
import { JobActions } from "@/components/features/recruiter/JobActions";
import { FindMatchesButton } from "@/components/features/recruiter/FindMatchesButton";

export default async function JobsPage() {
  const session = await auth();
  if (!session || session.user.role !== "RECRUITER") redirect("/profile");

  const jobs = await db.job.findMany({
    where: { recruiterId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">My Jobs</h1>
            <p className="text-xs text-muted-foreground">{jobs.length} posting{jobs.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <CreateJobDialog />
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">No jobs posted yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Post your first job to start finding candidates</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card-clean p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold leading-tight">{job.title}</h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${job.isActive ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20" : "bg-muted text-muted-foreground ring-border/40"}`}>
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                    {job.remote && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20 px-2 py-0.5 text-xs font-medium">
                        <Wifi className="h-3 w-3" /> Remote
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.salaryMin ? `₹${(job.salaryMin / 100000).toFixed(1)}L` : ""}
                        {job.salaryMin && job.salaryMax ? " – " : ""}
                        {job.salaryMax ? `₹${(job.salaryMax / 100000).toFixed(1)}L` : ""}
                      </span>
                    )}
                    {job.requirements.length > 0 && (
                      <span>{job.requirements.slice(0, 3).join(", ")}{job.requirements.length > 3 ? ` +${job.requirements.length - 3}` : ""}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <FindMatchesButton jobId={job.id} />
                  <JobActions jobId={job.id} isActive={job.isActive} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
