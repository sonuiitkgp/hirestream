import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, MapPin, Briefcase, GraduationCap, Eye, EyeOff } from "lucide-react";

export default async function AdminJobSeekersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/profile");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const perPage = 20;

  const [profiles, total] = await Promise.all([
    db.profile.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        _count: { select: { experiences: true, projects: true, academicBgs: true } },
      },
    }),
    db.profile.count(),
  ]);

  const pages = Math.ceil(total / perPage);

  const visibilityIcon: Record<string, typeof Eye> = {
    PUBLIC: Eye,
    PRIVATE: EyeOff,
    HIDDEN: EyeOff,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <User className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Job Seekers</h1>
          <p className="text-xs text-muted-foreground">{total} profiles total</p>
        </div>
      </div>

      <div className="space-y-3">
        {profiles.map((p) => {
          const VisIcon = visibilityIcon[p.visibility] ?? EyeOff;
          return (
            <div key={p.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-bold">
                {(p.user.name ?? p.user.email).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{p.user.name ?? p.user.email}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    p.visibility === "PUBLIC"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <VisIcon className="h-2.5 w-2.5" />
                    {p.visibility}
                  </span>
                </div>
                {p.headline && <p className="text-xs text-muted-foreground truncate mt-0.5">{p.headline}</p>}
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {p.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</span>
                  )}
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{p._count.experiences} exp</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{p._count.academicBgs} edu</span>
                  <span>{p._count.projects} projects</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs text-muted-foreground">{p.user.email}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Joined {new Date(p.user.createdAt).toLocaleDateString()}
                </div>
                {p.shareToken && p.visibility === "PUBLIC" && (
                  <Link href={`/p/${p.shareToken}`} className="mt-1 inline-block text-[10px] text-primary hover:underline">
                    View profile
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {profiles.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No job seekers yet.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 && (
            <Link href={`/admin/job-seekers?page=${page - 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          {page < pages && (
            <Link href={`/admin/job-seekers?page=${page + 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
