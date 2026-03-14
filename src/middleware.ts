import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Unauthenticated: redirect to login (except auth routes)
  if (!session && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session) {
    const role = session.user.role;

    // Role-based guards
    if (pathname.startsWith("/recruiter") && role !== "RECRUITER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    if (pathname.startsWith("/profile") && role === "RECRUITER") {
      return NextResponse.redirect(new URL("/recruiter/search", req.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Redirect authenticated users away from auth pages
    if (pathname === "/login" || pathname === "/register") {
      const dest = role === "RECRUITER" ? "/recruiter/search" : "/profile";
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
