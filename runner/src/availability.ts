/**
 * Which languages actually work on this runner.
 *
 * Each language is smoke-tested in a real container (version probe, then compile + run of the
 * Hello World from shared/languages.ts, output compared). Results are cached for a while and
 * refreshed on demand in the background, so a partial image (say, no Swift) degrades honestly:
 * /v1/languages says so and /v1/run answers `unsupported` instead of failing at run time.
 *
 * A language is only declared unusable when the TOOLCHAIN failed its test. When docker itself
 * is down the state is "unknown": /v1/run then tries anyway and reports internal_error.
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
    if (this.measuredAt > 0 && Date.now() - this.measuredAt < this.ttlMs) return Promise.resolve();
    this.inflight = this.refresh().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
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
    const t0 = Date.now();
    const queue = [...this.enabled];
    const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
      for (let id = queue.shift(); id; id = queue.shift()) {
        this.states.set(id, await this.probe(id));
      }
    });
    await Promise.all(workers);
    this.measuredAt = Date.now();
    const ok = this.enabled.filter((l) => this.states.get(l)?.available);
    this.log.info("language smoke tests finished", {
      available: ok.join(","),
      unavailable: this.enabled.filter((l) => !ok.includes(l)).join(","),
      totalMs: Date.now() - t0,
    });
  }

  private async probe(lang: LangId): Promise<LangState> {
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
      return { available: false, reason: "toolchain" };
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
