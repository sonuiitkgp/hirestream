"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Briefcase, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type RoleOption = "JOB_SEEKER" | "RECRUITER";

const ROLES: { value: RoleOption; label: string; description: string; icon: React.ElementType }[] = [
  { value: "JOB_SEEKER", label: "Job Seeker", description: "Build & share your profile, get peer reviews", icon: User },
  { value: "RECRUITER", label: "Recruiter", description: "Search talent & post jobs", icon: Briefcase },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [role, setRole] = useState<RoleOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // If existing user with profile already set up, skip onboarding
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    // Check if user already completed onboarding
    fetch("/api/auth/onboarding")
      .then((res) => res.json())
      .then((data) => {
        if (data.completed) {
          const dest = data.role === "RECRUITER" ? "/recruiter/search" : "/profile";
          router.push(dest);
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [session, status, router]);

  async function handleContinue() {
    if (!role) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      // Refresh the session so the new role is reflected
      await update();
      router.push(role === "RECRUITER" ? "/recruiter/search" : "/profile");
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  if (checking || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="rounded-xl border border-border bg-card shadow-sm w-full max-w-sm p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">HireStream</span>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome!</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            How will you use HireStream?
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {ROLES.map((r) => {
            const RoleIcon = r.icon;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  role === r.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border"
                }`}
              >
                <RoleIcon className="h-6 w-6" />
                <div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{r.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {error && <p className="text-sm text-destructive mb-3">{error}</p>}

        <Button
          onClick={handleContinue}
          disabled={!role || loading}
          className="h-11 w-full"
        >
          {loading ? "Setting up…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
