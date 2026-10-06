/**
 * Resolution of per-job limits.
 *
 * Callers (the Worker) may only LOWER limits: whatever they send is clamped to the
 * language's defaults, which themselves never exceed RUNNER_CEILING. Values that are not
 * positive integers, or that exceed the ceiling, are rejected by validation before
 * this runs; this module only clamps.
 */
import { RUNNER_CEILING, type RunLimits } from "../../shared/protocol";
import type { EffectiveLimits, LangDefaults } from "./languages";

export const MIN_COMPILE_TIMEOUT_MS = 1_000;
export const MIN_RUN_TIMEOUT_MS = 200;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function resolveLimits(defaults: LangDefaults, requested?: RunLimits): EffectiveLimits {
  const compileCeil = Math.min(defaults.compileTimeoutMs, RUNNER_CEILING.compileTimeoutMs);
  const runCeil = Math.min(defaults.runTimeoutMs, RUNNER_CEILING.runTimeoutMs);
  const memCeil = Math.min(defaults.memoryMb, RUNNER_CEILING.memoryMb);

  const memoryMb = clamp(requested?.memoryMb ?? memCeil, Math.min(defaults.minMemoryMb, memCeil), memCeil);
  return {
    compileTimeoutMs: clamp(requested?.compileTimeoutMs ?? compileCeil, Math.min(MIN_COMPILE_TIMEOUT_MS, compileCeil), compileCeil),
    runTimeoutMs: clamp(requested?.runTimeoutMs ?? runCeil, Math.min(MIN_RUN_TIMEOUT_MS, runCeil), runCeil),
    memoryMb,
    // The compile step has its own memory need that does not shrink with the learner's run limit.
    compileMemoryMb: clamp(Math.max(defaults.compileMemoryMb, memoryMb), memoryMb, RUNNER_CEILING.memoryMb),
    cpus: defaults.cpus,
    pids: defaults.pids,
    tmpfsMb: defaults.tmpfsMb,
  };
}
