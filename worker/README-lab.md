# Code Lab: operator notes (Worker)

Everything here concerns the Worker side of Code Lab (`worker/src/lab/**`, `abuse.ts`, `audit.ts`, `roles.ts`).
The spec is `docs/CODE_LAB.md`; the wire types are `shared/api.ts` and `shared/protocol.ts`.

## Endpoints

| Method and path | Auth | Purpose |
| --- | --- | --- |
| `GET /api/lab/languages` | public | Languages the runner can execute right now (`runner`: `up`, `down` or `unconfigured`). Cached 30 s per isolate (10 s when down). |
| `POST /api/lab/run` | user | Run code (free run) or grade a lesson lab exercise (`ref.kind = "lesson"`, one quota unit for the whole graded submission). |
| `GET /api/lab/quota` | user | Used / limit / remaining for today and the next reset (00:00 UTC). |
| `GET /api/lab/runs`, `GET /api/lab/runs/:id` | user | Own history only (cursor pagination with `?before=`); other users' ids answer 404. |
| `GET /api/lab/progress` | user | Lab exercises the user passed. |
| `POST /api/lab/snippets`, `GET /api/lab/snippets/:id` | user / public | Immutable shareable snippets (200 per user, 20 per hour). |

Challenge submissions are not handled here (`POST /api/challenges/:id/submit`); `ref.kind = "challenge"` on `/run` is a 400.

## Environment variables

All optional strings. Set them in the Cloudflare dashboard (Workers, Settings, Variables), not in `wrangler.toml [vars]`,
because every deploy overwrites `[vars]` and would silently undo a dashboard edit. Invalid or non-positive values fall back to the default.

| Variable | Default | Meaning |
| --- | --- | --- |
| `RUNNER_URL` | none | Base URL of the runner service (`https://` only; plain `http://` is accepted for loopback hosts). Unset means every run is `503 runner_unavailable` and the languages route reports `unconfigured`. |
| `RUNNER_SECRET` | none | HMAC-SHA256 secret shared with the runner. **Secret**, never a plain variable. |
| `RUN_DAILY_LIMIT_FREE` | 50 | Runs per free user per UTC day. |
| `RUN_DAILY_LIMIT_PRO` | 500 | Runs per pro user per UTC day. |
| `RUN_DAILY_LIMIT_GLOBAL` | 20000 | All users combined per UTC day: the cost kill switch. |
| `RUN_PER_MINUTE_FREE` | 10 | Burst limit per free user (rolling 60 s). |
| `RUN_PER_MINUTE_PRO` | 30 | Burst limit per pro user. |
| `RUN_MAX_CONCURRENT` | 2 | Simultaneous runs per user. A reservation stuck in `running` stops counting after 60 s. |
| `ABUSE_WINDOW_MIN` | 10 | Sliding window for abuse signals, in minutes. |
| `ABUSE_SUSPEND_HOURS` | 24 | Length of an automatic suspension. |
| `ABUSE_RESOURCE_MAX` | 8 | Timeout / memory / output-limit runs inside the window before suspension. |
| `ABUSE_NETWORK_PROBE_MAX` | 5 | Runs whose code looks like a network probe. |
| `ABUSE_FLOOD_MAX` | 25 | Per-minute rate-limit hits. |
| `ABUSE_BRUTEFORCE_MAX` | 30 | Wrong challenge flags (used by the challenge endpoints). |
| `ABUSE_VOLUME_MAX` | 5 | Reserved for volume heuristics. |

Quota tuning example: raise the free allowance without a deploy by setting `RUN_DAILY_LIMIT_FREE=100`; lower
`RUN_DAILY_LIMIT_GLOBAL` to throttle the whole feature if the runner is overloaded. Changes apply to the next request.

## Runner URL and secret

```sh
cd worker
npx wrangler secret put RUNNER_SECRET     # paste the same value the runner is started with (RUNNER_SECRET)
npx wrangler secret put RUNNER_URL        # e.g. https://runner.example.com  (a secret works too; the Worker only reads env.RUNNER_URL)
```

Every request to the runner is signed: `x-imb-signature = hex(HMAC-SHA256(secret, "<x-imb-timestamp>.<raw body>"))`
with the timestamp in milliseconds (see `shared/protocol.ts`). The runner rejects stale timestamps, so keep both clocks on NTP.
Rotating the secret: update the runner first, then the Worker; runs fail as `runner_unavailable` (and are refunded) in between.

## Database

Migration `migrations/0004_code_lab.sql` adds `users.role/status/suspended_until` and the tables `lab_runs`, `lab_usage`,
`lab_snippets`, `lab_progress`, `audit_log` and `abuse_signals`. Apply it like the earlier ones:

```sh
npx wrangler d1 migrations apply skillforge-db --remote
```

`lab_runs` keeps the learner's own copy of code, stdin and output (size-capped: 64 KiB code, 16 KiB each for stdin/stdout/stderr).
`labAccountDeleteStatements()` in `worker/src/lab/account-data.ts` lists what an account erasure must delete; it takes effect once `handleAccountDelete` (`worker/src/account.ts`, not owned by Code Lab) includes it in its batch. `audit_log` is kept on purpose.

## Roles

Roles are `student` (default), `instructor` and `admin`. They are granted by an operator with SQL, never through the API:

```sh
npx wrangler d1 execute skillforge-db --remote --command \
  "UPDATE users SET role = 'instructor' WHERE username = 'someone'"      # or 'admin'; 'student' demotes
npx wrangler d1 execute skillforge-db --remote --command \
  "INSERT INTO audit_log (user_id, action, detail) SELECT github_id, 'role.change', 'set to instructor by operator' FROM users WHERE username = 'someone'"
```

Accounts are identified by `users.github_id` for every provider (`"<num>"` GitHub, `"email:<uuid>"`, `"google:<sub>"`).
Admins are never auto-suspended.

## Suspensions

Abuse signals (`abuse_signals`) are advisory: timeouts and memory/output hits, code that looks like a network probe, and
rate-limit floods. The sandbox is the real security boundary; the signals only catch people probing it. Reaching a threshold
suspends the account for `ABUSE_SUSPEND_HOURS` and writes an `abuse.auto_suspend` audit row. A suspended user gets
`403 account_suspended` from every lab and challenge endpoint. Expired suspensions are lifted lazily on the user's next request
(`abuse.suspension_expired` audit row).

Lift one early:

```sh
npx wrangler d1 execute skillforge-db --remote --command \
  "UPDATE users SET status = 'active', suspended_until = NULL WHERE username = 'someone'"
npx wrangler d1 execute skillforge-db --remote --command \
  "DELETE FROM abuse_signals WHERE user_id = (SELECT github_id FROM users WHERE username = 'someone')"
```

Suspend manually (indefinitely: leave `suspended_until` NULL):

```sh
npx wrangler d1 execute skillforge-db --remote --command \
  "UPDATE users SET status = 'suspended', suspended_until = datetime('now', '+7 days') WHERE username = 'someone'"
```

## Reading the audit log and the run log

```sh
npx wrangler d1 execute skillforge-db --remote --command \
  "SELECT at, user_id, action, detail FROM audit_log ORDER BY id DESC LIMIT 50"
npx wrangler d1 execute skillforge-db --remote --command \
  "SELECT kind, COUNT(*) n FROM abuse_signals WHERE at >= datetime('now','-1 day') GROUP BY kind"
npx wrangler d1 execute skillforge-db --remote --command \
  "SELECT status, COUNT(*) n, ROUND(AVG(run_ms)) avg_ms FROM lab_runs WHERE created_at >= datetime('now','-1 day') GROUP BY status"
npx wrangler d1 execute skillforge-db --remote --command \
  "SELECT first_error, COUNT(*) n FROM lab_runs WHERE success = 0 AND first_error IS NOT NULL GROUP BY first_error ORDER BY n DESC LIMIT 20"
```

Today's global usage: `SELECT count FROM lab_usage WHERE user_id = '_global' AND day = date('now')`.

## Behaviour worth knowing

- Check order on every run: account status (403) then per-minute rate (429 `rate_limited`) then concurrency
  (429 `quota_exceeded`, scope `concurrency`) then the user's daily quota (scope `user`) then the global cap (scope `global`).
- Runs refunded to the learner: runner outage (`503 runner_unavailable`), runner `internal_error`, `unsupported`, and requests
  rejected after reservation. Compile errors, runtime errors and timeouts keep the charge.
- A runner outage never reads as a wrong answer: a graded submission that hits one is a refunded 503 and nothing is recorded as failed.
- Responses carry `Cache-Control: no-store` except public snippets (`max-age=300`) and the languages route (`max-age=10`).
- The Worker never logs user code, stdin or secrets; server logs only carry error messages.

## Tests

```sh
npm run test:worker      # node:test + tsx; D1 is a shim over node:sqlite with the real migrations applied
npx tsc --noEmit -p worker
```
