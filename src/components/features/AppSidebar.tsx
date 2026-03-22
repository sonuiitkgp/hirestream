"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Role } from "@/generated/prisma/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Zap,
  User,
  MessageCircle,
  Mail,
  Search,
  Briefcase,
  LayoutDashboard,
  Users,
  Compass,
  LogOut,
  Settings,
  MessageSquareDiff,
  type LucideIcon,
} from "lucide-react";
import { RoleSwitcher } from "@/components/features/RoleSwitcher";
import { NotificationBell } from "@/components/features/NotificationBell";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const JOB_SEEKER_NAV: NavItem[] = [
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/profile/comments", label: "Peer Reviews", icon: MessageCircle },
  { href: "/profile/suggestions", label: "Suggestions", icon: MessageSquareDiff },
  { href: "/mailbox", label: "Mailbox", icon: Mail },
  { href: "/profile/settings", label: "Settings", icon: Settings },
];

const RECRUITER_NAV: NavItem[] = [
  { href: "/recruiter/search", label: "Search Talent", icon: Search },
  { href: "/recruiter/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/mailbox", label: "Mailbox", icon: Mail },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/job-seekers", label: "Job Seekers", icon: User },
  { href: "/admin/recruiters", label: "Recruiters", icon: Briefcase },
  { href: "/admin/jobs", label: "Job Postings", icon: Search },
  { href: "/admin/comments", label: "Comments", icon: MessageCircle },
  { href: "/admin/suggestions", label: "Suggestions", icon: MessageSquareDiff },
  { href: "/mailbox", label: "Mailbox", icon: Mail },
];

function getNav(role: Role): NavItem[] {
  if (role === "RECRUITER") return RECRUITER_NAV;
  if (role === "ADMIN") return ADMIN_NAV;
  return JOB_SEEKER_NAV;
}

type Props = {
  user: {
    id: string;
    role: Role;
    roles?: Role[];
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function AppSidebar({ user }: Props) {
  const pathname = usePathname();
  const nav = getNav(user.role);
  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border pb-4 pt-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">
              HireStream
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              AI Talent Platform
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const ItemIcon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground group-hover:bg-muted"
                        }`}
                      >
                        <ItemIcon className="h-3.5 w-3.5" />
                      </span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-lg border border-border bg-muted/50 p-3 mb-2">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 ring-1 ring-border">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
              {user.role?.replace("_", " ")}
            </span>
          </div>
        </div>

        <NotificationBell />

        <RoleSwitcher currentRole={user.role} roles={user.roles ?? [user.role]} />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
