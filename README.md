# Lume

An AI-assisted resume studio for early-career candidates. Build a fixed
six-section resume, see a ten-check score, tailor it to a job description, and
export an A4, ATS-safe page.

The app is backed by Neon end to end:

- **Postgres** stores profiles, resumes, tailoring runs, usage, and subscriptions.
- **Neon Auth** (Managed Better Auth) provides Google sign-in and sessions.
- **Neon Functions** runs the AI endpoint that talks to DeepSeek.
- **Neon Realtime** streams resume changes to every open tab.

## Stack

- Next.js 16.4 App Router, React 19, Tailwind CSS 4
- Neon Postgres + Neon Auth + Neon Functions + Neon Realtime
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

`neon deploy` provisions the services declared in [neon.ts](./neon.ts), deploys
the AI function, and writes the branch environment variables into `.env.local`.
Generate the cookie secret once:

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

### AI Function

The AI endpoint lives in [`functions/api.ts`](./functions/api.ts) and is declared
in `neon.ts` as the `ai` function. It verifies Neon Auth JWTs against the
injected JWKS, then calls DeepSeek for summaries, bullet rewrites, keyword
extraction, and tailoring. If `DEEPSEEK_API_KEY` is unset, it returns a
deterministic heuristic response so the full review flow still works.

```bash
neon dev          # local function runtime at http://localhost:8787
neon deploy --env .env.local
```

To run the app against the local function during development:

```bash
NEON_FUNCTION_AI_BASE_URL=http://127.0.0.1:8787 npm run dev
```

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
