// Edge-safe auth config — NO database imports here.
// Used by middleware (Edge runtime) and composed into the full auth.ts.
import type { NextAuthConfig } from "next-auth";

// Inline the Role type so this file stays edge-safe (no node:path deps from generated Prisma client).
type Role = "JOB_SEEKER" | "RECRUITER" | "ADMIN";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], // providers are added in auth.ts
  callbacks: {
    authorized({ auth }) {
      return !!auth;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.roles = (user as { roles?: Role[] }).roles ?? [];
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.roles = (token.roles as Role[]) ?? [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
