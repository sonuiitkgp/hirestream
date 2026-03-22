"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Sparkles, Users, MessageSquare, User, Briefcase } from "lucide-react";

type RoleOption = "JOB_SEEKER" | "RECRUITER";

const ROLES: { value: RoleOption; label: string; description: string; icon: React.ElementType }[] = [
  { value: "JOB_SEEKER", label: "Job Seeker", description: "Build & share your profile", icon: User },
  { value: "RECRUITER", label: "Recruiter", description: "Search talent & post jobs", icon: Briefcase },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleOption>("JOB_SEEKER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push(role === "RECRUITER" ? "/recruiter/search" : "/profile");
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel ── */}
      <div className="relative hidden lg:flex w-1/2 flex-col items-center justify-center overflow-hidden bg-slate-900">
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-white/10 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-4xl text-white font-semibold tracking-tight">HireStream</span>
          </div>

          <p className="max-w-xs text-lg text-white/60 leading-relaxed">
            The AI-powered platform connecting top talent with great opportunities.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Resume Parsing
            </div>
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Semantic Talent Search
            </div>
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Direct Recruiter Messaging
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background p-6">
        {/* Mobile brand */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-xl text-foreground font-semibold">HireStream</span>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm w-full max-w-sm p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Choose your role to get started</p>
          </div>

          {/* Role selector */}
          <div className="mb-5 grid grid-cols-2 gap-3">
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
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full"
            >
              {loading
                ? "Creating account…"
                : `Join as ${role === "JOB_SEEKER" ? "Job Seeker" : "Recruiter"}`}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
