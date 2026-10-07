/**
 * Pure formatting helpers for Code Lab output: durations, relative times,
 * output truncation, placeholders. No React, no browser globals, so they run
 * under node:test.
 */
import type { RunStatus } from "../../shared/protocol";

/** Replaces `{name}` placeholders. Unknown placeholders are left in place. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** BCP-47 locale for Intl with Latin digits (the site shows Western digits in Arabic too). */
export function intlLocale(lang: "en" | "ar"): string {
  return lang === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-US";
}

export interface DurationLabels {
  ms: string; // "{n} ms"
  sec: string; // "{n} s"
}

/** 420 -> "420 ms", 1300 -> "1.3 s", 12000 -> "12 s". */
export function formatDuration(ms: number, labels: DurationLabels): string {
  const v = Math.max(0, Math.round(ms));
  if (v < 1000) return fill(labels.ms, { n: v });
  const s = v / 1000;
  return fill(labels.sec, { n: s >= 10 ? Math.round(s) : Math.round(s * 10) / 10 });
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round((n / 1024) * 10) / 10} KiB`;
  return `${Math.round((n / (1024 * 1024)) * 10) / 10} MiB`;
}

/** "3 minutes ago" / "just now" using Intl.RelativeTimeFormat. */
export function timeAgo(at: number, now: number, locale: string, justNow: string): string {
  const diff = Math.round((at - now) / 1000); // negative = past
  const abs = Math.abs(diff);
  if (abs < 45) return justNow;
  let rtf: Intl.RelativeTimeFormat;
  try {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  } catch {
    rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  }
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86_400 * 30) return rtf.format(Math.round(diff / 86_400), "day");
  if (abs < 86_400 * 365) return rtf.format(Math.round(diff / (86_400 * 30)), "month");
  return rtf.format(Math.round(diff / (86_400 * 365)), "year");
}

/**
 * Local clock time of a quota reset: "03:00" when it is today or tomorrow's
 * early hours, with the weekday/date added when it is further away.
 */
export function formatResetTime(iso: string, now: number, locale: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(t);
  const sameDay = new Date(t).toDateString() === new Date(now).toDateString();
  if (sameDay || t - now < 20 * 3600 * 1000) return time;
  return `${new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(t)}, ${time}`;
}

export function formatDate(iso: string, locale: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(t);
}

export interface Truncated {
  text: string;
  /** Characters kept. */
  shown: number;
  /** Characters in the original. */
  total: number;
  truncated: boolean;
}

/**
 * Caps text for display. Cuts on a line boundary when one is near the limit so
 * the last visible line is not half a line; never splits a surrogate pair.
 */
export function truncateForDisplay(text: string, maxChars: number): Truncated {
  const total = text.length;
  if (total <= maxChars) return { text, shown: total, total, truncated: false };
  let end = maxChars;
  const nl = text.lastIndexOf("\n", end);
  if (nl > end - 200 && nl > 0) end = nl;
  const code = text.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) end -= 1; // high surrogate left dangling
  return { text: text.slice(0, end), shown: end, total, truncated: true };
}

/** Compact "12,345" style used for character counts. */
export function formatCount(n: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(n);
}

export type StatusTone = "ok" | "error" | "warn";

export function statusTone(status: RunStatus): StatusTone {
  switch (status) {
    case "ok":
      return "ok";
    case "timeout":
    case "memory_limit":
    case "output_limit":
    case "unsupported":
      return "warn";
    default:
      return "error";
  }
}

/** Whole seconds until `untilMs` (never negative). */
export function secondsUntil(untilMs: number, now: number): number {
  return Math.max(0, Math.ceil((untilMs - now) / 1000));
}

/** Strips ANSI colour escapes some toolchains emit even without a TTY. */
export function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "");
}
