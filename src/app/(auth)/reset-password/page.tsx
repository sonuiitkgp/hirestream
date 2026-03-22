"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Lock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Missing or invalid reset link.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="relative hidden lg:flex w-1/2 flex-col items-center justify-center overflow-hidden bg-slate-900">
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-white/10 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-4xl text-white font-semibold tracking-tight">HireStream</span>
          </div>
          <p className="max-w-xs text-lg text-white/60 leading-relaxed">
            Set a new password for your account.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background p-6">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-xl text-foreground font-semibold">HireStream</span>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm w-full max-w-sm p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold">Password updated</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link href="/login">
                <Button className="h-11 w-full mt-2">Go to Sign In</Button>
              </Link>
            </div>
          ) : !token ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h1 className="text-xl font-bold">Invalid Link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
              <Link href="/forgot-password">
                <Button variant="outline" className="h-11 w-full mt-2">Request a new link</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repeat password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading} className="h-11 w-full">
                  {loading ? "Updating…" : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
