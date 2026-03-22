"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setLoading(false);
      setError("Invalid credentials.");
      return;
    }

    // Verify the user is actually an admin
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const roles: string[] = session?.user?.roles ?? [];

    if (!roles.includes("ADMIN")) {
      // Not an admin — sign them out and show error
      await fetch("/api/auth/signout", { method: "POST" });
      setLoading(false);
      setError("Access denied. Admin privileges required.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="relative hidden lg:flex w-1/2 flex-col items-center justify-center overflow-hidden bg-slate-900">
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-white/10 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-4xl text-white font-semibold tracking-tight">Admin Panel</span>
          </div>

          <p className="max-w-xs text-lg text-white/60 leading-relaxed">
            Manage users, monitor platform activity, and configure HireStream settings.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              User Management
            </div>
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Platform Analytics
            </div>
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Role & Access Control
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background p-6">
        {/* Mobile brand */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-xl text-foreground font-semibold">Admin Panel</span>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm w-full max-w-sm p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Restricted access for administrators only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hirestream.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Verifying…" : "Sign In as Admin"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Not an admin?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline transition-colors">
              Regular sign in
            </Link>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>HireStream Administration</span>
        </div>
      </div>
    </div>
  );
}
