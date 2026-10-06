/**
 * Runner configuration, read from the environment.
 *
 *   RUNNER_SECRET            required, >= 32 characters (HMAC key shared with the Worker)
 *   RUNNER_HOST              bind address (default 127.0.0.1)
 *   RUNNER_PORT              default 4242 (0 = random, used by tests)
 *   RUNNER_IMAGE             toolchain image (default imbegnal-runner:full)
 *   RUNNER_MAX_CONCURRENCY   containers running at once (default 4)
 *   RUNNER_QUEUE_MAX         jobs allowed to wait for a slot (default 16); more -> 503 busy
 *   RUNNER_QUEUE_TIMEOUT_MS  max wait for a slot before 503 busy (default 30000)
 *   RUNNER_DOCKER_RUNTIME    optional OCI runtime for job containers, e.g. "runsc" (gVisor)
 *   RUNNER_DOCKER_BIN        docker CLI to execute (default "docker")
 *   RUNNER_DOCKER_HOST       optional DOCKER_HOST for the CLI (e.g. a rootless socket)
 *   RUNNER_PREPULL           "1": `docker pull` the image at start if it is missing
 *   RUNNER_SMOKE_ON_START    "0" disables the start-up language smoke tests (default "1")
 *   RUNNER_LANGS             optional comma separated allow-list of language ids
 *   RUNNER_LOG_LEVEL         debug | info | warn | error (default info)
 */
import { LANG_IDS, type LangId } from "../../shared/languages";

export const MIN_SECRET_LENGTH = 32;

export interface RunnerConfig {
  secret: string;
  host: string;
  port: number;
  image: string;
  maxConcurrency: number;
  queueMax: number;
  queueTimeoutMs: number;
  dockerRuntime: string | null;
  dockerBin: string;
  dockerHost: string | null;
  prepull: boolean;
  smokeOnStart: boolean;
  /** Languages this runner offers; the others answer `unsupported`. */
  enabledLangs: readonly LangId[];
  logLevel: "debug" | "info" | "warn" | "error";
  /** Extra labels (`k=v`) that scope the orphan reaper; tests use this to stay out of other people's containers. */
  reapLabels: readonly string[];
  /** Containers older than this that this process does not own are removed by the reaper. */
  reapAgeMs: number;
  /** How often the reaper runs. */
  reapIntervalMs: number;
  /** How long the language smoke-test results stay fresh. */
  availabilityTtlMs: number;
  /** How long jobIds are remembered for replay protection. */
  replayTtlMs: number;
  /** Time running jobs get to finish when shutting down before they are killed. */
  shutdownGraceMs: number;
}

export class ConfigError extends Error {}

const IMAGE_RE = /^[a-z0-9]+(?:[._/-][a-z0-9]+)*(?::[A-Za-z0-9_][A-Za-z0-9_.-]{0,127})?(?:@sha256:[a-f0-9]{64})?$/;
const RUNTIME_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const LABEL_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}=[A-Za-z0-9_.-]{1,64}$/;

function intVar(env: NodeJS.ProcessEnv, name: string, def: number, min: number, max: number): number {
  const raw = env[name];
  if (raw === undefined || raw.trim() === "") return def;
  if (!/^\d+$/.test(raw.trim())) throw new ConfigError(`${name} must be a non-negative integer`);
  const n = Number(raw.trim());
  if (!Number.isSafeInteger(n) || n < min || n > max) {
    throw new ConfigError(`${name} must be between ${min} and ${max}`);
  }
  return n;
}

function boolVar(env: NodeJS.ProcessEnv, name: string, def: boolean): boolean {
  const raw = env[name]?.trim().toLowerCase();
  if (raw === undefined || raw === "") return def;
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  throw new ConfigError(`${name} must be 0 or 1`);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): RunnerConfig {
  const secret = env.RUNNER_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH) {
    // Never echo the value, not even its length-relevant prefix.
    throw new ConfigError(`RUNNER_SECRET is required and must be at least ${MIN_SECRET_LENGTH} characters`);
  }

  const image = (env.RUNNER_IMAGE?.trim() || "imbegnal-runner:full");
  if (!IMAGE_RE.test(image)) throw new ConfigError("RUNNER_IMAGE is not a valid image reference");

  const runtimeRaw = env.RUNNER_DOCKER_RUNTIME?.trim();
  if (runtimeRaw && !RUNTIME_RE.test(runtimeRaw)) throw new ConfigError("RUNNER_DOCKER_RUNTIME is not a valid runtime name");

  const dockerBin = env.RUNNER_DOCKER_BIN?.trim() || "docker";
  const dockerHost = env.RUNNER_DOCKER_HOST?.trim() || null;

  let enabledLangs: readonly LangId[] = LANG_IDS;
  const langsRaw = env.RUNNER_LANGS?.trim();
  if (langsRaw) {
    const wanted = langsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const known = new Set<string>(LANG_IDS);
    const bad = wanted.filter((w) => !known.has(w));
    if (bad.length) throw new ConfigError(`RUNNER_LANGS has unknown language(s): ${bad.join(", ")}`);
    enabledLangs = wanted as LangId[];
  }

  const level = (env.RUNNER_LOG_LEVEL?.trim() || "info") as RunnerConfig["logLevel"];
  if (!["debug", "info", "warn", "error"].includes(level)) throw new ConfigError("RUNNER_LOG_LEVEL is invalid");

  const reapLabels = (env.RUNNER_REAP_LABELS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const l of reapLabels) if (!LABEL_RE.test(l)) throw new ConfigError("RUNNER_REAP_LABELS entries must look like key=value");

  return {
    secret,
    host: env.RUNNER_HOST?.trim() || "127.0.0.1",
    port: intVar(env, "RUNNER_PORT", 4242, 0, 65535),
    image,
    maxConcurrency: intVar(env, "RUNNER_MAX_CONCURRENCY", 4, 1, 64),
    queueMax: intVar(env, "RUNNER_QUEUE_MAX", 16, 0, 1024),
    queueTimeoutMs: intVar(env, "RUNNER_QUEUE_TIMEOUT_MS", 30_000, 100, 300_000),
    dockerRuntime: runtimeRaw || null,
    dockerBin,
    dockerHost,
    prepull: boolVar(env, "RUNNER_PREPULL", false),
    smokeOnStart: boolVar(env, "RUNNER_SMOKE_ON_START", true),
    enabledLangs,
    logLevel: level,
    reapLabels,
    reapAgeMs: intVar(env, "RUNNER_REAP_AGE_MS", 2 * 60_000, 1000, 24 * 3_600_000),
    reapIntervalMs: intVar(env, "RUNNER_REAP_INTERVAL_MS", 60_000, 100, 3_600_000),
    availabilityTtlMs: intVar(env, "RUNNER_AVAILABILITY_TTL_MS", 60_000, 1000, 3_600_000),
    replayTtlMs: intVar(env, "RUNNER_REPLAY_TTL_MS", 10 * 60_000, 1000, 24 * 3_600_000),
    shutdownGraceMs: intVar(env, "RUNNER_SHUTDOWN_GRACE_MS", 10_000, 0, 120_000),
  };
}
