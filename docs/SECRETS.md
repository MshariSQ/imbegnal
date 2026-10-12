# Secrets and environment variables

Every secret and variable the platform reads, where it is read, where it is set, and whether it is required.
Audited against `worker/wrangler.toml`, `worker/src/**` (the `Env` interface in `worker/src/util.ts:4-38` and every
`env.X` use), `.github/workflows/*.yml`, the site (`process.env.*`, `next.config.ts`), the runner (`runner/src/config.ts`,
`runner/deploy/*`) and the Cloudflare Workers Builds settings in [`PLATFORM.md`](PLATFORM.md#deploying).

**No values here, ever.** Secrets go straight from where they are created into the GitHub or Cloudflare form (or a
`wrangler secret put` prompt); never into chat, an issue, a commit or a `wrangler.toml`.

Status: **Required** (the feature or the deploy does not work without it), **Optional, default X** (a code default applies
when it is unset or empty), **Missing** (required and known to be unset).

## First deploy order

1. **GitHub secrets** `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (both currently **Missing**: the last deploy run
   warned "Missing repository secret(s): CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID" and deployed the site only).
   Optional now or later: secret `WORKER_URL`, variable `GOOGLE_AUTH`.
2. **Worker secrets** on `skillforge-api`: `JWT_SECRET` and `GITHUB_CLIENT_SECRET` (required; production already has
   them, see [PLATFORM.md](PLATFORM.md#one-time-setup-no-credentials-are-ever-shared-in-chat-or-committed)), then the optional ones
   (`ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`, `RUNNER_URL` + `RUNNER_SECRET` once the runner VM is up).
3. **Deploy**: GitHub → repo → Actions → *Deploy (API + site)* → Run workflow (branch `main`), or open the last run and
   click *Re-run all jobs*. The *Deploy API* job must not show the "API not deployed" warning. It applies the pending D1
   migrations (up to `0007` XP ledger and `0008` `users.token_version`) before `wrangler deploy`, so the new Worker never
   runs on the old schema. Check: `GET <WORKER_URL>/api/state` answers 401 (the new API) instead of 404 (the old one).
4. **Make yourself admin**: sign in once on the site with GitHub (that creates your account), then, from `worker/` on a
   machine where `npx wrangler login` works, run the role CLI `node scripts/grant-role.mjs --remote --github-id <your numeric
   GitHub id> --role admin` (a dry run that prints the account and the SQL), then the same command with `--yes`. It needs no
   secret of its own; details in [PLATFORM.md](PLATFORM.md#owner-provisioning-roles).

## GitHub Actions (`.github/workflows/deploy.yml`)

Click path for all of them: GitHub → repo → **Settings → Secrets and variables → Actions** → *Secrets* tab → **New repository
secret** (or the *Variables* tab → **New repository variable** for `GOOGLE_AUTH`). `ci.yml` uses no secrets or variables.

| Name | Used by (file:line) | Where it is set | Status | How the owner sets it |
|---|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `.github/workflows/deploy.yml:90` (credential check), `:122` (`worker/scripts/d1-reconcile.mjs --remote`), `:129` (`wrangler d1 migrations apply`), `:137` (`wrangler deploy`) | GitHub Actions secret | **Missing** | Create it first: dash.cloudflare.com → My Profile → **API Tokens** → Create Token → **Custom token** → Get started. Permissions: **Account › Workers Scripts › Edit** (`wrangler deploy`) and **Account › D1 › Edit** (reconcile + migrations). Account Resources: Include → your account only. **No Zone permissions** (no routes are deployed). Create Token, copy it once into the GitHub secret. Account-level read permissions (Account Settings, User Memberships) are **not** needed because `CLOUDFLARE_ACCOUNT_ID` is set: wrangler only lists `/memberships` to find the account when that variable is missing (`getAccountChoices` in wrangler 3.114). |
| `CLOUDFLARE_ACCOUNT_ID` | `.github/workflows/deploy.yml:91`, `:123`, `:130`, `:138` | GitHub Actions secret | **Missing** | Cloudflare dashboard → Workers & Pages → **Account ID** in the right sidebar → copy (or `npx wrangler whoami`). Then New repository secret `CLOUDFLARE_ACCOUNT_ID`. |
| `WORKER_URL` | `.github/workflows/deploy.yml:45` → `NEXT_PUBLIC_API_URL` of the site build | GitHub Actions secret | Optional, default the live Worker (`lib/site.ts:11`; an empty value counts as unset) | New repository secret `WORKER_URL` = the Worker's public origin, no trailing slash. Must equal the Worker variable `WORKER_URL` (`worker/wrangler.toml:17`), or the site talks to another API. |
| `GH_CLIENT_ID` | `.github/workflows/deploy.yml:46` → `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub Actions secret | Optional, **unused**: no site code reads `NEXT_PUBLIC_GITHUB_CLIENT_ID` (GitHub sign-in starts on the Worker, which uses its own `GITHUB_CLIENT_ID`) | Nothing to do. Safe to leave unset or delete. |
| `GOOGLE_AUTH` | `.github/workflows/deploy.yml:48` → `NEXT_PUBLIC_GOOGLE_AUTH` (`app/login/page.tsx:13`) | GitHub Actions **variable** | Optional, default off (no Google button) | *Variables* tab → New repository variable `GOOGLE_AUTH` = `1`, only after the Worker has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. |

## Cloudflare Worker `skillforge-api` (the API)

Two ways to set a Worker secret or dashboard variable:

* Dashboard: Cloudflare → **Workers & Pages → `skillforge-api` → Settings → Variables and Secrets → Add** → Type **Secret**
  (or **Text** for a plain variable) → name and value → **Deploy**.
* CLI, from `worker/`: `npx wrangler secret put NAME --config wrangler.toml` (prompts for the value; needs `npx wrangler login`
  or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in the environment).

`keep_vars = true` (`worker/wrangler.toml:6`) keeps dashboard-only variables across deploys. The three `[vars]` in
`worker/wrangler.toml` are re-applied from the file on every deploy: edit them in the file, never in the dashboard, and
never add the tunables below to `[vars]` (a deploy would reset them).

| Name | Used by (file:line) | Where it is set | Status | How the owner sets it |
|---|---|---|---|---|
| `DB` (D1 binding, database `skillforge-db`) | `worker/wrangler.toml:8-12`; `env.DB` throughout `worker/src` | Worker binding in `wrangler.toml` | Required | Already configured. Do not rename (see [Legacy identifiers](PLATFORM.md#legacy-identifiers)). |
| `GITHUB_CLIENT_ID` | `worker/src/index.ts:91`, `:138` | Worker var in `wrangler.toml` (`worker/wrangler.toml:15`) | Required (public OAuth client id, not a secret) | Edit `worker/wrangler.toml` in a commit. It must belong to the same GitHub OAuth App as `GITHUB_CLIENT_SECRET`. |
| `FRONTEND_URL` | `worker/src/index.ts:123`, `worker/src/util.ts:242`, `worker/src/auth-google.ts:45`, `worker/src/certificates/handlers.ts:37` | Worker var in `wrangler.toml` (`worker/wrangler.toml:16`) | Required | Edit `worker/wrangler.toml` (`https://imbegnal.com`). OAuth sign-ins redirect here; certificate links use it. |
| `WORKER_URL` | `worker/src/index.ts:92`, `:141`, `worker/src/auth-google.ts:10` | Worker var in `wrangler.toml` (`worker/wrangler.toml:17`) | Required | Edit `worker/wrangler.toml`. OAuth redirect URIs are built from it, so the GitHub OAuth App callback must be `<WORKER_URL>/api/auth/callback` and the Google redirect URI `<WORKER_URL>/api/auth/google/callback`. |
| `JWT_SECRET` | `worker/src/util.ts:134` (sign), `worker/src/auth/guard.ts:86` (verify), `worker/src/certificates/handlers.ts:64` (certificate codes), `worker/src/auth-email.ts:58` (email account keys) | Cloudflare Worker secret | Required (present in production per PLATFORM.md) | Dashboard path above, Type Secret, or `npx wrangler secret put JWT_SECRET --config wrangler.toml`. Use a long random value (e.g. from `openssl rand -base64 48`, pasted straight into the prompt). Rotating it signs everyone out and changes the certificate codes derived from it; existing email accounts keep their keys (login finds them by email), but an email account deleted before the rotation comes back under a new key, without the counters deletion keeps. (Revoking one account's tokens needs no rotation: `POST /api/auth/logout` bumps `users.token_version`, which signs out every device of that account.) |
| `GITHUB_CLIENT_SECRET` | `worker/src/index.ts:139` | Cloudflare Worker secret | Required for GitHub sign-in (present in production per PLATFORM.md) | GitHub → Settings → Developer settings → OAuth Apps → the app → **Generate a new client secret**, then `npx wrangler secret put GITHUB_CLIENT_SECRET --config wrangler.toml`. |
| `GOOGLE_CLIENT_ID` | `worker/src/auth-google.ts:14`, `:19`, `:49`, `:61` | Cloudflare Worker secret | Optional; unset = Google sign-in answers `404 google_disabled` | Google Cloud Console → APIs & Services → Credentials → Create credentials → OAuth client ID → Web application, redirect URI `<WORKER_URL>/api/auth/google/callback`. Then `npx wrangler secret put GOOGLE_CLIENT_ID --config wrangler.toml`, and set the GitHub variable `GOOGLE_AUTH=1`. |
| `GOOGLE_CLIENT_SECRET` | `worker/src/auth-google.ts:49`, `:62` | Cloudflare Worker secret | Optional (required together with `GOOGLE_CLIENT_ID`) | Same OAuth client → client secret → `npx wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler.toml`. |
| `ANTHROPIC_API_KEY` | `worker/src/ai.ts:92`, `:116` | Cloudflare Worker secret | Optional; unset = the AI tutor answers `503 ai_disabled` | console.anthropic.com → API Keys → Create Key, then `npx wrangler secret put ANTHROPIC_API_KEY --config wrangler.toml`. Also set a monthly spend limit in the Anthropic Console. |
| `AI_MODEL` | `worker/src/ai.ts:112` | Worker dashboard variable (Text) | Optional, default `claude-opus-5-5` (`worker/src/ai.ts:14`) | Dashboard path above, Type Text. Cheaper: `claude-sonnet-5-5`, `claude-haiku-4-5`. |
| `AI_DAILY_LIMIT_FREE` | `worker/src/ai.ts:76` | Worker dashboard variable (Text) | Optional, default 20 questions per user per day | Dashboard, Type Text. |
| `AI_DAILY_LIMIT_PRO` | `worker/src/ai.ts:76` | Worker dashboard variable (Text) | Optional, default 200 | Dashboard, Type Text. |
| `AI_DAILY_LIMIT_GLOBAL` | `worker/src/ai.ts:77` | Worker dashboard variable (Text) | Optional, default 600 (all users per day, the spend kill switch) | Dashboard, Type Text. |
| `RATE_LIMIT_PER_MIN` | `worker/src/index.ts:25` | Worker dashboard variable (Text) | Optional, default 60 requests per IP per minute (per isolate) | Dashboard, Type Text. |
| `RATE_LIMIT_AUTH_PER_MIN` | `worker/src/index.ts:25` | Worker dashboard variable (Text) | Optional, default 10 on `/api/auth/*` | Dashboard, Type Text. |
| `RUNNER_URL` | `worker/src/lab/runner.ts:78` | Cloudflare Worker secret (a Text variable works too) | Optional; unset = server runs answer `503 runner_unavailable` (not charged), `/api/lab/languages` reports `unconfigured` | The runner's public `https://` origin (Cloudflare Tunnel, see [PLATFORM.md](PLATFORM.md#deploying-the-runner-once)). `npx wrangler secret put RUNNER_URL --config wrangler.toml`. |
| `RUNNER_SECRET` | `worker/src/lab/runner.ts:79` | Cloudflare Worker secret | Optional (required together with `RUNNER_URL`) | Read it on the runner VM (`sudo sed -n 's/^RUNNER_SECRET=//p' /etc/imbegnal-runner.env`) and paste it into `npx wrangler secret put RUNNER_SECRET --config wrangler.toml`. Must equal the runner's `RUNNER_SECRET`. Rotate the runner first, then the Worker. |
| `RUN_DAILY_LIMIT_FREE` | `worker/src/lab/config.ts:48` | Worker dashboard variable (Text) | Optional, default 50 runs per user per UTC day | Dashboard, Type Text. |
| `RUN_DAILY_LIMIT_PRO` | `worker/src/lab/config.ts:48` | Worker dashboard variable (Text) | Optional, default 500 | Dashboard, Type Text. |
| `RUN_DAILY_LIMIT_GLOBAL` | `worker/src/lab/config.ts:50` | Worker dashboard variable (Text) | Optional, default 20000 (all users, the cost kill switch) | Dashboard, Type Text. |
| `RUN_PER_MINUTE_FREE` | `worker/src/lab/config.ts:49` | Worker dashboard variable (Text) | Optional, default 10 | Dashboard, Type Text. |
| `RUN_PER_MINUTE_PRO` | `worker/src/lab/config.ts:49` | Worker dashboard variable (Text) | Optional, default 30 | Dashboard, Type Text. |
| `RUN_MAX_CONCURRENT` | `worker/src/lab/config.ts:51` | Worker dashboard variable (Text) | Optional, default 2 | Dashboard, Type Text. |
| `ABUSE_WINDOW_MIN` | `worker/src/abuse.ts:75` | Worker dashboard variable (Text) | Optional, default 10 minutes | Dashboard, Type Text. |
| `ABUSE_SUSPEND_HOURS` | `worker/src/abuse.ts:82` | Worker dashboard variable (Text) | Optional, default 24 | Dashboard, Type Text. |
| `ABUSE_RESOURCE_MAX` | `worker/src/abuse.ts:25` | Worker dashboard variable (Text) | Optional, default 8 | Dashboard, Type Text. |
| `ABUSE_NETWORK_PROBE_MAX` | `worker/src/abuse.ts:26` | Worker dashboard variable (Text) | Optional, default 5 | Dashboard, Type Text. |
| `ABUSE_FLOOD_MAX` | `worker/src/abuse.ts:27` | Worker dashboard variable (Text) | Optional, default 25 | Dashboard, Type Text. |
| `ABUSE_BRUTEFORCE_MAX` | `worker/src/abuse.ts:28` | Worker dashboard variable (Text) | Optional, default 30 | Dashboard, Type Text. |
| `ABUSE_VOLUME_MAX` | `worker/src/abuse.ts:29` | Worker dashboard variable (Text) | Optional, default 5 | Dashboard, Type Text. |

Every number above, the `AI_DAILY_LIMIT_*` ones included, must be a positive integer: an invalid, empty, zero or negative value falls back to the default (`positiveInt` in `worker/src/lab/config.ts:33`), so 0 cannot turn the AI tutor off; remove `ANTHROPIC_API_KEY` for that. Local development
reads the same names from `worker/.dev.vars` (git-ignored).

## Site build (`NEXT_PUBLIC_*`)

`NEXT_PUBLIC_*` values are baked into the static export at build time and are public: never put a secret in one.
`next.config.ts` reads no environment variables. The site is built twice on every merge, by `deploy.yml` (GitHub Pages)
and by Cloudflare Workers Builds (project `imbegnal`); a value has to be set for the build that serves `imbegnal.com`,
so set optional ones in both places.

| Name | Used by (file:line) | Where it is set | Status | How the owner sets it |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `lib/site.ts:10` | `deploy.yml:45` from GitHub Actions secret `WORKER_URL`; Cloudflare Workers Builds variable (optional) | Optional, default `https://skillforge-api.skillforge.workers.dev` in production builds, `http://localhost:8787` in `next dev` | GitHub: the `WORKER_URL` secret above. Workers Builds: see the next section. |
| `NEXT_PUBLIC_SITE_URL` | `lib/site.ts:2` (metadataBase, canonical links, og:url, sitemap, robots, JSON-LD) | Not set anywhere | Optional, default `https://imbegnal.com` | Leave unset for production. Only for a build that must advertise another origin. |
| `NEXT_PUBLIC_GOOGLE_AUTH` | `app/login/page.tsx:13` | `deploy.yml:48` from GitHub Actions variable `GOOGLE_AUTH`; Cloudflare Workers Builds variable | Optional, default off (`"1"` shows the Google button) | GitHub variable `GOOGLE_AUTH=1`, and the same `NEXT_PUBLIC_GOOGLE_AUTH=1` as a Workers Builds variable. |
| `NEXT_PUBLIC_BASE_PATH` | `app/about/page.tsx:6`, `app/profile/page.tsx:14`, `app/roadmaps/[slug]/RoadmapClient.tsx:126`, `components/layout/Footer.tsx:6`, `lib/auth.ts:75`, `lib/codelab/browser-runner.ts:221`, `lib/runner/python-client.ts:15` | `deploy.yml:50` (empty string, in the file) | Optional, default `""` | Leave empty: the site is served from the domain root and `next.config.ts` has no `basePath`. |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | none (set at `deploy.yml:46`, read nowhere) | `deploy.yml:46` from GitHub Actions secret `GH_CLIENT_ID` | Optional, unused | Nothing to do. |

## Cloudflare Workers Builds (the site, project `imbegnal`)

Settings that match the repo ([PLATFORM.md](PLATFORM.md#deploying)): root directory `/`, build command `npm run build`
(optional, `wrangler.jsonc` builds `./out` when it is missing), deploy command `npx wrangler deploy`, Node from
`.node-version` (22). Workers Builds deploys with a token Cloudflare manages for the build, so no `CLOUDFLARE_API_TOKEN`
is needed there, and the site needs no secrets at all.

| Name | Used by (file:line) | Where it is set | Status | How the owner sets it |
|---|---|---|---|---|
| `NEXT_PUBLIC_GOOGLE_AUTH` | `app/login/page.tsx:13` | Cloudflare Workers Builds variable | Optional, default off | Cloudflare → Workers & Pages → **`imbegnal` → Settings → Build → Variables and secrets** → Add → `NEXT_PUBLIC_GOOGLE_AUTH` = `1` → Save; the next build picks it up. |
| `NEXT_PUBLIC_API_URL` | `lib/site.ts:10` | Cloudflare Workers Builds variable | Optional, default the live Worker | Same path. Only when the API moves (see [Legacy identifiers](PLATFORM.md#legacy-identifiers)). |

## Runner VM (`runner/`)

Set in `/etc/imbegnal-runner.env` (systemd install; `runner/deploy/install.sh` writes it from `runner/deploy/.env.example`
with a generated `RUNNER_SECRET`, mode 0640) or `runner/deploy/.env` (docker compose; `chmod 600`). Edit with
`sudoedit /etc/imbegnal-runner.env`, then `sudo systemctl restart imbegnal-runner` (compose: `docker compose up -d runner`).
An invalid value stops the runner at start with a message naming the variable, never its value.

| Name | Used by (file:line) | Where it is set | Status | How the owner sets it |
|---|---|---|---|---|
| `RUNNER_SECRET` | `runner/src/config.ts:79` | Runner VM env file | Required, at least 32 characters | Generated by `install.sh` (`openssl rand -hex 32`). Copy it to the Worker secret `RUNNER_SECRET`. |
| `RUNNER_HOST` | `runner/src/config.ts:115` | Runner VM env file (compose: fixed `0.0.0.0`, `runner/deploy/docker-compose.yml:30`) | Optional, default `127.0.0.1` | Keep the default; expose the runner through the tunnel or Caddy only. |
| `RUNNER_PORT` | `runner/src/config.ts:116` | Runner VM env file (compose: fixed `4242`, `runner/deploy/docker-compose.yml:31`) | Optional, default 4242 | Env file. |
| `RUNNER_IMAGE` | `runner/src/config.ts:85`, `runner/deploy/docker-compose.yml:32`, `:52` | Runner VM env file | Optional, default `imbegnal-runner:full` | `install.sh` sets it to the built profile. |
| `RUNNER_MAX_CONCURRENCY` | `runner/src/config.ts:118` | Runner VM env file | Optional, default 4 (1-64) | Env file; about 1 CPU core and 0.5-1 GiB RAM per job. |
| `RUNNER_QUEUE_MAX` | `runner/src/config.ts:119` | Runner VM env file | Optional, default 16 | Env file. |
| `RUNNER_QUEUE_TIMEOUT_MS` | `runner/src/config.ts:120` | Runner VM env file | Optional, default 30000 | Env file. |
| `RUNNER_DOCKER_RUNTIME` | `runner/src/config.ts:88` | Runner VM env file | Optional, default Docker's (`runc`) | `runsc` for gVisor (see `runner/README.md`). |
| `RUNNER_DOCKER_BIN` | `runner/src/config.ts:91` | Runner VM env file | Optional, default `docker` | Env file. |
| `RUNNER_DOCKER_HOST` | `runner/src/config.ts:92` | Runner VM env file | Optional, default unset (the daemon's socket) | Rootless Docker socket, e.g. `unix:///run/user/<uid>/docker.sock`. |
| `RUNNER_PREPULL` | `runner/src/config.ts:124` | Runner VM env file | Optional, default 0 | `1` only for a registry-hosted image. |
| `RUNNER_SMOKE_ON_START` | `runner/src/config.ts:125` | Runner VM env file | Optional, default 1 | Env file. |
| `RUNNER_LANGS` | `runner/src/config.ts:95` | Runner VM env file | Optional, default all languages that pass the smoke test | Comma-separated language ids. |
| `RUNNER_LOG_LEVEL` | `runner/src/config.ts:104` | Runner VM env file | Optional, default `info` | `debug`, `info`, `warn` or `error`. |
| `RUNNER_REAP_LABELS`, `RUNNER_REAP_AGE_MS`, `RUNNER_REAP_INTERVAL_MS`, `RUNNER_AVAILABILITY_TTL_MS`, `RUNNER_REPLAY_TTL_MS`, `RUNNER_SHUTDOWN_GRACE_MS` | `runner/src/config.ts:107`, `:129`, `:130`, `:133`, `:134`, `:135` | Runner VM env file | Optional, defaults: none, 120000, 60000, 900000, 600000, 10000 | Leave unset (tests use them). |
| `DOCKER_GID` | `runner/deploy/docker-compose.yml:38` | `runner/deploy/.env` (compose only) | Optional, default 999 | `stat -c %g /var/run/docker.sock`. |
| `RUNNER_PUBLISH_PORT` | `runner/deploy/docker-compose.yml:34` | `runner/deploy/.env` (compose only) | Optional, default 4242 | `.env`. |
| `CLOUDFLARE_TUNNEL_TOKEN` | `runner/deploy/docker-compose.yml:71` | `runner/deploy/.env` (compose `--profile tunnel` only) | Optional (required for that profile) | Cloudflare → Zero Trust → Networks → Tunnels → the tunnel → install command shows the token; paste it into `.env`. Secret. |
| `RUNNER_DOMAIN` | `runner/deploy/docker-compose.yml:84`, `runner/deploy/Caddyfile:3` | `runner/deploy/.env` (compose `--profile caddy` only) | Optional (required for that profile) | `.env`. |
| `SWIFT_SHA256`, `SWIFT_VERSION`, `SWIFT_PLATFORM`, `WITH_SWIFT`, `BASE_IMAGE`, `RUNNER_IMAGE_TAG` | `runner/image/build.sh:22-35`, `runner/deploy/install.sh:103`, `runner/deploy/docker-compose.yml:59-60` | Shell environment when building the toolchain image | Optional; without `SWIFT_SHA256` Swift is skipped and reported unavailable | `export SWIFT_SHA256=<checksum from swift.org>` before `install.sh` / `build.sh`. |

The runner passes only `PATH`, `HOME`, `USER`, `DOCKER_HOST`, `DOCKER_CONFIG`, `DOCKER_CONTEXT`, `DOCKER_CERT_PATH`,
`DOCKER_TLS_VERIFY` and `XDG_RUNTIME_DIR` to the docker CLI (`runner/src/docker.ts:37-47`); job containers get a fixed
allow-list of their own, never the runner's environment or `RUNNER_SECRET`.

## CI-only (set inline in `.github/workflows/ci.yml`, nothing to configure)

`HINT_LEAK_REQUIRE_OUT` (`ci.yml:52`, read by `tests/unit/hints-no-leak.test.ts:91`), `RUNNER_TEST_IMAGE` (`ci.yml:70`,
`runner/tests/helpers.ts:14`), `PYODIDE_DIR` (`ci.yml:93`, `tests/e2e/codelab/support.ts:165`), `E2E_RUNNER_IMAGE`
(`ci.yml:115`, `tests/e2e/run.mjs:102`). `npm run test:e2e` generates throw-away Worker secrets for its local stack.
