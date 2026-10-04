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

## Deploying (order matters)

```bash
cd worker && npm install

# 1. Database first — new endpoints need these tables
npx wrangler d1 execute skillforge-db --remote --file schema-v3.sql   # email/Google accounts, plans, sync, AI quotas
npx wrangler d1 execute skillforge-db --remote --file schema-v4.sql   # anonymous analytics events

# 2. Secrets / vars (ANTHROPIC_API_KEY must be a console.anthropic.com key starting "sk-ant-")
npx wrangler secret put ANTHROPIC_API_KEY      # turns the AI tutor on
npx wrangler secret put GOOGLE_CLIENT_ID       # optional: "Continue with Google"
npx wrangler secret put GOOGLE_CLIENT_SECRET   #   redirect URI: <WORKER_URL>/api/auth/google/callback

# 3. Worker, then the frontend (merge to main → GitHub Pages deploy)
npx wrangler deploy
```

If the frontend ships before the worker, login/sync/tutor calls 404.
For Google sign-in also set the GitHub repo **variable** `GOOGLE_AUTH=1`.
Without the optional secrets, features degrade gracefully (tutor "unavailable", Google hidden).
Local dev: secrets in `worker/.dev.vars` (git-ignored), `npx wrangler dev` in `worker/`, `npm run dev` at the root.

### AI tutor cost controls (worker vars in `wrangler.toml` `[vars]` or the dashboard)

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
