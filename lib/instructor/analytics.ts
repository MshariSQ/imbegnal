/**
 * Pure helpers for the instructor dashboard (`/instructor/`): ordering, grouping, reference parsing and
 * number formatting for the `InstructorAnalytics` payload (shared/api.ts). No React, no browser globals.
 *
 * Semantics worth knowing (worker/src/instructor/analytics.ts): `runs`, `exercises` and `challenges` cover the
 * last `days`; `tracks` come from synced study state and are NOT limited to the period.
 */
import type { ExerciseAnalytics, InstructorAnalytics } from "../../shared/api";
import { intlLocale } from "../codelab/format";

export const PERIODS = [7, 30, 90] as const;
export type Period = (typeof PERIODS)[number];
export const DEFAULT_PERIOD: Period = 30;

type Lang = "en" | "ar";

// ── ordering ─────────────────────────────────────────────────────────────────

/** Hardest first: lowest pass rate, then the most attempts (more evidence), then the ref for a stable order. Pure. */
export function sortExercisesByPassRate(list: readonly ExerciseAnalytics[]): ExerciseAnalytics[] {
  return [...list].sort((a, b) => a.passRate - b.passRate || b.attempts - a.attempts || (a.exercise < b.exercise ? -1 : a.exercise > b.exercise ? 1 : 0));
}

type Challenge = InstructorAnalytics["challenges"][number];

/**
 * Challenges that saw activity, most attempts first (then most solves, then id), plus how many had none.
 * The Worker returns every registered challenge, so an idle tail would otherwise bury the interesting rows.
 */
export function activeChallenges(list: readonly Challenge[]): { rows: Challenge[]; idle: number } {
  const rows = list
    .filter((c) => c.attempts > 0 || c.solves > 0)
    .sort((a, b) => b.attempts - a.attempts || b.solves - a.solves || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { rows, idle: list.length - rows.length };
}

// ── totals ───────────────────────────────────────────────────────────────────

/** Share of runs that succeeded, 0..1; null when there were no runs (so the UI shows a dash, not 0%). */
export function successRate(runs: Pick<InstructorAnalytics["runs"], "total" | "success">): number | null {
  return runs.total > 0 ? Math.min(1, Math.max(0, runs.success / runs.total)) : null;
}

export const totalChallengeSolves = (list: readonly Challenge[]) => list.reduce((n, c) => n + c.solves, 0);

/** Completed (learner, course) pairs. Exact: unlike learners, completions never double count across tracks. */
export const totalCompletions = (tracks: InstructorAnalytics["tracks"]) => tracks.reduce((n, t) => n + t.completed, 0);

// ── bar lists ────────────────────────────────────────────────────────────────

export interface BarRow {
  key: string;
  count: number;
  /** count / total, 0..1 */
  share: number;
}

/** Largest first (ties by key); junk (non-finite, zero, negative) is dropped. Shares add up to 1. */
export function barRows(counts: Readonly<Record<string, number>>): BarRow[] {
  const entries = Object.entries(counts).filter(([, n]) => Number.isFinite(n) && n > 0);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  return entries
    .map(([key, count]) => ({ key, count, share: count / total }))
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/** The `limit` most frequent failure reasons of an exercise. */
export function topFailures(failures: Readonly<Record<string, number>>, limit = 3): BarRow[] {
  return barRows(failures).slice(0, limit);
}

// ── exercise references ──────────────────────────────────────────────────────

export type ExerciseRef =
  | { kind: "lesson"; track: string; lesson: string; exercise: string }
  | { kind: "challenge"; id: string }
  | { kind: "other"; ref: string };

/** "track/lesson/exerciseId" or "challenge:<id>" (see ExerciseAnalytics.exercise); anything else is kept verbatim. */
export function parseExerciseRef(ref: string): ExerciseRef {
  if (ref.startsWith("challenge:") && ref.length > "challenge:".length) return { kind: "challenge", id: ref.slice("challenge:".length) };
  const parts = ref.split("/");
  if (parts.length === 3 && parts.every((p) => p !== "")) return { kind: "lesson", track: parts[0], lesson: parts[1], exercise: parts[2] };
  return { kind: "other", ref };
}

/** "wrong_output" -> "Wrong output": last resort for statuses the dictionary does not know. */
export function humanizeKey(key: string): string {
  const s = key.replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── number formatting ────────────────────────────────────────────────────────

/** Integers with grouping, Latin digits in both languages (the site convention). */
export function formatCount(n: number, lang: Lang): string {
  return new Intl.NumberFormat(intlLocale(lang)).format(Number.isFinite(n) ? n : 0);
}

/** 0.6667 -> "66.7%", 0.5 -> "50%". Non-finite input gives an em dash. */
export function formatPercent(ratio: number | null | undefined, lang: Lang): string {
  if (ratio === null || ratio === undefined || !Number.isFinite(ratio)) return "—";
  return new Intl.NumberFormat(intlLocale(lang), { style: "percent", maximumFractionDigits: 1 }).format(ratio);
}
