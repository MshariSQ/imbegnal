# IMBEGNAL platform guide

## Architecture

```
Browser (static Next.js export: GitHub Pages / Cloudflare Workers assets)
┌──────────────────────────────────────────┐          ┌──────────────────────────────────┐
│ app/            routes (App Router)       │          │ Cloudflare Worker (worker/) + D1  │
│  learn/…        course + lesson player    │  HTTPS   │ /api/auth/*  /api/state  /api/ai │
│  code-lab/      editor, run, share        │ ───────► │ /api/lab/*   run, quota, history │
│  challenges/    CTF list, submit, board   │  Bearer  │ /api/challenges/* /api/leaderboard│
│  dashboard/ login/ pricing/ roadmaps/ …   │   JWT    │ /api/certificates/* /instructor/* │
│ lib/study-store local-first progress/notes│          └───────────────┬──────────────────┘
│ lib/sync        merge + debounced push    │                          │ HMAC-signed HTTPS
└──────────────────────────────────────────┘                          ▼ (RUNNER_URL)
                                                       ┌──────────────────────────────────┐
                                                       │ Runner (runner/) on a Docker VM   │
                                                       │ one throw-away container per run: │
                                                       │ no network, read-only, non-root   │
                                                       └──────────────────────────────────┘
```

* **Content** lives in `data/` (roadmaps → nodes → lessons). `lib/catalog.ts`
  derives *courses → modules → lessons* from it, so there is a single source of
  truth. Every lesson is its own statically generated, indexable page.
* **Local-first**: progress, notes, XP and streak work for guests
  (`localStorage`). When signed in, `lib/sync.ts` merges with the server copy
  (union of completions, newest note wins, XP derived from per-lesson records so
  merges never double-count) and pushes changes debounced.
* **Sign-in**: GitHub and Google use the OAuth code flow on the Worker; the OAuth `state` round-trips
  through an HttpOnly cookie. The Worker hands the JWT back in the URL fragment
  (`/auth/callback/#token=...&nonce=...`). The `nonce` closes login CSRF on that last hop: the login
  page creates a random per-tab nonce on click (`lib/auth-nonce.ts`, sessionStorage, 10 minutes, one
  use) and sends it as `?nonce=` to `/api/auth/github` or `/api/auth/google`; the Worker keeps it in
  the state cookie (`<state>.<nonce>`; a malformed nonce is ignored, not rejected) and echoes it only
  from that cookie. The callback page saves the token only when the echoed nonce matches its own, so a
  link carrying someone else's token (`#token=<attacker JWT>`) cannot sign a visitor in. Email/password
  sign-in returns the token in a JSON response and is not affected.
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
* **Code Lab and Challenges**: the binding spec is [`docs/CODE_LAB.md`](CODE_LAB.md); the runner's threat
  model and operations are in [`runner/README.md`](../runner/README.md); Worker-side variables in
  [`worker/README-lab.md`](../worker/README-lab.md). Summary in [Code Lab, Challenges and the runner](#code-lab-challenges-and-the-runner).

## Deploying

Merging to `main` runs `.github/workflows/deploy.yml`, in this order:

1. **Verify** — lint, type-check and build the site (no external effects; a broken frontend stops here).
2. **API** — `wrangler d1 migrations apply --remote` (only migrations not yet applied, tracked in D1's `d1_migrations` table), then `wrangler deploy`. Main branch only.
3. **Site** — the build from step 1 is published to GitHub Pages, only if step 2 succeeded (or was skipped because the Cloudflare secrets are not set — see *frontend-only mode* below).

The site is also built by Cloudflare's Git integration (Workers Builds, project `imbegnal`) using the root
`wrangler.jsonc` (`npm run build` → `npx wrangler deploy` publishes `./out` as static assets, with `public/_headers`
for long-lived caching). That path is independent of the workflow above, so on merge the frontend can go live a
minute or two before the API deploy finishes; the old and new API/frontend are compatible in both directions
(new site + old API = frontend-only mode, below: the dashboard says progress is saved on this device, and features that need the new API show friendly errors).
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

**Without the two GitHub secrets** the API job passes with a warning and deploys **nothing** (API and database untouched); the site still
publishes — *frontend-only mode*. In this mode GitHub sign-in, lessons, quizzes, notes and progress (saved on this device) keep working; email sign-up, Google sign-in, cloud sync, the AI tutor and account deletion need the new API.
The dashboard detects the old API (`GET /api/state` answers 404; the new Worker answers 401) and says so instead of claiming sync; it
points to a GitHub request for data deletion. Once the secrets exist, the next run (or "Re-run all jobs") applies migrations, deploys
the Worker, then publishes the site. If the secrets exist but a step fails, the pipeline stops and the site is **not** published.
Deleting or rotating the secrets later silently returns the pipeline to frontend-only mode (watch for the warning annotation).

> **Rollbacks:** do not roll the Worker back to a version older than the email-accounts release once anyone has signed up
> with email: the old `/api/auth/me` returned every column (including `password_hash`). Roll forward with a fix instead.
>
> If you ever ran the old `schema-v3.sql` by hand against production, tell a maintainer before the first automated deploy:
> migration `0002` adds the same columns and would fail on a database that already has them.

Database changes go in `worker/migrations/NNNN_name.sql` (never edit an applied migration).
Local dev against a database created by hand from the old `schema*.sql` files: delete `worker/.wrangler/state` first
(migrations would otherwise fail with "duplicate column"), then re-run the commands below.
Local dev: secrets in `worker/.dev.vars` (git-ignored), then in `worker/`:
`npx wrangler d1 migrations apply skillforge-db --local --config wrangler.toml && npm run dev`, and `npm run dev` at the root.

> **Always pass `--config wrangler.toml` to `wrangler` inside `worker/`** (`npm run dev` / `npm run deploy` there do it for you).
> Wrangler looks for `wrangler.json`/`wrangler.jsonc` in every parent directory *before* it looks for `wrangler.toml`,
> so without the flag it picks up the site's root `wrangler.jsonc` and would deploy or migrate the wrong project.

### AI tutor cost controls (set these in the Cloudflare dashboard only — Worker → Settings → Variables; do not add them to `wrangler.toml [vars]`, a deploy would reset them)

| Var | Default | Purpose |
|---|---|---|
| `AI_MODEL` | `claude-opus-5-5` | Cheaper: `claude-sonnet-5-5` or `claude-haiku-4-5` |
| `AI_DAILY_LIMIT_FREE` | 20 | Questions per user per day |
| `AI_DAILY_LIMIT_PRO` | 200 | Same, `users.plan = 'pro'` |
| `AI_DAILY_LIMIT_GLOBAL` | 600 | All users combined per day — spend kill switch |

Counters reset at 00:00 UTC (03:00 Riyadh). Failed model calls are refunded.
Also set a monthly spend limit in the Anthropic Console as the last line of defence.

## Code Lab, Challenges and the runner

![Lesson to Code Lab: starter code fails the server-side tests, a working solution passes, the lesson shows the lab as passed](media/code-lab-demo.gif)

### Pieces

| Piece | Where | What it does |
|---|---|---|
| Code Lab UI | `app/code-lab/`, `components/codelab/` | CodeMirror editor (14 languages), stdin, stdout/stderr panes, run history, read-only share links (`/code-lab/s/?id=`), "Open in Code Lab" from lessons and challenges. JavaScript and Python also run in the browser when signed out or when the runner is down. |
| Challenges UI | `app/challenges/`, `components/challenges/` | List with track / difficulty / status filters, points, estimated time, solves, first blood; detail page with flag or code submission and hints; leaderboard (all-time / weekly, per track). |
| Curriculum | `data/roadmaps.ts`, `data/curricula.ts`, `data/lessons/**` | `roadmaps[]` is the one taxonomy: course pages, Code Lab tags, challenge categories, certificates and analytics all use the roadmap `id` and look the title up at render time. Lessons embed graded `lab` exercises. |
| Worker | `worker/src/lab/**`, `worker/src/challenges/**`, `worker/src/graders/**` | Quota reserve → signed runner call → grade → log (`lab_runs`) → refund on infrastructure failure. Flags are stored as SHA-256 hashes; hidden tests, harnesses and reference solutions exist only in the Worker bundle. |
| Runner | `runner/` | Zero-dependency Node 22 service that executes one job per throw-away Docker container. |

### Sandbox security (why untrusted code cannot hurt us)

Every run gets a **fresh container** that is destroyed afterwards:
`--network none` (no egress at all: no DNS, no TCP, no cloud metadata), `--read-only` root filesystem with a size-capped
`tmpfs` work directory (nothing persists between runs or users), `--user 65534`, `--cap-drop ALL`,
`--security-opt no-new-privileges`, Docker's default seccomp profile, `--pids-limit` (fork bombs), `--memory` = `--memory-swap`
(OOM → `memory_limit`), `--cpus`, ulimits, a host-side wall-clock kill (infinite loops → `timeout`, compile and run timed
separately) and streaming output caps (64 KiB kept, 1 MiB kills the job → `output_limit`). There is no shell between user
input and Docker (argv only), the container environment is an explicit allow-list (the runner secret never enters it), and
the service authenticates every request with HMAC + timestamp window + replay-protected job ids. The full threat model,
residual risks (shared kernel, the Docker socket) and hardening options (gVisor `runsc`, rootless Docker) are in
[`runner/README.md`](../runner/README.md#threat-model). Each of these properties has a test against a real Docker daemon
(`npm run test:runner`) and again end-to-end through the Worker (`tests/e2e/full/sandbox.spec.ts`).

On top of the sandbox the Worker enforces **quotas** (free 50 / pro 500 runs per UTC day, 10 / 30 per minute, 2 concurrent,
20 000 per day globally — all overridable with `RUN_*` variables), refunds runs that fail for infrastructure reasons,
records **abuse signals** (resource-limit hits, network probes, floods, flag brute force) that auto-suspend an account for
24 h, and writes an **audit log** (`audit_log`). Logged per run: user, lesson/challenge, language, durations, exit code,
output size, status and timestamp — never environment, secrets or host paths.

### Deploying the runner (once)

1. **A dedicated Linux VM** (Ubuntu 24.04, 2+ vCPU, 4+ GB RAM; nothing else on it). Then:
   ```sh
   git clone https://github.com/MshariSQ/imbegnal && cd imbegnal
   sudo runner/deploy/install.sh --profile full   # Docker, Node 22, toolchain image, systemd unit, generated secret
   ```
   `--profile slim` (Python, JS/TS, Java, C, C++) builds in minutes; `full` adds C#, Go, Rust, Ruby, PHP, Kotlin, Bash
   (and Swift when `SWIFT_SHA256` is exported). Languages that fail their start-up smoke test are reported as unavailable
   and the Code Lab greys them out.
2. **Publish it without opening a port**: a Cloudflare Tunnel to `http://localhost:4242`
   ([steps](../runner/README.md#cloudflare-tunnel-setup)), e.g. `https://runner.imbegnal.com`.
3. **Point the Worker at it** (Cloudflare → Workers & Pages → `skillforge-api` → Settings → Variables and Secrets, type *Secret*):
   `RUNNER_URL` = the tunnel URL, `RUNNER_SECRET` = the value printed by `sudo sed -n 's/^RUNNER_SECRET=//p' /etc/imbegnal-runner.env`.
   No GitHub secret is needed for the runner; it never sees the repository's credentials.
4. Check: `GET <WORKER_URL>/api/lab/languages` answers `"runner": "up"` with the language list.

Until `RUNNER_URL` is set the site keeps working: lessons, challenges with flag answers and the in-browser JavaScript/Python
fallback work, and server runs answer a friendly "runner unavailable" (not charged).
Migrations `0004`–`0006` (Code Lab, challenges, certificates) are applied by the normal deploy.

**Roles**: `users.role` is `student` by default. Promote an instructor (analytics at `/api/instructor/analytics`) or admin
(audit log) with `wrangler d1 execute` — see [`worker/README-lab.md`](../worker/README-lab.md).

## Tests

| Command | Needs | Covers |
|---|---|---|
| `npm run typecheck` | — | site, Worker and runner TypeScript |
| `npx eslint .` | — | lint |
| `npm run check:catalog` | — | `worker/src/generated/catalog.ts` matches the lesson/challenge data (`npm run gen:catalog` to refresh) |
| `npm run test:unit` | host toolchains (optional) | contracts, output matching, curricula, canonical names, lessons; every lab and challenge reference solution is run against its tests on the host toolchains that exist (missing ones are skipped) |
| `npm run test:worker` | `cd worker && npm ci` | every Worker endpoint on a D1 shim over `node:sqlite` with a stubbed runner: quotas, refunds, grading, flags, first blood, leaderboard, abuse, audit, certificates, account deletion, the OAuth login nonce |
| `npm run test:runner` | Docker + `runner/image/build.sh slim` | the sandbox against a real Docker daemon: per-language Hello World, stdout/stderr, timeouts, memory, fork bombs, output floods, no network, no persistence, read-only root, uid, HMAC/replay |
| `npm run test:e2e` | Docker, a runner image, `worker/node_modules`, Chromium | the real stack (runner + `wrangler dev` with local D1 and the real migrations + the exported site + Playwright): Hello World in Python/JS/Java/C/C++ through the UI, stdout vs stderr, infinite loop killed, network blocked, quota exhaustion message and refunds, lesson → "Try in Code Lab" → starter code → pass → XP, challenge solve → points |

| `npm run test:e2e:ui` | Chromium | the site's UI against a mocked Worker: Code Lab (editor, every error state, history, share, permalinks, in-browser JS/Python runners, layout), Challenges (a fixture export: list, filters, detail, submit, hints, leaderboard), course pages, certificate verification, the instructor dashboard and the sign-in callback (login nonce); English and Arabic (RTL), 360-1280 px widths, axe-core, no hydration errors |

`npm run test:e2e` builds the site with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8787`, starts everything on loopback
(site 4173, Worker 8787, runner 4242) with throw-away secrets and a temporary D1, and tears it down afterwards.
`E2E_SKIP_BUILD=1` reuses `out/`, `E2E_SPECS="codelab.spec.ts"` runs one file, `E2E_KEEP=1` leaves the stack up.
CI (`.github/workflows/ci.yml`) runs all of the above on every pull request.

## Launch metrics (D1)

```bash
cd worker && npx wrangler d1 execute skillforge-db --remote --config wrangler.toml --command "<SQL>"
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
- Certificates of completion per course exist as a PDF skeleton with a verification code
  (`/api/certificates/*`); give them a designed template and make them a Pro perk.
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
- Login CSRF, residual window while production runs the previous Worker (frontend-only mode): that Worker
  cannot echo the login nonce, so the callback page still accepts a fragment **without** a nonce when the API
  is positively identified as the old one (`GET /api/state` answers 404, `getApiLevel()` in
  `lib/capabilities.ts`). While that lasts, a crafted `/auth/callback/#token=<attacker JWT>` link can still
  sign a visitor in to the attacker's account. A fragment that carries a nonce is always checked, and when the
  API is the new one or its generation cannot be determined, a missing nonce is refused. The window closes as
  soon as the new Worker is deployed; no site change is needed then.
- Rate limiting is per-isolate (per IP: 60 requests/min, 10/min on `/api/auth/*`; override with the
  `RATE_LIMIT_PER_MIN` / `RATE_LIMIT_AUTH_PER_MIN` variables); move to a Durable Object or Cloudflare Rate
  Limiting rules before large launches.
- Lessons are TypeScript objects; at 100+ lessons consider MDX/JSON content with
  a lint step that enforces English/Arabic parity.
- Runner: one VM is a single point of failure for server runs (the browser fallback covers JS/Python); add a
  second VM behind the tunnel (Cloudflare load-balances connectors) before large launches. gVisor is recommended there.
- Swift needs a checksum-pinned toolchain download (`SWIFT_SHA256`); it is reported unavailable until then.
