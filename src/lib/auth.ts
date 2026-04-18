// Full server-side auth config — safe to import Node.js modules.
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import type { Role } from "@/generated/prisma/client";
import { createNotifications } from "@/lib/notifications";
import { notifyAdminNewUser } from "@/lib/email";
import { audit } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(db as any),
  events: {
    async createUser({ user }) {
      // Fires for new OAuth signups (credential signups handled in register route)
      if (!user.id || !user.email) return;
      const role = "JOB_SEEKER";
      const admins = await db.user.findMany({
        where: { roles: { has: "ADMIN" } },
        select: { id: true },
      });
      if (admins.length > 0) {
        createNotifications(
          admins.map((a) => ({
            recipientId: a.id,
            actorId: user.id!,
            type: "NEW_USER" as const,
            title: "New user joined via Google",
            body: `${user.name ?? user.email} signed up.`,
            linkUrl: "/admin/users",
          })),
        ).catch(() => {});
      }
      notifyAdminNewUser({ name: user.name ?? null, email: user.email!, role }).catch(() => {});
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    // Override jwt to fetch role + roles from DB — Google OAuth user objects don't include custom fields
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        // Initial sign-in: fetch fresh role data from DB
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { id: true, role: true, roles: true },
        });
        token.id = dbUser?.id ?? user.id;
        token.role = dbUser?.role;
        token.roles = dbUser?.roles ?? [];
      } else if (trigger === "update") {
        // Session update (e.g. role switch) — use passed data or re-fetch from DB
        if (session?.role && session?.roles) {
          token.role = session.role;
          token.roles = session.roles;
        } else {
          const id = token.id as string;
          const dbUser = await db.user.findUnique({
            where: { id },
            select: { id: true, role: true, roles: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.roles = dbUser.roles;
          }
        }
      }
      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          audit("LOGIN_FAILED", { details: `email: ${email} — user not found or no password` }).catch(() => {});
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) {
          audit("LOGIN_FAILED", { userId: user.id, details: `email: ${email} — wrong password` }).catch(() => {});
          return null;
        }

        audit("LOGIN_SUCCESS", { userId: user.id, details: `email: ${email}` }).catch(() => {});
        return user;
      },
    }),
  ],
});

// Extend next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      roles: Role[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
