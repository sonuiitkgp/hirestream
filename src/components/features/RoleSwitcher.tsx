"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeftRight, User, Briefcase, Loader2, Plus, Shield } from "lucide-react";

type Role = "JOB_SEEKER" | "RECRUITER" | "ADMIN";

const ROLE_META: Record<string, { label: string; icon: React.ElementType; dest: string }> = {
  JOB_SEEKER: { label: "Job Seeker", icon: User, dest: "/profile" },
  RECRUITER: { label: "Recruiter", icon: Briefcase, dest: "/recruiter/search" },
  ADMIN: { label: "Admin", icon: Shield, dest: "/admin" },
};

export function RoleSwitcher({ currentRole, roles }: { currentRole: Role; roles: Role[] }) {
  const router = useRouter();
  const { update } = useSession();
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);

  // Get all switchable roles (roles the user has, excluding current)
  const switchableRoles = roles.filter((r) => r !== currentRole && ROLE_META[r]);
  if (switchableRoles.length === 0 && currentRole !== "ADMIN") {
    // Non-admin with only one role — show "add role" option
  } else if (switchableRoles.length === 0) {
    return null;
  }

  async function handleSwitch(targetRole: Role) {
    setSwitching(true);
    setOpen(false);
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to switch role.");
        setSwitching(false);
        return;
      }
      const { role: newRole, roles: newRoles } = await res.json();
      // Refresh the JWT/session with the new active role data
      await update({ role: newRole ?? targetRole, roles: newRoles });
      const meta = ROLE_META[targetRole];
      // Use window.location for a full page reload to ensure fresh server state
      window.location.href = meta?.dest ?? "/";
    } catch {
      toast.error("Network error.");
      setSwitching(false);
    }
  }

  if (switching) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Switching…
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Switch Role</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
            {switchableRoles.length > 0 ? (
              switchableRoles.map((role) => {
                const meta = ROLE_META[role];
                const Icon = meta.icon;
                return (
                  <button
                    key={role}
                    onClick={() => handleSwitch(role)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{meta.label}</p>
                      <p className="text-[11px] text-muted-foreground">Switch to {meta.label.toLowerCase()} view</p>
                    </div>
                  </button>
                );
              })
            ) : (
              // Non-admin user with only one role — offer to add the other
              (() => {
                const otherRole: Role = currentRole === "JOB_SEEKER" ? "RECRUITER" : "JOB_SEEKER";
                const meta = ROLE_META[otherRole];
                return (
                  <button
                    onClick={() => handleSwitch(otherRole)}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">Add {meta.label} Role</p>
                      <p className="text-[11px] text-muted-foreground">Also use HireStream as a {meta.label.toLowerCase()}</p>
                    </div>
                  </button>
                );
              })()
            )}
          </div>
        </>
      )}
    </div>
  );
}
