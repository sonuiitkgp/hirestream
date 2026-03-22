# HireStream — Project Documentation

> A plain-English guide to every folder and file in the project.
> Written so that anyone — developer or not — can understand what each piece does and how they fit together.

---

## What is HireStream?

HireStream is a web application where **job seekers** build professional profiles, **recruiters** find talent, and **peers** help each other improve. Think of it as a mix of LinkedIn (profiles), Google Docs (collaborative suggestions), and an AI-powered job board.

There are three kinds of roles, and **a single user can hold multiple roles** (e.g., be both a Job Seeker and a Recruiter):

| Role | What they do |
|------|-------------|
| **Job Seeker** | Build a profile (experience, projects, education, etc.), share it publicly, get peer reviews and suggestions, discover similar profiles, chat with recruiters |
| **Recruiter** | Search for candidates using plain-English queries (powered by AI), post jobs, message candidates directly |
| **Admin** | View platform statistics, manage users |

Users can switch between their roles at any time using the **Role Switcher** in the sidebar. When switching to a role for the first time, the system automatically sets it up (e.g., creates a profile when switching to Job Seeker).

---

## How the App Works (High Level)

1. A user signs up (email/password or Google) and picks an initial role. They can add the other role later via the sidebar switcher.
2. **Job seekers** fill out their profile — work experience, projects, internships, education, extra-curriculars, and optionally their CodeChef competitive programming stats.
3. The app generates an AI "embedding" (a numeric fingerprint) of each profile so it can find similar profiles or match recruiter searches.
4. Job seekers can share a public link. Visitors who are logged in can **suggest text edits** (like Google Docs suggestions) or **leave comments** on individual sections.
5. The profile owner sees all feedback in a dashboard and can accept or decline each item.
6. Recruiters type what they're looking for ("React developer with 3 years experience in Bangalore") and the AI finds the best-matching profiles.
7. Recruiters can message candidates directly through the built-in mailbox.

---

## Technology Stack (Plain English)

| Technology | What it does |
|-----------|-------------|
| **Next.js 16** | The framework that runs both the website (what you see) and the server (API logic) in one project |
| **React 19** | The library that builds the interactive user interface |
| **TypeScript** | JavaScript with type safety — catches bugs before the code runs |
| **Tailwind CSS 4** | A utility-first styling system — instead of writing CSS files, you add class names directly to HTML |
| **shadcn/ui** | Pre-built, good-looking UI components (buttons, dialogs, tabs, etc.) |
| **PostgreSQL** | The database where all data lives |
| **Prisma 7.5** | A tool that lets the code talk to the database using TypeScript instead of raw SQL |
| **pgvector** | A PostgreSQL extension that stores and searches AI embeddings (numeric profile fingerprints) |
| **NextAuth 5** | Handles login, signup, sessions, and Google OAuth |
| **Google Generative AI** | Converts profile text into 768-dimension vectors for semantic search |
| **Ollama + llama3.2** | A local AI model that reads uploaded PDF resumes and extracts structured data |
| **Sonner** | Shows toast notifications ("Saved!", "Error!") |
| **Lucide** | The icon library used throughout the UI |

---

## Project Folder Structure

```
hirestream/
├── prisma/                      ← Database schema & seed data
├── src/
│   ├── app/                     ← Pages & API routes (what the user sees + server logic)
│   │   ├── (auth)/              ← Login, register, onboarding pages
│   │   ├── (dashboard)/         ← Logged-in user pages (profile, discover, mailbox, etc.)
│   │   ├── (public)/            ← Publicly accessible pages (shared profiles)
│   │   └── api/                 ← Server-side API endpoints
│   ├── components/              ← Reusable UI pieces
│   │   ├── features/            ← Business-logic components (profile tabs, search bars, etc.)
│   │   └── ui/                  ← Generic UI primitives (buttons, inputs, dialogs)
│   ├── hooks/                   ← Custom React hooks
│   ├── lib/                     ← Shared utilities (database, auth, AI helpers)
│   └── types/                   ← TypeScript type definitions
├── Configuration files          ← package.json, tsconfig, eslint, tailwind, etc.
└── Environment files            ← .env, .env.local (secrets like API keys & DB URL)
```

---

## Root Configuration Files

These files configure the project itself. You rarely edit them directly.

| File | Purpose |
|------|---------|
| `package.json` | Lists every dependency (library) the project needs, plus scripts like `npm run dev` (start the app) and `npm run build` (compile for production). Also tells Prisma where the seed script is. |
| `package-lock.json` | Auto-generated lock file that pins exact dependency versions so every developer gets identical installs. |
| `next.config.ts` | Next.js settings — marks certain packages as "server-only" so they don't get bundled into browser code. |
| `tsconfig.json` | TypeScript compiler settings — path aliases (e.g., `@/lib/db` → `src/lib/db`), strictness level, etc. |
| `prisma.config.ts` | Tells Prisma where to find the schema file. |
| `postcss.config.mjs` | PostCSS plugin list — enables Tailwind CSS processing. |
| `components.json` | Configuration for shadcn/ui — tells the CLI where to put generated components and what style to use. |
| `eslint.config.mjs` | Linting rules that catch common mistakes and enforce code style. |
| `.env` / `.env.local` | Secret environment variables: database URL, Google OAuth keys, AI API keys. **Never committed to Git.** |
| `.env.example` | A template showing which environment variables are needed (without real values). |
| `.gitignore` | Tells Git which files to ignore (node_modules, .env, build output, etc.). |

---

## `prisma/` — Database Layer

### `prisma/schema.prisma` — The Database Blueprint

This single file defines **every table** in the database. Prisma reads it and generates TypeScript code so the app can query the DB safely.

**Enums (fixed lists of allowed values):**

| Enum | Values | Used for |
|------|--------|----------|
| `Role` | JOB_SEEKER, RECRUITER, ADMIN | What kind of user this is |
| `Visibility` | PUBLIC, PRIVATE, HIDDEN | Who can see a profile |
| `CommentStatus` | PENDING, ACCEPTED, DECLINED | Review workflow for comments & suggestions |
| `SectionType` | EXPERIENCE, PROJECT, INTERNSHIP, ACADEMIC, EXTRA_CURRICULAR, CODECHEF | Which profile section something belongs to |

**Models (database tables):**

| Model | What it stores |
|-------|---------------|
| `User` | Core user record — name, email, hashed password, active `role`, `roles` array (all granted roles), image. Every other model links back here. A user can hold multiple roles (e.g., both JOB_SEEKER and RECRUITER). |
| `Account` | OAuth provider connections (e.g., Google). Managed by NextAuth. |
| `Session` | Active login sessions. Managed by NextAuth. |
| `VerificationToken` | Email verification tokens. Managed by NextAuth. |
| `Profile` | A job seeker's profile — headline, bio, location, social links, skills, visibility setting, share token, and a 768-dimension vector embedding for AI search. |
| `Experience` | Work experience entries — company, role, dates, location, description. Linked to a Profile. |
| `Project` | Side projects — name, description, tech stack array, links. Linked to a Profile. |
| `Internship` | Internship records — company, role, dates, stipend, description. Linked to a Profile. |
| `AcademicBackground` | Education — institution, degree, field, GPA, years. Linked to a Profile. |
| `ExtraCurricular` | Activities — name, role, description. Linked to a Profile. |
| `CodeChefProfile` | Competitive programming stats — username, rating, stars, problems solved. Linked to a Profile. |
| `Comment` | A peer review comment on someone's profile. Can target a specific section item (e.g., a particular job experience). Supports threading (replies) and has a PENDING → ACCEPTED/DECLINED workflow. |
| `CommentHistory` | Every time a comment is edited, the old version is saved here for audit. |
| `Suggestion` | An inline text suggestion — "change this sentence to that sentence." Tracks the exact character offsets so the owner can accept and auto-apply the change. |
| `Conversation` | A chat thread between two users (typically recruiter ↔ candidate). |
| `Message` | An individual message within a conversation. |
| `Job` | A job posting by a recruiter — title, company, description, requirements, salary range, location, remote flag, and a vector embedding for AI matching. |
| `ResumeUpload` | History of uploaded resumes — file URL, parsed JSON data, status. |

### `prisma/seed.ts` — Test Data Generator

A script that creates **~35 realistic job seeker profiles** and **~5 recruiter accounts** with Indian tech professional names, companies, skills, and locations. Used during development so the app isn't empty. Run it with `npx tsx prisma/seed.ts`.

---

## `src/app/` — Pages & Routes

Next.js uses a **file-system router**: each folder under `src/app/` becomes a URL. A `page.tsx` file renders the page; a `route.ts` file handles API requests.

### Root Files

| File | Purpose |
|------|---------|
| `layout.tsx` | The outermost wrapper applied to **every** page. Sets up the HTML shell, loads fonts, wraps everything in a session provider (for auth) and a theme provider (for dark mode), and mounts the toast notification system. |
| `page.tsx` | The root page (`/`). Checks who you are and redirects: admins → `/admin`, recruiters → `/recruiter/search`, job seekers → `/profile`, guests → `/login`. |
| `globals.css` | Global styles — Tailwind imports, CSS custom properties for the color theme (light & dark mode), and utility classes like `.card-clean` and `.section-clean`. |

---

### `src/app/(auth)/` — Authentication Pages

The parentheses in `(auth)` make it a **route group** — it organizes files without affecting the URL. So `(auth)/login/page.tsx` renders at `/login`, not `/auth/login`.

| File | What it renders |
|------|----------------|
| `login/page.tsx` | The login page — email + password form, plus a "Sign in with Google" button. On success, redirects to the dashboard. |
| `register/page.tsx` | The registration page — pick your role (Job Seeker or Recruiter), enter name, email, password. Creates the account and logs you in. |
| `onboarding/page.tsx` | Shown after first Google sign-in. Google OAuth doesn't know your role, so this page asks "Are you a Job Seeker or Recruiter?" and sets it up. |

---

### `src/app/(dashboard)/` — Logged-In User Pages

Everything inside `(dashboard)` shares a sidebar layout with navigation links.

| File | What it renders |
|------|----------------|
| `layout.tsx` | The dashboard shell — a collapsible sidebar on the left (with navigation items that change based on your role) and the page content on the right. |

#### Profile Section (`/profile`)

| File | What it renders |
|------|----------------|
| `profile/page.tsx` | The main profile editing hub. Shows a header (name, headline, avatar, share link), a suggestion badge (if peers have suggested changes), and tabbed sections for experience, projects, internships, education, extra-curriculars, CodeChef, and miscellaneous. |
| `profile/loading.tsx` | A skeleton loading animation shown while the profile data is being fetched. |
| `profile/comments/page.tsx` | "Peer Reviews" page — lists all comments others have left on your profile. You can accept, decline, or reply to each one. |
| `profile/suggestions/page.tsx` | "Suggestions" page — lists all inline text suggestions. You can accept (auto-applies the change to your profile), decline, or delete each one. |
| `profile/settings/page.tsx` | Profile settings — change visibility (public/private/hidden), regenerate your share link, update headline/bio/location/social links. |
| `profile/print/page.tsx` | A clean, print-friendly version of your profile for generating PDFs. |
| `profile/print/PrintButton.tsx` | A small client-side component that triggers the browser's print dialog. |

#### Discover (`/discover`)

| File | What it renders |
|------|----------------|
| `discover/page.tsx` | "Discover People" — search for other job seekers with similar backgrounds. Uses AI vector similarity when the embedding API is available, falls back to text search otherwise. Shows profile cards with match scores. |

#### Mailbox (`/mailbox`)

| File | What it renders |
|------|----------------|
| `mailbox/page.tsx` | Lists all your conversations. Each row shows the other person's name and the last message preview. |
| `mailbox/[id]/page.tsx` | A single conversation thread — shows message history and a text input to send new messages. The `[id]` is a dynamic segment (the conversation ID). |

#### Recruiter Pages (`/recruiter`)

| File | What it renders |
|------|----------------|
| `recruiter/search/page.tsx` | Talent search — type a plain-English description ("senior React developer in Mumbai") and the AI finds the best-matching candidates using vector similarity. |
| `recruiter/jobs/page.tsx` | Job management — create, edit, and delete job postings. |

#### Admin Pages (`/admin`)

| File | What it renders |
|------|----------------|
| `admin/page.tsx` | Admin dashboard — shows platform statistics (total users, profiles, jobs, messages). |
| `admin/users/page.tsx` | User management — list all users with role badges, edit roles, or delete accounts. |

---

### `src/app/(public)/` — Publicly Accessible Pages

| File | What it renders |
|------|----------------|
| `layout.tsx` | A simpler layout for public pages — a top navigation bar with the HireStream logo, a back button, and a "Dashboard" or "Sign in" link. No sidebar. |
| `p/[token]/page.tsx` | **The public profile page** — the most feature-rich page in the app. When someone shares their profile link (e.g., `/p/abc123`), this page renders it. **Key features:** |
| | • Hero section with name, headline, location, social links |
| | • All profile sections (experience, projects, internships, education, extra-curriculars) |
| | • **For logged-in visitors (not the owner):** hover over any sentence to see a highlight; click to suggest an edit; click any sub-section card to leave a comment |
| | • **Feedback sidebar** on the right (like Google Docs) showing all your suggestions and comments with edit/withdraw options |
| | • Curved arrow connectors from sidebar items to the corresponding profile section |
| | • Real-time updates — new suggestions/comments appear in the sidebar instantly |
| | • **For the profile owner:** a banner saying "This is how others see your profile" with an "Edit Profile" link |

---

### `src/app/api/` — Server-Side API Endpoints

These are the "backend" — they receive requests, talk to the database, and return JSON responses. They are **never visible** to the user directly.

#### Authentication APIs

| File | Methods | What it does |
|------|---------|-------------|
| `auth/[...nextauth]/route.ts` | GET, POST | The NextAuth catch-all handler. Manages login sessions, OAuth callbacks, and token refresh. |
| `auth/register/route.ts` | POST | Creates a new user account — hashes the password, assigns the role and roles array, creates a Profile if Job Seeker. |
| `auth/onboarding/route.ts` | GET, POST | GET checks if onboarding is needed; POST sets the user's initial role and creates their profile. |
| `auth/switch-role/route.ts` | POST | Switches the user's active role. If the target role is new, adds it to their `roles` array. Creates a profile on-demand when switching to JOB_SEEKER for the first time. Returns the updated role and roles. |

#### Profile APIs

| File | Methods | What it does |
|------|---------|-------------|
| `profile/settings/route.ts` | GET, PATCH | Read or update profile metadata — name, headline, bio, location, social links, skills, visibility. Also regenerates the AI embedding when content changes. |
| `profile/share/[token]/route.ts` | GET | Fetches a full profile by its share token (used internally). |
| `profile/experience/route.ts` | GET, POST | List all experiences or add a new one. |
| `profile/experience/[id]/route.ts` | PATCH, DELETE | Update or delete a specific experience entry. |
| `profile/project/route.ts` | GET, POST | List all projects or add a new one. |
| `profile/project/[id]/route.ts` | PATCH, DELETE | Update or delete a specific project. |
| `profile/internship/route.ts` | GET, POST | List all internships or add a new one. |
| `profile/internship/[id]/route.ts` | PATCH, DELETE | Update or delete a specific internship. |
| `profile/academic/route.ts` | GET, POST | List all education entries or add a new one. |
| `profile/academic/[id]/route.ts` | PATCH, DELETE | Update or delete a specific education entry. |
| `profile/extra-curricular/route.ts` | GET, POST | List all extra-curricular activities or add a new one. |
| `profile/extra-curricular/[id]/route.ts` | PATCH, DELETE | Update or delete a specific extra-curricular activity. |
| `profile/codechef/route.ts` | POST | Sync CodeChef competitive programming data for the profile. |

#### Search & Discovery APIs

| File | Methods | What it does |
|------|---------|-------------|
| `search/route.ts` | GET | Recruiter talent search — converts the query into an AI embedding and finds the closest-matching profiles using vector distance. |
| `discover/route.ts` | GET | Job seeker discovery — finds profiles similar to yours using vector similarity, with a text-based fallback when the AI API is unavailable. |
| `upload/route.ts` | POST | Resume upload — accepts a PDF, extracts text using `unpdf`, sends it to Ollama's llama3.2 model to extract structured data (name, experience, skills, etc.), and returns the parsed result. |

#### Peer Review & Suggestion APIs

| File | Methods | What it does |
|------|---------|-------------|
| `comments/route.ts` | GET, POST | GET: fetch comments for a profile (owner sees all; others see only accepted). POST: create a new comment on a specific profile section/item. |
| `comments/[id]/route.ts` | PATCH, DELETE | PATCH: owner can accept/decline; author can edit (old version saved to history). DELETE: author or owner can remove. |
| `suggestions/route.ts` | GET, POST | GET: fetch suggestions (owner sees all; others see only their own). POST: create an inline text suggestion with character offsets. |
| `suggestions/[id]/route.ts` | PATCH, DELETE | PATCH: owner can accept (auto-applies the text change to the profile!) or decline; author can edit their suggestion text. DELETE: author or owner can remove. |

#### Messaging APIs

| File | Methods | What it does |
|------|---------|-------------|
| `conversations/route.ts` | POST | Create or find an existing conversation between two users. |
| `messages/route.ts` | GET, POST | GET: fetch messages in a conversation. POST: send a new message. |

#### Job APIs

| File | Methods | What it does |
|------|---------|-------------|
| `jobs/route.ts` | GET, POST | GET: list jobs (optionally filtered). POST: create a job posting with an AI embedding for matching. |
| `jobs/[id]/route.ts` | PATCH, DELETE | Update or delete a job posting. |

#### Admin APIs

| File | Methods | What it does |
|------|---------|-------------|
| `admin/stats/route.ts` | GET | Returns platform-wide counts (users, profiles, jobs, messages, etc.). |
| `admin/users/route.ts` | GET | List all users with their profiles. |
| `admin/users/[id]/route.ts` | PATCH, DELETE | Change a user's role or delete their account. |

---

## `src/components/` — Reusable UI Pieces

### `src/components/ui/` — Generic UI Primitives

These are **shadcn/ui** components — pre-styled building blocks with no business logic. They look consistent across the entire app.

| Component | What it is |
|-----------|-----------|
| `avatar.tsx` | A circular image with a fallback showing initials. |
| `badge.tsx` | A small colored label (e.g., "React", "PENDING", "ACCEPTED"). |
| `button.tsx` | A button with variants: default, outline, ghost, destructive, link. |
| `card.tsx` | A bordered container with header, content, and footer slots. |
| `checkbox.tsx` | A checkbox input with a checkmark animation. |
| `dialog.tsx` | A modal overlay that dims the background and shows content in the center. |
| `input.tsx` | A styled text input field. |
| `label.tsx` | A form label that associates with an input. |
| `select.tsx` | A dropdown selector with search and scroll support. |
| `separator.tsx` | A horizontal or vertical line to visually divide content. |
| `sheet.tsx` | A panel that slides in from the side (like a drawer). |
| `sidebar.tsx` | The layout primitives for the dashboard sidebar — provider, trigger, content, menu items, etc. |
| `skeleton.tsx` | A pulsing placeholder shown while content is loading. |
| `sonner.tsx` | Wrapper around the Sonner toast library for notifications. |
| `tabs.tsx` | Tabbed navigation — click a tab to show its content panel. |
| `textarea.tsx` | A multi-line text input. |
| `tooltip.tsx` | A small popup that appears on hover to explain something. |

### `src/components/features/` — Business-Logic Components

These components contain the actual app logic — they fetch data, handle user actions, and compose the UI primitives.

#### `AppSidebar.tsx` — Dashboard Navigation

The collapsible sidebar shown on all dashboard pages. Contains different navigation links based on your active role:

- **Job Seekers** see: Profile, Discover, Peer Reviews, Suggestions, Mailbox, Settings
- **Recruiters** see: Search Talent, My Jobs, Mailbox
- **Admins** see: Dashboard, Users, Mailbox

Also shows the user's avatar, name, current role badge, **Role Switcher** (to toggle between Job Seeker and Recruiter), and a logout button at the bottom.

#### `RoleSwitcher.tsx` — Role Switching

A dropdown button in the sidebar footer that lets users switch between roles. If the user already has the other role, it says "Switch to [role]". If they don't have it yet, it says "Add [role] Role" — clicking it grants the new role and switches to it in one step. The session/JWT is refreshed and the page redirects to the appropriate dashboard.

#### `features/profile/` — Profile Editing Components

| Component | What it does |
|-----------|-------------|
| `ProfileHeader.tsx` | The top section of the profile page — shows avatar, name (editable inline with a pencil icon), headline, location, social links, visibility badge, share button, and resume upload. |
| `ProfileTabs.tsx` | Tab bar that switches between profile sections: Experience, Projects, Internships, Education, Extra-Curricular, CodeChef, Misc. |
| `ExperienceTab.tsx` | CRUD interface for work experience — list existing entries, add/edit/delete with a form (company, role, dates, location, description). |
| `ProjectsTab.tsx` | CRUD interface for projects — name, description, tech stack (comma-separated), live URL, repo URL. |
| `InternshipTab.tsx` | CRUD interface for internships — company, role, dates, stipend, description. |
| `AcademicTab.tsx` | CRUD interface for education — institution, degree, field of study, GPA, start/end years. |
| `ExtraCurricularTab.tsx` | CRUD interface for activities — activity name, role, description. |
| `CodeChefTab.tsx` | Displays CodeChef competitive programming stats (read-only, synced from CodeChef). |
| `MiscTab.tsx` | A catch-all tab for displaying any additional profile sections. |
| `CommentCard.tsx` | Renders a single peer review comment with author info, timestamp, content, accept/decline buttons (for owner), and reply thread. |
| `ProfileSettingsForm.tsx` | The settings form for visibility, headline, bio, location, social links, and skills. |

#### `features/suggestions/` — Inline Suggestion System

This is the **Google Docs-style** suggestion system.

| Component | What it does |
|-----------|-------------|
| `TextSelectionSuggest.tsx` | Wraps a text block on the public profile. **Hover** over a sentence → it highlights. **Click** a sentence → opens a form to suggest a replacement. **Select text** with mouse → shows a floating "Suggest edit" button. Submits to the suggestions API and updates the sidebar in real-time. When the sidebar hovers this section, it glows with a ring highlight. |
| `SuggestionIndicator.tsx` | A small amber badge that appears below text that has pending suggestions. Shows count like "2 pending suggestions". Click to expand and see original → suggested text diffs. |
| `SuggestionCard.tsx` | Used on the owner's Suggestions dashboard page. Shows a full suggestion with original text (red strikethrough) → suggested text (green), author info, timestamp, and Accept/Decline/Delete buttons. Accepting auto-applies the change to the profile. |
| `SuggestionBadge.tsx` | A minimal expandable badge shown on the dashboard profile page. Shows "3 pending / 7 total" suggestions. Click to expand a preview list with links to the full suggestions page. |
| `SuggestButton.tsx` | A per-field suggest button (pencil icon). Click to open a form showing current text and a textarea for the replacement. An alternative to text selection for shorter fields. |
| `SuggestionsSidebar.tsx` | The original suggestions-only sidebar (now superseded by FeedbackSidebar for public profiles, but still available). |

#### `features/public/` — Public Profile Components

| Component | What it does |
|-----------|-------------|
| `ProfileFeedbackContext.tsx` | A React context (shared state container) that all feedback components on the public profile page share. Holds the list of sidebar items, an `addItem` function for real-time updates, and a `highlightedId` for the arrow connector system. |
| `FeedbackSidebar.tsx` | The **unified right-side panel** on public profiles (like Google Docs). Shows both suggestions AND comments in tabs (All / Suggestions / Comments). Each item shows its status, section type, and content. **Pending items** can be edited or withdrawn. **Hover** over an item → draws a curved dashed arrow from the sidebar to the corresponding profile section and highlights it. **Click** → scrolls to and briefly highlights the target section. |
| `SubSectionComment.tsx` | Wraps each individual profile card (a specific job experience, a specific project, etc.). On **hover**, shows a subtle "Comment" badge in the corner. On **click**, opens an inline comment form. The comment is linked to the specific item via `sectionItemId` so the sidebar can map it back with an arrow connector. |
| `PublicCommentSection.tsx` | A full comment section with threading — used for displaying accepted comments publicly. Includes a section filter dropdown, comment form, and nested reply threads. |

#### `features/discover/` — Profile Discovery

| Component | What it does |
|-----------|-------------|
| `DiscoverSearch.tsx` | The search interface on the Discover page. Type a query, hit search, and see matching profiles ranked by similarity score. Uses AI vector search when available, text search as fallback. Each result shows a profile card with name, headline, skills, and a link to their public profile. |

#### `features/messaging/` — Chat System

| Component | What it does |
|-----------|-------------|
| `ConversationView.tsx` | The chat message thread. Shows messages with timestamps, sender alignment (your messages on the right, theirs on the left), and a text input with send button at the bottom. Auto-scrolls to the latest message. |

#### `features/recruiter/` — Recruiter Tools

| Component | What it does |
|-----------|-------------|
| `SearchBar.tsx` | The talent search input — type a natural language description and get AI-ranked candidate results with match scores and profile previews. |
| `CreateJobDialog.tsx` | A dialog form for creating a new job posting — title, company, description, requirements, location, salary range, remote flag. |
| `JobActions.tsx` | Edit and delete buttons for job postings, with confirmation dialogs. |

#### `features/admin/` — Admin Tools

| Component | What it does |
|-----------|-------------|
| `UserActions.tsx` | Action buttons on each user row in the admin panel — change role dropdown and delete button with confirmation. |

---

## `src/lib/` — Shared Utilities

These are the "plumbing" files that multiple parts of the app use.

| File | What it does |
|------|-------------|
| `db.ts` | Creates a single shared database connection (Prisma client) using the PostgreSQL adapter. Every API route and server component imports `db` from here to query the database. |
| `auth.ts` | The full NextAuth configuration — sets up two login providers (email/password via Credentials, and Google OAuth), configures JWT sessions, defines callbacks that include both `role` (active) and `roles` (all granted) in the session, and uses PrismaAdapter to store auth data in the database. The JWT callback refreshes from the database on sign-in and session updates (e.g., after role switch). |
| `auth.config.ts` | A lightweight version of the auth config that works in Next.js middleware (which runs on the "edge" and can't use full Node.js). Passes both `role` and `roles` through JWT → session. |
| `utils.ts` | Small helper functions — `cn()` merges CSS class names, `toBool()` converts strings to booleans, `safeDate()` safely parses date strings. |

### `src/lib/ai/` — AI & Machine Learning

| File | What it does |
|------|-------------|
| `embeddings.ts` | Connects to Google's `text-embedding-004` model. Takes a piece of text and returns a 768-number array (vector) that captures its meaning. Used to make profiles and queries searchable by meaning, not just keywords. |
| `gemini.ts` | Initializes the Google Generative AI client (Gemini model). Used as a foundation for the embedding and other AI functions. |
| `resume-parser.ts` | The resume upload pipeline: (1) extracts text from the uploaded PDF using `unpdf`, (2) sends the text to a local Ollama llama3.2 model with a structured prompt, (3) parses the AI's JSON response into typed fields (name, email, experience, skills, etc.). |
| `profile-embedding.ts` | Takes all of a user's profile data (headline, bio, experience descriptions, project descriptions, skills, education, etc.), concatenates it into a single text block, and generates a vector embedding. This embedding is stored in the database and used for similarity search. |

---

## `src/hooks/` — Custom React Hooks

| File | What it does |
|------|-------------|
| `use-mobile.ts` | A hook that returns `true` when the browser window is narrower than 768px. Used by the sidebar to auto-collapse on mobile devices. |

---

## `src/types/` — TypeScript Type Definitions

| File | What it does |
|------|-------------|
| `index.ts` | Defines shared types used across the app: `FullProfile` (a profile with all its related data — experiences, projects, etc.), `ProfileCompleteness` (tracks which sections are filled out), and `ParsedResume` (the structured output from resume parsing). |

---

## `src/middleware.ts` — Route Protection

This file runs **before every page request** and acts as a security gate:

1. **Public paths** (`/login`, `/register`, `/onboarding`, `/p/*`) → anyone can access, no check needed.
2. **Authenticated paths** → if you're not logged in, redirect to `/login`.
3. **Role-based paths** — checks the user's **`roles` array** (not just active role), so dual-role users can access both dashboards:
   - `/recruiter/*` → requires RECRUITER or ADMIN in roles array
   - `/profile/*` → requires JOB_SEEKER in roles array
   - `/admin/*` → requires ADMIN in roles array
4. If you're logged in but don't have the required role, you get redirected to your appropriate home page.

---

## Key Features Explained

### 1. Multi-Role System

A single user can be both a Job Seeker and a Recruiter. Here's how it works:

- **Registration/Onboarding**: You pick one role to start.
- **Adding a second role**: Click "Switch Role" in the sidebar → "Add [Role] Role". The system grants it instantly.
- **Switching**: Once you have both roles, the switcher toggles between them. Your active role determines which dashboard and navigation you see.
- **On-demand setup**: When you switch to Job Seeker for the first time, a profile is automatically created. No extra steps needed.
- **Middleware**: Route guards check your `roles` array (all roles you hold), not just your active role — so dual-role users can navigate freely between both dashboards.
- **Google OAuth**: Works for both roles. After first Google sign-in, onboarding asks which role you want. You can add the other role later via the sidebar switcher.

### 2. The Suggestion System (Google Docs-style)

When you visit a peer's public profile:

- **Hover** over any sentence in their descriptions → the sentence highlights in a soft color
- **Click** the sentence → a form appears where you type your suggested replacement
- **Select text** with your mouse → a floating "Suggest edit" button appears

Your suggestion is saved with exact character positions. The profile owner sees it on their Suggestions dashboard and can **Accept** (which automatically rewrites that text in their profile) or **Decline**.

### 3. The Feedback Sidebar

On public profiles, a sidebar appears on the right (like Google Docs) showing all your suggestions and comments on this profile. It has:

- **Tabs** to filter: All, Suggestions, Comments
- **Pending count** badge
- **Edit/Withdraw** actions for your pending items
- **Arrow connectors** — hover over any sidebar item and a dashed curved line connects it to the exact profile section it refers to, which also glows with a highlight

### 4. AI-Powered Search

Profiles and job postings are converted into 768-dimensional vectors (numeric fingerprints of meaning). When a recruiter searches "Python developer with ML experience," that query is also converted to a vector, and the database finds the profiles whose vectors are closest — meaning they are most semantically similar, even if they use different words.

### 5. Resume Parsing

Upload a PDF resume, and a local AI model (llama3.2 via Ollama) reads it and extracts structured data — name, contact info, work experience, projects, education, skills — which auto-populates your profile sections.

---

## How Data Flows Through the App

```
User Action (browser)
    ↓
Page Component (src/app/**/page.tsx)
    ↓
API Route (src/app/api/**/route.ts)
    ↓
Prisma Client (src/lib/db.ts)
    ↓
PostgreSQL Database
```

For real-time sidebar updates (suggestions & comments):

```
User submits suggestion/comment
    ↓
Component calls fetch() to API
    ↓
API creates record in DB, returns it
    ↓
Component calls addItem() on ProfileFeedbackContext
    ↓
Sidebar re-renders instantly with the new item
```

---

*Last updated: 2026-03-17 (v2 — added multi-role system)*
