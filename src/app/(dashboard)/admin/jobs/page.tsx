import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, MapPin, Wifi, DollarSign, User } from "lucide-react";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/profile");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const perPage = 20;

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        recruiter: { select: { name: true, email: true } },
      },
    }),
    db.job.count(),
  ]);

  const pages = Math.ceil(total / perPage);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
          <Briefcase className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Job Postings</h1>
          <p className="text-xs text-muted-foreground">{total} jobs posted</p>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium">{job.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{job.description}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                job.isActive
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground"
              }`}>
                {job.isActive ? "Active" : "Closed"}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {job.recruiter.name ?? job.recruiter.email}
              </span>
              {job.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
              )}
              {job.remote && (
                <span className="flex items-center gap-1"><Wifi className="h-3 w-3" />Remote</span>
              )}
              {(job.salaryMin || job.salaryMax) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {job.salaryMin?.toLocaleString()}{job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : "+"}
                </span>
              )}
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            {job.requirements.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {job.requirements.slice(0, 5).map((r, i) => (
                  <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {r}
                  </span>
                ))}
                {job.requirements.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">+{job.requirements.length - 5} more</span>
                )}
              </div>
            )}
          </div>
        ))}
        {jobs.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No job postings yet.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 && (
            <Link href={`/admin/jobs?page=${page - 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          {page < pages && (
            <Link href={`/admin/jobs?page=${page + 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
