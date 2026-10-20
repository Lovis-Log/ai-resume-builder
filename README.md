# Resume Builder

An AI-assisted resume builder for early-career candidates and new grads. Build a fixed six-section resume, see a free 10-check score, tailor it to a job description, and export an A4, ATS-safe PDF.

## Stack

- Next.js 16.4 App Router, React 19, Tailwind CSS 4
- Neon Postgres + Neon Auth (Google only)
- Drizzle ORM + `pg`
- DeepSeek `deepseek-flash`
- `@react-pdf/renderer`
- Vercel

The full product, architecture, and implementation plan is in [plan.md](./plan.md).

## Quick start

```bash
npm install
cp .env.example .env.local
# fill in DATABASE_URL, DATABASE_URL_UNPOOLED,
# NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, DEEPSEEK_API_KEY
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

### Neon Auth

1. Create a Neon project and enable Auth on the branch.
2. Set `NEON_AUTH_BASE_URL` to the full branch auth URL (including `/neondb/auth`).
3. Generate a cookie secret with `openssl rand -base64 32` and set `NEON_AUTH_COOKIE_SECRET`.
4. In Neon Console → Auth → OAuth providers → Google, add a Google OAuth client.
   - Authorized redirect URI: `{NEON_AUTH_BASE_URL}/callback/google`.
5. Add `http://localhost:3000` and your production domain as trusted domains.
6. Disable email/password sign-up; the app is Google-only.

### Database

```bash
npm run db:generate   # generate SQL from lib/db/schema.ts
npm run db:migrate    # apply against DATABASE_URL_UNPOOLED
npm run db:studio
```

Enable Neon Auth before applying the optional `neon_auth.user` foreign-key
migration. App data still cascades from `profiles` even without the cross-schema
FK.

### Local helpers

```bash
# Sign in once, then copy the auth user id from neon_auth.user
npm run seed -- <user-id>
npm run seed:grant-pro -- <user-id>
```

## AI

AI features are opt-in. The consent dialog explains that resume text and job
descriptions are sent to DeepSeek, which processes data in the PRC and may use
inputs for model improvement. The score, editor, autosave, and PDF export do not
call an AI provider.

The app uses `deepseek-flash` with thinking disabled for latency. Prompts are in
`lib/ai/prompts.ts`; JSON output is validated with Zod. Failed or invalid calls
do not consume an AI action.

## Billing

Billing provider integration is intentionally deferred. The app has a
provider-agnostic adapter (`lib/billing/`) and a `manual` adapter for local Pro
testing. Set `BILLING_PROVIDER=manual` (default). Paid launch is blocked until a
real merchant-of-record provider is connected. The recommended target is Creem;
Dodo Payments is the backup. See `plan.md` for the research and trade-offs.

## Tests

```bash
npm run typecheck
npm test
npm run test:e2e
```

The PDF extraction test uses `pdftotext` when available. Install Poppler to run
it locally (`brew install poppler`, `apt-get install poppler-utils`, or the
Windows Poppler build). Without it, the PDF test still checks page size and
count.

## Deployment

- Deploy to Vercel (Pro plan for commercial use).
- Set all environment variables for Production, Preview, and Development.
- Use the Neon/Vercel integration for branch-aware `DATABASE_URL` and
  `NEON_AUTH_BASE_URL`.
- Run migrations against the target Neon branch before deploying.
- Google OAuth redirect URIs are per Neon Auth branch; use Neon's shared
  credentials for previews or register each branch.
- `NEXT_PUBLIC_APP_URL` must be the production origin.

## Scope guardrails

Fixed sections only: Contact, Summary, Experience, Education, Projects, Skills.
One A4 template. No drag-and-drop, custom sections, rich formatting, teams,
sharing, folders, or mobile editing. The editor is desktop-only; the marketing
page is responsive.
