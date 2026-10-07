# Code Lab, Challenges and the canonical curriculum

This document is the **binding spec** for the Code Lab / Challenges feature set. It is written
for the engineers (and agents) building the pieces in parallel; `docs/PLATFORM.md` carries the
operator-facing summary once the work lands.

## 1. What we are building

| Surface | Path | Purpose |
|---|---|---|
| Code Lab | `/code-lab/` | Editor + run button + stdin + stdout/stderr, 14 languages, history, read-only share links |
| Snippet permalink | `/code-lab/s/?id=<id>` | Read-only view of a shared snippet, "Open in Code Lab" forks it |
| Challenges | `/challenges/` | CTF list: filter by track (roadmap), difficulty, status; points, est. time, solves, first blood |
| Challenge | `/challenges/<id>/` | Statement, files, hints, submit (flag / code), Open in Code Lab |
| Leaderboard | `/challenges/leaderboard/` | All-time / weekly, per track |
| Course page | `/learn/<track>/` | Curriculum: objectives, prerequisites, hours, modules → lessons → lab exercises, recommended challenges, certificate |
| Instructor | `/instructor/` | Analytics (role: instructor/admin only) |

### Architecture

```
Browser (static Next.js export; GitHub Pages / Workers assets)
  │  HTTPS, Bearer JWT
  ▼
Cloudflare Worker (worker/)  ── D1 (runs, snippets, challenge progress, audit log, quotas)
  │  quota reserve → HMAC-signed HTTPS (RUNNER_URL) → refund on infrastructure failure
  ▼
Runner service (runner/)  on a Docker host (VM, Fly machine, bare metal…)
  │  one throw-away container per run: no network, read-only rootfs, tmpfs work dir,
  │  non-root, all capabilities dropped, memory/CPU/pids/ulimit/time/output caps
  ▼
Toolchain image (runner/Dockerfile: full | slim profile)
```

The browser can also run **JavaScript, Python and HTML/CSS locally** (no server) as an offline
fallback when the runner is unreachable or the visitor is signed out; the 14-language server
runner requires sign-in (cost control + abuse protection).

### Canonical data (single source of truth)

* `data/roadmaps.ts` → `roadmaps[]` is THE taxonomy. A *course* is a roadmap track
  (`lib/catalog.ts`). `track` everywhere (lessons, challenges, Code Lab filters, analytics,
  certificates) is a roadmap `id`; titles are looked up from `roadmaps[]` at render time and are
  never copied into other data files, so renaming a roadmap renames it site-wide.
* `data/curricula.ts` → per-track curriculum metadata (objectives, prerequisites, hours, order,
  assessment, badges). Keyed by roadmap id; a unit test fails if a roadmap has no entry.
* `data/lessons/**` → lessons; the `lab` section type is a graded multi-language exercise.
* `data/challenges/**` (public) + `worker/src/graders/data/**` (server-only) → challenges.
* `worker/src/generated/catalog.ts` is **generated** (`npm run gen:catalog`) from the above for
  the Worker (lesson order, lab tests). `npm run check:catalog` fails when stale.

## 2. Shared contracts (`shared/`)

| File | Contents |
|---|---|
| `languages.ts` | `LANGUAGES`, `LangId`, Hello World templates, aliases |
| `protocol.ts` | Worker ⇄ runner protocol: `RunRequest`, `RunResult`, statuses, limits, HMAC header names |
| `api.ts` | Public Worker API types (run, quota, runs, snippets, challenges, leaderboard, analytics, audit) |
| `challenges.ts` | `ChallengeMeta` (public) and `ChallengeGrader` (server-only) |
| `catalog.ts` | Generated catalog shape |
| `links.ts` | URL builders/parsers (`codeLabHref`, `parseCodeLabQuery`, …): use these for every link |

Lesson-side contract: `LabExerciseSection` in `data/lessons/types.ts`
(`ref = track/lesson/exerciseId`). Client progress: `lib/lab-progress.ts`.

## 3. Worker API (all JSON, Bearer JWT unless noted)

| Method & path | Auth | Notes |
|---|---|---|
| `GET /api/lab/languages` | none | runner availability per language (cached ~30 s) |
| `POST /api/lab/run` | user | `RunApiRequest` → `RunApiResponse`. Reserves quota, runs, logs, refunds on `internal_error`/runner down. With `ref` lesson/challenge also returns `grade` |
| `GET /api/lab/quota` | user | `QuotaInfo` |
| `GET /api/lab/runs?limit=&before=` | user | own history, newest first |
| `GET /api/lab/runs/:id` | user | own run incl. code/stdout/stderr |
| `POST /api/lab/snippets` | user | create immutable snippet → `{id, path}` |
| `GET /api/lab/snippets/:id` | none | public read-only snippet |
| `GET /api/lab/progress` | user | passed lab refs |
| `GET /api/challenges` | optional | per-challenge stats (solves, first blood, median solve time) + caller's progress |
| `POST /api/challenges/:id/open` | user | stamps first-open time (time-to-solve) |
| `POST /api/challenges/:id/hint` | user | `{index}` reveals a hint, costs points once |
| `POST /api/challenges/:id/submit` | user | `SubmitRequest` → `SubmitResponse` |
| `GET /api/leaderboard?track=&period=` | optional | `LeaderboardResponse` |
| `GET /api/certificates/:track` | user | PDF certificate when the track is complete (skeleton) |
| `GET /api/certificates/verify/:code` | none | `CertificateVerifyResponse` |
| `GET /api/instructor/analytics?days=` | instructor/admin | `InstructorAnalytics` |
| `GET /api/admin/audit?limit=` | admin | `AuditEntry[]` |

Status/error codes are listed at the top of `shared/api.ts`.

### Quotas (Free vs Plus)

The paid plan on the pricing page is **Pro** (`users.plan = 'pro'`); "Plus" in product copy means
that tier. Env vars (defaults): `RUN_DAILY_LIMIT_FREE=50`, `RUN_DAILY_LIMIT_PRO=500`,
`RUN_DAILY_LIMIT_GLOBAL=20000`, `RUN_PER_MINUTE_FREE=10`, `RUN_PER_MINUTE_PRO=30`,
`RUN_MAX_CONCURRENT=2`. Order of checks: account status → rate (per minute) → concurrency →
daily user quota → global cap. Quota is **reserved before** the run and **refunded** when the
outcome is `internal_error`, the runner is unreachable, or the request is rejected before
execution. User-caused outcomes (compile/runtime error, timeout, memory) consume quota.
A graded lesson run or challenge submission is one reservation; it starts no test after a 90 s
budget, and an unsettled reservation stops counting toward the concurrency cap after that budget
plus one runner call (about 175 s).

### Logging

Every run writes one `lab_runs` row: `user_id, ref_kind, track, lesson, exercise/challenge id,
language, run_ms, exit_code, status, stdout_bytes, success, created_at` (+ code/stdout/stderr
for the user's own history, size-capped). Never store environment, secrets or host paths.

## 4. Runner security model (must hold; tests prove it)

Untrusted code runs **only** inside a fresh container per run:

* `--network none`, `--read-only` rootfs, `--tmpfs /work` (noexec off only where the compiler
  needs it; size-capped), no volumes except a read-only source mount, nothing persists
* `--user 65534`, `--cap-drop ALL`, `--security-opt no-new-privileges`, default seccomp profile
  (no `--privileged`, never the Docker socket), optional `--runtime=runsc` (gVisor)
* `--pids-limit`, `--memory` = `--memory-swap`, `--cpus`, ulimits (nofile, nproc, fsize, core=0)
* wall-clock kill (`docker kill` + `rm -f`), compile and run limited separately
* stdout/stderr streamed with a keep-cap (64 KiB) and a kill-cap (1 MiB → `output_limit`)
* no shell interpolation of user data anywhere: file names are fixed; Java class name is
  validated against `^[A-Za-z_][A-Za-z0-9_]*$`
* the service itself: HMAC-authenticated, timestamp window, replay-protected `jobId`, binds to
  loopback, bounded concurrency + queue, orphan-container reaper, never exposes env/paths in
  errors, runs as an unprivileged user that can reach Docker (operators: rootless Docker or a
  dedicated VM recommended; see deployment notes)

**Residual risks** (accepted, documented):

* Hidden-test inputs can in principle be inferred from the per-test pass/fail, exit codes and
  timings of one's own submissions. This is inherent to output judging; it is slowed down by the
  per-minute limits, daily quotas and the bruteforce-style abuse signals, not prevented.
* Runs share the host kernel: a kernel or container-runtime exploit from inside a job is out of
  scope of the container hardening (gVisor and rootless Docker narrow it; see
  [runner/README.md, Honest limitations](../runner/README.md#honest-limitations)).
* Author-written `regex`-mode expected patterns run against up to 64 KiB of learner output in the
  Worker; `tests/unit/regex-patterns.test.ts` checks every one compiles, has no nested unbounded
  quantifiers and stays fast on adversarial input.

## 5. Conventions for contributors

* **Ports** (local dev/E2E): site `4173`, Worker (`wrangler dev`) `8787`, runner `4242`.
* **Tests**: `npm run test:unit` (pure logic), `test:worker` (handlers on a D1 shim),
  `test:runner` (needs Docker + the slim image), `test:e2e` (full stack, Playwright).
* **i18n**: add keys only to your dictionary (`lib/i18n-codelab.ts`, `lib/i18n-ctf.ts`,
  `lib/i18n-curriculum.ts`); Arabic is type-checked against English. Code is always LTR
  (`dir="ltr"`), everything else uses logical properties (`ms-`, `me-`, `ps-`, `start-`).
* **UI**: reuse tokens/classes (`card`, `bg-surface`, `text-fg-*`, `border-line`, `PageHeader`,
  `lucide-react`); hydration-safe stores (`useSyncExternalStore` with a server snapshot);
  never read `localStorage`/`Date` during render.
* **Never** put a flag, hidden test or reference solution in `data/**`, `shared/**` or the site
  bundle. Graders are Worker-only.
