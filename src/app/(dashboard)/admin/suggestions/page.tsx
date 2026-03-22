import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquareDiff, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function AdminSuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/profile");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const perPage = 20;

  const [suggestions, total, statusCounts] = await Promise.all([
    db.suggestion.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
        profile: { select: { user: { select: { name: true, email: true } } } },
      },
    }),
    db.suggestion.count(),
    Promise.all([
      db.suggestion.count({ where: { status: "PENDING" } }),
      db.suggestion.count({ where: { status: "ACCEPTED" } }),
      db.suggestion.count({ where: { status: "DECLINED" } }),
    ]),
  ]);

  const [pending, accepted, declined] = statusCounts;
  const pages = Math.ceil(total / perPage);

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    PENDING: { color: "bg-amber-500/10 text-amber-600", icon: Clock },
    ACCEPTED: { color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
    DECLINED: { color: "bg-red-500/10 text-red-600", icon: XCircle },
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
          <MessageSquareDiff className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Suggestions</h1>
          <p className="text-xs text-muted-foreground">{total} total</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card p-3 text-center">
          <Clock className="h-4 w-4 mx-auto text-amber-600" />
          <div className="text-lg font-bold mt-1">{pending}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="rounded-xl border bg-card p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto text-emerald-600" />
          <div className="text-lg font-bold mt-1">{accepted}</div>
          <div className="text-xs text-muted-foreground">Accepted</div>
        </div>
        <div className="rounded-xl border bg-card p-3 text-center">
          <XCircle className="h-4 w-4 mx-auto text-red-600" />
          <div className="text-lg font-bold mt-1">{declined}</div>
          <div className="text-xs text-muted-foreground">Declined</div>
        </div>
      </div>

      <div className="space-y-3">
        {suggestions.map((s) => {
          const cfg = statusConfig[s.status] ?? statusConfig.PENDING;
          const StatusIcon = cfg.icon;
          return (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {s.originalText && (
                    <p className="text-xs text-muted-foreground line-through line-clamp-1 mb-1">{s.originalText}</p>
                  )}
                  <p className="text-sm line-clamp-2">{s.suggestedText}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>By <strong>{s.author.name ?? s.author.email}</strong></span>
                    <span>&rarr;</span>
                    <span>For <strong>{s.profile.user.name ?? s.profile.user.email}</strong></span>
                    {s.sectionType && <span className="rounded bg-muted px-1.5 py-0.5">{s.sectionType}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {s.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {suggestions.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No suggestions yet.</p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 && (
            <Link href={`/admin/suggestions?page=${page - 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          {page < pages && (
            <Link href={`/admin/suggestions?page=${page + 1}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
