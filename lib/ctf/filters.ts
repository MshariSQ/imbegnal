/**
 * Pure list logic for /challenges/: URL state <-> filters, filtering, sorting.
 * No React, no DOM: unit-tested in tests/unit/ctf-filters.test.ts.
 */
import type { ChallengeKind, Difficulty } from "../../shared/challenges";
import type { ChallengeListItem } from "./types";

export type StatusFilter = "all" | "unsolved" | "solved";
export type SortKey = "recommended" | "newest" | "points" | "solves";
export type DifficultyFilter = 0 | Difficulty; // 0 = any
export type KindFilter = "all" | ChallengeKind;

export interface CtfFilters {
  track: string; // roadmap id, "all" for no filter
  difficulty: DifficultyFilter;
  status: StatusFilter;
  kind: KindFilter;
  q: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: CtfFilters = { track: "all", difficulty: 0, status: "all", kind: "all", q: "", sort: "recommended" };

export const SORT_KEYS: readonly SortKey[] = ["recommended", "newest", "points", "solves"];
export const STATUS_FILTERS: readonly StatusFilter[] = ["all", "unsolved", "solved"];
export const KIND_FILTERS: readonly ChallengeKind[] = ["flag", "output", "code"];
export const DIFFICULTIES: readonly Difficulty[] = [1, 2, 3, 4];

/** Anything with a `get`, so URLSearchParams and Next's ReadonlyURLSearchParams both work. */
interface ParamReader {
  get(name: string): string | null;
}

function oneOf<T extends string>(v: string | null, allowed: readonly T[], fallback: T): T {
  return v !== null && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** Lenient: junk values fall back to the default; a track outside `validTracks` becomes "all". */
export function parseFilters(sp: ParamReader, validTracks?: ReadonlySet<string>): CtfFilters {
  const track = sp.get("track") ?? "all";
  const d = Number(sp.get("difficulty"));
  return {
    track: track !== "all" && validTracks && !validTracks.has(track) ? "all" : track,
    difficulty: d === 1 || d === 2 || d === 3 || d === 4 ? d : 0,
    status: oneOf(sp.get("status"), STATUS_FILTERS, "all"),
    kind: oneOf(sp.get("kind"), KIND_FILTERS, "all"),
    q: (sp.get("q") ?? "").slice(0, 80),
    sort: oneOf(sp.get("sort"), SORT_KEYS, "recommended"),
  };
}

/** Query string (no leading "?") containing only non-default values, in a stable order. */
export function filtersToQuery(f: CtfFilters): string {
  const p = new URLSearchParams();
  if (f.track !== "all") p.set("track", f.track);
  if (f.difficulty) p.set("difficulty", String(f.difficulty));
  if (f.status !== "all") p.set("status", f.status);
  if (f.kind !== "all") p.set("kind", f.kind);
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.sort !== "recommended") p.set("sort", f.sort);
  return p.toString();
}

/** True when any narrowing filter (everything except the sort order) is set. */
export function hasActiveFilters(f: CtfFilters): boolean {
  return filtersToQuery({ ...f, sort: "recommended" }) !== "";
}

/** Lowercase, drop Arabic diacritics/tatweel and unify alef/ya/ta-marbuta forms so Arabic search is forgiving. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

export interface FilterContext {
  lang: "en" | "ar";
  /** ids the viewer has solved */
  solved: ReadonlySet<string>;
  /** localized track title for text search (so searching "security" finds a track by its name) */
  trackTitle: (trackId: string) => string;
}

/** Title, summary, topic, tags and track name in the current language; every word must match. */
export function matchesQuery(item: ChallengeListItem, q: string, ctx: Pick<FilterContext, "lang" | "trackTitle">): boolean {
  const needle = normalizeText(q);
  if (!needle) return true;
  const hay = normalizeText(
    [item.title[ctx.lang], item.summary[ctx.lang], item.topic.replace(/-/g, " "), item.tags.join(" "), ctx.trackTitle(item.track)].join(" \n ")
  );
  return needle.split(/\s+/).every((w) => hay.includes(w));
}

export function filterItems(items: readonly ChallengeListItem[], f: CtfFilters, ctx: FilterContext): ChallengeListItem[] {
  return items.filter((c) => {
    if (f.track !== "all" && c.track !== f.track) return false;
    if (f.difficulty && c.difficulty !== f.difficulty) return false;
    if (f.kind !== "all" && c.kind !== f.kind) return false;
    if (f.status === "solved" && !ctx.solved.has(c.id)) return false;
    if (f.status === "unsolved" && ctx.solved.has(c.id)) return false;
    return matchesQuery(c, f.q, ctx);
  });
}

/** Recommended order: easier first, then cheaper (a learning ramp), then registry order. */
export function compareRecommended(a: ChallengeListItem, b: ChallengeListItem): number {
  return a.difficulty - b.difficulty || a.points - b.points || a.order - b.order;
}

export function sortItems(
  items: readonly ChallengeListItem[],
  sort: SortKey,
  solvesOf: (id: string) => number
): ChallengeListItem[] {
  const out = [...items];
  switch (sort) {
    case "newest":
      out.sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? "") || b.order - a.order);
      break;
    case "points":
      out.sort((a, b) => b.points - a.points || compareRecommended(a, b));
      break;
    case "solves":
      out.sort((a, b) => solvesOf(b.id) - solvesOf(a.id) || compareRecommended(a, b));
      break;
    default:
      out.sort(compareRecommended);
  }
  return out;
}

/** Same-track challenges first (same topic, then nearest difficulty), then the rest; never the current one. */
export function relatedItems(items: readonly ChallengeListItem[], current: ChallengeListItem, limit: number): ChallengeListItem[] {
  const rank = (c: ChallengeListItem) => [
    c.track === current.track ? 0 : 1,
    c.topic === current.topic ? 0 : 1,
    Math.abs(c.difficulty - current.difficulty),
  ];
  return items
    .filter((c) => c.id !== current.id)
    .sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] - rb[i];
      return compareRecommended(a, b);
    })
    .slice(0, limit);
}
