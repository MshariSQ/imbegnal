/**
 * Request authentication (shared/protocol.ts):
 *   X-IMB-Timestamp: <unix ms>
 *   X-IMB-Signature: hex(HMAC-SHA256(secret, `${timestamp}.${rawBody}`))
 * plus replay protection for job ids.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { SIGNATURE_WINDOW_MS } from "../../shared/protocol";

const HEX64 = /^[0-9a-f]{64}$/;
const TS_RE = /^\d{10,16}$/;

/** Hex HMAC over `${timestamp}.` followed by the raw body bytes. */
export function sign(secret: string, timestamp: string, rawBody: Buffer | string): string {
  const h = createHmac("sha256", secret);
  h.update(`${timestamp}.`);
  h.update(rawBody);
  return h.digest("hex");
}

export type AuthFailure = "missing_headers" | "bad_timestamp" | "stale_timestamp" | "bad_signature";

export interface AuthInput {
  secret: string;
  timestamp: string | undefined;
  signature: string | undefined;
  rawBody: Buffer;
  now: number;
  windowMs?: number;
}

/**
 * Returns null when the request is authentic, or the reason it is not. The signature
 * is compared in constant time; the reason is for the operator log only (clients
 * always get the same 401).
 */
export function verifyRequest(input: AuthInput): AuthFailure | null {
  const { timestamp, signature } = input;
  if (typeof timestamp !== "string" || typeof signature !== "string") return "missing_headers";
  if (!TS_RE.test(timestamp)) return "bad_timestamp";
  const ts = Number(timestamp);
  if (!Number.isSafeInteger(ts)) return "bad_timestamp";
  if (Math.abs(input.now - ts) > (input.windowMs ?? SIGNATURE_WINDOW_MS)) return "stale_timestamp";

  const supplied = signature.toLowerCase();
  if (!HEX64.test(supplied)) return "bad_signature";
  const expected = sign(input.secret, timestamp, input.rawBody);
  const a = Buffer.from(supplied, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "bad_signature";
  return null;
}

/**
 * Remembers job ids for `ttlMs` so a captured request cannot be replayed. `claim` is
 * synchronous, so two concurrent requests with one id cannot both win.
 */
export class ReplayGuard {
  private readonly seen = new Map<string, number>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 200_000,
    private readonly clock: () => number = Date.now,
  ) {}

  /** True when the id was new (and is now remembered); false for a replay. */
  claim(jobId: string): boolean {
    const now = this.clock();
    this.prune(now);
    if (this.seen.has(jobId)) return false;
    this.seen.set(jobId, now + this.ttlMs);
    return true;
  }

  /** Forget an id whose job was never started (queue full), so the caller may retry. */
  release(jobId: string): void {
    this.seen.delete(jobId);
  }

  get size(): number {
    return this.seen.size;
  }

  private prune(now: number): void {
    // Map iteration order is insertion order and expiries are monotonic, so stop at the first live entry.
    for (const [id, exp] of this.seen) {
      if (exp > now && this.seen.size <= this.maxEntries) break;
      this.seen.delete(id);
    }
  }
}
