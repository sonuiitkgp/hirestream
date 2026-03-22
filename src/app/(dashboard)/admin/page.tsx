import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, FileText, Briefcase, MessageCircle, LayoutDashboard,
  ShieldCheck, MessageSquareDiff, User, Search, ArrowRight,
} from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/profile");

  const [
    userCount, jobSeekerCount, recruiterCount, adminCount,
    profileCount, jobCount, messageCount, commentCount, suggestionCount,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { roles: { has: "JOB_SEEKER" } } }),
    db.user.count({ where: { roles: { has: "RECRUITER" } } }),
    db.user.count({ where: { roles: { has: "ADMIN" } } }),
    db.profile.count(),
    db.job.count(),
    db.message.count(),
    db.comment.count(),
    db.suggestion.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, href: "/admin/users" },
    { label: "Job Seekers", value: jobSeekerCount, icon: User, href: "/admin/job-seekers" },
    { label: "Recruiters", value: recruiterCount, icon: Briefcase, href: "/admin/recruiters" },
    { label: "Admins", value: adminCount, icon: ShieldCheck, href: "/admin/users" },
    { label: "Profiles", value: profileCount, icon: FileText, href: "/admin/job-seekers" },
    { label: "Job Postings", value: jobCount, icon: Search, href: "/admin/jobs" },
    { label: "Comments", value: commentCount, icon: MessageCircle, href: "/admin/comments" },
    { label: "Suggestions", value: suggestionCount, icon: MessageSquareDiff, href: "/admin/suggestions" },
  ];

  const roleColor: Record<string, string> = {
    ADMIN: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
    RECRUITER: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
    JOB_SEEKER: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Platform overview &middot; {messageCount.toLocaleString()} messages exchanged
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card-clean p-5 hover:border-primary/30 transition-colors group">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl text-foreground font-bold">{value.toLocaleString()}</div>
            <div className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
              {label}
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      <div className="section-clean space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-base font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-3.5 w-3.5" />
            </span>
            Recent Users
          </h2>
          <Link href="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {recentUsers.map((u) => {
            const initials = (u.name ?? u.email).split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={u.id} className="flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name ?? u.email}</div>
                  {u.name && <div className="text-xs text-muted-foreground truncate">{u.email}</div>}
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${roleColor[u.role] ?? "bg-muted text-muted-foreground ring-border/40"}`}>
                  {u.role.replace("_", " ")}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
