/**
 * Course catalog — derived from the existing roadmap + lesson data so there is
 * one source of truth. A "course" is a roadmap track; its "modules" are the
 * roadmap's status groups (foundations → core → advanced); its "lessons" are
 * the topic nodes that have an interactive lesson.
 *
 * `roadmaps[]` (data/roadmaps.ts) is the ONLY place a track's name, icon and
 * accent live: every title shown anywhere goes through `trackTitle` /
 * `trackMeta` below. Curriculum metadata (objectives, hours, assessment,
 * badges…) lives in data/curricula.ts, keyed by the same ids.
 *
 * This module is light (no lesson bodies, no challenge registry) and safe to
 * import client-side. Server-only helpers that read lesson bodies or the
 * challenge registry are in lib/catalog-server.ts and call the pure resolvers
 * exported here.
 */
import { roadmaps, type Roadmap } from "@/data/roadmaps";
import { NODE_DATA, type RoadmapNodeInfo } from "@/data/roadmap-nodes";
import { hasLesson } from "@/data/lessons";
import { curricula, type Badge, type BadgeRule, type Curriculum } from "@/data/curricula";
import type { L10n, LessonSection, RunnerLang } from "@/data/lessons/types";
import type { ChallengeMeta } from "@/shared/challenges";
import type { LangId } from "@/shared/languages";
import { codeLabHref, challengeHref } from "@/shared/links";

export type ModuleKey = RoadmapNodeInfo["status"];
export const MODULE_ORDER: ModuleKey[] = ["required", "important", "optional"];

export interface CourseLessonRef {
  trackId: string;
  lessonId: string;
  label: string; // English topic label (localized title lives in the lesson file)
  module: ModuleKey;
}

export interface Course {
  id: string;
  roadmap: Roadmap;
  lessons: CourseLessonRef[]; // in study order (module order, then roadmap order)
}

function buildCourse(r: Roadmap): Course {
  const nodes = NODE_DATA[r.id] ?? [];
  const lessons = MODULE_ORDER.flatMap((m) =>
    nodes
      .filter((n) => n.status === m && hasLesson(r.id, n.id))
      .map((n) => ({ trackId: r.id, lessonId: n.id, label: n.label, module: m }))
  );
  return { id: r.id, roadmap: r, lessons };
}

export const courses: Course[] = roadmaps.map(buildCourse).filter((c) => c.lessons.length > 0);

export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export const lessonKey = (trackId: string, lessonId: string) => `${trackId}/${lessonId}`;

export function lessonHref(trackId: string, lessonId: string) {
  return `/learn/${trackId}/${lessonId}/`;
}

/** Previous/next lesson in a course's study order. */
export function neighbors(trackId: string, lessonId: string) {
  const course = getCourse(trackId);
  const i = course?.lessons.findIndex((l) => l.lessonId === lessonId) ?? -1;
  return {
    prev: i > 0 ? course!.lessons[i - 1] : null,
    next: course && i >= 0 && i < course.lessons.length - 1 ? course.lessons[i + 1] : null,
    index: i,
    total: course?.lessons.length ?? 0,
  };
}

// ── Canonical track names ────────────────────────────────────────────────────

export interface TrackMeta {
  id: string;
  title: L10n;
  description: L10n;
  icon: string;
  accent: string;
  level: Roadmap["level"];
  duration: string;
  jobs: string[];
}

const byId = (list: readonly Roadmap[], id: string) => list.find((r) => r.id === id);

/**
 * Display data of a track, from the roadmap (English, icon, accent, level) plus
 * the Arabic rendering kept with its curriculum. `source` defaults to the real
 * `roadmaps[]`; tests pass a modified copy to prove a rename propagates.
 * Unknown ids return null.
 */
export function trackMeta(id: string, source: readonly Roadmap[] = roadmaps): TrackMeta | null {
  const r = byId(source, id);
  if (!r) return null;
  const ar = curricula[id]?.arabic;
  return {
    id,
    title: { en: r.title, ar: ar?.title ?? r.title },
    description: { en: r.description, ar: ar?.description ?? r.description },
    icon: r.icon,
    accent: r.accent,
    level: r.level,
    duration: r.duration,
    jobs: r.jobs,
  };
}

/** Localized title of a track (falls back to the id for unknown tracks). */
export function trackTitle(id: string, lang: keyof L10n = "en", source: readonly Roadmap[] = roadmaps): string {
  return trackMeta(id, source)?.title[lang] ?? id;
}

export function trackDescription(id: string, lang: keyof L10n = "en", source: readonly Roadmap[] = roadmaps): string {
  return trackMeta(id, source)?.description[lang] ?? "";
}

export function getCurriculum(id: string): Curriculum | undefined {
  return curricula[id];
}

// ── Course outline + progress (client-safe shapes) ───────────────────────────

/** A graded `lab` section as shown on course and lesson pages. */
export interface PracticeLab {
  kind: "lab";
  /** `${track}/${lesson}/${exerciseId}` */
  ref: string;
  id: string;
  lang: LangId;
  /** Index of the section in the lesson (for deep links to `#sec-<n>`). */
  section: number;
  href: string;
}

/** A runnable code-demo / exercise block that can open in Code Lab. */
export interface PracticeDemo {
  kind: "demo";
  section: number;
  lang: LangId | "web";
  /** "exercise" for in-browser graded exercises, "demo" for code-demo blocks. */
  source: "demo" | "exercise";
  href: string;
}

/** Challenge card data (public metadata only: never the description or files). */
export interface PracticeChallenge {
  kind: "challenge";
  id: string;
  title: L10n;
  track: string;
  topic: string;
  difficulty: ChallengeMeta["difficulty"];
  points: number;
  estMinutes: number;
  href: string;
}

export interface PracticeBlank {
  kind: "blank";
  lang: LangId;
  href: string;
}

export interface LessonPractice {
  labs: PracticeLab[];
  demos: PracticeDemo[];
  challenges: PracticeChallenge[];
  /** Blank Code Lab in the lesson's language; always present unless other practice exists and the curriculum opts out. */
  blank: PracticeBlank | null;
}

/** Number of distinct practice links of a lesson (≥ 1 for every lesson: tested). */
export function practiceCount(p: LessonPractice): number {
  return p.labs.length + p.demos.length + p.challenges.length + (p.blank ? 1 : 0);
}

/** One lesson of a course with everything the course page needs (built on the server). */
export interface CourseLesson {
  lessonId: string;
  title: L10n;
  minutes: number;
  module: ModuleKey;
  exercises: number;
  quizzes: number;
  description: string;
  practice: LessonPractice;
}

const RUNNER_TO_LANG = { js: "javascript", python: "python", web: "web" } as const satisfies Record<RunnerLang, LangId | "web">;

/** Language of a browser-runner section: a Code Lab language, or "web" for HTML/CSS pages. */
export function runnerLangToLang(lang: RunnerLang): LangId | "web" {
  return RUNNER_TO_LANG[lang];
}

function compareChallenges(a: ChallengeMeta, b: ChallengeMeta): number {
  return a.difficulty - b.difficulty || a.points - b.points || a.id.localeCompare(b.id);
}

function toPracticeChallenge(c: ChallengeMeta): PracticeChallenge {
  return {
    kind: "challenge",
    id: c.id,
    title: c.title,
    track: c.track,
    topic: c.topic,
    difficulty: c.difficulty,
    points: c.points,
    estMinutes: c.estMinutes,
    href: challengeHref(c.id),
  };
}

/**
 * Challenges worth doing for a track or one of its lessons. Pure: the caller
 * passes the public registry (an empty registry yields an empty list).
 *
 * Lesson scope: challenges that list the lesson in `lessons`, plus the ids the
 * curriculum names for it. Track scope: every challenge of the track, those tied
 * to a lesson of the track first. Easier first within a group.
 */
export function pickChallenges(
  registry: readonly ChallengeMeta[],
  trackId: string,
  lessonId?: string,
  limit = Infinity
): PracticeChallenge[] {
  const key = lessonId ? lessonKey(trackId, lessonId) : null;
  const named = new Set(lessonId ? (curricula[trackId]?.lessonLinks?.[lessonId]?.challenges ?? []) : []);
  const own = registry.filter((c) => c.track === trackId);
  const pool = key
    ? registry.filter((c) => c.lessons?.includes(key) || named.has(c.id))
    : own;
  const linked = (c: ChallengeMeta) => (c.lessons ?? []).some((k) => k.startsWith(`${trackId}/`));
  const sorted = [...pool].sort((a, b) => Number(linked(b)) - Number(linked(a)) || compareChallenges(a, b));
  return sorted.slice(0, limit).map(toPracticeChallenge);
}

/**
 * What a learner can practice for a lesson, from its sections and the public
 * challenge registry. Pure so it runs in the unit tests for every lesson.
 *
 * GUARANTEE: at least one link. The blank Code Lab (in the lesson's language,
 * `lessonLinks[lesson].lang ?? primaryLang`) is offered unless the curriculum
 * opts out with `lab: false` AND the lesson already has other practice.
 */
export function resolvePractice(
  trackId: string,
  lessonId: string,
  sections: readonly LessonSection[],
  registry: readonly ChallengeMeta[]
): LessonPractice {
  const cur = curricula[trackId];
  const link = cur?.lessonLinks?.[lessonId];
  const labs: PracticeLab[] = [];
  const demos: PracticeDemo[] = [];
  sections.forEach((s, i) => {
    if (s.type === "lab") {
      const ref = `${trackId}/${lessonId}/${s.id}`;
      labs.push({ kind: "lab", ref, id: s.id, lang: s.lang, section: i, href: codeLabHref({ kind: "exercise", ref }) });
    } else if (s.type === "exercise" || (s.type === "code-demo" && s.runnable !== false)) {
      demos.push({
        kind: "demo",
        section: i,
        lang: runnerLangToLang(s.lang),
        source: s.type === "exercise" ? "exercise" : "demo",
        href: codeLabHref({ kind: "demo", track: trackId, lesson: lessonId, section: i }),
      });
    }
  });
  const challenges = pickChallenges(registry, trackId, lessonId, 4);
  const hasOther = labs.length + demos.length + challenges.length > 0;
  const lang: LangId = link?.lang ?? cur?.primaryLang ?? "python";
  const blank: PracticeBlank | null =
    link?.lab === false && hasOther ? null : { kind: "blank", lang, href: codeLabHref({ kind: "blank", lang }) };
  return { labs, demos, challenges, blank };
}

export interface ProgressInput {
  /** Study-store lessons, keyed `track/lesson`. */
  lessons: Readonly<Record<string, { done?: number; quiz?: number } | undefined>>;
  /** Passed lab refs (lib/lab-progress). */
  labs: Readonly<Record<string, number>>;
}

export interface CourseStats {
  total: number;
  done: number;
  byModule: Record<ModuleKey, { total: number; done: number }>;
  /** Lessons that contain a quiz (only these can contribute quiz accuracy). */
  quizLessons: number;
  labsTotal: number;
  labsPassed: number;
  /** Quiz accuracy (0..1) per completed-quiz lesson. */
  quizScores: number[];
}

/** Aggregates local progress for one course. Pure. */
export function courseStats(trackId: string, lessons: readonly CourseLesson[], progress: ProgressInput): CourseStats {
  const byModule = { required: { total: 0, done: 0 }, important: { total: 0, done: 0 }, optional: { total: 0, done: 0 } };
  let done = 0;
  let quizLessons = 0;
  let labsTotal = 0;
  let labsPassed = 0;
  const quizScores: number[] = [];
  for (const l of lessons) {
    const rec = progress.lessons[lessonKey(trackId, l.lessonId)];
    const isDone = !!rec?.done;
    byModule[l.module].total++;
    if (isDone) {
      done++;
      byModule[l.module].done++;
    }
    if (l.quizzes > 0) quizLessons++;
    if (typeof rec?.quiz === "number") quizScores.push(rec.quiz);
    for (const lab of l.practice.labs) {
      labsTotal++;
      if (progress.labs[lab.ref]) labsPassed++;
    }
  }
  return { total: lessons.length, done, byModule, quizLessons, labsTotal, labsPassed, quizScores };
}

export interface BadgeState {
  badge: Badge;
  /** False when the track cannot offer what the rule needs (e.g. a lab badge on a track without labs). */
  available: boolean;
  earned: boolean;
  have: number;
  need: number;
}

/** Deterministic badge evaluation from local progress. Counts are capped at what the track offers. */
export function evaluateBadge(badge: Badge, s: CourseStats): BadgeState {
  const rule: BadgeRule = badge.rule;
  let have = 0;
  let need = 0;
  switch (rule.kind) {
    case "lessons":
      need = Math.min(rule.count, s.total);
      have = Math.min(s.done, need);
      break;
    case "module":
      need = s.byModule[rule.module].total;
      have = s.byModule[rule.module].done;
      break;
    case "labs":
      need = Math.min(rule.count, s.labsTotal);
      have = Math.min(s.labsPassed, need);
      break;
    case "quizzes":
      need = Math.min(rule.count, s.quizLessons);
      have = Math.min(s.quizScores.filter((q) => q >= rule.min).length, need);
      break;
    case "course":
      need = s.total;
      have = s.done;
      break;
  }
  const available = need > 0;
  return { badge, available, earned: available && have >= need, have, need };
}

export function evaluateBadges(trackId: string, s: CourseStats): BadgeState[] {
  return (curricula[trackId]?.badges ?? []).map((b) => evaluateBadge(b, s)).filter((b) => b.available);
}

/** Certificate readiness: 100% of the lessons. */
export const certificateReady = (s: CourseStats) => s.total > 0 && s.done === s.total;
