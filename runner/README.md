# IMBEGNAL runner

The runner is the service behind Code Lab and the Challenges grader. It receives a signed
request ("run this code in this language with this stdin"), executes it in a throw-away,
locked-down Docker container and returns stdout, stderr, exit status and timings.

It executes **untrusted code written by anonymous users**. Everything in this directory is
organised around one question: *what can a malicious program do, and what stops it?*

- Zero runtime npm dependencies: Node 22 built-ins only (`node:http`, `node:child_process`,
  `node:crypto`, ...). The compiler (`tsc`) is a build-time tool only.
- Wire protocol and limits: [`shared/protocol.ts`](../shared/protocol.ts) and
  [`shared/languages.ts`](../shared/languages.ts). Architecture and quotas: [`docs/CODE_LAB.md`](../docs/CODE_LAB.md).

```
browser ──► Cloudflare Worker (auth, quota, history) ──HMAC──► runner ──docker CLI──► Docker daemon
                                                                                          │
                                                       one container per run  ◄───────────┘
                                                       (no network, read-only, unprivileged)
```

The browser never talks to the runner. Only the Worker holds `RUNNER_SECRET`.

## Contents

1. [Quick start](#quick-start)
2. [HTTP API](#http-api)
3. [Threat model](#threat-model)
4. [Isolation layers](#isolation-layers)
5. [Limits](#limits)
6. [Languages and images](#languages-and-images)
7. [Configuration](#configuration)
8. [Tests](#tests)
9. [Deployment](#deployment)
10. [Hardening options: gVisor and rootless Docker](#hardening-options)
11. [Capacity planning](#capacity-planning)
12. [Cloudflare Tunnel setup for `RUNNER_URL`](#cloudflare-tunnel-setup)
13. [Operations](#operations)
14. [Honest limitations](#honest-limitations)

## Quick start

Development on a machine with Docker:

```sh
# 1. the toolchain image jobs run in (slim = Python, Node/TypeScript, Java, C, C++; a few minutes)
runner/image/build.sh slim                       # tags imbegnal-runner:slim

# 2. the service
export RUNNER_SECRET="$(openssl rand -hex 32)"   # >= 32 characters or the service refuses to start
export RUNNER_IMAGE=imbegnal-runner:slim
npm run build --prefix runner && node runner/dist/runner/src/main.js
# {"ts":"...","level":"info","msg":"runner listening","host":"127.0.0.1","port":4242,...}
# {"ts":"...","level":"info","msg":"language smoke tests finished","available":"python,javascript,...","unavailable":"swift,..."}
```

Production: [`deploy/install.sh`](deploy/install.sh) on a fresh Ubuntu 24.04 VM, see [Deployment](#deployment).

## HTTP API

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /healthz` | none | Liveness. Returns `{"ok":true}` (`503 {"ok":false}` while shutting down) and nothing else: no versions, no counts. |
| `GET /v1/languages` | signed | `LanguagesResponse`: per language `available` and `version`, plus the default limits. |
| `POST /v1/run` | signed | Body `RunRequest`, answer `RunResult`. |

A job that ran, whatever its outcome (compile error, timeout, OOM, ...), is **HTTP 200** with a
`RunResult` whose `status` says what happened. HTTP errors mean no job was executed:
`400 bad_request`, `401 unauthorized`, `409 duplicate_job`, `413 too_large`, `415`, `503 busy`,
`503 shutting_down` (full list in `shared/protocol.ts`). Error bodies are `{"error": "<code>", "message": "..."}`
and never contain host paths, environment values or stack traces.

### Authentication

Every non-health request carries two headers:

```
x-imb-timestamp: <unix epoch milliseconds>
x-imb-signature: hex(HMAC-SHA256(RUNNER_SECRET, `${timestamp}.${rawBody}`))
```

The raw body is signed (empty string for `GET`). The runner compares in constant time, accepts
timestamps within +-30 s, and remembers every `jobId` for 10 minutes: a replayed job is a `409`,
so a captured request cannot be re-submitted to burn CPU or re-trigger a grading run.

### Validation

Strict, field by field, before anything touches Docker: `lang` must be one of the 14 ids, `jobId`
8-64 chars of `[A-Za-z0-9-]`, `code`/`stdin` strings within 64 KiB each, no NUL bytes in `code`,
`limits` integers that may only **lower** the defaults (never raise, never above the hard
ceilings), no unknown top-level fields. The HTTP body is capped slightly above
`codeBytes + stdinBytes` while it is being read (an oversized body is cut off, not buffered).

## Threat model

**Assets**: the host (and anything else on the network it sits on), `RUNNER_SECRET`, other users'
jobs and results, availability of the service.

**Attacker**: any logged-in (or, if the Worker allows it, anonymous) learner who can submit
arbitrary source code and stdin in 14 languages. They may also reach the runner's URL directly if
it is exposed, so the runner authenticates by itself rather than trusting its network position.

**In scope** (what the design is meant to stop):

| Attack | Mitigation |
| --- | --- |
| Call home, scan the LAN, reach cloud metadata (169.254.169.254), mine, spam | `--network none`: the container has only a loopback interface |
| Read or modify the host filesystem, other jobs' files | no host mounts at all; read-only root; private tmpfs per job |
| Persist anything between runs / poison the next learner | one fresh container per run, destroyed in `finally`; tmpfs is gone with it |
| Escalate to root, use setuid binaries, load kernel modules | uid 65534, `--cap-drop ALL`, `no-new-privileges`, setuid bits stripped in the image, default seccomp profile |
| Fork bomb | `--pids-limit` (per container, the real control) plus `RLIMIT_NPROC` as a backstop |
| Memory bomb, swap thrash | `--memory` == `--memory-swap`; the kernel OOM-kills the container, reported as `memory_limit` |
| CPU burn, infinite loop | `--cpus`, host-side wall-clock timeout that kills the whole container, `RLIMIT_CPU` |
| Fill the disk | size-capped tmpfs (RAM-backed, counted against `--memory`), `RLIMIT_FSIZE`, no writable layer (read-only rootfs) |
| Flood stdout/stderr to exhaust runner memory | streaming caps: keep 64 KiB per stream, **kill at 1 MiB** (`output_limit`) |
| Forge runner control data (fake "status" lines in output) | the runner never parses program output for control data; compile and run are separate `docker exec` calls with separate pipes |
| Command injection through code, stdin, class names, job ids | no shell anywhere: `spawn("docker", [argv])` only; user text goes to fixed file names or a stdin pipe; Java class names are validated against `^[A-Za-z_][A-Za-z0-9_]*$` |
| Steal `RUNNER_SECRET` or host environment | containers get a minimal explicit environment (`HOME`, `TMPDIR`, `PATH`, `LANG`, language caches); the secret is never passed on a command line either |
| Log scraping / privacy | logs contain job id, language, status, durations and byte counts only, never code, stdin or output |
| Replay and forgery of requests | HMAC + timestamp window + `jobId` memory |
| Queue flooding | bounded concurrency, bounded queue, `503 busy` beyond it, queue wait timeout |
| Leak containers if the runner crashes | orphan reaper at start-up and every minute |

**Out of scope / residual risk** (see [Honest limitations](#honest-limitations)): a Linux kernel
or container-runtime vulnerability exploited from inside a job. Containers share the host kernel.
The default configuration accepts that risk for a learning platform running on a dedicated VM;
[gVisor](#hardening-options) removes most of it.

**Trust boundary of the runner itself**: the service talks to the Docker daemon, which is
root-equivalent on its host. A bug in the (small, dependency-free) service is therefore a host
compromise. This is why the service runs as an unprivileged user with a hardened systemd unit,
validates everything, and belongs on a dedicated VM. See [Deployment](#deployment).

## Isolation layers

Defence in depth: each layer is meant to hold even if the one above it fails. The flags are
assembled in `src/docker.ts` (`buildCreateArgs`, unit-tested) and each is verified against a real
daemon in `tests/isolation.test.ts`.

1. **Authentication and validation** (`auth.ts`, `validate.ts`): nothing is executed for an
   unsigned, stale, replayed, oversized or malformed request.
2. **No shell, no interpolation** (`docker.ts`, `languages.ts`): commands are argv arrays.
   User-controlled bytes only ever reach a file with a *fixed* name (`main.py`, `main.c`, ...
   from `shared/languages.ts`) or a pipe. The one value derived from user code (the Java class
   name) is matched by a strict regex and re-validated; anything else falls back to `Main` or is rejected.
3. **One container per run, labelled and named `imb-run-<jobId>`**: created idle
   (`sleep infinity` under `--init`), then the compile step and the run step are separate
   `docker exec` invocations. The host sees each phase's stdout/stderr on its own pipes, so program
   output can never be mistaken for runner metadata, and stdin is fed through the exec pipe.
   The container is always killed and removed in `finally`.
4. **Namespaces and cgroups** (Docker defaults): PID, mount, UTS, IPC and network namespaces,
   `--network none`, `--hostname sandbox`, cgroup limits for memory, CPU and pids.
5. **Filesystem**: `--read-only` root; `/work` and `/work/tmp` are size-capped `tmpfs` mounts
   (`rw,exec,nosuid,nodev`; exec is needed because compilers write executables there).
   Nothing is mounted from the host. The Docker socket is never mounted into job containers.
6. **Privileges**: `--user 65534:65534`, `--cap-drop ALL` (effective capability set is all zeros),
   `--security-opt no-new-privileges`, Docker's **default seccomp profile** (never `unconfined`,
   never `--privileged`), setuid/setgid bits removed from every file in the image.
7. **Resource limits**: `--memory` = `--memory-swap`, `--cpus`, `--pids-limit`, `--shm-size 8m`,
   `ulimit` for `nofile`, `nproc`, `fsize`, `core=0` and `cpu`.
8. **Host-side enforcement**: wall time is measured and enforced by the runner, not by anything
   inside the container. On timeout, output flood or OOM the **whole container** is killed
   (`docker kill`, then `docker rm -f`), which also takes care of any process the program detached.
9. **Clean environment**: `HOME=/work`, `TMPDIR=/work/tmp`, a fixed `PATH`; no variable is
   inherited from the runner's own environment.
10. **Optional**: a stronger OCI runtime (`RUNNER_DOCKER_RUNTIME=runsc`) so the program talks to a
    user-space kernel, not the host kernel; and rootless Docker so that a runner compromise is not root.

## Limits

Callers may only lower these (`RUNNER_DEFAULTS`, per-language overrides below), never raise them
above `RUNNER_CEILING`.

| | Default | Hard ceiling |
| --- | --- | --- |
| Run wall-clock | 5 s | 15 s |
| Compile wall-clock | 10 s (15-20 s for TypeScript, Java, C++, Go, Rust, Kotlin, Swift) | 20 s |
| Memory per container | 256 MiB (Java, TypeScript runtime and Kotlin use 512 MiB) | 1024 MiB |
| CPUs | 1 (2 for Go, Rust, Kotlin, Swift) | |
| PIDs | 64 (up to 192 for JVM/Go/Rust/Swift) | |
| Work tmpfs | 64 MiB (up to 256 MiB for Go, counted against memory) | |
| Source / stdin | 64 KiB / 64 KiB | |
| Output kept per stream | 64 KiB (the rest is dropped, `truncated: true`) | |
| Output kill threshold per stream | 1 MiB (`output_limit`) | |

Compilers get more memory than the program they produce (`docker update --memory` between the
phases), because `javac`, `kotlinc`, `rustc` and `go build` need far more than the programs they build.
The exact numbers per language live in `src/languages.ts`.

## Languages and images

All 14 languages in `shared/languages.ts`:

| Language | Compile | Run |
| --- | --- | --- |
| Python | `python3 -m py_compile` (syntax check, so errors are `compile_error`) | `python3` |
| JavaScript | none | `node` |
| TypeScript | `tsc` (strict, type errors are `compile_error`) | `node` on the emitted JS |
| Java | `javac` | `java -cp out <Class>` (serial GC, container-aware heap) |
| C | `gcc -O2 -std=c17 -lm` | `./main` |
| C++ | `g++ -O2 -std=c++20` | `./main` |
| C# | `mcs` | `mono` |
| Go | `go build` (offline, prebuilt standard-library cache) | `./main` |
| Rust | `rustc -O` | `./main` |
| Ruby | none (syntax check) | `ruby` |
| PHP | `php -l` | `php` |
| Kotlin | `kotlinc` | `java -cp` |
| Swift | `swiftc` | `./main` |
| Bash | `bash -n` | `bash` |

### Availability is measured, not assumed

At start-up (and on demand at most every 60 s) the runner smoke-tests each language in a real
container (compile and run a hello world, compare the output) and reports `available` plus the toolchain
`version` in `GET /v1/languages`. A language whose toolchain is missing from the image answers
`unsupported` on `/v1/run`. A partially built image therefore degrades honestly instead of failing at run time.

### Building the toolchain image

One Dockerfile, two profiles (`runner/Dockerfile`, helper `runner/image/build.sh`):

```sh
runner/image/build.sh slim     # python3, Node 22 + TypeScript, OpenJDK 21, gcc/g++
runner/image/build.sh full     # slim + Go, Rust, Ruby, PHP, C# (Mono), Kotlin, Swift
```

- Base: `mirror.gcr.io/library/ubuntu:24.04` (override with `BASE_IMAGE`). Packages are installed with
  `--no-install-recommends` and caches are removed. The image has no package manager access at run time (no network).
- Node.js, TypeScript, undici typings and the Kotlin compiler are downloaded in a throw-away build
  stage and **verified against pinned SHA-256 / npm integrity hashes** (`image/fetch.sh`). Nothing from the build stage but the
  verified files reaches the final image.
- **Swift** is distributed by swift.org only and has no checksum default: pass `SWIFT_SHA256` (look it up on
  <https://www.swift.org/install/linux/>) and optionally `SWIFT_VERSION`. Without it, build with `WITH_SWIFT=0`; Swift then
  reports `available: false`. *The Swift stage could not be exercised on the development VM (download.swift.org is not reachable from it);
  it is written against swift.org's documented tarball layout and must be verified on the first real build.*
- Behind a TLS-inspecting proxy: `BUILD_CA_BUNDLE=/path/ca.pem HTTPS_PROXY=... runner/image/build.sh ...`. The CA bundle is a
  BuildKit secret, only mounted for the download step, never copied into the image.
- Offline defaults baked in: `GOPROXY=off`, `GOFLAGS=-mod=mod`, `CARGO_NET_OFFLINE=true`, `npm_config_offline=true`.
- The Go standard library is pre-built into `/opt/gocache` at image build time and copied into each job's tmpfs
  (a cold `go build` otherwise takes ~25 s).

Measured on the development VM (Docker 29, cgroup v1, overlay2, runc, no gVisor):

| Image | Size |
| --- | --- |
| `imbegnal-runner:slim` | 823 MB |
| `full` without Swift (`imbegnal-runner:full-partial`) | 1.7 GB |

End-to-end "Hello World" through the HTTP API (create container, compile, run, remove; the machine was shared
with other builds, so treat these as upper bounds): Python 1.0 s, Bash 1.2 s, JavaScript 0.8 s, PHP 1.1 s, Ruby 1.5 s,
Rust 1.9 s, C 1.9 s, C# 2.0 s, Java 2.1 s, TypeScript 2.6 s, C++ 3.1 s, Go 5.2 s, Kotlin 9.4 s.

## Configuration

Environment variables (see [`deploy/.env.example`](deploy/.env.example)):

| Variable | Default | Meaning |
| --- | --- | --- |
| `RUNNER_SECRET` | **required** | HMAC key, at least 32 characters; the service refuses to start otherwise |
| `RUNNER_HOST` / `RUNNER_PORT` | `127.0.0.1` / `4242` | Listen address. Keep loopback and put a tunnel/proxy in front |
| `RUNNER_IMAGE` | `imbegnal-runner:full` | Toolchain image for job containers |
| `RUNNER_MAX_CONCURRENCY` | `4` | Containers running at once |
| `RUNNER_QUEUE_MAX` | `16` | Jobs waiting for a slot; beyond that `503 {"error":"busy"}` |
| `RUNNER_QUEUE_TIMEOUT_MS` | `30000` | Longest wait for a slot before `503 busy` |
| `RUNNER_DOCKER_RUNTIME` | unset | OCI runtime for jobs, e.g. `runsc` |
| `RUNNER_DOCKER_HOST` | unset | `DOCKER_HOST` for the CLI, e.g. a rootless socket |
| `RUNNER_PREPULL` | `0` | `1`: pull the image at start-up if it is missing |
| `RUNNER_SMOKE_ON_START` | `1` | `0` skips the start-up language smoke tests |
| `RUNNER_LANGS` | all | Comma separated allow-list of language ids |
| `RUNNER_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `RUNNER_SHUTDOWN_GRACE_MS` | `10000` | Time running jobs get on SIGTERM before they are killed |
| `RUNNER_REAP_AGE_MS` | `120000` | Age after which an unowned labelled container is removed |
| `RUNNER_AVAILABILITY_TTL_MS` | `900000` | How long smoke-test results are trusted before a background re-check (each re-check runs Hello World in every language). A re-check that only times out or runs out of memory keeps the previous result. |
| `RUNNER_REPLAY_TTL_MS` | `600000` | How long a `jobId` is remembered |

Containers and images the runner creates carry the label `imbegnal.runner=1`; job containers are named `imb-run-<jobId>`.

## Tests

```sh
npm run test:runner        # everything (from the repository root)
npm run typecheck          # includes `tsc --noEmit -p runner`
```

Tests use `node:test` and start the **real server in-process** on a random port with a random secret, signing
requests with the real HMAC. They need a Docker daemon and the toolchain image
(`RUNNER_TEST_IMAGE`, default `imbegnal-runner:slim`); **Docker-dependent tests skip with a clear message
when the daemon or the image is missing**, so CI without Docker still passes. The pure-logic tests never need Docker.

| File | Covers |
| --- | --- |
| `tests/unit.test.ts` | HMAC, validation, limit clamping, Java class detection, output caps, status mapping, `docker create` argv (no daemon) |
| `tests/http.test.ts` | auth failures (401), replay (409), body/field validation (400/413/415), health, error bodies, daemon unreachable -> `internal_error` |
| `tests/languages.test.ts` | Hello World per language present in the image, stdout/stderr separation, stdin, exit codes and signals, compile errors, Java specifics |
| `tests/limits.test.ts` | infinite loop -> `timeout`, memory bomb -> `memory_limit`, fork bomb contained, output flood -> `output_limit` |
| `tests/isolation.test.ts` | no network (Python, Node, bash, C, DNS), read-only root, writable `/work`, nothing persists, uid 65534, zero capabilities, no docker.sock, no host paths, clean environment, `docker inspect` flags |
| `tests/service.test.ts` | concurrency cap, `503 busy`, orphan reaper, availability, runtime selection, graceful shutdown, logs never contain code/stdin/output |

Test against the full image: `RUNNER_TEST_IMAGE=imbegnal-runner:full npm run test:runner`.

## Deployment

Files in [`deploy/`](deploy/):

| File | Purpose |
| --- | --- |
| `install.sh` | Fresh Ubuntu 24.04 VM: Docker, Node 22 (checksum verified), service user, build, toolchain image, generated secret in `/etc/imbegnal-runner.env`, systemd unit, health wait. Idempotent. |
| `imbegnal-runner.service` | systemd unit: dedicated unprivileged user, `docker` supplementary group, `Restart=always`, `NoNewPrivileges`, empty capability set, `ProtectSystem=strict`, syscall filter, address-family allow-list, memory/task caps |
| `docker-compose.yml` | Service container plus optional `cloudflared` or `caddy` profiles |
| `Dockerfile.service` | Image for the service itself (not the toolchain image) |
| `Caddyfile` | TLS front end for the `caddy` profile; exposes only the three runner paths |
| `.env.example` | Every variable, documented |

```sh
sudo runner/deploy/install.sh --profile full          # export SWIFT_SHA256=... first to include Swift
sudo sed -n 's/^RUNNER_SECRET=//p' /etc/imbegnal-runner.env    # give it to the Worker
journalctl -u imbegnal-runner -f
```

### The docker.sock trade-off

The runner must create containers, so it needs access to a Docker daemon. **Access to the Docker socket is root on
that host.** The two ways to deploy accept that differently:

- **systemd (recommended)**: the service runs as an unprivileged user in the `docker` group with a hardened unit.
  The group membership is the trust boundary: only the runner process (a few hundred lines, no dependencies, all input validated) has it.
- **docker compose**: the socket is mounted into the service container (`/var/run/docker.sock`). The container is read-only,
  drops all capabilities and has `no-new-privileges`, but the socket itself is still root on the host.

Either way: **dedicate a VM to the runner**. Do not put databases, secrets, SSH keys of other systems or other workloads on it, and give it
no route to your private network (egress to the internet is enough, and only the tunnel needs even that). A socket proxy that only allows
`containers/create|start|exec|kill|delete|inspect`, `images/inspect` and `info` is a further improvement; rootless Docker (below) is a stronger one.

## Hardening options

### gVisor (`runsc`)

gVisor implements the Linux system-call interface in user space, so a program inside the container no longer talks to the host kernel
directly. A kernel exploit then needs a gVisor escape first. Cost: slower syscalls and process start (typically +100-300 ms per run),
a few unsupported syscalls (some Mono/JVM/Go corner cases), and no cgroup v1 `--pids-limit` accounting quirks to worry about.

```sh
# Ubuntu 24.04, see https://gvisor.dev/docs/user_guide/install/
sudo runsc install                 # registers the runtime in /etc/docker/daemon.json
sudo systemctl restart docker
docker run --rm --runtime runsc --network none imbegnal-runner:full uname -a    # should print "Linux ... 4.4.0"
# then in /etc/imbegnal-runner.env:
RUNNER_DOCKER_RUNTIME=runsc
sudo systemctl restart imbegnal-runner
```

The runner passes `--runtime runsc` to `docker create` and every other layer stays on. Re-run `npm run test:runner`
with `RUNNER_DOCKER_RUNTIME=runsc` to confirm every language still passes on your host. gVisor is **not** exercised by
this repository's CI or on the development VM (no runsc there).

### Rootless Docker

With rootless Docker, "root in the container" and the daemon itself map to an unprivileged host user, so a runner compromise or a
container escape lands in a user with no privileges. Run the runner under the same user and point it at that user's socket:

```sh
RUNNER_DOCKER_HOST=unix:///run/user/<uid>/docker.sock
```

Rootless mode needs `newuidmap`, user namespaces and (for resource limits) cgroup v2 delegation. Without cgroup v2 delegation the
`--memory`, `--cpus` and `--pids-limit` flags are **ignored**, which would remove the fork/memory-bomb protection: check
`docker info` (look for "WARNING: No memory limit support") and do not run untrusted code on a rootless daemon that prints it.

### Firecracker / one VM per run

For the strongest isolation run the runner inside a microVM (Firecracker, Kata Containers with `--runtime kata`) and use the same flags.
The `RUNNER_DOCKER_RUNTIME` switch also accepts `kata-runtime`/`kata`.

## Capacity planning

One concurrent job is **about 1 CPU core and 0.5-1 GiB of RAM** at peak, because the memory cap applies to the container (and its RAM-backed tmpfs)
and the compilers of Go, Rust, Kotlin, Java and Swift are the heavy part.

| VM | Suggested `RUNNER_MAX_CONCURRENCY` | `RUNNER_QUEUE_MAX` |
| --- | --- | --- |
| 2 vCPU / 4 GiB | 2 | 8 |
| 4 vCPU / 8 GiB | 4 (default) | 16 |
| 8 vCPU / 16 GiB | 8 | 32 |

Throughput is roughly `concurrency / median_job_seconds` (about 1-2 s for scripting languages, 3-10 s for compiled ones on a loaded host):
a 4-slot runner sustains around 2-4 runs per second of mixed traffic. Use the Worker's per-user quota (`docs/CODE_LAB.md`) to keep any
single learner from filling the queue. Memory is the hard limit: `concurrency * 1 GiB + 1 GiB for the host and the service` must fit in RAM.
Disk: the full image is ~2 GB; jobs themselves write no disk (tmpfs). Add a daily `docker image prune` only for dangling layers; do not prune the toolchain image.

If `503 busy` shows up regularly the Worker should tell the learner to retry, not queue indefinitely: this is why the queue is short.

## Cloudflare Tunnel setup

The runner listens on loopback. A Cloudflare Tunnel publishes it over HTTPS without opening an inbound port.

1. Zero Trust dashboard -> Networks -> Tunnels -> *Create a tunnel* (type **Cloudflared**), name it `imbegnal-runner`.
2. Add a **public hostname**, for example `runner.example.com`, service `http://localhost:4242` (or `http://runner:4242` with the compose stack).
3. Install and run the connector on the runner VM with the token the dashboard shows:
   - compose: put it in `deploy/.env` as `CLOUDFLARE_TUNNEL_TOKEN=...` and run `docker compose --profile tunnel up -d`;
   - or on the host: `sudo cloudflared service install <token>`.
4. In the Worker: `wrangler secret put RUNNER_URL` (`https://runner.example.com`) and `wrangler secret put RUNNER_SECRET` (the value from `/etc/imbegnal-runner.env`).
5. Verify: `curl https://runner.example.com/healthz` -> `{"ok":true}`.
6. Recommended: add a Cloudflare Access service-token policy or an IP allow-list for the Worker as a second factor in front of the HMAC.
   Keep the runner's own HMAC check on: it is what stands between the internet and a code-execution service.

Alternative without Cloudflare: `docker compose --profile caddy up -d` with `RUNNER_DOMAIN` pointing at the VM
(Caddy obtains a certificate and only forwards `/healthz`, `/v1/run`, `/v1/languages`).

## Operations

- **Logs**: one JSON object per line on stdout (`journalctl -u imbegnal-runner`). Fields: `ts`, `level`, `msg`, `jobId`, `lang`, `status`,
  `compileMs`, `runMs`, `stdoutBytes`, `stderrBytes`. Never code, stdin or output. Log strings are stripped of control characters (no log injection) and length-capped.
- **Shutdown**: SIGTERM stops accepting (`503 shutting_down`), lets running jobs finish for `RUNNER_SHUTDOWN_GRACE_MS`, kills the rest and removes their containers.
- **Orphans**: at start-up and every minute, containers labelled `imbegnal.runner=1` that this process does not own and that are older than
  `RUNNER_REAP_AGE_MS` are removed (crash, `kill -9`, power loss).
- **Docker down**: `/v1/run` answers `200` with `status: "internal_error"` (the learner is not charged) and `/v1/languages` marks everything unavailable; the service stays up and recovers by itself.
- **Upgrades**: re-run `install.sh` (keeps the secret). To rotate the secret: edit `/etc/imbegnal-runner.env`, restart, update the Worker secret.
- **Cleanup by hand**: `docker ps -a --filter label=imbegnal.runner=1`.

## Honest limitations

- **Shared kernel.** With runc, a kernel or runtime vulnerability reachable through the allowed syscalls is a host escape. Seccomp, dropped capabilities and
  `no-new-privileges` shrink that surface; they do not remove it. Use gVisor or microVMs, and a dedicated VM, if the risk matters to you.
- **The Docker socket is root.** See [the trade-off](#the-dockersock-trade-off).
- **Fork and CPU abuse are bounded, not prevented.** A job can use its CPU share and spawn up to `--pids-limit` processes for the length of its time limit.
  Noisy neighbours on the same host see degraded latency during that window. CPU-heavy abuse is bounded further by the quota in the Worker.
- **Per-run container start latency.** One fresh container per run costs roughly 0.3-0.8 s before the program starts (create, start, exec), plus compile time.
  We chose isolation over speed; there is no warm pool because a reused container could carry state between users.
- **Memory-backed tmpfs** is charged to the container's memory limit, so a large `/work` write can end as `memory_limit`, not a disk-full error.
- **Network is off entirely.** Programs cannot download packages or call APIs (by design); `pip`, `npm`, `cargo`, `go get` do not work.
- **Time measurement** is wall-clock on the host and includes `docker exec` start-up (tens of milliseconds); CPU-time limits are only a backstop.
- **Language availability depends on the image.** Swift needs a checksum-pinned download that is not part of the default `full` build here; it reports unavailable until built with `SWIFT_SHA256`.
- **Windows/macOS hosts** are for development only; the deployment files assume Linux with systemd.
