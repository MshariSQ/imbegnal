/**
 * Orphan-container reaper.
 *
 * Job containers are removed in a `finally` block, but a crash, a SIGKILL or a daemon hiccup
 * can still leave one behind. The reaper removes containers labelled imbegnal.runner=1 that are
 * older than any job can legitimately run and that this process does not own.
 */
import type { Docker } from "./docker";
import type { Logger } from "./log";

export class Reaper {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly docker: Docker,
    private readonly owned: () => ReadonlySet<string>,
    private readonly log: Logger,
    private readonly minAgeMs: number,
    private readonly intervalMs: number,
  ) {}

  /** One sweep. Returns the number of containers removed; never throws. */
  async reapOnce(now: number = Date.now()): Promise<number> {
    if (this.running) return 0;
    this.running = true;
    try {
      const mine = this.owned();
      const all = await this.docker.listOwned();
      let removed = 0;
      for (const c of all) {
        if (mine.has(c.name)) continue;
        if (now - c.createdMs < this.minAgeMs) continue;
        if (await this.docker.remove(c.id)) {
          removed++;
          this.log.warn("removed orphaned container", { ageMs: now - c.createdMs });
        }
      }
      return removed;
    } catch (e) {
      this.log.warn("orphan reaper could not list containers", { error: e instanceof Error ? e.name : "error" });
      return 0;
    } finally {
      this.running = false;
    }
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.reapOnce(), this.intervalMs);
    this.timer.unref();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
