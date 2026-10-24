# Lume

A local-first resume workspace and studio for early-career candidates. Build a
fixed six-section resume, see a ten-check score, rehearse a tailoring flow, and
export an A4 page.

The current build is a **front-end product demo**. It intentionally runs without
accounts, a database, an AI provider, or a billing provider. The interactive
workspace is seeded with realistic sample content and saves everything in your
browser.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and go straight to the
workspace. No environment variables are required.

If you open an older `/login` link, it redirects to `/dashboard` for this demo.

## What is interactive

- Dashboard with seeded resumes, search, create, rename, duplicate, delete, and
  local persistence.
- Studio with a structured editor, live A4 preview, three templates, six accent
  colors, three density settings, zoom, and click-to-edit sections.
- Ten-check resume score with fix links.
- Simulated Lume AI summary drafting and bullet improvement with review/apply.
- Simulated job tailoring: keyword overlap, gaps, reviewed suggestions, and apply.
- Export through the browser print dialog (A4, selectable text) or as editable
  JSON.
- Mock billing and account settings, including a reset-to-seed action.
- Responsive layouts, with an explicit Edit/Preview switch on small screens.

All AI and billing flows are labelled as simulations. No resume text or job
description leaves the browser.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public marketing page |
| `/dashboard` | Workspace and resume library |
| `/resume/[id]` | Resume editor, preview, AI, tailoring, and score |
| `/templates` | Template gallery and new-resume entry |
| `/billing` | Demo plan, usage, and invoices |
| `/settings` | Local profile and workspace data |
| `/privacy`, `/terms` | Public legal pages |

## Local data

Demo state is stored under `lume-demo-workspace-v1` in `localStorage`. Use
**Settings → Reset the demo** to restore the three sample resumes and default
profile. **Export workspace** downloads the complete state as JSON.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The existing unit/PDF suite passes. The production build runs with no secrets.

## Parked production prototype

The earlier backend implementation is still in the repository for a later
phase. Its API route handlers were moved to
[`legacy/api-routes`](./legacy/api-routes/README.md) because they require Neon,
Google OAuth, DeepSeek, and billing environment variables at build time. Related
libraries remain under `lib/`, and the full production architecture is described
in [plan.md](./plan.md).

When reconnecting the backend:

1. Move the required folders from `legacy/api-routes/api` back into `app/api`.
2. Restore authentication routing and environment variables from `.env.example`.
3. Replace the local demo store with server data and real AI/PDF handlers.
