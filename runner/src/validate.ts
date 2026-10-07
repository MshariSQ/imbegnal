/**
 * Strict validation of POST /v1/run bodies. Every field is checked; unknown fields are
 * rejected so a typo on the Worker side fails loudly instead of being ignored.
 */
import { isLangId } from "../../shared/languages";
import { JOB_ID_PATTERN, RUNNER_CEILING, type RunLimits, type RunRequest } from "../../shared/protocol";

/** JSON expands: `"` and `\n` become two bytes, control characters six. */
export const MAX_BODY_BYTES = 2 * (RUNNER_CEILING.codeBytes + RUNNER_CEILING.stdinBytes) + 4096;

export type ValidationResult =
  | { ok: true; request: RunRequest }
  | { ok: false; status: 400 | 413; message: string };

const TOP_KEYS = new Set(["jobId", "lang", "code", "stdin", "limits"]);
const LIMIT_KEYS = new Set(["compileTimeoutMs", "runTimeoutMs", "memoryMb"]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function fail(message: string, status: 400 | 413 = 400): ValidationResult {
  return { ok: false, status, message };
}

function parseLimits(raw: unknown): RunLimits | string {
  if (!isPlainObject(raw)) return "limits must be an object";
  const out: RunLimits = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!LIMIT_KEYS.has(k)) return `limits.${k} is not a known limit`;
    if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) return `limits.${k} must be a positive integer`;
    const ceil =
      k === "compileTimeoutMs"
        ? RUNNER_CEILING.compileTimeoutMs
        : k === "runTimeoutMs"
          ? RUNNER_CEILING.runTimeoutMs
          : RUNNER_CEILING.memoryMb;
    if (v > ceil) return `limits.${k} exceeds the runner ceiling (${ceil})`;
    out[k as keyof RunLimits] = v;
  }
  return out;
}

export function validateRunRequest(rawBody: Buffer): ValidationResult {
  if (rawBody.length === 0) return fail("empty body");
  if (rawBody.length > MAX_BODY_BYTES) return fail("body too large", 413);

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return fail("body is not valid JSON");
  }
  if (!isPlainObject(parsed)) return fail("body must be a JSON object");
  for (const k of Object.keys(parsed)) if (!TOP_KEYS.has(k)) return fail(`unknown field "${k}"`);

  const { jobId, lang, code, stdin, limits } = parsed;
  if (typeof jobId !== "string" || !JOB_ID_PATTERN.test(jobId)) return fail("jobId must be a uuid-like string");
  if (typeof lang !== "string" || !isLangId(lang)) return fail("lang is not a supported language");
  if (typeof code !== "string") return fail("code must be a string");
  if (typeof stdin !== "string") return fail("stdin must be a string");

  if (Buffer.byteLength(code, "utf8") > RUNNER_CEILING.codeBytes) return fail("code is too large", 413);
  if (Buffer.byteLength(stdin, "utf8") > RUNNER_CEILING.stdinBytes) return fail("stdin is too large", 413);
  if (code.includes("\u0000")) return fail("code must not contain NUL bytes");

  const request: RunRequest = { jobId, lang, code, stdin };
  if (limits !== undefined) {
    const l = parseLimits(limits);
    if (typeof l === "string") return fail(l);
    request.limits = l;
  }
  return { ok: true, request };
}
