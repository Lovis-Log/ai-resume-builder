# Lume

An AI-assisted resume studio for early-career candidates. Build a fixed
six-section resume, see a ten-check score, tailor it to a job description, and
export an A4, ATS-safe page.

The app is backed by Neon for data and identity:

- **Postgres** stores profiles, resumes, tailoring runs, usage, and subscriptions.
- **Neon Auth** (Managed Better Auth) provides Google sign-in and sessions.
- **Neon Realtime** streams resume changes to every open tab.

AI actions run in Next.js server actions and call DeepSeek directly.

## Stack

- Next.js 16.4 App Router, React 19, Tailwind CSS 4
- Neon Postgres + Neon Auth + Neon Realtime
- Drizzle ORM + `pg`
- DeepSeek `deepseek-flash` (optional; deterministic fallback without a key)
- `@react-pdf/renderer` for the legacy server PDF path
- Vercel

## Quick start

```bash
npm install
cp .env.example .env.local
neon login
neon link --project-id <project-id>
neon deploy --env .env.local
npm run db:migrate
npm run dev
```

`neon deploy` provisions the services declared in [neon.ts](./neon.ts) and
writes the branch environment variables into `.env.local`. Add
`DEEPSEEK_API_KEY` to `.env.local` to enable live AI; without it, AI actions use
deterministic local heuristics. Generate the cookie secret once:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
# add NEON_AUTH_COOKIE_SECRET=... to .env.local
```

Open `http://localhost:3000`.

### Neon Auth

1. Enable Auth on the branch (`auth: true` in `neon.ts`, applied by `neon deploy`).
2. Set `NEON_AUTH_COOKIE_SECRET` to a random string of 32+ characters.
3. In Neon Console → Auth → OAuth providers → Google, add a Google OAuth client
   for production. Development uses Neon's shared Google credentials.
4. Authorized redirect URI: `{NEON_AUTH_BASE_URL}/callback/google`.
5. Add `http://localhost:3000` and the production origin as trusted domains.
   Localhost ports are pre-approved by default.

`app/api/auth/[...path]/route.ts` proxies the SDK, and [proxy.ts](./proxy.ts)
protects `/dashboard`, `/resume`, `/templates`, `/billing`, and `/settings`.
Every server action re-checks the session; the proxy is not the authorization
boundary.

### Database

```bash
npm run db:generate   # generate SQL from lib/db/schema.ts
npm run db:migrate    # apply against DATABASE_URL_UNPOOLED
npm run db:studio
```

Migrations are in [`drizzle/`](./drizzle/). The application uses the pooled
`DATABASE_URL` through a `pg` pool; migrations use the direct URL.

### AI actions

AI requests are handled by the server actions in
[`app/actions/ai.ts`](./app/actions/ai.ts). They call
[`lib/ai/agents.ts`](./lib/ai/agents.ts), which sends prompts straight to
DeepSeek's OpenAI-compatible Chat Completions endpoint using
`DEEPSEEK_API_KEY`. There is no Neon Function or gateway in the path. Responses
use DeepSeek's JSON output mode and are validated with zod before they reach the
studio.

```bash
# .env.local
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

If the key is unset or the provider call fails, each action falls back to the
deterministic heuristics in [`lib/ai/heuristics.ts`](./lib/ai/heuristics.ts), so
the review flow still works. The resume route sets `maxDuration = 60` to cover
the provider deadline and usage bookkeeping.

### Realtime

The signed-in `(app)` layout loads the initial resume snapshot and a sealed
Realtime query. `components/app/workspace-store.tsx` subscribes through
`@neon/realtime-react`; `app/api/realtime/resumes/route.ts` renews the sealed
query for the current user. Writes return `pg_current_xact_id()` so the client
can wait for the matching transaction.

If a network blocks the WebSocket handshake, the provider falls back to a
short authenticated poll of `app/api/workspace/resumes/route.ts`, so open tabs
still converge.

### Billing

Billing remains provider-manual. Plan changes update the `subscriptions` row in
Postgres; checkout is disabled until a merchant-of-record provider (Creem is the
recommended target) is connected. See `lib/billing/`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public marketing page |
| `/login` | Google sign-in |
| `/dashboard` | Workspace and resume library |
| `/resume/[id]` | Editor, live preview, AI, tailoring, and score |
| `/templates` | Template gallery and new-resume entry |
| `/billing` | Plan, usage, and invoices |
| `/settings` | Profile, export, sign-out, and account deletion |
| `/privacy`, `/terms` | Public legal pages |

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The production build is verified with the live Neon branch. See
[plan.md](./plan.md) for the product architecture.

## Notes

- `legacy/api-routes/` contains the earlier server route handlers, which are not
  part of the current app and are kept for reference.
- The browser print dialog is the PDF export path in the studio. The
  `@react-pdf/renderer` document remains available for a future server export.
