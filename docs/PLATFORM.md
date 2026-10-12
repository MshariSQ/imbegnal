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
  merges never double-count) and pushes changes debounced. The Worker stores a sanitized
  copy (`worker/src/state.ts`: catalog lessons only, each lesson's bonus clamped to what its
  exercises and quizzes can award, sane timestamps). XP for graded lab exercises of
  signed-in learners is awarded by the Worker (`xp_ledger`); every XP total in the UI comes
  from `lib/xp.ts` (study-state XP, plus that lab XP when signed in). What is server-authoritative,
  server-bounded or still client-trusted: [XP authority](#xp-authority).
* **Sign-in**: GitHub and Google use the OAuth code flow on the Worker; the OAuth `state` round-trips
  through an HttpOnly cookie. The Worker hands the JWT back in the URL fragment
  (`/auth/callback/#token=...&nonce=...`). The `nonce` closes login CSRF on that last hop: the login
  page creates a random per-tab nonce on click (`lib/auth-nonce.ts`, sessionStorage, 10 minutes, one
  use) and sends it as `?nonce=` to `/api/auth/github` or `/api/auth/google`; the Worker keeps it in
  the state cookie (`<state>.<nonce>`; a malformed nonce is ignored, not rejected) and echoes it only
  from that cookie. The callback page saves the token only when the echoed nonce matches its own, so a
  link carrying someone else's token (`#token=<attacker JWT>`) cannot sign a visitor in. Email/password
  sign-in returns the token in a JSON response and is not affected.
* **Sessions and access control**: the JWT (HS256, 30 days) carries `sub`, `username`, `name`, `avatar`,
  `tv`, `iat` and `exp`, never a role or a plan. Every route that needs a signed-in user goes through one
  guard, `worker/src/auth/guard.ts`: the token must verify, its account must still exist, and its `tv` must
  equal `users.token_version` (tokens from before migration `0008` have no `tv`, which counts as 0);
  otherwise `401`. A suspended account then gets `403 account_suspended` (with `until`, ISO, when the
  suspension has an end) on every route except `GET /api/auth/me` (it reports `suspended` and
  `suspended_until`), `POST /api/auth/logout` and `DELETE /api/account` (`409` while suspended); an expired
  suspension is lifted, with its audit row, by the next request to any guarded route. On the site a `403
  account_suspended` never signs the tab out and never drops local data (the study-state sync keeps the local copy and
  pushes again later, as after a network error); the certificate card, the AI tutor, Code Lab and the challenge
  hints/submissions show an "Account suspended" message instead of their generic error, the first two with the end
  date when `until` is present (`lib/suspension.ts`, `tests/e2e/phase3/suspension.spec.ts`). Roles are read from D1
  on every request. **Signing out** calls `POST /api/auth/logout`, which increments `token_version` and so
  revokes every token of the account on every device (there is no per-device sign-out); the site then
  clears its copy, and a tab whose token the Worker rejects with `401` on the study-state sync signs itself
  out; that is the only thing that does (a `401` from `GET /api/lab/progress` only re-checks the token on
  `/api/state`; the rule is at the top of `lib/sync.ts`). Operators can end all sessions of an account with
  `UPDATE users SET token_version = token_version + 1 WHERE github_id = '<id>'`. **Starting version**: a new
  account row (GitHub callback, Google callback, email registration) starts at a random `token_version` in
  1..2^31-1 (`newTokenVersion()` in `worker/src/util.ts`), and signing in again never changes it. Account keys
  are deterministic (see [Account deletion](#account-deletion)), so an account that is deleted and created
  again gets the same key; the fresh random version means a token issued to the deleted account (its old `tv`,
  or no `tv`) is refused (`worker/tests/recreate-revocation.test.ts`). Accounts created before this keep
  version 0, so their current tokens keep working.
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

Every secret and variable, where it is read, where it is set and whether it is required: [`docs/SECRETS.md`](SECRETS.md)
(with the order for a first deploy).

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
> A Worker from before the auth guard ignores `tv`: the data stays compatible, but tokens revoked by a sign-out work
> again until they expire.
>
> If the old `schema-v3.sql` was ever run by hand against production, migration `0002` would fail on the columns it already
> added. The deploy handles this: `worker/scripts/d1-reconcile.mjs` runs first and, for a migration whose `ADD COLUMN`
> columns already exist, runs its remaining idempotent statements and records it as applied (tested in
> `worker/tests/d1-reconcile.test.ts` on a database built the old way). When it cannot prove that safe it stops the
> deploy with an error and changes nothing.

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
| Challenges UI | `app/challenges/`, `components/challenges/` | List with track / difficulty / status filters, points, estimated time, solves, first blood; detail page with flag or code submission and hints; leaderboard (all-time / weekly, per track). Hint texts are Worker-only (`worker/src/graders/data/hints/`): the public data lists each hint's cost, and the text reaches the page only from `POST /api/challenges/:id/hint` (after the cost is charged) or from the learner's own progress; `tests/unit/hints-no-leak.test.ts` scans the data, the sources and `out/`. |
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
Migrations `0004`–`0008` (Code Lab, challenges, certificates, `0007`: XP ledger, `0008`: `users.token_version`) are
applied by the normal deploy.

### Owner provisioning (roles)

Roles: `student` (default) < `instructor` (analytics at `/instructor/`, `GET /api/instructor/analytics`) < `admin` (also
`GET /api/admin/audit`). Only the owner grants them, from a machine where `npx wrangler login` works (or with a
`CLOUDFLARE_API_TOKEN` that can edit D1 in the environment). No API route writes `users.role` or `users.plan`, signing in
never changes them, and tokens carry neither (`worker/tests/owner-admin.test.ts`).

```sh
cd worker
node scripts/grant-role.mjs --remote --github-id 583231 --role admin         # dry run: prints the account and the SQL
node scripts/grant-role.mjs --remote --github-id 583231 --role admin --yes   # applies it
```

* `--github-id` is the numeric GitHub user id: it never changes (`https://api.github.com/users/<login>` shows it as `id`).
  `--username <name>` also finds email and Google accounts, and is refused when several accounts share the name.
  `--local [--persist-to DIR]` targets a local D1 instead of production.
* It prints the matching account, then the exact SQL, and changes nothing without `--yes`. With `--yes` it writes the role
  and an `audit_log` row (`role.grant`, e.g. `student -> admin (actor: cli)`) in one `wrangler d1 execute`, then prints the
  account again. Running it twice is harmless; `--role student` demotes.
* The role applies to the account's next request; no sign-out is needed.
* `wrangler d1 execute` has no bind parameters, so the script accepts only digits, `[A-Za-z0-9-]` usernames (1-39) and the
  role enum (`worker/tests/grant-role.test.ts`). It holds no credentials: wrangler uses the operator's own login.

First setup: sign in once on the site with GitHub (that creates the account), then grant yourself `admin` as above.

## Account deletion

`DELETE /api/account` (`worker/src/account.ts`, the delete button on the dashboard) erases the account in one atomic D1
batch: the user row, synced study state and notes, roadmap progress, bookmarks, Code Lab runs, snippets and lab
progress, lab XP awards (`xp_ledger`), challenge progress and solves, and certificates
(`worker/tests/account-delete.test.ts`). A suspended account cannot delete itself until the
suspension ends (operators can still erase it on request).

**What is kept, and why.** If deletion also erased the rows that rate limits and abuse checks count, "delete the
account, sign up again" would hand out a fresh daily quota, a clean abuse history and new flag guesses. So the batch
keeps, for at least as long as they count:

| Kept | Counted by |
|---|---|
| today's `lab_usage` row (key, date, number) | Code Lab daily run quota |
| today's `ai_usage` row (key, date, number) | AI tutor daily quota |
| `abuse_signals` of the last 24 hours (kind and a fixed-format detail) | automatic suspension |
| `challenge_attempts` of the last 24 hours (challenge id, correct or not, time; the submitted flag is never stored) | flag brute-force limits: 5 a minute and 30 an hour per challenge, 120 an hour overall |
| `audit_log` | the operators' security record |

Older rows of the four counter tables go with the account. The retained rows hold counters only, under the opaque account key:
no email address, name, code, notes or other content. Nothing purges them afterwards (there is no scheduled job yet);
a later deletion of the same key erases the ones that have stopped counting by then. The full list is in the comment
at the top of `worker/src/lab/account-data.ts`.

Every provider's key is deterministic, so signing up again lands on the same key and the retained rows apply again:

- GitHub: the numeric GitHub user id.
- Google: `google:<sub>`.
- Email: `email:` + the first 32 hex characters of HMAC-SHA256(`JWT_SECRET`, `"imbegnal:email-account:v1|" + email`),
  with the email trimmed and lower-cased exactly as at sign-in (`worker/src/auth-email.ts`). It is keyed because the
  account key travels in the JWT `sub`: a plain hash of the email would let anyone confirm a guessed address. A
  registration whose key is already in use answers `409 email_taken`, like a taken email.

Email accounts created before the derived keys keep their random `email:<uuid>` key (sign-in looks accounts up by
email). When such an account is deleted, the same batch moves the rows it keeps (today's `lab_usage` and
`ai_usage`, the last 24 hours of `abuse_signals` and `challenge_attempts`) to the derived key of its email
(`worker/src/account.ts`), adding counts if that key already has a row for the day, so registering the address
again is still counted; after that the key is stable. Rotating `JWT_SECRET` changes the key of later registrations
(existing accounts keep theirs), so an email account deleted before a rotation comes back without its counters.

A graded lab run or challenge code submission that is still on the runner when the deletion commits writes nothing
back: the run log (code, output), the lab pass, its XP and a solve are written only while the account still exists
with the `token_version` the request was authenticated with (`worker/src/lab/execute.ts` `recordRun`,
`worker/src/lab/handlers.ts`, `worker/src/challenges/submit.ts`). The caller still gets the result, with
`xpAwarded`/`awarded` 0. A sign-out on another device during the run also changes `token_version`, so that one run is
not recorded either (running it again records it).

## XP authority

What the Worker decides, what it only bounds, and what it still takes from the browser:

| | What | How |
|---|---|---|
| **Server-authoritative** | Lesson lab exercises (`lab` sections): the pass (`lab_progress`) and its 15 XP (`xp_ledger`, source `lab`, once per user and exercise) | Written only after the Worker graded the run itself (`POST /api/lab/run` with a lesson ref, `worker/src/lab/handlers.ts`). A pass graded in the browser earns a signed-in learner no XP (it is shown as unverified until the server grades it). |
| **Server-bounded** | The synced study state (`PUT /api/state`, `sanitizeStudyState` in `worker/src/state.ts`) | Catalog lesson keys only; `done` is `true` (legacy) or a positive time, clamped to now + 1 day; `visited` between 2020-01-01 and now + 1 day; `quiz` in [0, 1]; `bonus` at most the lesson's `maxBonus` (its exercises with tests × 15 + quizzes × 10, in the generated catalog), plus 15 for each of the learner's lab passes recorded before the ledger existed (see below). |
| **Still client-trusted** | Lesson completion (50 XP per `done`), the in-lesson exercise and quiz bonus up to that cap, and course certificates (issued once every lesson of the course is `done`) | The browser grades in-lesson exercises and quizzes and marks lessons done. |

Why lesson XP is not graded on the server yet: quiz answers and in-lesson exercise tests ship in the public static
bundle, so a server that "grades" them adds no real authority until that content moves to the Worker (a separate
feature, like the private challenge hints). Requirement 1.1 names the lesson lab exercises (`worker/src/lab/`), and
those are server-authoritative.

**Lab passes from before the XP ledger.** The previous client added 15 XP to the lesson `bonus` for every lab pass,
including the ones the Worker graded (`lab_progress`). Those passes never get a ledger row (the ledger skips refs
already in `lab_progress`), so `PUT /api/state` allows that XP to stay in `bonus`: per lesson, 15 for each of the
learner's `lab_progress` rows of that lesson's catalog labs without an `xp_ledger` row (one query per PUT). The ledger
is not backfilled, which would count the same XP twice.

**One exercise, counted once, on the site.** A lab passed in the browser by a guest (or by the previous client) put
its 15 XP into the lesson bonus. When the Worker later awards the same exercise (a server-graded pass, or
`GET /api/lab/progress` reporting it with `xp`), `lib/lab-progress.ts` takes that local award back out of the bonus
once, and `lib/sync.ts` keeps it out of the next pull + merge until the reduced document is pushed. Residual case: a
copy of a local award held by another device (made there, or synced there before the removal) can come back through
that device's next push; the server never stores more than `maxBonus` (plus pre-ledger lab passes) for a lesson, so
that double count is bounded by the lesson's `maxBonus`.

**Known gap: certificates trust `done`.** `GET /api/certificates/:track` issues a publicly verifiable certificate once
every lesson of the course is `done` in the synced study state, which the browser writes; one `PUT /api/state` can
mark them all done. Requiring server-verified lab passes now would block every certificate, because the code runner
is not deployed in production yet.

**Recommended follow-up.** Server-graded quizzes with private answer keys (kept on the Worker, like the hint texts),
so quiz XP and lesson completion can move to the ledger; and certificates that also require a server-verified pass
(`lab_progress`) of every lab of the course once the runner is deployed in production.

**Renaming or moving a lesson drops its server copy.** `PUT /api/state` keeps only keys of the generated catalog
(`worker/src/generated/catalog.ts`). A renamed or moved lesson (a new `track/lesson` key) therefore loses its server
copy (`done`, `bonus`, `visited`) at each learner's next sync, and a device that still has it locally keeps it only
there (it pushes it under the old key, which is dropped again); removing an exercise or a quiz lowers `maxBonus` and
clamps the stored bonus. There is no alias mechanism yet, so treat lesson ids as permanent; if one must move, first
add an alias (old key -> new key, mapped by `sanitizeStudyState`). The generated catalog must match the content when
the Worker deploys: `ci.yml` runs `npm run check:catalog`, `deploy.yml` does not, so deploy only commits that passed CI.

## Tests

| Command | Needs | Covers |
|---|---|---|
| `npm run typecheck` | — | site, Worker and runner TypeScript |
| `npx eslint .` | — | lint |
| `npm run check:catalog` | — | `worker/src/generated/catalog.ts` matches the lesson/challenge data (`npm run gen:catalog` to refresh) |
| `npm run test:unit` | host toolchains (optional) | contracts, output matching, curricula, canonical names, lessons; every lab and challenge reference solution is run against its tests on the host toolchains that exist (missing ones are skipped) |
| `npm run test:worker` | `cd worker && npm ci` | every Worker endpoint on a D1 shim over `node:sqlite` with a stubbed runner: quotas, refunds, grading, flags, first blood, leaderboard, abuse, audit, certificates, account deletion, the OAuth login nonce, the auth guard on every protected route (revoked tokens, deleted accounts, suspensions, roles), logout and `tv` issuance (a deleted, re-created account refuses the old tokens), role/plan never client-writable, the role CLI |
| `npm run test:runner` | Docker + `runner/image/build.sh slim` | the sandbox against a real Docker daemon: per-language Hello World, stdout/stderr, timeouts, memory, fork bombs, output floods, no network, no persistence, read-only root, uid, HMAC/replay |
| `npm run test:e2e` | Docker, a runner image, `worker/node_modules`, Chromium | the real stack (runner + `wrangler dev` with local D1 and the real migrations + the exported site + Playwright): Hello World in Python/JS/Java/C/C++ through the UI, stdout vs stderr, infinite loop killed, network blocked, quota exhaustion message and refunds, lesson → "Try in Code Lab" → starter code → pass → XP, challenge solve → points |
| `npm run test:e2e:ui` | Chromium; `PYODIDE_DIR` (a local `pyodide@0.26.4`) for the Python specs | the site's UI against a mocked Worker: Code Lab (editor, every error state, history, share, permalinks, in-browser JS/Python runners, layout; the Pyodide specs are skipped without `PYODIDE_DIR` and always run in CI, which installs it), Challenges (a fixture export: list, filters, detail, submit, hints, leaderboard), course pages, certificate verification and the printable certificate (print media, EN/AR), the instructor dashboard, the sign-in callback (login nonce) and sign-out (server revocation, a revoked token signs the tab out); English and Arabic (RTL), 360-1280 px widths, axe-core, no hydration errors |

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

## Legacy identifiers

The platform was called SkillForge before it became IMBEGNAL. Everything a learner reads says IMBEGNAL, but a few
identifiers that were already deployed, or that live in learners' browsers, keep the old name **on purpose**. Do not
rename them in a normal change: each rename below either signs people out, loses progress that exists only on their
device, or makes a deploy talk to a different Worker or database. New identifiers use `imbegnal` / `imb-` / `imb_`
(as `imb-theme`, `imb-study-v1`, `imb_login_nonce` and `imb_google_state` already do).

| Identifier | Used in | Why it stays | How to migrate safely later |
|---|---|---|---|
| Worker name `skillforge-api` | `worker/wrangler.toml:1`, `worker/package.json:2` (kept equal to the Worker it deploys), this guide (dashboard paths) | `wrangler deploy` with another `name` creates a **second, empty Worker**: no secrets (`JWT_SECRET`, `GITHUB_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `RUNNER_*`), none of the dashboard-only variables, and a different URL. The old Worker keeps serving every site build that points at it. | Create the new Worker beside the old one: set its secrets and dashboard variables first (`npx wrangler secret put NAME --name imbegnal-api --config wrangler.toml` in `worker/`, answer *yes* when wrangler offers to create it), keep the same `[[d1_databases]]` block so both use one database, give it a custom domain (Workers & Pages → the Worker → Settings → Domains & Routes → Add → Custom domain, e.g. `api.imbegnal.com`), then switch `WORKER_URL` as in the next row. Delete the old Worker only after no published site build calls it. |
| API URL `https://skillforge-api.skillforge.workers.dev` (`skillforge` is the account's workers.dev subdomain) | `worker/wrangler.toml:17` (`WORKER_URL`), `lib/site.ts:11` (production fallback for `NEXT_PUBLIC_API_URL`), GitHub secret `WORKER_URL`, the GitHub OAuth App callback `<WORKER_URL>/api/auth/callback` and the Google client's redirect URI `<WORKER_URL>/api/auth/google/callback`; tests: `tests/unit/site-csp.test.ts:8,15,21`, `tests/e2e/phase3/harness.ts:9,21` | It is baked into every built page (API calls and the CSP `connect-src`), and it is the OAuth redirect URI GitHub and Google check on every sign-in. Changing the workers.dev subdomain also renames every other Worker on the account. | Add a custom domain to the Worker (row above) and register the new callback in the GitHub OAuth App and the Google client **before** switching. Then, in one change: `WORKER_URL` in `wrangler.toml`, the GitHub secret `WORKER_URL`, the fallback in `lib/site.ts` and its tests. Keep the workers.dev route enabled until old cached pages are gone. |
| D1 database `skillforge-db` (binding `DB`, `database_id` in `worker/wrangler.toml:8-12`) | `worker/wrangler.toml:10`, `.github/workflows/deploy.yml:132`, `worker/scripts/d1-reconcile.mjs:78`, `worker/scripts/grant-role.mjs:25` (`DATABASE` of the role CLI, asserted in `worker/tests/grant-role.test.ts:113,115`), `tests/e2e/run.mjs:154` (local throw-away copy, must match `wrangler.toml`), operator commands in this guide and `worker/README-lab.md` | Wrangler and the deploy workflow find the production database by this name; the database in Cloudflare is called `skillforge-db` and holds every account, progress record, run and certificate. A renamed config entry that no longer matches the real database can send migrations to a different (or a new, empty) database. The binding name `DB` is what the code reads (`env.DB`) and is brand-neutral. | Export and import in a short write freeze: `npx wrangler d1 export skillforge-db --remote --output backup.sql --config wrangler.toml`, `npx wrangler d1 create imbegnal-db`, `npx wrangler d1 execute imbegnal-db --remote --file backup.sql --config wrangler.toml` (after adding it to `wrangler.toml`), check that `d1_migrations` came across (otherwise migrations re-run), then switch `database_name` / `database_id` and every command above in one change. Keep the old database untouched for rollback. |
| `localStorage` `sf_token` | `lib/auth.ts:12`; e2e helpers under `tests/e2e/**`, `tests/unit/sync-signout.test.ts`, `tests/unit/xp-authority.test.ts` | The signed-in session (JWT). Renaming it signs every learner out. | Read-old-write-new shim: read the new key, fall back to `sf_token`, write the value back under the new key and remove the old one. Keep the fallback for at least the token lifetime (30 days, `TOKEN_TTL` in `worker/src/util.ts`). Update those tests in the same change. |
| `localStorage` `sf-lang` | `lib/lang-context.tsx:6`, the pre-paint script in `lib/theme.ts:14`; e2e helpers | The learner's language choice. Renaming it resets Arabic readers to English and brings back a flash of the wrong direction before the language loads. | Same shim in `lib/lang-context.tsx` **and** in the pre-paint script (it must read both keys), kept for a few months. |
| `localStorage` `sf-lesson:<roadmapId>:<nodeId>` | `lib/lesson-progress.ts:7` (writes per-section exercise and quiz progress), `lib/study-store.ts:62` (imports old completions) | For guests this is the only copy of which exercises and quizzes they passed. Renaming it loses that progress. | Shim in `lib/lesson-progress.ts`: on read, copy an old key to the new one before using it; keep the `study-store` import reading both prefixes. |
| Cookie `sf_oauth_state` | `worker/src/index.ts:103,115-116`; tests `worker/tests/auth-nonce.test.ts:47`, `auth-logout.test.ts:137`, `owner-admin.test.ts:87`, `recreate-revocation.test.ts:133` | Holds the GitHub OAuth `state` and the login nonce for 10 minutes. A rename fails every GitHub sign-in that is in flight during the deploy. | On the callback, accept the new name and fall back to the old one; set only the new name. Remove the fallback one release later (the cookie lives 10 minutes). |
| GitHub / Cloudflare resources | GitHub repository `MshariSQ/imbegnal` and the site's Workers Builds project `imbegnal` already use the new name; the GitHub OAuth App and the Google OAuth client may still be *labelled* SkillForge | Labels only; the client IDs and secrets are what matter. | Rename the OAuth apps' display names in GitHub (Settings → Developer settings → OAuth Apps) and Google Cloud Console (Google Auth Platform → Branding, formerly the OAuth consent screen) at any time; IDs and secrets do not change. |

## Product recommendations

**Engagement**
- Weekly email/Telegram digest with streak status and the next lesson (needs the
  email already collected at signup).
- Spaced-repetition review: resurface questions the learner missed, 1/3/7 days later.
- Certificates of completion per course have a verification code (`/api/certificates/*`), a plain PDF from the
  Worker and a designed, printable certificate on the site (`/certificate/?code=...&print=1`, English or Arabic,
  saved as PDF from the browser's print dialog, so Arabic names print correctly); make them a Pro perk.
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

**Growth**: lesson pages carry `LearningResource` JSON-LD and a sitemap, so every
lesson can rank in English and Arabic; Arabic tech content is
under-served. Add an OG image per course and submit the sitemap to Search Console.

## Known gaps / next steps
- Stripe billing, email verification and password reset (email auth currently has
  no verification — fine for progress sync, add before paid features).
- Login CSRF, residual window while production runs the previous Worker (frontend-only mode): that Worker
  cannot echo the login nonce, so when the API is positively identified as the old one (`GET /api/state`
  answers 404, `getApiLevel()` in `lib/capabilities.ts`) the callback page accepts a fragment **without** a
  nonce, but only in a tab that has just started a sign-in itself (it holds a stored nonce under 10 minutes
  old, which the check consumes). A crafted `/auth/callback/#token=<attacker JWT>` link opened in a fresh tab
  is refused. What remains: a victim who has clicked "Continue with GitHub/Google" and, within those 10
  minutes and in that same tab, follows such a link instead of completing their own sign-in. Trade-off: under
  the old Worker a sign-in that returns in a different tab or browser (for example a mobile hand-off through
  the GitHub app) is refused, exactly as under the new Worker. A fragment that carries a nonce is always
  checked, and when the API is the new one or its generation cannot be determined, a missing nonce is
  refused. The window closes as soon as the new Worker is deployed; no site change is needed then.
- Sessions are revoked per account: signing out ends every session of the account, and a token otherwise stays valid until
  it expires (30 days) unless the account signs out or is deleted, or an operator bumps `token_version`.
- Rate limiting is per-isolate (per IP: 60 requests/min, 10/min on `/api/auth/*`; override with the
  `RATE_LIMIT_PER_MIN` / `RATE_LIMIT_AUTH_PER_MIN` variables); move to a Durable Object or Cloudflare Rate
  Limiting rules before large launches.
- Lessons are TypeScript objects; at 100+ lessons consider MDX/JSON content with
  a lint step that enforces English/Arabic parity.
- Runner: one VM is a single point of failure for server runs (the browser fallback covers JS/Python); add a
  second VM behind the tunnel (Cloudflare load-balances connectors) before large launches. gVisor is recommended there.
- Swift needs a checksum-pinned toolchain download (`SWIFT_SHA256`); it is reported unavailable until then.
- Code Lab's Web (HTML/CSS/JS) preview stops runaway code two ways: a watchdog in the parent page (works where the
  browser runs the sandboxed frame in its own process, desktop Chrome and Edge) and time-checked loop guards inserted
  into the page's inline scripts before they run (`lib/codelab/loop-guard.ts`, acorn loaded only for Web runs), which
  throw inside the frame once a loop keeps the page busy for longer than the Web limit (5 s), so `while(true){}` no
  longer freezes the tab in Firefox or Safari. Still not covered there: recursion without loops (the browser's stack
  limit ends it), code built from strings (`eval`, `new Function`, inline `on*=` attributes), and scripts acorn cannot
  parse (left unchanged, the browser reports the syntax error).
