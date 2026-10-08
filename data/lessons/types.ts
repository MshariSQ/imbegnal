import type { MatchMode } from "../../shared/challenges";
import type { LangId } from "../../shared/languages";

export interface L10n {
  en: string;
  ar: string;
}

export type RunnerLang = "web" | "js" | "python";
// "web"    = full HTML document (may include <style>/<script>) rendered in the sandbox
// "js"     = plain JS run in a minimal HTML shell, console output shown
// "python" = run via Pyodide in a Web Worker

export interface TextSection {
  type: "text";
  body: L10n; // markdown subset: headings, bold, inline code, code fences, lists
}

export interface CodeDemoSection {
  type: "code-demo";
  lang: RunnerLang;
  code: string; // code is always English/LTR
  explanation: L10n;
  /** when false, hide the "Try it" runner button (for pseudo-code / terminal commands) */
  runnable?: boolean;
}

export interface ExerciseTest {
  name: L10n; // human-readable: "The page contains an <h1>"
  check: string;
  // lang web/js : JS expression evaluated INSIDE the sandbox iframe; must evaluate truthy.
  //               Has access to the sandboxed document/window, user globals, and
  //               __consoleLog (string[] of everything the user code logged).
  // lang python : Python snippet (asserts) executed after user code in the same scope.
  //               _stdout (str) holds everything the user code printed.
}

export interface ExerciseSection {
  type: "exercise";
  lang: RunnerLang;
  prompt: L10n; // what to build, ELI5 wording
  starterCode: string;
  solution: string; // revealed via "Show solution" after >= 2 failed check runs
  hints: L10n[]; // progressive hints, revealed one at a time
  tests: ExerciseTest[];
}

/**
 * A server-graded, multi-language exercise that opens in Code Lab ("Try in Code
 * Lab"). Reference: `${track}/${lesson}/${id}`. The student runs the code on the
 * sandboxed runner; the Worker grades stdout against `tests` (looked up from the
 * generated catalog, never trusted from the client). Tests are visible to the
 * learner by design; hidden tests exist only for CTF challenges.
 */
export interface LabTest {
  name: L10n;
  stdin?: string;
  /** Expected stdout. */
  expected: string;
  /** default "trim" (compare after trimming trailing whitespace/newlines). */
  mode?: MatchMode;
  epsilon?: number;
}

export interface LabExerciseSection {
  type: "lab";
  /** Unique within the lesson; forms the exercise reference with track + lesson. */
  id: string;
  lang: LangId;
  prompt: L10n;
  starterCode: string;
  /** Reference solution: shown after failed attempts and to instructors; verified by the test-suite. */
  solution: string;
  hints: L10n[];
  tests: LabTest[];
  /** Pre-filled stdin when the learner opens a free run. */
  sampleInput?: string;
}

export interface QuizQuestion {
  q: L10n;
  choices: L10n[]; // 3–4 choices
  answer: number; // index into choices
  explain: L10n; // shown after answering
}

export interface QuizSection {
  type: "quiz";
  questions: QuizQuestion[];
}

export type LessonSection = TextSection | CodeDemoSection | ExerciseSection | LabExerciseSection | QuizSection;

export interface Lesson {
  nodeId: string; // matches RoadmapNodeInfo.id
  title: L10n;
  estMinutes: number; // honest estimate shown to the student
  sections: LessonSection[];
}
