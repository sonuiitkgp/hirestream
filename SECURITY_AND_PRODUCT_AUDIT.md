# HireStream — Security & Product Audit

**Date:** 2026-04-11

---

## Security Findings

### CRITICAL

#### 1. Secrets exposed in `.env` (committed to git)
- **File:** `.env`
- **Issue:** All credentials (Google OAuth, API keys, SMTP password, AUTH_SECRET) are in the repo history
- **Fix:** Rotate ALL credentials immediately. Ensure `.env` is in `.gitignore` and remove from git history with `git filter-branch` or BFG Repo-Cleaner

#### 2. Unsafe raw SQL queries
Using `$queryRawUnsafe`/`$executeRawUnsafe` instead of safe tagged template versions.
- `src/app/api/jobs/route.ts`
- `src/app/api/jobs/[id]/matches/route.ts`
- `src/app/api/search/route.ts`
- `src/app/api/discover/route.ts`
- `src/lib/ai/profile-embedding.ts`
- **Fix:** Replace with `$queryRaw` / `$executeRaw` (tagged template literals)

---

### HIGH

#### 3. No rate limiting on auth endpoints
- **Files:** `src/app/api/auth/register/route.ts`, `forgot-password/route.ts`, `reset-password/route.ts`
- **Issue:** Vulnerable to brute force, email spam, token guessing
- **Fix:** Add rate limiting using `@vercel/kv` + `@upstash/ratelimit` or similar

#### 4. Weak password requirements
- **File:** `src/app/api/auth/register/route.ts` (line 15)
- **Issue:** Only 8-char minimum, no complexity rules
- **Fix:** Require 12+ chars with uppercase, lowercase, number, and symbol

#### 5. Public email exposure
- **File:** `src/app/api/discover/route.ts`
- **Issue:** User emails returned in public search/discover API responses
- **Fix:** Remove `email` from public `select` queries

---

### MEDIUM

#### 6. Hardcoded admin notification email
- **File:** `src/lib/email.ts` (line 3)
- **Issue:** `const ADMIN_EMAIL = "sonuamex721@gmail.com"` hardcoded
- **Fix:** Use `process.env.ADMIN_NOTIFICATION_EMAIL`

#### 7. No security headers
- **Issue:** Missing CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Fix:** Add security headers in `next.config.ts` or middleware

#### 8. Password reset token valid too long
- **File:** `src/app/api/auth/forgot-password/route.ts` (line 33)
- **Issue:** Token expires in 1 hour
- **Fix:** Reduce to 15–30 minutes

#### 9. Dangerous email account linking
- **File:** `src/lib/auth.ts`
- **Issue:** `allowDangerousEmailAccountLinking: true` — allows account takeover if attacker controls a Google account with same email
- **Fix:** Remove or add email verification before linking

#### 10. No environment variable validation
- **Issue:** Missing env vars can crash the app at runtime with unclear errors
- **Fix:** Add a startup validation script that checks all required env vars

#### 11. No audit logging
- **Issue:** No logging for failed logins, role changes, admin actions
- **Fix:** Create an `AuditLog` model and log security-relevant events

---

### LOW

#### 12. Bcrypt cost factor
- **Files:** `register/route.ts`, `reset-password/route.ts`
- **Issue:** Cost factor is 12 — acceptable but could be 13–14
- **Fix:** Increase to 13

#### 13. Missing input length validation
- **File:** `src/app/api/jobs/route.ts`
- **Issue:** No max length on title, description, requirements
- **Fix:** Add length limits (e.g., title max 200, description max 5000)

#### 14. File upload — no magic number validation
- **File:** `src/app/api/upload/route.ts`
- **Issue:** Only checks MIME type, not actual file bytes
- **Fix:** Validate PDF magic bytes (`%PDF`)

---

## Product Suggestions for Success

### Must-Have

1. **Landing / Marketing page** — Currently `/` redirects to login. Need a public homepage explaining what HireStream does with features, testimonials, and CTAs.

2. **Job application flow** — Vector matching exists but no "Apply" button. Job seekers should apply, recruiters should see applicants with status tracking (Applied → Screening → Interview → Offer → Rejected).

3. **Email verification** — New accounts should verify email before accessing features. Prevents spam signups.

4. **Custom domain** — `hirestream.vercel.app` doesn't build trust. Get `hirestream.io` or similar and connect to Vercel (free SSL).

### Should-Have

5. **Profile completeness indicator** — Show job seekers a progress bar ("Your profile is 60% complete") to drive engagement and better matching.

6. **Search filters & sorting** — Discover/search pages need filters: location, skills, experience level, remote/onsite, salary range. Sort by relevance, recency.

7. **Notification preferences** — Let users choose what notifications they get (email, in-app, both, none). Reduce notification fatigue.

8. **Analytics for recruiters** — Job post views, candidate match counts, response rates, time-to-hire metrics.

9. **SEO & Open Graph tags** — Public profiles should have proper meta tags for good link previews on LinkedIn/Twitter.

### Nice-to-Have

10. **Mobile-responsive profile editor** — Resume upload works on mobile but manual editing should be equally smooth.

11. **Saved searches for recruiters** — Let recruiters save search criteria and get notified when new matching candidates join.

12. **Profile PDF export** — Let job seekers export their HireStream profile as a formatted PDF resume.

13. **Interview scheduling** — Integrate calendar booking so recruiters can schedule interviews directly through the platform.

14. **Candidate pipeline / Kanban board** — Recruiters manage applicants in a visual pipeline (Applied → Phone Screen → Technical → Offer).
