/**
 * Resolves a deep-link intent into the lab context (what the task panel
 * shows) and the starting editor state. Data comes from `sources.ts` (lessons,
 * challenges) and the snippet API; everything is validated here so the
 * component only deals with a small, typed result.
 */
import type { CodeLabIntent } from "../../shared/links";
import type { ChallengeMeta } from "../../shared/challenges";
import type { LangId } from "../../shared/languages";
import type { L10n, LabExerciseSection } from "../../data/lessons/types";
import { LabApiError } from "./api-error";
import { fetchSnippet } from "./api";
import { challengeStart, findDemoSection, findLabSection, splitExerciseRef, type ChallengeStart } from "./intent";
import { getLabLanguage, type LabLangId } from "./langs";
import { loadLabChallenge, loadLabLesson } from "./sources";

export type LabContext =
  | { kind: "free" }
  | {
      kind: "exercise";
      ref: string;
      track: string;
      lessonId: string;
      lessonTitle: L10n;
      section: LabExerciseSection;
      /** Next lesson of the course, when there is one. */
      next: { track: string; lesson: string } | null;
    }
  | { kind: "demo"; ref: string; track: string; lessonId: string; lessonTitle: L10n }
  | { kind: "challenge"; meta: ChallengeMeta; start: ChallengeStart }
  | { kind: "snippet"; id: string };

export interface Start {
  lang: LabLangId;
  code: string;
  stdin: string;
}

export type Resolved =
  | { status: "ready"; ctx: LabContext; start: Start | null; allowed?: LabLangId[] }
  | { status: "notfound"; kind: "exercise" | "demo" | "challenge" | "snippet" };

export async function resolveContext(intent: CodeLabIntent, signal?: AbortSignal): Promise<Resolved> {
  switch (intent.kind) {
    case "blank":
      return {
        status: "ready",
        ctx: { kind: "free" },
        start: intent.lang ? { lang: intent.lang, code: getLabLanguage(intent.lang).hello, stdin: "" } : null,
      };

    case "exercise": {
      const ref = splitExerciseRef(intent.ref);
      if (!ref) return { status: "notfound", kind: "exercise" };
      const lesson = await loadLabLesson(ref.track, ref.lesson);
      const section = lesson ? findLabSection(lesson, ref.exercise) : null;
      if (!lesson || !section) return { status: "notfound", kind: "exercise" };
      const { neighbors } = await import("../catalog");
      const next = neighbors(ref.track, ref.lesson).next;
      return {
        status: "ready",
        ctx: {
          kind: "exercise",
          ref: intent.ref,
          track: ref.track,
          lessonId: ref.lesson,
          lessonTitle: lesson.title,
          section,
          next: next ? { track: next.trackId, lesson: next.lessonId } : null,
        },
        start: { lang: section.lang, code: section.starterCode, stdin: section.sampleInput ?? "" },
      };
    }

    case "demo": {
      const lesson = await loadLabLesson(intent.track, intent.lesson);
      const demo = lesson ? findDemoSection(lesson, intent.section) : null;
      if (!lesson || !demo) return { status: "notfound", kind: "demo" };
      return {
        status: "ready",
        ctx: { kind: "demo", ref: `${intent.track}/${intent.lesson}/${intent.section}`, track: intent.track, lessonId: intent.lesson, lessonTitle: lesson.title },
        start: { lang: demo.lang, code: demo.code, stdin: "" },
      };
    }

    case "challenge": {
      const meta = await loadLabChallenge(intent.id);
      if (!meta) return { status: "notfound", kind: "challenge" };
      const start = challengeStart(meta, intent.lang as LangId | undefined);
      return { status: "ready", ctx: { kind: "challenge", meta, start }, start: { lang: start.lang, code: start.code, stdin: start.stdin }, allowed: start.allowed };
    }

    case "snippet": {
      try {
        const s = await fetchSnippet(intent.id, signal);
        return { status: "ready", ctx: { kind: "snippet", id: intent.id }, start: { lang: s.lang, code: s.code, stdin: s.stdin } };
      } catch (err) {
        if (err instanceof LabApiError && (err.status === 404 || err.code === "not_found")) return { status: "notfound", kind: "snippet" };
        throw err;
      }
    }
  }
}
