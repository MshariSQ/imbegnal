/**
 * Which languages actually work on this runner.
 *
 * Each language is smoke-tested in a real container (version probe, then compile + run of the
 * Hello World from shared/languages.ts, output compared). Results are cached for a while and
 * refreshed on demand in the background, so a partial image (say, no Swift) degrades honestly:
 * /v1/languages says so and /v1/run answers `unsupported` instead of failing at run time.
 *
 * A language is only declared unusable when the TOOLCHAIN failed its test. When docker itself
 * is down the state is "unknown": /v1/run then tries anyway and reports internal_error, and the
 * smoke tests are repeated after UNKNOWN_RECHECK_MS instead of the full TTL, so a short Docker
 * blip does not show working languages as unavailable for the whole cache lifetime.
 */
import { LANG_IDS, getLanguage, type LangId } from "../../shared/languages";
import type { LanguageStatus } from "../../shared/protocol";
import { randomUUID } from "node:crypto";
import type { JobExecutor } from "./executor";
import type { Logger } from "./log";
import type { SlotQueue } from "./queue";

export type AvailabilityReason = "toolchain" | "docker" | "disabled";

export interface LangState {
  available: boolean;
  version?: string;
  reason?: AvailabilityReason;
}

const EXPECTED = "Hello, World!";
/** Smoke-test outcomes caused by load rather than by a missing or broken toolchain. */
const TRANSIENT = new Set(["timeout", "memory_limit", "output_limit", "internal_error"]);
/**
 * Re-check delay while any enabled language's state is unknown (docker failed during its smoke
 * test). Short, because the state shown is a guess; not zero, so a Docker outage does not turn
 * every /v1/languages call into a fresh round of smoke tests.
 */
export const UNKNOWN_RECHECK_MS = 30_000;

export class Availability {
  private readonly states = new Map<LangId, LangState>();
  private measuredAt = 0;
  private inflight: Promise<void> | null = null;

  constructor(
    private readonly enabled: readonly LangId[],
    private readonly executor: JobExecutor,
    private readonly slots: SlotQueue,
    private readonly log: Logger,
    private readonly ttlMs: number,
    /** When false no smoke tests run: every enabled language is assumed to work. */
    private readonly measure: boolean,
    /** Clock (tests). */
    private readonly now: () => number = Date.now,
  ) {
    for (const id of LANG_IDS) {
      if (!enabled.includes(id)) this.states.set(id, { available: false, reason: "disabled" });
    }
  }

  get measured(): boolean {
    return this.measuredAt > 0;
  }

  /** Start a refresh when the cache is stale. Single-flight; never throws. */
  refreshIfStale(): Promise<void> {
    if (!this.measure) return Promise.resolve();
    if (this.inflight) return this.inflight;
    if (this.measuredAt > 0 && this.now() - this.measuredAt < this.maxAgeMs()) return Promise.resolve();
    this.inflight = this.refresh().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  /** How long the last measurement stays fresh: the TTL, or much less while a state is unknown. */
  private maxAgeMs(): number {
    const unknown = this.enabled.some((l) => this.states.get(l)?.reason === "docker");
    return unknown ? Math.min(UNKNOWN_RECHECK_MS, this.ttlMs) : this.ttlMs;
  }

  /** Force a full refresh (start-up). */
  refreshNow(): Promise<void> {
    if (!this.measure) return Promise.resolve();
    this.inflight ??= this.refresh().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async refresh(): Promise<void> {
    const t0 = this.now();
    const queue = [...this.enabled];
    const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
      for (let id = queue.shift(); id; id = queue.shift()) {
        this.states.set(id, await this.probe(id));
      }
    });
    await Promise.all(workers);
    this.measuredAt = this.now();
    const ok = this.enabled.filter((l) => this.states.get(l)?.available);
    this.log.info("language smoke tests finished", {
      available: ok.join(","),
      unavailable: this.enabled.filter((l) => !ok.includes(l)).join(","),
      totalMs: this.now() - t0,
    });
  }

  private async probe(lang: LangId): Promise<LangState> {
    const prev = this.states.get(lang);
    const next = await this.probeOnce(lang);
    // A re-check that only ran out of time or memory (a busy host compiling Kotlin, Go or Rust
    // next to learners' jobs) says nothing about the toolchain: keep the last good result rather
    // than refusing every run of a working language until the next re-check.
    if (!next.available && next.transient && prev?.available) {
      this.log.warn("language smoke test inconclusive; keeping previous result", { lang, status: next.transient });
      return prev;
    }
    return { available: next.available, version: next.version, reason: next.reason };
  }

  private async probeOnce(lang: LangId): Promise<LangState & { transient?: string }> {
    const spec = getLanguage(lang);
    if (!spec) return { available: false, reason: "toolchain" };
    // Runs through the normal slot queue so smoke tests never exceed RUNNER_MAX_CONCURRENCY.
    const slot = await this.slots.acquire({ unbounded: true }).catch(() => null);
    if (!slot) return { available: false, reason: "docker" };
    try {
      const { result, version, infra } = await this.executor.execute(
        { jobId: `smoke-${lang}-${randomUUID().slice(0, 8)}`, lang, code: spec.hello, stdin: "" },
        { probeVersion: true },
      );
      if (infra) return { available: false, reason: "docker" };
      if (result.status === "ok" && result.stdout.trim() === EXPECTED) return { available: true, version };
      const transient = TRANSIENT.has(result.status) ? result.status : undefined;
      return { available: false, reason: "toolchain", transient };
    } finally {
      slot.release();
    }
  }

  /** State used by /v1/run to decide `unsupported`. Unmeasured languages are assumed to work. */
  state(lang: LangId): LangState {
    return this.states.get(lang) ?? { available: true };
  }

  /** True when a run should be refused with `unsupported`. */
  isUnsupported(lang: LangId): boolean {
    const s = this.state(lang);
    return !s.available && (s.reason === "toolchain" || s.reason === "disabled");
  }

  snapshot(): LanguageStatus[] {
    return LANG_IDS.map((id) => {
      const s = this.state(id);
      const out: LanguageStatus = { id, available: s.available };
      if (s.available && s.version) out.version = s.version;
      return out;
    });
  }
}
