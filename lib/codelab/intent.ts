/**
 * Turns a deep-link intent (shared/links.ts `parseCodeLabQuery`) plus the data
 * it points at (a lesson, a challenge) into what the editor should start with.
 * Pure: loading the lesson/challenge happens in the component.
 */
import type { CodeLabIntent } from "../../shared/links";
import type { ChallengeMeta } from "../../shared/challenges";
import { LANG_IDS, type LangId } from "../../shared/languages";
import type { CodeDemoSection, ExerciseSection, L10n, Lesson, LabExerciseSection } from "../../data/lessons/types";
import { fromRunnerLang, getLabLanguage, type LabLangId } from "./langs";

/** Stable string for an intent, usable as an effect dependency. */
export function intentKey(intent: CodeLabIntent): string {
  switch (intent.kind) {
    case "blank":
      return `blank:${intent.lang ?? ""}`;
    case "exercise":
      return `ex:${intent.ref}:${intent.lang ?? ""}`;
    case "demo":
      return `demo:${intent.track}/${intent.lesson}/${intent.section}`;
    case "challenge":
      return `ch:${intent.id}:${intent.lang ?? ""}`;
    case "snippet":
      return `fork:${intent.id}`;
  }
}

export interface ExerciseRef {
  track: string;
  lesson: string;
  exercise: string;
}

export function splitExerciseRef(ref: string): ExerciseRef | null {
  const m = ref.match(/^([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
  return m ? { track: m[1], lesson: m[2], exercise: m[3] } : null;
}

/** The `lab` section with this id, or null. */
export function findLabSection(lesson: Lesson, exerciseId: string): LabExerciseSection | null {
  for (const s of lesson.sections) if (s.type === "lab" && s.id === exerciseId) return s;
  return null;
}

export interface DemoStart {
  lang: LabLangId;
  code: string;
}

/** Starter code of the code-demo / exercise section at `index` (0-based, as in the lesson's `sections`). */
export function findDemoSection(lesson: Lesson, index: number): DemoStart | null {
  const s = lesson.sections[index];
  if (!s) return null;
  if (s.type === "code-demo") return { lang: fromRunnerLang((s as CodeDemoSection).lang), code: (s as CodeDemoSection).code };
  if (s.type === "exercise") return { lang: fromRunnerLang((s as ExerciseSection).lang), code: (s as ExerciseSection).starterCode };
  return null;
}

export interface ChallengeStart {
  lang: LangId;
  code: string;
  stdin: string;
  /** Languages the selector offers. */
  allowed: LangId[];
  /** Whether Code Lab offers a "Submit solution" action. */
  submittable: boolean;
}

/**
 * Starting state for a code/output challenge: the requested language when the
 * challenge allows it, else its default, else the first language with starter code.
 */
export function challengeStart(meta: ChallengeMeta, requested?: LangId): ChallengeStart {
  const allowed = meta.allowedLangs && meta.allowedLangs.length > 0 ? meta.allowedLangs : [...LANG_IDS];
  const starterLangs = Object.keys(meta.starterCode ?? {}) as LangId[];
  const candidates: (LangId | undefined)[] = [requested, meta.lang, ...starterLangs, allowed[0]];
  const lang = candidates.find((l): l is LangId => !!l && allowed.includes(l)) ?? allowed[0];
  const code = meta.starterCode?.[lang] ?? getLabLanguage(lang).hello;
  return { lang, code, stdin: meta.sampleInput ?? "", allowed, submittable: meta.kind === "code" || meta.kind === "output" };
}

export const l10n = (t: L10n, lang: "en" | "ar") => t[lang];
