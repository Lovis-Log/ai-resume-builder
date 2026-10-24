# AI Resume Builder — Full Build Plan

> **Last updated:** 2026-10-24
> **Status:** Interview complete. Product spec, architecture, and implementation plan are aligned. No product code has been written.
> **Billing provider:** integration deferred by choice (see §14). Everything else is locked.
> **How to use this file:** this is the single reference for the project. Update it when a decision changes; do not let code and this document drift.

---

## 0. Executive summary

Build a paid, AI-assisted resume builder for **early-career job seekers / new graduates**. The product takes a user from a blank page to a clean, ATS-parseable, job-tailored resume in minutes, then exports a selectable-text PDF.

The wedge is:
1. A **free 10-check resume score** — the hook.
2. **Job-description tailoring** — the paid value.
3. A deliberately constrained editor and one ATS-safe template — the reliability promise.

**Stack:** Next.js 16.4.2 App Router on Vercel, Neon Postgres + Neon Auth (Google only), DeepSeek `deepseek-flash`, `@react-pdf/renderer`, Tailwind 4, Drizzle ORM.

**Commercial model:** Free tier with lifetime limits; Pro at $12/month with 500 included AI actions and metered overage. Billing provider integration is deferred; the app is built provider-agnostically and cannot launch as a paid product until a provider is connected.

**Timeline:** no fixed deadline. A realistic solo build with AI assistance is ~4–6 weeks across the phases in §8.

---

## 1. Product specification

### 1.1 Target user

Early-career / new-grad job seekers, primarily on a laptop, applying to multiple roles. They need a credible, ATS-safe resume but cannot afford a professional writer and do not want a complex design tool.

**Positioning:** “AI resume builder for new grads — free score, ATS-safe PDF, tailored to the job.”

### 1.2 Core job to be done

“Help me turn my experience, projects, and coursework into a clean resume that gets past applicant tracking systems and matches this job description — without me learning resume design.”

### 1.3 In scope (v1)

#### A. Auth + dashboard
- Google-only sign-in via Neon Auth.
- Dashboard lists resumes; create, rename, delete.
- Free users: **1 concurrent resume**. Pro: unlimited.
- No teams, sharing, folders, or orgs.

#### B. Resume editor
- Fixed sections in this order:
  1. **Contact** — full name, email, phone, location. Core only; no LinkedIn/GitHub fields in v1.
  2. **Summary** — plain text.
  3. **Experience** — title, company, location, start date, end date, current flag, bullets.
  4. **Education** — school, degree, major, location, start/end dates, GPA, coursework, honors.
  5. **Projects** — name, link, start/end dates, bullets.
  6. **Skills** — one comma-separated string.
- Add/remove entries and bullets.
- Plain text only; no rich formatting.
- Autosave with save status and stale-tab detection.
- No drag-and-drop, custom sections, or formatting toolbar.

#### C. Live preview + one ATS-safe template
- Single-column layout, selectable text, embedded fonts.
- No tables, icons, photos, sidebars, or multi-column grids.
- A4 page size (210 × 297 mm).
- Preview updates beside the editor.
- One template only. More templates later, after payment.

#### D. AI writing (3 buttons)
- **Write summary** — from target role + resume experience.
- **Write bullets** — from job title, company, and user notes.
- **Improve** — rewrite a selected bullet.
- Each successful generation consumes **1 AI action**.

#### E. Job tailoring (paid value)
- Paste a job description.
- **Analyze job** calls DeepSeek and returns the top 10 keywords plus which are missing from the resume. Consumes **1 AI action** on success.
- **Tailor my resume** rewrites the summary and top 3 bullets. Consumes **1 AI action** on success.
- User reviews original vs suggested per item with checkboxes and applies selected items.
- Full run = **2 AI actions**.
- No keyword taxonomy or complex matching engine.

#### F. Resume score (free hook)
- 10 pass/fail checks, 10 points each, 0–100.
- Checks: contact info, summary present, experience present, 2+ bullets per job, action verbs, numbers in bullets, 5+ skills, 1–2 pages, dates present, no first-person pronouns.
- Each item shows pass/fail and a “fix” link that scrolls to and focuses the relevant field.
- No AI. Free to run.

#### G. PDF download + billing
- One-click PDF, selectable text, single column, A4.
- Free: **3 PDF downloads lifetime**; each successful generation counts.
- Pro: **$12/month**, unlimited resumes/downloads, **500 AI actions included per billing month**, then **$0.05/action metered overage**, capped at **$25/month** (500 extra actions; 1,000 total).
- Monthly only. No trial. No annual plan.
- Billing provider integration is deferred. Build the entitlement layer and a provider-agnostic adapter now; integrate Creem (recommended) or Dodo when ready. Hosted checkout, customer portal, webhooks, and tax are provider responsibilities.
- Until a provider is connected: Pro is granted through a `manual` adapter for development/testing, and the production upgrade flow is feature-flagged off. **Paid launch is blocked until a provider is connected.**
- Upgrade modal when a free user hits a limit.

### 1.4 Explicitly out of scope

Teams, sharing, folders, custom sections, drag-and-drop, rich text formatting, multiple templates, cover letters, LinkedIn/PDF import, DOCX export, transactional email, marketing email, admin dashboard, i18n, mobile editing.

### 1.5 Pricing and limits

| | Free | Pro |
|---|---|---|
| Price | $0 | $12/month |
| Resumes | 1 concurrent | Unlimited |
| AI actions | 3 lifetime | 500 included per billing month |
| Overage | — | $0.05/action, capped at $25/month (500 extra actions) |
| PDF downloads | 3 lifetime | Unlimited |
| Support | mailto | mailto; provider handles receipts |

- AI actions are consumed only on successful, validated output.
- Tailoring costs 2 actions per full run: keywords + rewrite.
- PDF downloads are consumed per successful generation; failed renders are free.
- A free user may delete their only resume and create another; lifetime AI/PDF counters do **not** reset.
- A canceled Pro user keeps access through the paid period, then reverts to free limits for new resumes, AI actions, and PDFs. Existing extra resumes remain viewable/editable.

### 1.6 Definition of done

All seven features work end-to-end against real Neon and DeepSeek and either a billing sandbox or the `manual` Pro adapter:
- Free limits enforced atomically.
- PDF parses cleanly with text extraction and embedded fonts.
- Critical-path tests pass in CI.
- Google OAuth works in production.
- Account deletion works.
- Paid launch additionally requires a connected billing provider and verified checkout/portal/webhooks.

---

## 2. Users and core flows

### 2.1 Visitor

1. Lands on `/` — single public landing page.
2. Sees hero, sample resume/score explanation, how it works, pricing, FAQ, CTA.
3. Clicks “Build my resume” → `/login`.

### 2.2 Signup / onboarding

1. `/login` — “Continue with Google”.
2. Google OAuth → Neon Auth session.
3. Redirect to `/dashboard`.
4. Empty state: “Create your first resume”.
5. Create dialog asks for a resume title (default “Untitled resume”).
6. Enter editor.

### 2.3 Dashboard

- Lists resumes sorted by `updated_at DESC`.
- Each card: title, updated date, score badge if available, menu (rename, delete).
- “New resume” button:
  - Free user with 1 resume → upgrade modal.
  - Pro → create dialog.
- Empty state with a single primary CTA.
- Plan/usage summary: free remaining AI/PDF; Pro included/overage usage.

### 2.4 Editor

- Desktop-only split layout:
  - Left: scrollable section editors.
  - Right: sticky live preview and score panel/tabs.
- Header: back to dashboard, editable title, save status, AI usage badge, Download PDF button.
- Add/remove entries and bullets.
- Autosave:
  - Debounce ~700 ms.
  - Save status: “Saving…”, “Saved”, “Couldn’t save — retry”.
  - `version` check detects stale tabs; on conflict show “This resume was updated in another tab” with “Reload latest” and “Overwrite” options (v1: reload latest; overwrite optional).
  - Local draft backup in `localStorage` on every change; restore if the server save fails or the session expires.

### 2.5 AI writing

- **Write summary**:
  - Button in Summary section opens a dialog with a target-role input, prefilled from the most recent job title.
  - Calls `/api/ai/write-summary`.
  - Returns a summary the user can insert, replace, or discard.
- **Write bullets**:
  - Button in an Experience entry opens a dialog with job title, company, and notes.
  - Prefills title/company from the entry.
  - Returns 3–5 bullets; user can append selected bullets.
- **Improve**:
  - User selects a bullet; button calls `/api/ai/improve` with the bullet + job context.
  - Returns one improved bullet; user accepts or rejects.
- Every control shows “Uses 1 AI action”.
- Before the first AI action, show the AI consent modal.

### 2.6 Job tailoring

1. Open “Tailor to job” panel in the editor.
2. Paste a job description (max 10,000 characters).
3. Click **Analyze job** (1 action):
   - DeepSeek extracts top 10 keywords with importance and evidence quotes.
   - App matches them against the resume text.
   - UI shows keyword chips, present vs missing, and evidence.
   - Creates a `tailoring_runs` row.
4. Click **Tailor my resume** (1 action):
   - DeepSeek rewrites the summary and top 3 most relevant bullets.
   - Each suggestion includes original, suggested, and source quotes.
   - UI shows original vs suggested side by side with per-item checkboxes.
5. User selects items and clicks **Apply selected**:
   - Updates resume content.
   - Marks run `applied`.
   - No AI action consumed.
6. User can discard the run.

### 2.7 Resume score

- Visible in the editor as a panel/tab.
- Updates live as the user types.
- Shows 0–100 and 10 checks with pass/fail.
- Each failed check has a “Fix” link that scrolls to and focuses the relevant field.
- Free, no AI.

### 2.8 PDF download

- Click **Download PDF**.
- If free and 0 downloads remaining → upgrade modal.
- If allowed:
  - POST to `/api/resumes/[id]/pdf` with an idempotency key.
  - Server renders PDF, counts usage on success, returns bytes.
  - Client downloads via blob URL.
- Show remaining free downloads.
- Filename: `First-Last-Resume.pdf` (sanitized).

### 2.9 Upgrade / cancel

- Upgrade modal appears when:
  - Free user tries to create a second resume.
  - Free user has used 3 AI actions.
  - Free user has used 3 PDF downloads.
- Modal shows Pro benefits, price, included actions, overage terms, and CTA.
- If billing is disabled (`BILLING_PROVIDER=manual`), show “Billing is coming soon” and a mailto; do not fake checkout.
- When connected:
  - CTA creates a provider checkout session.
  - `/billing` shows plan, usage, portal link, invoices.
  - Cancellation is handled by the provider portal; webhook updates entitlement at period end.

### 2.10 Account deletion

- `/settings` → “Delete account”.
- Confirmation modal requires typing `DELETE`.
- Server action:
  1. Force fresh session (`disableCookieCache: true`).
  2. Cancel active subscription if provider connected.
  3. Call `auth.deleteUser()` (removes `neon_auth` user, sessions, accounts).
  4. App tables cascade from `profiles`/`neon_auth.user`.
  5. Redirect to `/`.
- If `auth.deleteUser()` fails, fall back to admin API/CLI and show a support message; do not silently leave data.
- Note: the signed `session_data` cookie may remain valid for up to 5 minutes; the account is deleted server-side.

---

## 3. Pages and routing

### 3.1 Public

| Route | Purpose |
|---|---|
| `/` | Single landing page with `#pricing` anchor. Responsive. |
| `/login` | Google sign-in. Redirects authenticated users to `/dashboard`. |
| `/privacy` | Privacy policy naming DeepSeek and, once connected, the billing provider. AI consent language. |
| `/terms` | Terms of service. |

### 3.2 Protected (desktop-only)

| Route | Purpose |
|---|---|
| `/dashboard` | Resume list, create/rename/delete, plan/usage summary. |
| `/resume/[id]` | Editor + preview + score + tailoring. Ownership checked. |
| `/billing` | Plan, usage, provider portal (once connected), invoices. |
| `/settings` | Account info, AI consent status, delete account. |

- App routes show a desktop gate below the desktop breakpoint (e.g., `< 1024px`):
  - Clear notice: “The editor works best on a desktop. Open this page on a laptop or desktop computer.”
  - Do not block the public landing page.
- App pages set `robots: { index: false }`.

### 3.3 Route handlers

| Route | Purpose |
|---|---|
| `GET/POST /api/auth/[...path]` | Neon Auth handler. |
| `POST /api/ai/write-summary` | Generate summary. |
| `POST /api/ai/write-bullets` | Generate bullets. |
| `POST /api/ai/improve` | Improve a bullet. |
| `POST /api/ai/keywords` | Extract JD keywords + missing. |
| `POST /api/ai/tailor` | Generate tailored summary + bullets. |
| `POST /api/resumes/[id]/pdf` | Render and return PDF. |
| `POST /api/billing/webhook` | Provider webhook, signature-verified. |

### 3.4 Server actions

- `createResume(title)`
- `renameResume(id, title)`
- `deleteResume(id)`
- `saveResume(id, content, version)` — debounced autosave.
- `applyTailoring(runId, selectedItemIds)`
- `createCheckoutSession()`
- `createPortalSession()`
- `deleteAccount()`
- `signOut()`

### 3.5 Protection model

- `proxy.ts` (Next 16 replaces `middleware.ts`) performs an optimistic session check and redirects unauthenticated app routes to `/login`.
- Matcher:
  ```ts
  export const config = {
    matcher: ['/dashboard/:path*', '/resume/:path*', '/billing/:path*', '/settings/:path*'],
  };
  ```
- Every server action and route handler re-authenticates and re-authorizes.
- Ownership checks return `notFound()` rather than leaking existence.
- Proxy is never the security boundary.
- `getCurrentUser()` is a server-only DAL function using `use cache: private`.
- Session-reading UI sits behind `<Suspense>`.
- Do not use `export const dynamic` or `export const runtime` with Cache Components enabled.

---

## 4. Data model

**Database:** Neon Postgres.
**ORM:** Drizzle ORM with `pg` (node-postgres) and a pooled connection string.
**Migrations:** Drizzle Kit using the unpooled URL.
**File storage:** none. All resume content lives in Postgres.

### 4.1 Relationships

```
neon_auth.user (managed)
    │ 1:1
public.profiles
    │ 1:N
    ├── public.resumes
    │       ├── 1:N public.usage_events
    │       └── 1:N public.tailoring_runs
    ├── 1:1 public.subscriptions
    └── 1:N public.usage_events
```

### 4.2 `profiles`

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES neon_auth.user(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  avatar_url text,
  ai_consent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

- `id` is the Neon Auth user UUID. Use `uuid`, not `text`.
- Created lazily on first authenticated request (`getOrCreateProfile`).
- Updating email/name/avatar on each session read is optional; do it on dashboard load.
- `ai_consent_at` records the DeepSeek consent.

### 4.3 `resumes`

```sql
CREATE TABLE public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb NOT NULL,
  version integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX resumes_user_updated_idx
  ON public.resumes (user_id, updated_at DESC);
```

- `content` validated by Zod before write.
- `version` increments on every save; used for stale-tab detection.
- Free user limit: count rows where `user_id = $1`; enforce in a transaction with an advisory lock to prevent concurrent creates.

### 4.4 Resume content schema

```ts
type ResumeContent = {
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    id: string;              // crypto.randomUUID()
    title: string;
    company: string;
    location: string;
    startDate: string;       // "YYYY-MM"
    endDate: string | null;  // "YYYY-MM" or null when current
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    major: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    coursework: string;
    honors: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    link: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  skills: string;            // comma-separated
};
```

- Max lengths (enforced in Zod):
  - Contact name/email/phone/location: 200 chars each.
  - Summary: 2,000 chars.
  - Bullet: 500 chars; max 10 bullets per entry.
  - Entry fields: 200 chars each.
  - Skills: 1,000 chars.
  - Job description: 10,000 chars.
- Dates are strings to avoid timezone bugs. Render `"Jan 2024"` and `"Jan 2024 – Present"`.
- Empty entries are allowed in the editor but hidden in the PDF.
- `skills` is a single string; the score counts comma-separated items.

### 4.5 `usage_events`

```sql
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN (
    'ai_summary','ai_bullets','ai_improve','ai_keywords','ai_tailor','pdf_download'
  )),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','succeeded','failed')),
  idempotency_key text NOT NULL,
  model text,
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(10,6),
  billing_period_start timestamptz,
  provider_reported_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, idempotency_key)
);

CREATE INDEX usage_events_user_created_idx
  ON public.usage_events (user_id, created_at DESC);
CREATE INDEX usage_events_user_period_idx
  ON public.usage_events (user_id, billing_period_start);
```

- **Reservation pattern** prevents free-limit races:
  1. In a transaction, acquire `pg_advisory_xact_lock(hashtext(user_id))`.
  2. Count `succeeded` events plus non-stale `pending` events.
  3. If under limit, insert a `pending` event with the idempotency key.
  4. Call the provider / render PDF.
  5. On success: update `status='succeeded'`, tokens, cost.
  6. On failure: update `status='failed'`.
- Stale pending events (older than 10 minutes) are treated as failed in entitlement queries.
- Unique `(user_id, idempotency_key)` prevents duplicate charges. If a duplicate key is submitted:
  - If the existing event succeeded, return a cached/regenerated result without charging.
  - If pending, return 409 “already in progress”.
  - If failed, allow a new key (client should generate a new one).
- Tier rules:
  - Free: count `kind LIKE 'ai_%'` lifetime for AI; `kind='pdf_download'` lifetime for PDFs.
  - Pro: count AI events in the current billing period; PDFs unlimited.
- Overage units = `max(0, pro_ai_succeeded_in_period - 500)`, capped at 500.
- Hard stop at 1,000 AI actions per period.
- `billing_period_start` is set from the subscription’s current period start at reservation time.

### 4.6 `tailoring_runs`

```sql
CREATE TABLE public.tailoring_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id uuid NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_description text NOT NULL,
  keywords jsonb NOT NULL DEFAULT '[]',
  missing_keywords jsonb NOT NULL DEFAULT '[]',
  suggestions jsonb,
  status text NOT NULL DEFAULT 'keywords_ready'
    CHECK (status IN ('keywords_ready','tailored','applied','discarded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tailoring_runs_resume_created_idx
  ON public.tailoring_runs (resume_id, created_at DESC);
```

- `keywords`: `[{ term, importance, evidenceQuote, found }]`
- `missing_keywords`: `[{ term, importance, evidenceQuote }]`
- `suggestions`: `{ summary: { original, suggested, sourceQuotes }, bullets: [{ id, original, suggested, sourceQuotes }] }`
- Validate `sourceQuotes` are substrings of the original resume or JD before storing/serving.

### 4.7 `subscriptions`

```sql
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'manual',
  customer_id text,
  subscription_id text,
  status text NOT NULL DEFAULT 'inactive',
  plan text NOT NULL DEFAULT 'free',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_provider_sub_idx
  ON public.subscriptions (provider, subscription_id);
```

- `status`: `inactive | active | past_due | canceled | trialing`.
- `plan`: `free | pro`.
- Entitlement: Pro if `plan='pro'` and `status` is `active`/`trialing`, or `canceled`/`past_due` but `current_period_end > now()` (grace until period end).
- Webhooks are the source of truth once a provider is connected.

### 4.8 `webhook_events`

```sql
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);
```

- Insert first; if unique violation, return 200 (already processed).
- Process in a transaction; update `processed_at` or `error`.
- Return 500 on processing failure so the provider retries.

### 4.9 `usage_outbox`

```sql
CREATE TABLE public.usage_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_event_id uuid NOT NULL REFERENCES public.usage_events(id) ON DELETE CASCADE,
  provider text NOT NULL,
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX usage_outbox_pending_idx
  ON public.usage_outbox (sent_at, next_attempt_at);
```

- Used only when a metered provider is connected.
- Attempt immediately after a successful Pro AI action; on failure, retry lazily on the next request or billing page load.
- No cron in v1; if volume grows, add a scheduled flush.

### 4.10 `rate_limits`

```sql
CREATE TABLE public.rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0
);
```

- Per-user AI: e.g., 20 requests/minute + max 3 concurrent.
- Per-user PDF: e.g., 10/minute.
- Implement with an atomic upsert; no Redis dependency.
- Usage limits already cap total volume; rate limits protect against bursts.

### 4.11 Data deletion

- `profiles` cascades to resumes, usage events, tailoring runs, subscriptions, outbox rows.
- `neon_auth.user` cascades to `neon_auth.session` and `neon_auth.account`.
- Account deletion order:
  1. Cancel active subscription (if provider connected).
  2. Call `auth.deleteUser()`.
  3. App rows cascade via FK.
- If `auth.deleteUser()` is unavailable or fails, use Neon CLI/management API; never leave the auth user active while deleting only app data.
- Direct SQL against `neon_auth` is a fallback, not the primary path.

---

## 5. Architecture

### 5.1 Stack decisions

| Layer | Decision | Why |
|---|---|---|
| Framework | Next.js 16.4.2 App Router | Existing repo; Server Components + Server Actions. |
| Hosting | Vercel | Native Next.js support, Fluid compute, easy env/preview deploys. |
| Database | Neon Postgres | Serverless Postgres, branching, generous free tier. |
| ORM | Drizzle ORM + `pg` | Typed SQL, migrations, good serverless support. |
| Auth | Neon Auth (Managed Better Auth) | Google OAuth, sessions in Postgres, user chose Neon. |
| AI | DeepSeek `deepseek-flash` | User choice; low cost, 1M context, JSON output. |
| PDF | `@react-pdf/renderer` | Pure JS, selectable text, deterministic single-column, no Chromium. |
| Preview | HTML/CSS | Lightweight, instant updates; PDF is separate but aligned. |
| Billing | Provider-agnostic adapter; Creem recommended | Deferred; no Stripe-capable entity. |
| Styling | Tailwind CSS 4 + small component layer | Existing setup; no heavy UI kit. |
| Analytics | Vercel Analytics + structured logs | User choice; no Sentry/PostHog. |
| Tests | Vitest + Playwright | Critical-path coverage only. |

### 5.2 Next.js 16 specifics

The repo has:
```ts
cacheComponents: true,
partialPrefetching: true,
turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
```

Rules to follow:
- **`middleware.ts` is replaced by `proxy.ts`.** Export `proxy` (default export) and `config.matcher`. Proxy runs on Node.js only; do not set `runtime`.
- **Cache Components is on.** Do not use `export const dynamic`, `dynamicParams`, `revalidate`, or `fetchCache` in routes. Do not export `runtime`.
- **Request-time data** (`cookies()`, `headers()`, session reads) must be inside `<Suspense>` or handled with `use cache: private`.
- **`getCurrentUser()`** should use `use cache: private`, because Neon Auth reads cookies. Keep it in a server-only DAL module.
- **`params` and `searchParams` are Promises.** Await them.
- **`revalidateTag` requires a second argument** in Next 16; use `updateTag(tag)` in Server Actions for read-your-own-writes.
- **`error.tsx`** is a Client Component and receives `error`, `retry()`, and `reset()`. Use `retry()` for retry buttons.
- **`next lint` is removed.** Scripts use `eslint`.
- **Server Actions** are POST-only, serialize one at a time per client, have a 1 MB body limit by default, and must authenticate/authorize themselves.
- **Route handlers** are not cached by default; POST handlers are dynamic. Set `maxDuration` for AI/PDF routes; do not set `runtime` with Cache Components.
- **Parallel routes** require explicit `default.js`; not used in v1.
- **Metadata/OG/sitemap** conventions are current; `sitemap()` `id` is a Promise in v16 if using `generateSitemaps` (not needed for a single sitemap).
- **Turbopack** is the default bundler. Tailwind 4 is wired through `@tailwindcss/turbopack`; do not add a PostCSS config.

### 5.3 Neon Postgres + Drizzle

- Use the **pooled** `DATABASE_URL` for application queries.
- Use the **unpooled** `DATABASE_URL_UNPOOLED` for migrations and `CREATE INDEX CONCURRENTLY`.
- On Vercel with Fluid compute, Neon recommends `pg` (node-postgres) + a pooled connection string + `attachDatabasePool` from `@vercel/functions` to close idle connections before suspension.
- Drizzle driver: `drizzle-orm/node-postgres` with `pg.Pool`.
- Create one pool per server instance; do not double-pool.
- Neon free tier scales to zero after 5 minutes; first query after idle may be slower. Do not add health checks that keep it awake unnecessarily.
- Migrations:
  - `drizzle-kit generate` produces SQL.
  - `drizzle-kit migrate` runs against the unpooled URL.
  - Run against the production branch before deploying; run against preview/staging branches as needed.
- Indexes:
  - `resumes (user_id, updated_at DESC)`
  - `usage_events (user_id, created_at DESC)`
  - `usage_events (user_id, billing_period_start)`
  - `tailoring_runs (resume_id, created_at DESC)`
  - `subscriptions (provider, subscription_id)`
  - `usage_outbox (sent_at, next_attempt_at)`
- RLS:
  - We do not expose the Data API. Query from trusted server code.
  - The table-owner role bypasses RLS; RLS is not the app security boundary.
  - Enforce ownership in every query and action (`WHERE user_id = $1`).
  - Optionally enable RLS as defense-in-depth, but do not rely on it.

### 5.4 Neon Auth (Managed Better Auth)

**Packages**
- `@neondatabase/auth@0.6.0-beta` — server + client SDK.
- Optional: `@neondatabase/auth-ui@0.4.0-beta` — not used; we build a custom Google button.
- The service is GA; the SDK is beta and minor versions may break. Pin the exact version.
- ESM-only package; ensure test tooling handles ESM.

**Environment**
```bash
NEON_AUTH_BASE_URL=https://ep-xxx.neonauth.<region>.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=<32+ chars, openssl rand -base64 32>
```
- `NEON_AUTH_BASE_URL` is auto-injected by the Neon/Vercel integration per branch.
- `NEON_AUTH_COOKIE_SECRET` is **not** auto-injected; set it manually for Production, Preview, and Development.
- `createNeonAuth()` validates the secret at module load; it must be available during `next build`.

**Files**
```ts
// lib/auth/server.ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    // sessionDataTtl: 300,
    // domain: '.example.com',
  },
});
```

```ts
// lib/auth/client.ts
'use client';
import { createAuthClient } from '@neondatabase/auth/next';
export const authClient = createAuthClient();
```

```ts
// app/api/auth/[...path]/route.ts
import { auth } from '@/lib/auth/server';
export const { GET, POST } = auth.handler();
```

```ts
// proxy.ts
import { auth } from '@/lib/auth/server';
export default auth.middleware({ loginUrl: '/login' });
export const config = {
  matcher: ['/dashboard/:path*', '/resume/:path*', '/billing/:path*', '/settings/:path*'],
};
```

**Session reading**
```ts
const { data, error } = await auth.getSession();
// data: { session, user } | null
// data.user.id: UUID string
// data.user.email, data.user.name, data.user.image
```
- Do not use the stale `const { session, user } = await auth.getSession()` pattern.
- For sensitive operations (account deletion, billing changes), force a fresh check:
  ```ts
  await auth.getSession({ query: { disableCookieCache: 'true' } });
  ```
- `getSession()` trusts a signed `session_data` cookie for up to 300 seconds. Revoked/deleted sessions can look valid briefly. Sign-out does not revoke already-issued JWTs (15-minute expiry).
- `proxy.ts` runs on Node.js; do not add `runtime`.

**Google OAuth**
- Development/preview: Neon shared Google credentials work with no setup, but the consent screen shows Neon branding. Fine for dev/preview.
- Production:
  1. Create a Google Cloud project and a **Web application** OAuth client.
  2. Authorized redirect URI: `{NEON_AUTH_BASE_URL}/callback/google` (the Neon Auth host, not the app host).
  3. In Neon Console → branch → Auth → OAuth providers → Google, paste Client ID/Secret.
  4. Add app origins to Auth → Configuration → Domains:
     - `https://app.example.com`
     - `https://www.app.example.com`
     - `http://localhost:3000` (pre-approved)
     - Preview wildcard if supported.
  5. Configure the Google consent screen: app name, support email, authorized domain, privacy/terms URLs. Publish it; testing mode only allows listed users.
- Google does not support wildcard redirect URIs. For ephemeral preview branches:
  - Use Neon shared credentials for previews, or register each branch’s callback URI (subject to Google limits).
  - Vercel Deployment Protection can intercept post-OAuth redirects; allow the callback path.
- Disable email/password sign-up in Neon Console; the app is Google-only.

**App profile**
- Do not add custom fields to `neon_auth.user`; the schema is managed.
- Create `public.profiles` keyed by `neon_auth.user.id` (UUID).
- Lazy upsert on first authenticated request:
  ```ts
  insert into profiles (id, email, name, avatar_url)
  values (...)
  on conflict (id) do update set email = excluded.email, name = excluded.name, avatar_url = excluded.avatar_url;
  ```
- Use the session user for identity; never trust a client-supplied user id.

**Account deletion**
- `auth.deleteUser()` is exposed by the SDK; test the OAuth-user path in a branch.
- Admin fallback: Neon CLI `neon neon-auth user delete <user-id>` or management API `DELETE /api/v2/projects/.../auth/users/{id}`.
- Direct SQL `DELETE FROM neon_auth.user WHERE id = $1` cascades sessions/accounts but bypasses the Auth service; use only as a last resort.
- App tables reference `profiles(id)` with `ON DELETE CASCADE`.
- The signed session cookie may remain valid for up to 5 minutes; force a fresh session check before deletion.

**Known Neon Auth constraints**
- Open signups by default; hide/disable email sign-up and rely on Google.
- No custom JWT claims; role in JWT is not an app role.
- Fixed plugin set; no MFA/passkeys/SSO in v1.
- Cookies are host-only by default, `Secure`, `SameSite=Lax` in 0.6.0-beta (docs may say strict). Cross-subdomain sessions require an explicit parent domain; preview hosts each get their own cookie.
- AWS regions only; no IP allow/private networking with Auth.
- Email templates are limited; not relevant for Google-only.
- SDK beta; pin and regression-test.

### 5.5 DeepSeek AI

**Model and API**
- Model: **`deepseek-flash`** (current as of 2026-10-20; alias repointed 2026-10-17; behavior can change without a code change).
- Do not use retired IDs: `deepseek-chat`, `deepseek-reasoner`, `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`.
- Base URL: `https://api.deepseek.com`.
- OpenAI-compatible Chat Completions and Responses API.
- Use the `openai` SDK with `baseURL` and `apiKey: process.env.DEEPSEEK_API_KEY`.
- Structured output:
  - Preferred: Responses API `text.format` with `json_schema`.
  - Fallback: Chat Completions `response_format: { type: 'json_object' }` + Zod validation.
  - Always validate with Zod; check `finish_reason`/status; retry once on empty/truncated/invalid JSON.
- Thinking:
  - v1: disabled for all calls for latency and cost.
  - If quality needs it, enable `thinking: { type: 'enabled' }` + `reasoning_effort: 'high'` for tailoring only, only if it fits the function timeout.
- Limits:
  - Buttons: `max_tokens: 2048`.
  - Keywords: `max_tokens: 2048`, temperature ~0.2.
  - Tailoring: `max_output_tokens: 8192–16384`.
- Cost:
  - Flash input ~$0.30/1M peak, output ~$1.20/1M peak; off-peak half.
  - A button call ~$0.0012; a tailoring call ~$0.008. At $0.05/action overage, margin is healthy.
- Reliability:
  - ~99.5% uptime; retry once with exponential backoff; surface a friendly error.
  - Do not charge failed calls.
- Privacy:
  - Data processed in the PRC; may be used for training unless opted out by email.
  - Consent modal + privacy policy disclosure.
  - Do not log prompts, resumes, or JDs.
  - Use a hashed user id in the `user_id` field; never PII.
- Prompt injection:
  - Treat JD and notes as untrusted data; system prompt instructs the model to ignore embedded instructions.
  - No tools; validate output; never execute model output.
  - Require source quotes for tailored claims; validate quotes are substrings of the input.
- Fabrication:
  - System prompt: use only facts provided; never invent employers, titles, dates, metrics, tools, or education; omit missing facts.
  - For writing buttons, the user reviews output before insertion.
  - For tailoring, show original vs suggested and require acceptance.

**Prompts** (in `lib/ai/prompts.ts`)
- Shared system prompt:
  - Expert resume writer for early-career candidates.
  - ATS-friendly, concise, no first-person pronouns, no buzzwords.
  - Use only facts in the input; return valid JSON matching the schema.
- Write summary:
  - Input: target role, experience, education, skills.
  - Output: `{ summary: string }`, 2–3 sentences, 40–60 words.
- Write bullets:
  - Input: job title, company, user notes.
  - Output: `{ bullets: string[] }`, 3–5 bullets, each starts with a strong action verb; metrics only if present in notes.
- Improve:
  - Input: original bullet, job title/company context.
  - Output: `{ bullet: string }`; no new facts.
- Keywords:
  - Input: JD.
  - Output: `{ keywords: [{ term, importance, evidenceQuote }] }`, top 10, evidence quote must be an exact substring of the JD.
- Tailor:
  - Input: resume content, JD, selected keywords.
  - Output: `{ summary: { suggested, sourceQuotes }, bullets: [{ id, suggested, sourceQuotes }] }`; source quotes must be exact substrings of the resume.
  - Top 3 bullets selected by relevance.
- Validation:
  - Zod parse.
  - Source quote substring checks.
  - Reject empty/duplicate/too-long output.
  - One repair retry; then fail without charging.

**AI route flow**
1. Parse JSON body (size limit).
2. Authenticate; load profile; check consent.
3. Load resume; verify ownership.
4. Validate input with Zod.
5. Check entitlements and reserve a pending usage event with idempotency key + advisory lock.
6. Call DeepSeek with a 30–60s timeout.
7. Validate output.
8. Mark usage succeeded with tokens/cost.
9. Return JSON.
10. On any failure: mark usage failed; return a stable error code; do not leak provider details.

### 5.6 PDF pipeline

**Packages**
- `@react-pdf/renderer` — pin a tested version. 4.9.0 has an open multi-document glyph/ToUnicode regression (Oct 2026); test warm concurrent renders; fallback to 4.7.0 if needed.
- `pdf-lib` — optional, for page count/metadata validation.
- Static font files in `public/fonts/` (e.g., Source Sans 3 400/600/700 TTF).

**Next config**
```ts
const nextConfig: NextConfig = {
  // existing options...
  serverExternalPackages: ['@react-pdf/renderer'],
  outputFileTracingIncludes: {
    '/api/resumes/[id]/pdf': [
      './public/fonts/**/*',
      './node_modules/pdfkit/js/data/*.afm',
      './node_modules/pdfkit/js/standard-fonts/*.cjs',
    ],
  },
};
```
- Do not export `runtime` from the route with Cache Components; the default is Node.
- Set `maxDuration = 60` on the PDF route.
- Test the production Turbopack build, not only `next dev`.

**Template**
- A4: 595.28 × 841.89 pt.
- Margins: ~42–48 pt (≈ 15–17 mm).
- Fonts: Source Sans 3 or Inter; embed static weights; no variable fonts.
- Name: 18–20 pt bold.
- Contact line: 9.5–10 pt.
- Section headings: 11 pt, bold/small caps, thin rule.
- Body: 10 pt, line height 1.25–1.35.
- Single column; no tables; no sidebars.
- Dates on the same line as role/company or directly beneath; no right-hand rail that can scramble reading order.
- Bullets are real text with `•`; no icon fonts.
- Skills comma-separated inline.
- Hide empty sections.
- No photos, icons, graphics, headers/footers with critical content.
- Optional `conformance="PDF/A-2b"` to force embedded fonts; test extraction.
- Disable hyphenation:
  ```ts
  Font.registerHyphenationCallback((word) => [word]);
  ```
- Test `fi`/`ff`/`fl` ligatures and email/URL extraction; watch for `(cid:NNN)` or `�`.
- Verify with `pdftotext -layout`, `pdffonts`, `pdfimages -list`.

**Route**
- `POST /api/resumes/[id]/pdf`.
- Auth + ownership.
- Validate content; require at least a name and one non-empty section; otherwise 400.
- Reserve usage with idempotency key; free limit check.
- Render `renderToBuffer(<ResumeDocument content={...} />)`.
- On failure: mark usage failed; 500 with request id.
- On success: mark succeeded; return bytes.
- Headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="First-Last-Resume.pdf"` (sanitized)
  - `Cache-Control: private, no-store`
  - `X-PDF-Pages`
  - `X-Request-Id`
- Duplicate idempotency key: regenerate (no charge) or return 409; prefer regenerate.
- Free limit reached: 402/403 JSON `{ code: 'limit_reached', limit: 'pdf' }`; client opens upgrade modal.
- Origin/`Sec-Fetch-Site` check for browser POSTs.

### 5.7 Preview and score

**Preview**
- HTML/CSS component driven by `ResumeContent`.
- A4 aspect ratio; on-screen width scaled to fit; print-like typography.
- Shared design tokens in `lib/resume/design.ts`:
  - A4 dimensions, margins, font sizes, line heights, colors.
  - Preview uses mm/CSS; PDF converts to pt.
- Sections render in the same order as the PDF.
- Show page-break guide lines; a continuous sheet is fine for v1.
- Empty state: “Start filling the form to see your resume.”
- A `ResumePreview` client component reports estimated `pageCount` to the parent via a callback/`ResizeObserver`.

**Score**
- Pure function `computeScore(content, pageCount)` in `lib/score/compute.ts`.
- Each check: `{ id, label, passed, weight: 10, fixTarget, detail }`.
- Checks:
  1. **Contact info** — full name, valid email, phone with ≥7 digits. Location optional.
  2. **Summary present** — trimmed length ≥20.
  3. **Experience present** — at least one entry with title and company.
  4. **2+ bullets per job** — every experience entry has ≥2 non-empty bullets.
  5. **Action verbs** — ≥80% of bullets start with a verb from a curated list; show failing bullets.
  6. **Numbers in bullets** — ≥50% of experience entries have at least one bullet containing a digit/%/$.
  7. **5+ skills** — ≥5 comma-separated items.
  8. **1–2 pages** — estimated page count 1–2 inclusive.
  9. **Dates present** — every experience/education/project entry has a start date and either an end date or `current`.
  10. **No first-person pronouns** — regex `\b(I|me|my|mine|we|our|ours|us)\b` case-insensitive across summary/bullets/coursework/honors.
- Score = passed checks × 10.
- Fix targets are DOM IDs: `#contact-email`, `#summary`, `#experience`, `#skills`, etc.
- Client-side `useMemo`; no server call.
- Unit-test every check and edge case.

### 5.8 Billing abstraction

**Why deferred**
- No Stripe-capable entity. Stripe is not viable without a supported business/bank.
- The original Stripe Checkout/Customer Portal requirement is superseded by a provider-agnostic adapter.
- Build the entitlement layer now; integrate a provider later.
- Paid launch is blocked until a provider is connected.

**Provider landscape (researched 2026-10-20)**

| Provider | China seller | Payout | Fees | Metered fit | Verdict |
|---|---|---|---|---|---|
| **Creem** | Yes, individual with Chinese ID | Alipay/CNY bank; $7 or 1% fee; 50k CNY cap | 3.9% + $0.40 | Native `free_allowance` + `unit_price` + `cap`; verify cap | **Recommended** |
| **Dodo Payments** | Yes, China on accepted list | Bank/SWIFT; CNY not officially documented | 4% + $0.40 + 1.5% intl + 0.5% subscription | Native credits + `overage_limit` + `price_per_unit` | **Backup** |
| **Paddle** | China not explicitly documented | Wire/Payoneer; PayPal payouts ended Feb 2026 | 5% + $0.50 | Partial; custom line item; usage billing beta | Mature fallback |
| **Polar** | No (Stripe Connect Express) | — | 5% + $0.50 + 1.5% intl | Native credits + metered + cap | Not viable |
| **Lemon Squeezy** | No (bank list excludes China) | — | 5% + $0.50 + surcharges | Partial | Not viable |
| **Freemius** | Yes | PayPal/Payoneer/Wise/wire | 3.8% + $0.50 + gateway | Prepaid credits only | Credit-pack fallback |
| **FastSpring** | Likely | Hyperwallet | 5.9% + $0.95 + FX | No native metered | Fallback |
| **2Checkout** | Yes per community | Payoneer/wire/PayPal; 90-day reserve | ~6% + $0.60 | Native usage | Last resort |

**Fallback if metered is unsupported:** sell a **$25 / 500-action top-up** alongside the $12 plan, max one per billing cycle, enforced in-app. Credit via webhook idempotently.

**Adapter interface**
```ts
type CheckoutResult = { url: string } | { disabled: true; reason: string };

interface BillingProvider {
  name: string;
  createCheckout(userId: string): Promise<CheckoutResult>;
  createPortal(userId: string): Promise<CheckoutResult>;
  verifyWebhook(request: Request): Promise<WebhookEvent>;
  handleWebhook(event: WebhookEvent): Promise<void>;
  reportUsage?(event: UsageEvent): Promise<void>;
}
```

- `manual.ts`:
  - `createCheckout`/`createPortal` return `{ disabled: true }`.
  - Webhook no-op.
  - `grantPro(userId, days)` helper used by `scripts/grant-pro.ts`.
- `creem.ts` / `dodo.ts`: implement when the provider is chosen.
- `getBillingProvider()` reads `BILLING_PROVIDER` (`manual` default).
- Upgrade UI checks `billingEnabled`; if false, shows “Billing coming soon”.

**Entitlements**
- `lib/billing/entitlements.ts`:
  - Load subscription.
  - Determine plan and period.
  - Count usage.
  - Return limits and remaining.
- Free:
  - `resumeLimit: 1`
  - `aiLimit: 3` lifetime
  - `pdfLimit: 3` lifetime
- Pro:
  - `resumeLimit: Infinity`
  - `aiIncluded: 500`
  - `aiOverageUnitPrice: 0.05`
  - `aiOverageCap: 25`
  - `aiHardLimit: 1000` per period
  - `pdfLimit: Infinity`
- Canceled Pro:
  - Pro until `current_period_end`; then free.
- Past due:
  - Pro until `current_period_end` with a banner; provider dunning handles retries.
- Manual Pro:
  - `provider='manual'`, `status='active'`, `plan='pro'`, `current_period_end` far future (or rolling).

**Usage reservation**
- See §4.5.
- `reserveUsage(userId, kind, idempotencyKey, resumeId)` returns `eventId` or throws `LimitReached`.
- `completeUsage(eventId, { model, inputTokens, outputTokens, costUsd })`.
- `failUsage(eventId, error)`.
- For Pro AI success:
  - Compute overage units after completion.
  - If >0 and provider supports metering, insert `usage_outbox` and attempt report.
  - Enforce hard cap before reserving.
- For free PDF:
  - Reserve counts a pending event; if render fails, mark failed; the slot is freed.

**Webhook**
- Verify signature with the provider’s scheme.
- Insert `webhook_events` unique `(provider, event_id)`.
- Process:
  - `checkout.completed` / `subscription.active` → upsert subscription.
  - `subscription.updated` → update status/period.
  - `subscription.canceled` → set `cancel_at_period_end`/status.
  - `invoice.paid`/`payment.failed` → update status/grace.
- Return 200 after processing; 500 on failure for retry.
- Idempotent: repeated events do nothing.

**Upgrade modal**
- Triggered by `LimitReached` responses and UI checks.
- Shows:
  - Free vs Pro comparison.
  - 500 included actions, $0.05 extra, $25 cap.
  - “Billing coming soon” if disabled.
- No fake checkout.
- Billing page:
  - Current plan, usage meter, period end.
  - “Manage subscription” (portal) when connected.
  - Invoice history via portal.

### 5.9 SEO and public surface

- Single landing page at `/`.
- Metadata:
  - Title/description targeting “AI resume builder for new grads / ATS resume builder.”
  - Canonical.
  - Open Graph + Twitter card.
  - `metadataBase` from `NEXT_PUBLIC_APP_URL`.
- `app/opengraph-image.tsx` — generated 1200×630 branded image via `next/og`.
- `app/sitemap.ts` — `/`, `/privacy`, `/terms`.
- `app/robots.ts` — allow public pages; disallow `/dashboard`, `/resume`, `/billing`, `/settings`, `/api`.
- App pages `robots: { index: false }`.
- JSON-LD `SoftwareApplication`:
  - Name, description, applicationCategory `BusinessApplication`, operatingSystem `Web`, offers `$12/month`.
- No blog, separate pricing page, template gallery, or programmatic SEO in v1.
- Landing sections:
  1. Hero with sample resume/score visual.
  2. How it works (Build → Tailor → Score → Download).
  3. ATS-safe template explanation.
  4. Free score checklist.
  5. Pricing (Free vs Pro).
  6. FAQ.
  7. Footer (privacy, terms, contact).
- No fake testimonials or logos.
- Responsive landing; app desktop-only.

### 5.10 Observability

- Vercel Analytics via `@vercel/analytics/next` `<Analytics />` in the root layout.
- Page views + Web Vitals.
- Structured logs (JSON) for key events, without PII:
  - `resume_created`, `resume_deleted`
  - `ai_action_started`, `ai_action_succeeded`, `ai_action_failed`
  - `pdf_generated`, `pdf_failed`
  - `limit_reached`
  - `checkout_started`, `checkout_disabled`
  - `webhook_received`, `webhook_processed`, `webhook_failed`
  - `account_deleted`
- Each AI/PDF request gets a `requestId`; return it in error JSON; log it.
- Error boundaries:
  - `app/error.tsx` — client, uses `retry()`.
  - `app/global-error.tsx` — root fallback with its own `<html>/<body>`.
  - Route handlers return stable JSON error codes.
- No Sentry/PostHog in v1. If debugging becomes painful, add Sentry later.

### 5.11 Security and privacy

- `server-only` on DB/AI/billing/auth modules.
- No secrets in client bundles.
- Every action/route:
  - Authenticate via Neon Auth.
  - Authorize ownership by `user_id`.
  - Validate with Zod.
  - Enforce entitlements.
- CSRF:
  - Server Actions have built-in Origin/Host checks.
  - Browser-facing POST route handlers check `Origin`/`Sec-Fetch-Site`.
  - Billing webhooks use signature verification.
- Rate limits:
  - Per-user AI: 20/min, 3 concurrent.
  - Per-user PDF: 10/min.
  - DB-based, no Redis.
- Idempotency:
  - Client-generated UUID per action.
  - Unique `(user_id, idempotency_key)`.
  - Duplicate submissions return cached/in-progress/409.
- Prompt injection:
  - Treat JD/notes as data.
  - System prompt instructions.
  - No tools.
  - Validate output; source-quote checks.
- PII:
  - Never log resumes, JDs, or prompts.
  - Log token counts, model, event type, request id.
  - Privacy policy names DeepSeek and the billing provider (once connected).
  - AI consent stored in `profiles.ai_consent_at`.
  - Account deletion removes app and auth data.
- Downloads:
  - Sanitize filenames.
  - `Content-Type: application/pdf`.
  - No user-controlled path.
- Open redirects:
  - Validate `callbackURL`/`next` to same-origin paths.
- Secrets:
  - `.env.local` locally.
  - Vercel env vars per environment.
  - Rotate `NEON_AUTH_COOKIE_SECRET` only with a plan (it invalidates sessions).

### 5.12 Background work and idempotency

- No job queue in v1.
- Provider webhooks retry at the provider; our handler is idempotent.
- Metered usage:
  - Attempt immediately.
  - On failure, leave in `usage_outbox`; retry lazily on the next AI action or billing page load.
  - If volume grows, add a Vercel Cron to flush.
- Account deletion is synchronous.
- No transactional email.

---

## 6. API and action contracts

### 6.1 Common error shape

```json
{
  "error": {
    "code": "LIMIT_REACHED | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | VALIDATION | CONSENT_REQUIRED | PROVIDER_ERROR | RATE_LIMITED | INTERNAL",
    "message": "Human-readable message",
    "requestId": "uuid",
    "details": {}
  }
}
```

### 6.2 AI routes

All AI routes:
- `POST`
- JSON body
- `Idempotency-Key` header (UUID) or `idempotencyKey` body field
- Auth required
- AI consent required
- Entitlement + rate limit + reservation
- `maxDuration = 60` (tailoring may need 90 if the plan allows)
- Return `{ data, usage: { remaining, limit } }`

#### `POST /api/ai/write-summary`
Request:
```json
{ "resumeId": "uuid", "targetRole": "Software Engineer", "idempotencyKey": "uuid" }
```
Response:
```json
{ "summary": "..." }
```

#### `POST /api/ai/write-bullets`
Request:
```json
{
  "resumeId": "uuid",
  "experienceId": "uuid | null",
  "jobTitle": "Software Engineering Intern",
  "company": "Acme",
  "notes": "Built a dashboard, reduced load time...",
  "idempotencyKey": "uuid"
}
```
Response:
```json
{ "bullets": ["...", "..."] }
```

#### `POST /api/ai/improve`
Request:
```json
{
  "resumeId": "uuid",
  "bullet": "Worked on the backend",
  "jobTitle": "Software Engineer",
  "company": "Acme",
  "idempotencyKey": "uuid"
}
```
Response:
```json
{ "bullet": "..." }
```

#### `POST /api/ai/keywords`
Request:
```json
{ "resumeId": "uuid", "jobDescription": "...", "idempotencyKey": "uuid" }
```
Response:
```json
{
  "runId": "uuid",
  "keywords": [
    { "term": "TypeScript", "importance": "high", "evidenceQuote": "...", "found": true }
  ],
  "missing": [
    { "term": "Kubernetes", "importance": "medium", "evidenceQuote": "..." }
  ]
}
```

#### `POST /api/ai/tailor`
Request:
```json
{ "runId": "uuid", "idempotencyKey": "uuid" }
```
Response:
```json
{
  "runId": "uuid",
  "suggestions": {
    "summary": { "original": "...", "suggested": "...", "sourceQuotes": ["..."] },
    "bullets": [
      { "id": "uuid", "original": "...", "suggested": "...", "sourceQuotes": ["..."] }
    ]
  }
}
```

### 6.3 PDF route

`POST /api/resumes/[id]/pdf`
- Headers: `Idempotency-Key`
- Response: `application/pdf`
- Errors: JSON as above; `LIMIT_REACHED` triggers the upgrade modal.

### 6.4 Billing webhook

`POST /api/billing/webhook`
- Raw body; signature header verified by adapter.
- No user session.
- 200 on success/duplicate; 500 on processing failure.

### 6.5 Server actions

```ts
createResume(input: { title: string }): Promise<{ id: string }>
renameResume(input: { id: string; title: string }): Promise<void>
deleteResume(input: { id: string }): Promise<void>
saveResume(input: { id: string; content: ResumeContent; version: number }): Promise<{ version: number }>
applyTailoring(input: { runId: string; selectedIds: string[] }): Promise<void>
createCheckoutSession(): Promise<CheckoutResult>
createPortalSession(): Promise<CheckoutResult>
deleteAccount(): Promise<void>
signOut(): Promise<void>
```

- All actions: `requireUser()`, ownership, Zod, stable errors.
- `saveResume` uses optimistic concurrency:
  ```sql
  UPDATE resumes
  SET content = $1, version = version + 1, updated_at = now()
  WHERE id = $2 AND user_id = $3 AND version = $4
  RETURNING version;
  ```
  If 0 rows, return 409 with the latest version.

---

## 7. Implementation phases

Estimates assume one developer with AI assistance; no fixed deadline.

### Phase 0 — Foundations (1–2 days)
- Install dependencies:
  - `@neondatabase/auth@0.6.0-beta`
  - `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`
  - `@vercel/functions`, `@vercel/analytics`
  - `zod`, `openai`, `server-only`
  - `react-hook-form`, `@hookform/resolvers`
  - `@react-pdf/renderer`, `pdf-lib`
  - `lucide-react`, `clsx`, `tailwind-merge`
  - Dev: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@playwright/test`, `tsx`, `dotenv`
- Add scripts: `typecheck`, `test`, `test:e2e`, `db:generate`, `db:migrate`, `db:studio`, `seed:grant-pro`.
- Add `lib/validation/env.ts` with Zod env validation.
- Add DB connection + Drizzle schema + migrations.
- Add `serverExternalPackages` and font tracing to `next.config.ts`.
- Add root layout, fonts, design tokens, base UI components.
- Acceptance: `npm run build` and `npm run typecheck` pass; migration applies; app boots.

### Phase 1 — Auth + protected shell (2–3 days)
- `lib/auth/server.ts`, `lib/auth/client.ts`.
- `app/api/auth/[...path]/route.ts`.
- `proxy.ts` with matcher.
- `/login` page with Google button; redirect if authenticated.
- `getCurrentUser()` / `requireUser()` / `getOrCreateProfile()`.
- Protected `(app)` layout: header, user menu, desktop gate.
- Sign out.
- Neon Console: enable Google OAuth, disable email/password, set trusted domains.
- Acceptance: Google sign-in works in dev; app routes redirect; session reads inside Suspense; no `dynamic`/`runtime` exports; profile row created.

### Phase 2 — Dashboard + resume CRUD (2 days)
- Dashboard page with resume list and empty state.
- Create/rename/delete dialogs.
- Server actions with ownership + free resume limit.
- Usage summary placeholders.
- Acceptance: CRUD works; free user cannot create a second resume; deleting frees the slot; lifetime counters unchanged.

### Phase 3 — Editor + autosave + preview (4–5 days)
- Resume Zod schema, defaults, IDs.
- Editor layout with section components.
- RHF `useFieldArray` for experience/education/projects/bullets.
- Add/remove entries and bullets.
- Autosave hook: debounce 700ms, version check, status, localStorage backup.
- Preview component with A4 layout and shared design tokens.
- Page count estimate.
- Acceptance: edits persist; preview updates; stale tab conflict handled; reload restores; no lost draft on failed save.

### Phase 4 — PDF + score (3–4 days)
- PDF document component, font registration, hyphenation off.
- PDF route with usage reservation, idempotency, headers.
- Download UX + free remaining indicator.
- Upgrade modal trigger on limit.
- Score function, rules, panel, fix links.
- Acceptance: PDF passes `pdftotext`/`pdffonts`; free 3 downloads enforced atomically; score correct; upgrade modal appears.

### Phase 5 — AI writing (4–5 days)
- DeepSeek client + env.
- Prompts + Zod output schemas.
- Consent modal + `ai_consent_at`.
- Three AI routes + reservation/completion.
- Write summary/bullets dialogs; improve button.
- Error/retry/rate limit UX.
- Acceptance: each button returns validated output; success charges 1; failure charges 0; consent required; free limit enforced; no PII in logs.

### Phase 6 — Job tailoring (4–5 days)
- Keywords route + local matching.
- Tailor route + source-quote validation.
- `tailoring_runs` persistence.
- Tailoring panel: JD textarea, keyword chips, missing list, suggestions, checkboxes.
- Apply server action.
- 2-action metering.
- Acceptance: full run consumes 2 actions; missing keywords correct; suggestions validated; apply updates resume; free user gets one full run.

### Phase 7 — Billing architecture + upgrade UX (2–3 days; provider later)
- Billing types + manual adapter.
- Entitlements service + usage meters.
- Upgrade modal + `/billing` page.
- `BILLING_PROVIDER` feature flag.
- `scripts/grant-pro.ts`.
- Acceptance: free/Pro limits correct; manual Pro unlocks; provider interface ready; no Stripe dependency; upgrade flow shows “coming soon” when disabled.

### Phase 8 — Landing page + legal + SEO (3–4 days)
- Landing sections, sample preview, pricing, FAQ.
- `/privacy`, `/terms`.
- Metadata, OG image, sitemap, robots, JSON-LD.
- Responsive landing; desktop gate for app.
- Acceptance: landing responsive; SEO tags; legal pages; CTA → login; no fake claims.

### Phase 9 — Hardening + tests + deploy (3–5 days)
- Unit tests: score, entitlements, schemas, billing event mapping.
- PDF extraction test.
- One Playwright E2E happy path with mocked AI.
- Rate limits, origin checks, idempotency tests.
- Error boundaries, request IDs, structured logs.
- CI: lint, typecheck, test, build, PDF tests.
- Vercel + Neon production setup; Google OAuth production; env vars.
- Manual QA checklist.
- Acceptance: CI green; production deploy; all seven features; account deletion; manual Pro; paid launch blocked until provider.

**Total:** ~26–36 working days (~5–7 weeks) for one developer; 4–6 weeks is achievable with prior Next.js experience and focused scope.

---

## 8. File and directory structure

```
app/
  layout.tsx                       # root layout, fonts, metadata, Analytics
  globals.css                      # Tailwind 4 + design tokens
  page.tsx                         # landing page
  privacy/page.tsx
  terms/page.tsx
  login/page.tsx
  opengraph-image.tsx
  sitemap.ts
  robots.ts
  not-found.tsx
  error.tsx
  global-error.tsx

  (app)/
    layout.tsx                     # protected shell, header, desktop gate
    dashboard/page.tsx
    resume/[id]/page.tsx
    billing/page.tsx
    settings/page.tsx

  api/
    auth/[...path]/route.ts        # Neon Auth handler
    ai/write-summary/route.ts
    ai/write-bullets/route.ts
    ai/improve/route.ts
    ai/keywords/route.ts
    ai/tailor/route.ts
    resumes/[id]/pdf/route.ts
    billing/webhook/route.ts

  actions/
    resumes.ts
    tailoring.ts
    billing.ts
    account.ts

proxy.ts                           # Next 16 route protection
next.config.ts
drizzle.config.ts
vitest.config.mts
playwright.config.ts

lib/
  auth/
    server.ts                      # createNeonAuth
    client.ts                      # createAuthClient
    dal.ts                         # getCurrentUser, requireUser, requireUserForPage, requireUserForApi
    profile.ts                     # getOrCreateProfile, requireProfile, setAiConsent
  db/
    index.ts                       # pg Pool + Drizzle
    schema.ts                      # Drizzle tables
    queries.ts                     # typed queries
  resume/
    schema.ts                      # Zod ResumeContent
    defaults.ts
    format.ts                      # dates, names, filenames
    design.ts                      # A4/typography tokens
  score/
    compute.ts
    rules.ts                       # action verbs, regexes
  ai/
    client.ts                      # DeepSeek client
    prompts.ts
    schemas.ts                     # Zod output schemas
    usage.ts                       # cost/tokens
  billing/
    types.ts
    manual.ts
    creem.ts                       # later
    dodo.ts                        # later
    entitlements.ts
    webhooks.ts
  pdf/
    document.tsx                   # @react-pdf/renderer template
    render.ts                      # renderToBuffer
    fonts.ts
  security/
    rate-limit.ts
    origin.ts
    idempotency.ts
  validation/
    env.ts
  analytics.ts

components/
  ui/
    button.tsx
    input.tsx
    textarea.tsx
    modal.tsx
    toast.tsx
    badge.tsx
    card.tsx
    skeleton.tsx
    dropdown.tsx
  marketing/
    hero.tsx
    how-it-works.tsx
    sample-resume.tsx
    pricing.tsx
    faq.tsx
    footer.tsx
  dashboard/
    resume-list.tsx
    resume-card.tsx
    create-resume-dialog.tsx
    rename-resume-dialog.tsx
    delete-resume-dialog.tsx
  editor/
    editor-shell.tsx
    contact-section.tsx
    summary-section.tsx
    experience-section.tsx
    experience-entry.tsx
    education-section.tsx
    education-entry.tsx
    projects-section.tsx
    project-entry.tsx
    skills-section.tsx
    bullet-list.tsx
    autosave-indicator.tsx
  preview/
    resume-preview.tsx
    preview-page.tsx
  score/
    score-panel.tsx
    score-item.tsx
  ai/
    ai-consent-dialog.tsx
    write-summary-dialog.tsx
    write-bullets-dialog.tsx
    improve-bullet-button.tsx
    tailoring-panel.tsx
    keyword-chips.tsx
    suggestion-card.tsx
  billing/
    upgrade-dialog.tsx
    usage-meter.tsx
    plan-card.tsx
    checkout-button.tsx
  layout/
    app-header.tsx
    user-menu.tsx
    desktop-gate.tsx

public/
  fonts/
    SourceSans3-Regular.ttf
    SourceSans3-SemiBold.ttf
    SourceSans3-Bold.ttf

scripts/
  seed.ts
  grant-pro.ts

tests/
  unit/
  pdf/
  e2e/
```

---

## 9. Environment and setup

### 9.1 Environment variables

| Variable | Scope | Required | Notes |
|---|---|---|---|
| `DATABASE_URL` | Server | Yes | Neon pooled connection string. |
| `DATABASE_URL_UNPOOLED` | Server / CLI | Yes | Migrations, DDL. |
| `NEON_AUTH_BASE_URL` | Server | Yes | Full branch Auth URL incl. `/neondb/auth`. |
| `NEON_AUTH_COOKIE_SECRET` | Server | Yes | 32+ chars; set manually in all environments. |
| `DEEPSEEK_API_KEY` | Server | Yes | Never expose client-side. |
| `DEEPSEEK_MODEL` | Server | No | Default `deepseek-flash`. |
| `DEEPSEEK_BASE_URL` | Server | No | Default `https://api.deepseek.com`. |
| `NEXT_PUBLIC_APP_URL` | Public | Yes | Metadata, OG, absolute URLs. |
| `BILLING_PROVIDER` | Server | No | `manual` default; `creem`/`dodo` later. |
| `BILLING_WEBHOOK_SECRET` | Server | Later | Provider-specific. |
| `CREEM_API_KEY` | Server | Later | When Creem connected. |
| `CREEM_WEBHOOK_SECRET` | Server | Later | When Creem connected. |
| `E2E_TEST_MODE` | Server | Test only | Never enable in production. |

### 9.2 Google OAuth setup

1. Create a Google Cloud project.
2. Configure OAuth consent screen:
   - App name.
   - User support email.
   - Authorized domains.
   - Privacy policy URL, terms URL.
   - Publish (testing mode only allows test users).
3. Create OAuth client (Web application).
4. Authorized redirect URI:
   ```
   {NEON_AUTH_BASE_URL}/callback/google
   ```
5. In Neon Console → branch → Auth → OAuth providers → Google:
   - Paste Client ID/Secret.
6. Add trusted domains in Neon Auth:
   - Production app domain.
   - Preview wildcard if supported.
   - `http://localhost:3000`.
7. Disable email/password sign-up and other providers.
8. Test sign-in, sign-out, session refresh, and account deletion.

### 9.3 Neon setup

1. Create a Neon project in the region closest to the target market (EU/Asia; evaluate with the A4/global positioning).
2. Create branches: `main` (production), `staging`/`preview` as needed.
3. Enable Neon Auth on the branch.
4. Run migrations against the unpooled URL.
5. Create `profiles` lazily; no seed required.
6. Verify scale-to-zero behavior and connection pooling.
7. Set up the Neon/Vercel integration so `NEON_AUTH_BASE_URL` and `DATABASE_URL` are available per environment.

### 9.4 DeepSeek setup

1. Create a DeepSeek API key.
2. Add `DEEPSEEK_API_KEY` to Vercel env vars.
3. Test a minimal call in a server-only script:
   - `deepseek-flash`, non-thinking, JSON output.
4. Verify `responses` API support; fall back to Chat Completions JSON mode if needed.
5. Record token usage and cost for a sample call.
6. Add a consent modal and privacy copy before enabling AI.

### 9.5 Local development

```bash
npm install
cp .env.example .env.local   # fill values
npm run db:migrate
npm run dev
```

- Use a Neon dev branch for local data.
- Use Neon shared Google credentials for local OAuth.
- `localhost:3000` is pre-approved in Neon Auth.
- Seed a sample resume with `npm run seed`.
- Grant Pro locally:
  ```bash
  npm run seed:grant-pro -- <user-id>
  ```
- Never commit `.env.local`.

### 9.6 Deployment

- Vercel project connected to the GitHub repo.
- Production branch: `main`; preview deployments for PRs.
- Environment variables set per Vercel environment.
- Build command: `npm run build`; install: `npm ci`.
- Migrations run separately (CI or manual) against the target Neon branch before deploy.
- Custom domain; set `NEXT_PUBLIC_APP_URL`.
- Google OAuth redirect URI for production.
- Add the production domain to Neon Auth trusted domains.
- Vercel Pro required for commercial use.
- Monitor Neon compute/storage and Vercel function duration.

### 9.7 CI

GitHub Actions on PR/push:
1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test`
5. Install poppler-utils; run PDF extraction test.
6. `npm run build`
7. Optional: Playwright E2E against a test deployment/branch with seeded auth; if secrets are unavailable, run manually before release.

---

## 10. Testing and QA

### 10.1 Unit tests (Vitest)

- `lib/score/compute.test.ts`:
  - Each check pass/fail.
  - Score totals.
  - Edge cases: empty resume, no experience, one page vs three pages, pronouns, skills count.
- `lib/billing/entitlements.test.ts`:
  - Free lifetime limits.
  - Pro 500 included.
  - Overage math: 500 → 0, 501 → 1 unit, 1,000 → 500 units, 1,001 → blocked.
  - $25 cap.
  - Canceled Pro grace.
  - Manual Pro.
- `lib/resume/schema.test.ts`:
  - Valid/invalid content.
  - Max lengths.
  - Date formats.
- `lib/ai/schemas.test.ts`:
  - JSON validation.
  - Source quote substring checks.
  - Rejection of fabrication markers.
- `lib/billing/webhooks.test.ts`:
  - Event mapping and idempotency.

### 10.2 PDF extraction test

- Render a representative resume with:
  - Name, email, phone, location.
  - Summary with special characters.
  - Two experience entries with dates.
  - Education, projects, skills.
- Write to a temp file.
- Run:
  - `pdftotext -layout file.pdf -` → assert name/email/company/title/date order.
  - `pdffonts file.pdf` → assert `emb yes`, `sub yes`, `uni yes`.
  - `pdfimages -list file.pdf` → assert no full-page image.
  - `pdfinfo file.pdf` → assert A4 page size and page count.
- Test `fi`/`ff`/`fl` ligatures and email extraction.
- Test warm concurrent renders if using `@react-pdf/renderer` 4.9.0; pin 4.7.0 if the regression reproduces.

### 10.3 E2E (Playwright)

One happy path:
1. Start from a seeded test user (test branch with email/password enabled, or a guarded test session).
2. Dashboard → create resume.
3. Fill contact, summary, one experience with two bullets, education, skills.
4. Preview updates.
5. Score shows expected checks.
6. Mock `/api/ai/**` responses; click Write summary and Improve; assert insertion.
7. Download PDF; assert file downloads and is non-empty.
8. Seed usage to 3 PDFs; assert 4th click opens the upgrade modal.
9. Delete resume; assert empty state.
10. Account deletion (optional, separate test).

- AI calls are mocked via Playwright route interception; no real DeepSeek spend in CI.
- PDF generation is real; parse the downloaded file with `pdf-parse` if available.
- Auth test path is guarded by `E2E_TEST_MODE` and fails closed in production.

### 10.4 Manual QA checklist

- [ ] Google OAuth sign-in, sign-out, session refresh.
- [ ] Unauthenticated app routes redirect.
- [ ] Free user: 1 resume, 3 AI actions, 3 PDFs; upgrade modal at each limit.
- [ ] Pro via manual adapter: unlimited resumes/downloads, 500 included, overage math, cap.
- [ ] Canceled Pro: access until period end, then free limits; extra resumes remain.
- [ ] AI consent modal; decline disables AI.
- [ ] DeepSeek timeout/outage: friendly error, no charge.
- [ ] PDF failure: no charge.
- [ ] Duplicate AI/PDF submissions: no double charge.
- [ ] Stale-tab autosave: 409 and reload flow.
- [ ] Session expiry mid-edit: local draft restore.
- [ ] Desktop gate on mobile; landing responsive.
- [ ] Account deletion removes app + auth data.
- [ ] Privacy/terms links; Google consent screen.
- [ ] PDF extraction: `pdftotext`, `pdffonts`, A4.
- [ ] Vercel logs show request ids, no PII.
- [ ] Billing provider (when connected): checkout, portal, cancellation, webhook replay, overage reporting.

---

## 11. Assumptions

1. Public brand is **Lume**, from the supplied brand kit. The landing, metadata, login, legal pages, app icon, and OG image use Lume; the internal package and repository names remain `resume-builder`.
2. English-only, global market; **A4 page size** (210×297 mm). US Letter is a later option.
3. Free “1 resume” means one concurrent resume; deleting frees the slot but lifetime AI/PDF counters persist.
4. Section order: Contact header, Summary, Experience, Education, Projects, Skills.
5. Skills are one comma-separated string; “5+” counts comma-separated items.
6. Dates are `YYYY-MM` strings; `current` flag; rendered “Jan 2024 – Present”.
7. No version history/undo; autosave is debounced ~700 ms with a save indicator and a `version` check for stale tabs.
8. Preview is HTML/CSS; PDF is `@react-pdf/renderer`; they share content and tokens but are not pixel-identical.
9. Score is client-side; page count is preview-estimated.
10. DeepSeek `deepseek-flash`, thinking disabled initially; JSON schema via Responses API, with Chat Completions JSON mode + Zod as fallback.
11. AI actions are charged only on successful, validated output; keyword analysis + tailoring = 2 actions per full run.
12. PDF downloads are charged per successful generation; failed renders free; idempotency prevents double charges.
13. Pro period = provider billing period; unused included actions do not roll over; overage is metered and capped at $25.
14. Canceled Pro keeps access through period end, then reverts to free limits; extra resumes stay editable.
15. Billing provider integration is deferred. Build a provider-agnostic adapter plus a `manual` dev adapter. When ready, Creem is the default recommendation and Dodo is the backup; hosted checkout + portal + merchant-of-record tax handling; monthly only, no trial. Paid launch is blocked until a provider is connected.
16. No transactional email; provider sends receipts; support is a mailto link.
17. No admin dashboard.
18. Desktop-only app; landing page responsive; no dark mode; resume preview always white.
19. Observability is Vercel logs + Analytics only.
20. Account deletion is self-service in Settings; cancel subscription, delete app data, and remove the Neon Auth user via `auth.deleteUser()`; admin API/CLI fallback.
21. No file storage; all resume content lives in Postgres.
22. No background job queue; webhook retries + lazy outbox flushing.
23. Modern browsers only (latest Chrome/Safari/Firefox/Edge).
24. Vercel region and Neon region chosen together for lowest latency. With A4/global positioning, evaluate EU or Asia rather than defaulting to US East.
25. No fixed deadline; prioritize correctness and the seven-feature scope over a shipping date.
26. Budget: Vercel Pro (~$20/mo) for commercial use; Neon free tier initially; DeepSeek sub-cent per action; domain and billing-provider fees separate. No paid analytics/monitoring.
27. Privacy and terms copy are plain-language templates for your review; not legal advice.
28. The `manual` billing adapter is for development/testing only; production Pro grants require a real provider.
29. The app is not launchable as a paid product until a billing provider is connected and verified.

---

## 12. Open risks

1. **Billing provider integration is deferred.** Paid launch is blocked until Creem (recommended) or Dodo (backup) is connected and verified. Creem is a young vendor; confirm cap semantics, Alipay payout limits (50k CNY/payout), and end-of-period cancellation. Dodo’s mainland-China CNY payout rail is not officially documented. Fallback: prepaid $25/500-action packs.
2. **Neon Auth SDK is 0.6.0-beta.** API changes, docs inconsistencies (`getSession` shape, `sameSite` default), ESM-only tooling, and account deletion behavior are risks. Pin the exact version; test the OAuth deletion path in a branch. The service is GA, but the SDK is not.
3. **DeepSeek PII/privacy.** API data is processed in the PRC and may be used for training unless opted out by email. Consent + disclosure chosen, but this remains a trust/compliance risk for users in privacy-sensitive jurisdictions. Reliability is ~99.5%; fabrication and prompt injection are real.
4. **`@react-pdf/renderer` 4.9.0** has an open multi-document glyph/ToUnicode regression (Oct 2026) and no official Next 16/Turbopack statement. Pin/test; fallback to 4.7.0, Playwright/Chromium, or a hosted PDF API.
5. **Next.js 16 Cache Components + auth.** A top-level session read in a layout is a build error. Do not copy Neon’s `force-dynamic` quickstart. Use `<Suspense>` and `use cache: private`. Proxy is Node-only.
6. **Desktop-only editor + core-only contact fields** may hurt conversion for early-career users, who often apply from phones and need LinkedIn/GitHub links. Revisit after launch.
7. **Free tailoring costs 2 of 3 AI actions**, leaving one full run. The free score is the hook, but this may feel stingy.
8. **Page-count accuracy** is preview-estimated; the PDF may paginate differently.
9. **Vercel access from mainland China** may slow development/operations. Vercel Hobby is non-commercial; a paid launch needs Pro.
10. **Metered overage** may not be supported by the chosen provider; the fallback changes the pricing UX.
11. **No Sentry/PostHog** means production debugging relies on Vercel logs; no error grouping or funnel analysis.
12. **AI latency vs Vercel timeout.** Tailoring with thinking enabled could exceed a 60s function limit. v1 starts without thinking.
13. **Google OAuth production setup** requires your own client, redirect URIs per environment/branch, a published consent screen, and privacy/terms URLs. Google does not allow wildcard redirect URIs; preview branches are awkward.
14. **Autosave data loss** if a session expires mid-edit; localStorage backup needs explicit handling and testing.
15. **PDF download abuse** for Pro (unlimited) needs rate limiting and idempotency.
16. **Single landing page** limits SEO surface versus competitors with template/pricing/guide pages.
17. **DeepSeek model alias is moving** (`deepseek-flash` repointed 2026-10-17); behavior can change without a code change. Regression-test prompts.
18. **Commercial hosting cost:** Vercel Hobby is non-commercial; Neon free tier scales to zero and has limits. Monitor as usage grows.
19. **Neon Auth session cache:** a revoked/deleted session can look valid for up to 5 minutes. Force `disableCookieCache: 'true'` for account deletion and billing changes.
20. **Neon Auth RLS caveat:** the table-owner connection bypasses RLS. App-level ownership checks are mandatory; do not rely on RLS.
21. **No custom auth claims:** app roles/plans live in `profiles`/`subscriptions`, not the JWT.
22. **Account deletion cache/CLI fallback:** if `auth.deleteUser()` requires a fresh session or fails, the admin API/CLI path must be documented and tested.

---

## 13. Deferred decisions

- **Billing provider integration** — deferred by choice. Build provider-agnostically with a `manual` adapter. Recommended target: **Creem**. Backup: **Dodo Payments**. Fallback: prepaid action packs. Paid launch is gated on connecting and verifying a provider.
- **Stripe** — not viable without a Stripe-capable entity. The original Stripe Checkout/Portal requirement is superseded.
- **US Letter** — later option; v1 is A4.
- **Annual plan / trial** — not in v1; monthly only.
- **Admin dashboard** — not in v1.
- **Email service** — not in v1.
- **Sentry/PostHog** — not in v1; Vercel logs + Analytics only.

---

## 14. Decisions locked

- Google-only auth via Neon Auth.
- Six fixed sections (Projects added).
- Core contact fields only.
- Education includes coursework/honors.
- A4, single-column, ATS-safe template.
- 3 AI writing buttons; 1 action each on success.
- Tailoring = 2 LLM calls / 2 actions.
- Free lifetime limits: 1 concurrent resume, 3 AI actions, 3 PDFs.
- Pro $12/mo: unlimited resumes/downloads, 500 included AI actions, $0.05 overage, $25 cap.
- AI charged on success only.
- PDF charged per successful generation.
- Canceled Pro keeps data and access through period end.
- Desktop-only app; responsive landing.
- DeepSeek `deepseek-flash` with consent + disclosure.
- Next.js full-stack on Vercel; Neon Postgres + Neon Auth; Drizzle + `pg`.
- `@react-pdf/renderer`; HTML/CSS preview.
- Vercel logs + Analytics.
- Critical-path tests.
- Public brand: Lume (`resume-builder` remains the internal package/repo name).
- No fixed deadline.

---

## 15. References

**Next.js 16 (bundled docs in `node_modules/next/dist/docs/`)**
- `01-app/02-guides/authentication-with-cache-components.md`
- `01-app/02-guides/authentication.md`
- `01-app/03-api-reference/03-file-conventions/proxy.md`
- `01-app/01-getting-started/08-caching.md`
- `01-app/01-getting-started/15-route-handlers.md`
- `01-app/01-getting-started/14-metadata-and-og-images.md`
- `01-app/03-api-reference/05-config/01-next-config-js/serverExternalPackages.md`

**Neon**
- Neon Auth Next.js quickstart: `https://neon.com/docs/auth/quick-start/nextjs-api-only`
- Neon Auth server SDK: `https://neon.com/docs/auth/reference/nextjs-server`
- Neon Auth OAuth setup: `https://neon.com/docs/auth/guides/setup-oauth`
- Neon Auth trusted domains: `https://neon.com/docs/auth/guides/configure-domains`
- Neon Auth account deletion / admin: `https://neon.com/docs/auth/guides/plugins/admin`
- Neon Auth production checklist: `https://neon.com/docs/auth/production-checklist`
- Neon connection methods: `https://neon.com/docs/connect/choose-connection`
- Neon Drizzle guide: `https://neon.com/docs/guides/drizzle`
- Neon plans: `https://neon.com/docs/introduction/plans`

**DeepSeek**
- Models & pricing: `https://api-docs.deepseek.com/quick_start/pricing/`
- JSON output: `https://api-docs.deepseek.com/guides/json_mode`
- Responses API: `https://api-docs.deepseek.com/guides/responses_api`
- Rate limits: `https://api-docs.deepseek.com/quick_start/rate_limit`
- Privacy policy: `https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html`
- Status: `https://status.deepseek.com/`

**PDF**
- `@react-pdf/renderer`: `https://react-pdf.org/`
- Fonts/hyphenation: `https://react-pdf.org/fonts`
- Issue #3589 (4.9 multi-document regression): `https://github.com/diegomura/react-pdf/issues/3589`
- PDF/A conformance PR: `https://github.com/diegomura/react-pdf/pull/3529`

**Billing**
- Creem supported countries: `https://docs.creem.io/merchant-of-record/supported-countries`
- Creem payouts: `https://docs.creem.io/merchant-of-record/finance/payouts`
- Creem usage billing: `https://docs.creem.io/features/usage-based-billing`
- Creem customer portal: `https://docs.creem.io/features/customer-portal`
- Creem Next.js template: `https://docs.creem.io/code/sdks/templates`
- Dodo accepted countries: `https://docs.dodopayments.com/miscellaneous/accepted-countries-and-territories`
- Dodo credit-based billing: `https://docs.dodopayments.com/features/credit-based-billing`
- Dodo Next.js SDK: `https://www.npmjs.com/package/@dodopayments/nextjs`
- Paddle supported countries: `https://developer.paddle.com/concepts/sell/supported-countries-locales/`
- Paddle customer portal: `https://developer.paddle.com/build/customers/integrate-customer-portal/`
- Freemius supported countries: `https://freemius.com/help/documentation/selling-with-freemius/supported-countries/`

**Vercel**
- Vercel Functions limits: `https://vercel.com/docs/functions/limitations`
- Vercel Node versions: `https://vercel.com/docs/functions/runtimes/node-js/node-js-versions`
- Vercel Analytics: `https://vercel.com/docs/analytics`

---

## 15. Implementation status (2026-10-20)

**2026-10-24 — Lume landing rebrand**
- Rebuilt the public landing page in the supplied motion/design direction: sky hero, HTML/CSS editor mockup, scroll-linked feature cards, score demo, single ATS-template showcase, pricing, FAQ, and final CTA.
- Replaced the old text mark with the Lume brand kit direction: SVG gradient mark, tightened Quicksand wordmark, app icon/favicon, and OG image.
- Hero line: “Built to be read. Written to be remembered.” Template line: “Quiet page. Loud achievements.”
- Nav now links How it works / Features / Templates / Pricing / FAQ plus Sign in. It uses the approved blue-hour liquid-glass values: `#244d88`/`#3b68a5`/`#7194c2` sky tokens, white nav text, white/purple CTA, pointer-tracked specular, and the reference caustic timing.
- Hero sky uses the four cloud WebP layers extracted from `Lume_Blue_Hour_Hero.html`, with the reference sizes, positions, opacity, and 47s/56s/67s/71s drift. Headline sizing, weights, gradient, CTA shadows, and product entrance timing match the reference.
- The fixed nav keeps the reference glass at the top and switches to a deeper blue glass when scrolled so white nav text stays legible. The editor mockup preserves the existing HTML preview; the floating score chip was removed to match the reference.
- Rebranded visible product surfaces and metadata to Lume. Support address is a placeholder: `support@lume.app`.

**Built**
- Google-only Neon Auth shell, protected `(app)` routes, `proxy.ts`, session DAL, profile upsert, sign-out, and account deletion.
- Dashboard with create/rename/delete, free resume limit, usage summary, upgrade modal, and empty state.
- Six-section editor (Contact, Summary, Experience, Education, Projects, Skills), debounced autosave, stale-tab conflict handling, localStorage draft recovery, and stale-save mutex.
- A4 live preview, 10-check score with fix links, and `@react-pdf/renderer` PDF export with embedded Source Sans 3, hyphenation disabled, and ATS extraction tests.
- DeepSeek client with JSON-schema output, Zod validation, source-quote checks, consent modal, per-action usage reservation, idempotency, and rate limits.
- Three AI writing routes (summary, bullets, improve) and two-step job tailoring (keyword analysis + rewrite) with per-item review.
- Provider-agnostic billing adapter, `manual` Pro adapter, entitlement math (free lifetime limits, Pro 500 included + 500 overage, $25 cap), billing page, and upgrade flows.
- Landing page, pricing, FAQ, privacy/terms, metadata, OG image, robots, sitemap, JSON-LD, and Vercel Analytics.
- Initial Drizzle migration in `drizzle/0000_init.sql`, including an optional `neon_auth.user` FK added in a guarded DO block.

**Verified**
- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npm test` — 21 tests pass (score, entitlements, schema, PDF render/extraction where `pdftotext` is available).
- `npm run build` — pass. Static: `/`, `/login`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`. Partial/dynamic: `/dashboard`, `/resume/[id]`, `/billing`, `/settings`, API routes.
- Production smoke test: `/` 200 with hero, `/privacy` 200, `/login` 200 with “Continue with Google”, `/dashboard` 307 → `/login`.
- Note: `/login` is intentionally static now; it does not perform a server-side session check before rendering.

**Implementation deviations / notes**
- `lib/auth/dal.ts` is session-only; profile writes live in `lib/auth/profile.ts`. This keeps `/login` and the public header from requiring `DATABASE_URL`.
- `lib/db/client.ts` uses `pg.Pool`, the pooled URL, and `attachDatabasePool` on Vercel.
- `@neondatabase/auth` is pinned to `0.6.0-beta`; `@react-pdf/renderer` is pinned to `4.7.0`.
- The `neon_auth.user` FK is optional and only added if the auth schema exists when the migration runs. Account deletion also explicitly deletes the profile, so app data cascades even without the FK.
- Billing remains `manual`. Creem is still the recommended target; no provider adapter is implemented yet.

**Still required before a real launch**
1. Create `.env.local`/Vercel envs: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `DEEPSEEK_API_KEY`, `NEXT_PUBLIC_APP_URL`.
2. Enable Neon Auth and configure Google OAuth redirect URI `{NEON_AUTH_BASE_URL}/callback/google`, trusted domains, and disable email/password signup.
3. Run `npm run db:migrate` against the target Neon branch.
4. Test real Google sign-in, autosave, AI routes with a live DeepSeek key, and PDF download in a configured environment.
5. Connect and verify a billing provider (Creem recommended), then enable checkout.
6. Install Playwright Chromium and run the E2E suite in CI or locally.
7. Review privacy/terms with counsel and replace the placeholder support address.
8. Deploy to Vercel Pro and verify font tracing for the PDF route in the production runtime.

---

*End of plan.*
