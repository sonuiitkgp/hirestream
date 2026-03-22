"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Sparkles, Users, MessageSquare } from "lucide-react";

export default function LoginPage() {
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

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/onboarding" });
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
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-primary hover:underline transition-colors">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="h-11 w-full"
            onClick={handleGoogle}
          >
            Continue with Google
          </Button>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline transition-colors">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
