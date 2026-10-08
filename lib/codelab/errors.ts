/**
 * Maps API failures and run statuses to localized, actionable messages.
 * Pure: takes the dictionary, locale and clock as inputs.
 */
import { RUNNER_DEFAULTS, type RunStatus } from "../../shared/protocol";
import type { QuotaInfo } from "../../shared/api";
import type { Tx } from "../i18n";
import { LabApiError } from "./api-error";
import { fill, formatResetTime } from "./format";

export type CodelabDict = Tx["codelab"];

export type ProblemKind =
  | "signin"
  | "expired"
  | "quota"
  | "global"
  | "rate"
  | "concurrency"
  | "suspended"
  | "runner"
  | "invalid"
  | "forbidden"
  | "not_found"
  | "network"
  | "python_load"
  | "unknown";

export type ProblemAction = "signin" | "browser" | "pricing" | "retry";

export interface Problem {
  kind: ProblemKind;
  title: string;
  body: string;
  actions: ProblemAction[];
  /** Seconds to wait before retrying (rate/concurrency); the UI counts down. */
  retryAfterSec?: number;
}

export interface ErrorContext {
  tx: CodelabDict;
  locale: string;
  /** Display name of the language being run, for the sign-in prompt. */
  langLabel: string;
  signedIn: boolean;
  /** The language has an in-browser runtime that can replace the server. */
  browserFallback: boolean;
  /** Last quota seen, to decide whether to mention Pro. */
  quota?: QuotaInfo | null;
  now: number;
  /** Concurrent run limit (documented default 2). */
  maxConcurrent?: number;
}

/** Marker thrown by the browser runners when a runtime failed to download. */
export class RuntimeLoadError extends Error {
  constructor(readonly runtime: "python" | "javascript", cause?: unknown) {
    super(`Could not load the ${runtime} runtime`);
    this.name = "RuntimeLoadError";
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause;
  }
}

export function describeError(err: unknown, ctx: ErrorContext): Problem {
  const p = ctx.tx.problems;
  if (err instanceof RuntimeLoadError) {
    return { kind: "python_load", title: p.pythonLoadTitle, body: p.pythonLoadBody, actions: ["retry"] };
  }
  if (!(err instanceof LabApiError)) {
    const detail = err instanceof Error ? err.message : "error";
    return { kind: "unknown", title: p.unknownTitle, body: fill(p.unknownBody, { detail }), actions: ["retry"] };
  }

  const { status, code } = err;
  const browser: ProblemAction[] = ctx.browserFallback ? ["browser"] : [];

  if (status === 0 || code === "network" || code === "timeout") {
    return {
      kind: "network",
      title: p.networkTitle,
      body: code === "timeout" ? p.timeoutBody : p.networkBody,
      actions: ["retry", ...browser],
    };
  }
  if (status === 401 || code === "unauthorized") {
    return ctx.signedIn
      ? { kind: "expired", title: p.expiredTitle, body: p.expiredBody, actions: ["signin"] }
      : {
          kind: "signin",
          title: fill(p.signinTitle, { lang: ctx.langLabel }),
          body: fill(p.signinBody, { lang: ctx.langLabel }),
          actions: ["signin", ...browser],
        };
  }
  if (code === "account_suspended") {
    return { kind: "suspended", title: p.suspendedTitle, body: p.suspendedBody, actions: [] };
  }
  if (status === 403) {
    return { kind: "forbidden", title: p.forbiddenTitle, body: p.forbiddenBody, actions: [] };
  }
  if (status === 404 || code === "not_found") {
    return { kind: "not_found", title: p.notFoundTitle, body: p.notFoundBody, actions: [] };
  }
  if (status === 429 || code === "quota_exceeded" || code === "rate_limited") {
    return describeQuotaError(err, ctx);
  }
  if (status === 503 || code === "runner_unavailable") {
    return {
      kind: "runner",
      title: p.runnerTitle,
      body: ctx.browserFallback ? `${p.runnerBody} ${p.runnerFallbackBody}` : p.runnerBody,
      actions: ["retry", ...browser],
    };
  }
  if (status === 400 || code === "invalid_request") {
    return { kind: "invalid", title: p.invalidTitle, body: p.invalidBody, actions: [] };
  }
  return {
    kind: "unknown",
    title: p.unknownTitle,
    body: fill(p.unknownBody, { detail: `${status} ${code}` }),
    actions: ["retry"],
  };
}

function describeQuotaError(err: LabApiError, ctx: ErrorContext): Problem {
  const p = ctx.tx.problems;
  const b = err.body;
  const browser: ProblemAction[] = ctx.browserFallback ? ["browser"] : [];
  const scope = b?.scope ?? (err.code === "rate_limited" ? "rate" : "user");
  const retry = typeof b?.retryAfterSec === "number" ? Math.max(1, Math.ceil(b.retryAfterSec)) : undefined;
  const reset = b?.resetAt ? fill(p.resetAround, { time: formatResetTime(b.resetAt, ctx.now, ctx.locale) }) : "";

  switch (scope) {
    case "rate":
      return {
        kind: "rate",
        title: p.rateTitle,
        body: p.rateBody,
        actions: ["retry", ...browser],
        retryAfterSec: retry ?? 15,
      };
    case "concurrency":
      return {
        kind: "concurrency",
        title: p.concurrencyTitle,
        body: fill(p.concurrencyBody, { n: ctx.maxConcurrent ?? 2 }),
        actions: ["retry"],
        retryAfterSec: retry ?? 3,
      };
    case "global":
      return {
        kind: "global",
        title: p.quotaGlobalTitle,
        body: fill(p.quotaGlobalBody, { reset: reset || "" }).replace(/\s+\./, "."),
        actions: [...browser],
      };
    default:
      return {
        kind: "quota",
        title: p.quotaUserTitle,
        body: fill(p.quotaUserBody, { reset: reset || "" }).replace(/\s+\./, "."),
        actions: [...browser, ...(ctx.quota?.plan === "pro" ? [] : (["pricing"] as ProblemAction[]))],
      };
  }
}

export interface StatusExplanation {
  label: string;
  /** A teaching sentence, or null when the status needs none (ok). */
  help: string | null;
}

/** Label + a sentence that teaches what the status means and what to look for. */
export function describeRunStatus(
  status: RunStatus,
  tx: CodelabDict,
  opts: {
    browser?: boolean;
    limits?: { runTimeoutMs?: number; memoryMb?: number };
    /** For a browser timeout: the line of the loop the in-page loop guard stopped. */
    line?: number;
  } = {}
): StatusExplanation {
  const label = tx.runStatus[status];
  const seconds = Math.round((opts.limits?.runTimeoutMs ?? RUNNER_DEFAULTS.runTimeoutMs) / 100) / 10;
  const mb = opts.limits?.memoryMb ?? RUNNER_DEFAULTS.memoryMb;
  switch (status) {
    case "ok":
      return { label, help: null };
    case "timeout":
      if (opts.browser && opts.line) return { label, help: fill(tx.runHelp.browserLoop, { seconds, line: opts.line }) };
      return { label, help: fill(opts.browser ? tx.runHelp.browserTimeout : tx.runHelp.timeout, { seconds }) };
    case "memory_limit":
      return { label, help: fill(tx.runHelp.memory_limit, { mb }) };
    case "output_limit":
      return { label, help: opts.browser ? tx.runHelp.browserFlood : tx.runHelp.output_limit };
    default:
      return { label, help: tx.runHelp[status] };
  }
}
