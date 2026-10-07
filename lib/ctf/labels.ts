/**
 * Display labels resolved at render time from the dictionaries, so nothing
 * localized is ever copied into challenge data.
 */
import type { Difficulty } from "../../shared/challenges";
import type { Tx } from "../i18n";

/** Localized track (roadmap) title; falls back to the roadmap's own English title, then the id. */
export function trackTitle(tx: Tx, id: string, fallback?: string): string {
  return tx.tracks[id]?.title ?? fallback ?? id;
}

/** "crypto" -> "Crypto" (or its Arabic label); unknown topics are humanized ("reverse-shells" -> "Reverse shells"). */
export function topicLabel(tx: Tx, topic: string): string {
  const known = tx.ctf.topics[topic];
  if (known) return known;
  const s = topic.replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const DIFFICULTY_KEYS = ["easy", "medium", "hard", "insane"] as const;

export function difficultyLabel(tx: Tx, d: Difficulty): string {
  return tx.ctf.difficulty[DIFFICULTY_KEYS[d - 1]];
}
