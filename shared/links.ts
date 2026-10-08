/**
 * URL contract for the new surfaces. EVERY producer (lessons, course pages,
 * challenges, dashboard) builds links with these helpers and Code Lab parses
 * them with `parseCodeLabQuery`, so formats cannot drift. Pure; no imports
 * except types. Paths end with "/" (the site uses trailingSlash).
 */
import type { LangId } from "./languages";
import { parseLangId } from "./languages";

export type CodeLabIntent =
  | { kind: "blank"; lang?: LangId }
  /** A graded `lab` section of a lesson: `${track}/${lesson}/${exerciseId}` */
  | { kind: "exercise"; ref: string; lang?: LangId }
  /** A code-demo or in-lesson exercise section: starter code only, no server grading. */
  | { kind: "demo"; track: string; lesson: string; section: number }
  | { kind: "challenge"; id: string; lang?: LangId }
  /** Fork an existing read-only snippet into the editor. */
  | { kind: "snippet"; id: string };

export function codeLabHref(intent: CodeLabIntent): string {
  const q = new URLSearchParams();
  switch (intent.kind) {
    case "blank":
      if (intent.lang) q.set("lang", intent.lang);
      break;
    case "exercise":
      q.set("ex", intent.ref);
      if (intent.lang) q.set("lang", intent.lang);
      break;
    case "demo":
      q.set("demo", `${intent.track}/${intent.lesson}/${intent.section}`);
      break;
    case "challenge":
      q.set("ch", intent.id);
      if (intent.lang) q.set("lang", intent.lang);
      break;
    case "snippet":
      q.set("fork", intent.id);
      break;
  }
  const s = q.toString();
  return `/code-lab/${s ? `?${s}` : ""}`;
}

export function parseCodeLabQuery(q: URLSearchParams): CodeLabIntent {
  const lang = parseLangId(q.get("lang")) ?? undefined;
  const ex = q.get("ex");
  if (ex && /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/.test(ex)) return { kind: "exercise", ref: ex, lang };
  const demo = q.get("demo")?.match(/^([a-z0-9-]+)\/([a-z0-9-]+)\/(\d{1,3})$/);
  if (demo) return { kind: "demo", track: demo[1], lesson: demo[2], section: Number(demo[3]) };
  const ch = q.get("ch");
  if (ch && /^[a-z0-9-]+$/.test(ch)) return { kind: "challenge", id: ch, lang };
  const fork = q.get("fork");
  if (fork && /^[A-Za-z0-9_-]{6,40}$/.test(fork)) return { kind: "snippet", id: fork };
  return { kind: "blank", lang };
}

export const snippetHref = (id: string) => `/code-lab/s/?id=${encodeURIComponent(id)}`;
export const challengeHref = (id: string) => `/challenges/${id}/`;
export const challengesHref = (track?: string) => `/challenges/${track ? `?track=${encodeURIComponent(track)}` : ""}`;
export const courseHref = (track: string) => `/learn/${track}/`;
export const lessonHref = (track: string, lesson: string) => `/learn/${track}/${lesson}/`;
export const leaderboardHref = (track?: string) => `/challenges/leaderboard/${track ? `?track=${encodeURIComponent(track)}` : ""}`;
