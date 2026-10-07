/**
 * Pure time formatting for challenge cards and stats. `nowMs` is always passed
 * in (never read here) so output is deterministic and render stays hydration-safe.
 */

export type CtfLang = "en" | "ar";

/** Latin digits in Arabic too, like the rest of the site (`-u-nu-latn`). */
const localeFor = (lang: CtfLang) => (lang === "ar" ? "ar-u-nu-latn" : "en");

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 3600_000 },
  { unit: "month", ms: 30 * 24 * 3600_000 },
  { unit: "week", ms: 7 * 24 * 3600_000 },
  { unit: "day", ms: 24 * 3600_000 },
  { unit: "hour", ms: 3600_000 },
  { unit: "minute", ms: 60_000 },
];

/** "2 hours ago" / "قبل ساعتين". Returns "" for an unparsable date. Future dates clamp to "now". */
export function relativeTime(iso: string, nowMs: number, lang: CtfLang): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const rtf = new Intl.RelativeTimeFormat(localeFor(lang), { numeric: "auto" });
  const diff = Math.min(0, t - nowMs); // <= 0
  for (const { unit, ms } of UNITS) {
    if (-diff >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return rtf.format(0, "second");
}

/** Deterministic absolute date (UTC, ISO) used before the clock is available (SSR / first paint). */
export function absoluteDate(iso: string): string {
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : "";
}

export interface DurationUnits {
  /** e.g. "h" / "س" */
  h: string;
  /** e.g. "min" / "د" */
  min: string;
}

/** 45 -> "45 min", 90 -> "1 h 30 min", 120 -> "2 h". Minutes are rounded; <1 shows "1 min". */
export function formatDuration(minutes: number, u: DurationUnits): string {
  const m = Math.max(1, Math.round(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} ${u.min}`;
  return r === 0 ? `${h} ${u.h}` : `${h} ${u.h} ${r} ${u.min}`;
}

/** mm:ss for the rate-limit countdown. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** 1250 -> "1,250" (Latin digits in both languages). */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
