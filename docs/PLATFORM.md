# IMBEGNAL platform guide

## Architecture

```
Browser (static Next.js export on GitHub Pages)        Cloudflare Worker + D1
┌──────────────────────────────────────────┐          ┌─────────────────────────────┐
│ app/            routes (App Router)       │          │ /api/auth/{github,google}   │
│  learn/…        course + lesson player    │  HTTPS   │ /api/auth/{register,login}  │
│  dashboard/     streak, XP, resume        │ ───────► │ /api/state   (sync, PUT/GET)│
│  login/ pricing/ roadmaps/ …              │          │ /api/ai/chat (SSE → Claude) │
│ lib/study-store local-first progress/notes│          │ /api/progress /bookmarks    │
│ lib/sync        merge + debounced push    │          └─────────────────────────────┘
└──────────────────────────────────────────┘
```

* **Content** lives in `data/` (roadmaps → nodes → lessons). `lib/catalog.ts`
  derives *courses → modules → lessons* from it, so there is a single source of
  truth. Every lesson is its own statically generated, indexable page.
* **Local-first**: progress, notes, XP and streak work for guests
  (`localStorage`). When signed in, `lib/sync.ts` merges with the server copy
  (union of completions, newest note wins, XP derived from per-lesson records so
  merges never double-count) and pushes changes debounced.
* **Theming**: semantic tokens in `app/globals.css` (`bg-surface`, `text-fg-muted`,
  `border-line`, …) flip on `<html data-theme>`. A tiny inline script applies the
  saved/system theme and RTL before first paint (no flash).
* **i18n**: `lib/i18n.ts` + `lib/i18n-platform.ts`. The Arabic dictionary is
  type-checked against the English one, so a missing key fails the build.
  Layout uses logical properties (`ms-*`, `ps-*`, `start-*`) for RTL.
* **AI tutor**: `worker/src/ai.ts` streams Claude's reply as SSE. The lesson
  text is sent as a cached system block (follow-up questions are cheap), with
  per-user daily quotas (20 free / 200 pro by default) and server-side refusal
  fallback. The API key never reaches the browser.

## Deploying

Merging to `main` runs `.github/workflows/deploy.yml`, in this order:

1. **Verify** — lint, type-check and build the site (no external effects; a broken frontend stops here).
2. **API** — `wrangler d1 migrations apply --remote` (only migrations not yet applied, tracked in D1's `d1_migrations` table), then `wrangler deploy`. Main branch only.
3. **Site** — the build from step 1 is published to GitHub Pages, only if step 2 succeeded.

The site is also built by Cloudflare's Git integration (Workers Builds, project `imbegnal`) using the root
`wrangler.jsonc` (`npm run build` → `npx wrangler deploy` publishes `./out` as static assets, with `public/_headers`
for long-lived caching). That path is independent of the workflow above, so on merge the frontend can go live a
minute or two before the API deploy finishes; the old and new API/frontend are compatible in both directions
(new site + old API: email sign-up, sync and tutor show an error until the API is deployed; everything else works).
`NEXT_PUBLIC_API_URL` defaults to the live Worker in production builds, so a build without env vars cannot ship a localhost URL.
Cloudflare project settings that match the repo: root directory `/`, build command `npm run build` (optional — `wrangler.jsonc`
builds `./out` itself when it is missing), deploy command `npx wrangler deploy`, Node version from `.node-version` (22).

### One-time setup (no credentials are ever shared in chat or committed)

1. **Cloudflare API token** — dash.cloudflare.com → My Profile → API Tokens → Create Token → **Create Custom Token** with exactly:
   **Account › Workers Scripts › Edit** and **Account › D1 › Edit**; Account Resources: your account only; **no Zone permissions**
   (the "Edit Cloudflare Workers" template also grants route access on every domain in the account, which CI does not need).
2. **Account ID** — Cloudflare dashboard → Workers & Pages → *Account ID* (right sidebar).
3. **GitHub** → repo Settings → Secrets and variables → Actions → New repository secret:
   `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. **Worker secrets** (encrypted, set once in Cloudflare → Workers & Pages → `skillforge-api` → Settings → Variables and Secrets, type *Secret*):
   `ANTHROPIC_API_KEY` (a console.anthropic.com key, starts with `sk-ant-`), optionally `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   (redirect URI `<WORKER_URL>/api/auth/google/callback`; then set repo **variable** `GOOGLE_AUTH=1`).
   `JWT_SECRET` and `GITHUB_CLIENT_SECRET` already exist. With `keep_vars = true`, secrets and variables that exist
   **only in the dashboard** survive deploys. Variables listed in `wrangler.toml [vars]` (`GITHUB_CLIENT_ID`, `FRONTEND_URL`,
   `WORKER_URL`) are re-applied from the file on every deploy, so edit those in the file, not the dashboard.

Without the two GitHub secrets the API job fails with a clear message and **nothing** is deployed (the live site stays as it was).

> **Rollbacks:** do not roll the Worker back to a version older than the email-accounts release once anyone has signed up
> with email: the old `/api/auth/me` returned every column (including `password_hash`). Roll forward with a fix instead.
>
> If you ever ran the old `schema-v3.sql` by hand against production, tell a maintainer before the first automated deploy:
> migration `0002` adds the same columns and would fail on a database that already has them.

Database changes go in `worker/migrations/NNNN_name.sql` (never edit an applied migration).
Local dev against a database created by hand from the old `schema*.sql` files: delete `worker/.wrangler/state` first
(migrations would otherwise fail with "duplicate column"), then re-run the commands below.
Local dev: secrets in `worker/.dev.vars` (git-ignored), then in `worker/`:
`npx wrangler d1 migrations apply skillforge-db --local && npx wrangler dev`, and `npm run dev` at the root.

### AI tutor cost controls (set these in the Cloudflare dashboard only — Worker → Settings → Variables; do not add them to `wrangler.toml [vars]`, a deploy would reset them)

| Var | Default | Purpose |
|---|---|---|
| `AI_MODEL` | `claude-opus-5-5` | Cheaper: `claude-sonnet-5-5` or `claude-haiku-4-5` |
| `AI_DAILY_LIMIT_FREE` | 20 | Questions per user per day |
| `AI_DAILY_LIMIT_PRO` | 200 | Same, `users.plan = 'pro'` |
| `AI_DAILY_LIMIT_GLOBAL` | 600 | All users combined per day — spend kill switch |

Counters reset at 00:00 UTC (03:00 Riyadh). Failed model calls are refunded.
Also set a monthly spend limit in the Anthropic Console as the last line of defence.

## Launch metrics (D1)

```bash
npx wrangler d1 execute skillforge-db --remote --command "<SQL>"
```

```sql
-- Daily funnel (unique anonymous browsers)
SELECT day,
  COUNT(DISTINCT CASE WHEN name='lesson_start' THEN anon END) AS started,
  COUNT(DISTINCT CASE WHEN name='lesson_done'  THEN anon END) AS completed,
  COUNT(DISTINCT CASE WHEN name='ai_question'  THEN anon END) AS used_ai,
  COUNT(DISTINCT CASE WHEN name='auth'         THEN anon END) AS signed_in,
  COUNT(DISTINCT CASE WHEN name='pro_click'    THEN anon END) AS pro_clicks
FROM events GROUP BY day ORDER BY day DESC;

-- Day-1 return rate for yesterday's new learners
SELECT COUNT(DISTINCT a.anon) AS cohort, COUNT(DISTINCT b.anon) AS returned_next_day
FROM events a LEFT JOIN events b ON b.anon = a.anon AND b.day = date(a.day, '+1 day')
WHERE a.name = 'lesson_start' AND a.day = date('now', '-1 day');

-- Signups per day and provider
SELECT date(created_at) AS day, provider, COUNT(*) AS signups FROM users GROUP BY day, provider ORDER BY day DESC;

-- AI questions per day (all users)
SELECT day, count FROM ai_usage WHERE github_id = '_global' ORDER BY day DESC LIMIT 14;
```

## Product recommendations

**Engagement**
- Weekly email/Telegram digest with streak status and the next lesson (needs the
  email already collected at signup).
- Spaced-repetition review: resurface questions the learner missed, 1/3/7 days later.
- Shareable certificates of completion per course (PDF + verification URL) —
  also the natural Pro feature.
- Leaderboards by cohort/friends rather than global, to avoid discouraging beginners.
- "Study with a friend" streak pairs; public learner profiles with badges.
- AI-generated practice quizzes and "explain my wrong answer" from the tutor.

**Monetization** (free content stays free — it is the acquisition engine)
1. **Pro subscription** (~$6/mo, ~$50/yr): higher AI limits, AI-generated
   quizzes, certificates, early access. `users.plan` and quotas already exist;
   add Stripe Checkout + a webhook that sets `plan = 'pro'`.
2. **Teams & schools**: cohort dashboards, custom paths, invoicing/SSO.
3. **Certification prep**: paid mock exams and affiliate links on the
   certification pages (disclose clearly).
4. **Sponsorships/GitHub Sponsors** for the open-source project; employer-sponsored tracks.

**Growth**: lesson pages carry `LearningResource` JSON-LD and a sitemap, so each
of the 67 lessons can rank in English and Arabic; Arabic tech content is
under-served. Add an OG image per course and submit the sitemap to Search Console.

## Known gaps / next steps
- Stripe billing, email verification and password reset (email auth currently has
  no verification — fine for progress sync, add before paid features).
- Rate limiting is per-isolate; move to a Durable Object or Cloudflare Rate
  Limiting rules before large launches.
- Lessons are TypeScript objects; at 100+ lessons consider MDX/JSON content with
  a lint step that enforces English/Arabic parity.
- Add Playwright smoke tests to CI (a local e2e script was used during development).
