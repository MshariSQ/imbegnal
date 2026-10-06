/**
 * View-model types for the Challenges UI. The list and detail pages receive
 * these slim shapes from their server components so the (large) statements,
 * files and hints of every challenge never ship with the list page.
 */
import type { ChallengeKind, ChallengeMeta, Difficulty, L10nText } from "../../shared/challenges";

export interface ChallengeListItem {
  id: string;
  track: string;
  topic: string;
  title: L10nText;
  summary: L10nText;
  difficulty: Difficulty;
  points: number;
  estMinutes: number;
  kind: ChallengeKind;
  tags: string[];
  /** ISO date the challenge was added, when the author provided it. */
  addedAt?: string;
  /** Position in the registry; later entries are newer when `addedAt` is missing. */
  order: number;
}

/** A roadmap that has at least one challenge (title is the English fallback; localized at render). */
export interface TrackInfo {
  id: string;
  title: string;
  icon: string;
  accent: string;
}

export function toListItem(meta: ChallengeMeta, order: number): ChallengeListItem {
  return {
    id: meta.id,
    track: meta.track,
    topic: meta.topic,
    title: meta.title,
    summary: meta.summary,
    difficulty: meta.difficulty,
    points: meta.points,
    estMinutes: meta.estMinutes,
    kind: meta.kind,
    tags: meta.tags ?? [],
    addedAt: meta.addedAt,
    order,
  };
}

export function toListItems(challenges: readonly ChallengeMeta[]): ChallengeListItem[] {
  return challenges.map(toListItem);
}

/** Roadmaps (in canonical roadmap order) that own at least one of the given challenges. */
export function tracksWithChallenges(
  items: readonly { track: string }[],
  roadmaps: readonly { id: string; title: string; icon: string; accent: string }[]
): TrackInfo[] {
  const used = new Set(items.map((i) => i.track));
  return roadmaps.filter((r) => used.has(r.id)).map((r) => ({ id: r.id, title: r.title, icon: r.icon, accent: r.accent }));
}
