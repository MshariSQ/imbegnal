/**
 * Challenge (CTF) contracts.
 *
 *   data/challenges/**           PUBLIC metadata  (ChallengeMeta)   → shipped to the browser
 *   worker/src/graders/data/**   SERVER-ONLY      (ChallengeGrader) → flag hashes, hidden tests
 *
 * A challenge exists only when BOTH halves exist with the same `id`
 * (tests/challenges.parity.test enforces this, and that no meta field contains a
 * grader secret). The repo is public, so flags are stored as SHA-256 hashes and
 * the puzzle material (ciphertext, source, logs…) is public by design: this is
 * an open-source CTF, spoilers are possible for a determined reader. For a
 * competitive event, move the grader data to a private D1 table.
 *
 * `track` is ALWAYS a roadmap id from data/roadmaps.ts, the same taxonomy as
 * courses and Code Lab filters, so renaming a roadmap renames it everywhere.
 */
import type { LangId } from "./languages";

export interface L10nText {
  en: string;
  ar: string;
}

/** 1 easy · 2 medium · 3 hard · 4 insane */
export type Difficulty = 1 | 2 | 3 | 4;

export type ChallengeKind =
  | "flag" //   submit a flag string found by solving a puzzle
  | "output" // write a program; its stdout (for given stdin) must match
  | "code"; //  write a solution graded by hidden tests / a custom harness

export interface ChallengeFile {
  name: string;
  /** Text content (binary material should be hex/base64 text). */
  content: string;
  description?: L10nText;
}

export interface ChallengeHint {
  text: L10nText;
  /** Points deducted from the award when the hint is revealed. */
  cost: number;
}

export interface ChallengeMeta {
  /** kebab-case, unique, URL-safe: used in /challenges/<id>/ */
  id: string;
  /** Roadmap id (data/roadmaps.ts). */
  track: string;
  /** Free-form sub-topic tag within the track, e.g. "crypto", "forensics", "scheduling". */
  topic: string;
  title: L10nText;
  /** One or two sentences for the list card. */
  summary: L10nText;
  /** Markdown. Story + task + input/output spec. Never contains the flag. */
  description: L10nText;
  difficulty: Difficulty;
  points: number;
  /** Honest estimate in minutes. */
  estMinutes: number;
  kind: ChallengeKind;
  /** Default language for code/output challenges. */
  lang?: LangId;
  /** Starter code per language for code/output challenges. */
  starterCode?: Partial<Record<LangId, string>>;
  /** Languages allowed for code/output submissions (default: all). */
  allowedLangs?: LangId[];
  /** Sample stdin shown in the statement / preloaded in Code Lab. */
  sampleInput?: string;
  /** Public puzzle material. */
  files?: ChallengeFile[];
  hints?: ChallengeHint[];
  /** "track/lesson" keys of lessons that teach what is needed. */
  lessons?: string[];
  tags?: string[];
  /** Required format hint shown to the user for flag challenges, e.g. "IMB{...}". */
  flagFormat?: string;
}

// ── Server-only grader configuration ─────────────────────────────────────────

export type MatchMode = "exact" | "trim" | "lines" | "contains" | "regex" | "float";

export interface OutputTest {
  name: string;
  stdin: string;
  /** Expected stdout (or regex source when mode "regex"). */
  expected: string;
  mode?: MatchMode; // default "trim"
  /** float mode tolerance (absolute). */
  epsilon?: number;
  /** Hidden tests report only pass/fail to the user. */
  hidden?: boolean;
  /** Overrides the run time limit (ms), lower than the runner default only. */
  timeoutMs?: number;
}

export interface FlagGrader {
  id: string;
  kind: "flag";
  /** hex SHA-256 of the exact flag (after trimming). Never the plaintext. */
  flagHash: string;
  /** Compare case-insensitively (hash the lowercase flag). */
  caseInsensitive?: boolean;
}

export interface OutputGrader {
  id: string;
  kind: "output";
  tests: OutputTest[];
}

/**
 * Wraps the submission with a test driver so the user only writes a function.
 * `template` receives the user's code at `{{CODE}}`; the combined program is run
 * once per test with that test's stdin and compared like an OutputGrader.
 * Per-language templates keep the harness out of the learner's sight.
 */
export interface HarnessGrader {
  id: string;
  kind: "code";
  harness: Partial<Record<LangId, string>>;
  tests: OutputTest[];
}

export type ChallengeGrader = FlagGrader | OutputGrader | HarnessGrader;

/** Reference solution used ONLY by the test-suite to prove each challenge is solvable. */
export interface ChallengeReference {
  id: string;
  /** For flag challenges: the plaintext flag (kept out of the grader file; see tests/). */
  flag?: string;
  /** For code/output challenges: a passing solution per language. */
  solutions?: Partial<Record<LangId, string>>;
}
