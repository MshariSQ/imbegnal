/**
 * Bounded concurrency with a bounded wait queue.
 *
 * At most `maxRunning` jobs hold a slot; up to `queueMax` more wait (FIFO) for at most
 * `waitTimeoutMs`. Anything beyond that is refused immediately with BusyError, so a burst
 * can never pile up unbounded work (or unbounded containers) on the host.
 */

export class BusyError extends Error {
  constructor(readonly reason: "queue_full" | "wait_timeout" | "closed") {
    super(reason);
  }
}

export type Release = () => void;

interface Waiter {
  grant: (release: Release) => void;
  fail: (e: Error) => void;
  timer: NodeJS.Timeout;
  onAbort?: () => void;
  signal?: AbortSignal;
  enqueuedAt: number;
}

export class SlotQueue {
  private running = 0;
  private closed = false;
  private readonly waiters: Waiter[] = [];

  constructor(
    private readonly maxRunning: number,
    private readonly queueMax: number,
    private readonly waitTimeoutMs: number,
  ) {}

  get runningCount(): number {
    return this.running;
  }

  get queuedCount(): number {
    return this.waiters.length;
  }

  /** Stop admitting work: queued waiters are rejected, running jobs keep their slots. */
  close(): void {
    this.closed = true;
    for (const w of this.waiters.splice(0)) {
      this.dispose(w);
      w.fail(new BusyError("closed"));
    }
  }

  /**
   * Wait for a slot. `unbounded` callers (internal smoke tests) skip the queue-length cap but
   * still honour the slot limit, so they cannot exceed the configured concurrency either.
   */
  acquire(opts: { signal?: AbortSignal; unbounded?: boolean } = {}): Promise<{ release: Release; queueMs: number }> {
    if (this.closed) return Promise.reject(new BusyError("closed"));
    if (this.running < this.maxRunning && this.waiters.length === 0) {
      this.running++;
      return Promise.resolve({ release: this.makeRelease(), queueMs: 0 });
    }
    if (!opts.unbounded && this.waiters.length >= this.queueMax) return Promise.reject(new BusyError("queue_full"));

    return new Promise((resolve, reject) => {
      const w: Waiter = {
        enqueuedAt: Date.now(),
        signal: opts.signal,
        grant: (release) => resolve({ release, queueMs: Date.now() - w.enqueuedAt }),
        fail: reject,
        timer: setTimeout(() => {
          const i = this.waiters.indexOf(w);
          if (i >= 0) this.waiters.splice(i, 1);
          this.dispose(w);
          reject(new BusyError("wait_timeout"));
        }, opts.unbounded ? 10 * 60_000 : this.waitTimeoutMs),
      };
      if (opts.signal) {
        w.onAbort = () => {
          const i = this.waiters.indexOf(w);
          if (i >= 0) this.waiters.splice(i, 1);
          this.dispose(w);
          reject(new BusyError("closed"));
        };
        if (opts.signal.aborted) {
          w.onAbort();
          return;
        }
        opts.signal.addEventListener("abort", w.onAbort, { once: true });
      }
      this.waiters.push(w);
    });
  }

  private dispose(w: Waiter): void {
    clearTimeout(w.timer);
    if (w.onAbort) w.signal?.removeEventListener("abort", w.onAbort);
  }

  private makeRelease(): Release {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      this.running--;
      this.drain();
    };
  }

  private drain(): void {
    while (this.running < this.maxRunning && this.waiters.length > 0) {
      const w = this.waiters.shift();
      if (!w) break;
      this.dispose(w);
      this.running++;
      w.grant(this.makeRelease());
    }
  }
}
