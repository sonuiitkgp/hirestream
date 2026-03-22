import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { UserActions } from "@/components/features/admin/UserActions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/profile");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const limit = 20;

  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
    }),
    db.user.count(),
  ]);

  const pages = Math.ceil(total / limit);


  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">User Management</h1>
            <p className="text-xs text-muted-foreground">{total} total users — page {page} of {pages}</p>
          </div>
        </div>
      </div>

      <div className="section-clean space-y-2">
        {users.map((u) => {
          const initials = (u.name ?? u.email).split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={u.id} className="flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{u.name ?? "—"}</div>
                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
              </div>
              <UserActions
                userId={u.id}
                currentRole={u.role}
                isSelf={u.id === session.user.id}
              />
              <span className="shrink-0 text-xs text-muted-foreground w-24 text-right">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          );
        })}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {page > 1 && (
            <a href={`?page=${page - 1}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-border hover:text-foreground transition-all">
              ← Prev
            </a>
          )}
          <span className="text-sm text-muted-foreground">Page {page} / {pages}</span>
          {page < pages && (
            <a href={`?page=${page + 1}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:border-border hover:text-foreground transition-all">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
