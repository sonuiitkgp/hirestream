import Link from "next/link";
import { auth } from "@/lib/auth";
import { Zap, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/features/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link
              href={session ? "/profile" : "/"}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link href="/" className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                HireStream
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/about" className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:inline-flex">
              About
            </Link>
            <Link href="/guide" className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:inline-flex">
              Guide
            </Link>
            {session ? (
              <Link
                href="/profile"
                className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      {children}
      <Footer />
    </div>
  );
}
