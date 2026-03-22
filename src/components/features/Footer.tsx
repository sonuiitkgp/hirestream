import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card/50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">HireStream</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-powered talent platform connecting job seekers with great opportunities through smart matching and peer collaboration.
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About HireStream</Link></li>
              <li><Link href="/guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">User Guide</Link></li>
              <li><Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Discover People</Link></li>
            </ul>
          </div>

          {/* For Users */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For Users</h3>
            <ul className="space-y-2">
              <li><Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Profile</Link></li>
              <li><Link href="/mailbox" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mailbox</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For Recruiters</h3>
            <ul className="space-y-2">
              <li><Link href="/recruiter/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Search Talent</Link></li>
              <li><Link href="/recruiter/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Post Jobs</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} HireStream. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/guide" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Guide</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
