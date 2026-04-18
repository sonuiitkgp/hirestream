import { db } from "@/lib/db";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "REGISTER"
  | "PASSWORD_RESET"
  | "ROLE_CHANGED"
  | "ADMIN_LOGIN"
  | "ADMIN_LOGIN_DENIED"
  | "ACCOUNT_LINKED"
  | "PROFILE_UPDATED";

export async function audit(
  action: AuditAction,
  opts: { userId?: string; ip?: string; details?: string } = {},
) {
  try {
    await db.auditLog.create({
      data: {
        action,
        userId: opts.userId ?? null,
        ip: opts.ip ?? null,
        details: opts.details ?? null,
      },
    });
  } catch {
    // Audit logging is best-effort — never break the main flow
  }
}
