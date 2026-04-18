/**
 * Validates that all required environment variables are set.
 * Call at app startup to fail fast with clear error messages.
 */

const REQUIRED_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

const OPTIONAL_VARS = [
  "NEXTAUTH_URL",
  "GROQ_API_KEY",
  "GOOGLE_API_KEY",
  "SMTP_USER",
  "SMTP_PASS",
  "ADMIN_NOTIFICATION_EMAIL",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}\n\nAdd them to .env.local or your hosting provider's environment settings.`
    );
  }

  // Warn about optional vars that affect features
  for (const key of OPTIONAL_VARS) {
    if (!process.env[key]) {
      console.warn(`[env] Optional variable ${key} is not set — related features may be disabled.`);
    }
  }
}
