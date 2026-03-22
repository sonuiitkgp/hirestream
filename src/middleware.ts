// Middleware runs on the Edge runtime — must NOT import Node.js-only modules.
// We use authConfig (no PrismaAdapter) for JWT validation here.
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

type Role = "JOB_SEEKER" | "RECRUITER" | "ADMIN";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public paths that don't require auth
  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/guide") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // Unauthenticated: redirect to login (except public paths)
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session) {
    const role = session.user.role as Role;
    const roles = ((session.user as { roles?: Role[] }).roles ?? [role]) as Role[];

    // Redirect authenticated users away from auth pages (but allow onboarding)
    if (pathname === "/login" || pathname === "/register") {
      const dest = role === "RECRUITER" ? "/recruiter/search" : "/profile";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    if (pathname === "/admin-login") {
      if (roles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // Role-based guards — check roles array (not just active role)
    if (role) {
      // /recruiter paths require RECRUITER or ADMIN in roles
      if (pathname.startsWith("/recruiter") && !roles.includes("RECRUITER") && !roles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/profile", req.url));
      }
      // /profile paths require JOB_SEEKER in roles
      if (pathname.startsWith("/profile") && !roles.includes("JOB_SEEKER") && roles.includes("RECRUITER")) {
        return NextResponse.redirect(new URL("/recruiter/search", req.url));
      }
      // /admin paths require ADMIN
      if (pathname.startsWith("/admin") && !roles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
