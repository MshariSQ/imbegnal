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
import type { ChallengeStat } from "./api";

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

// ── Worker API shapes that shared/api.ts does not cover ──────────────────────
// (additive: owned by the Challenges Worker module; the site imports these types)

/** Submission limits the Worker enforces; the site may pre-validate with the same numbers. */
export const SUBMIT_LIMITS = {
  /** Max characters of a submitted flag. */
  flagMaxChars: 256,
  /** Max UTF-8 bytes of submitted source code. */
  codeMaxBytes: 32 * 1024,
  /** Max tests run per submission (extra tests of a grader are ignored). */
  maxTests: 20,
  /** Max hints per challenge (they are tracked in a 30-bit mask). */
  maxHints: 30,
} as const;

/** `mine` of a ChallengeStat plus the reveal mask (bit i set = hint i was revealed). */
export type ChallengeMine = NonNullable<ChallengeStat["mine"]> & { hintMask: number };

/** POST /api/challenges/:id/open */
export interface ChallengeOpenResponse {
  ok: true;
  /** ISO time of the FIRST open (stable across calls). */
  openedAt: string;
}

/** POST /api/challenges/:id/hint — revealing again is free and returns the same text. */
export interface ChallengeHintResponse {
  index: number;
  text: L10nText;
  cost: number;
  /** Indexes of every hint this learner has revealed so far. */
  revealed: number[];
  hintsUsed: number;
  /** What a correct solve would award right now (points minus revealed hint costs). */
  potentialPoints: number;
}

/** GET /api/certificates/:track?format=json */
export interface CertificateInfo {
  code: string;
  track: string;
  recipient: string;
  issuedAt: string;
  verifyUrl: string;
}

/** 403 body of GET /api/certificates/:track while lessons remain. */
export interface CertificateIneligibleBody {
  error: "not_eligible";
  message?: string;
  total: number;
  done: number;
  remaining: number;
}
