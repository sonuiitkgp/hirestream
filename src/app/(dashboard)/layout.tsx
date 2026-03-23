import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/features/AppSidebar";
import { Zap } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/features/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
          <SidebarTrigger className="-ml-1 h-8 w-8 rounded-md hover:bg-muted transition-colors" />
          <div className="mx-2 h-4 w-px bg-border" />
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              HireStream
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/about" className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              About
            </Link>
            <Link href="/guide" className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              User Guide
            </Link>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          {children}
          <Footer />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
