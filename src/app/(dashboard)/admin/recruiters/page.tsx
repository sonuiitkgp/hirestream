import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Mail } from "lucide-react";

export default async function AdminRecruitersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/profile");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const perPage = 20;

  const [recruiters, total] = await Promise.all([
    db.user.findMany({
      where: { roles: { has: "RECRUITER" } },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
        _count: { select: { postedJobs: true, sentMessages: true } },
      },
    }),
    db.user.count({ where: { roles: { has: "RECRUITER" } } }),
  ]);

  const pages = Math.ceil(total / perPage);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
          <Briefcase className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Recruiters</h1>
          <p className="text-xs text-muted-foreground">{total} recruiters total</p>
        </div>
      </div>

      <div className="space-y-3">
        {recruiters.map((r) => (
          <div key={r.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 text-sm font-bold">
              {(r.name ?? r.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{r.name ?? r.email}</div>
              <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3" />{r.email}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{r._count.postedJobs}</div>
                <div>Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{r._count.sentMessages}</div>
                <div>Messages</div>
              </div>
            </div>
            <div className="shrink-0 text-xs text-muted-foreground">
              Joined {new Date(r.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
        {recruiters.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No recruiters yet.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 && (
            <Link href={`/admin/recruiters?page=${page - 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          {page < pages && (
            <Link href={`/admin/recruiters?page=${page + 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
