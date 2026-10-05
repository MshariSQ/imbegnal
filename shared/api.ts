/**
 * Public API of the IMBEGNAL Worker for Code Lab, Challenges, certificates and
 * instructor analytics. Types only: the site and the Worker both import this so
 * the two cannot drift.
 *
 * Conventions
 *  - JSON in/out, `Authorization: Bearer <jwt>` (same token as the rest of the API).
 *  - Errors are `ApiErrorBody` with a stable machine `error` code and the HTTP
 *    status below. Messages are English hints for developers; the site maps the
 *    `error` code to a localized message.
 *      400 invalid_request          malformed body / unknown language / too large
 *      401 unauthorized             missing or stale token
 *      403 account_suspended        abuse protection disabled the account
 *      403 forbidden                role required (instructor/admin)
 *      404 not_found
 *      429 quota_exceeded           see QuotaError.scope
 *      429 rate_limited
 *      503 runner_unavailable       runner down/unconfigured (quota is refunded)
 */
import type { LangId } from "./languages";
import type { RunStatus } from "./protocol";

export interface ApiErrorBody {
  error: string;
  message?: string;
}

export type QuotaScope = "user" | "global" | "rate" | "concurrency";

export interface QuotaError extends ApiErrorBody {
  error: "quota_exceeded" | "rate_limited";
  scope: QuotaScope;
  /** ISO time when the exhausted counter resets (daily quotas) or retry-after hint. */
  resetAt?: string;
  retryAfterSec?: number;
}

export type Plan = "free" | "pro";

export interface QuotaInfo {
  plan: Plan;
  /** Runs counted today (UTC day). */
  used: number;
  /** Daily limit for this plan. */
  limit: number;
  remaining: number;
  /** Next 00:00 UTC (03:00 Riyadh). */
  resetAt: string;
  /** Per-minute burst limit for this plan. */
  perMinute: number;
}

/** What a run is attached to (drives logging, grading and analytics). */
export type RunRef =
  | { kind: "free" }
  | { kind: "lesson"; track: string; lesson: string; exercise: string }
  | { kind: "challenge"; id: string };

export interface RunApiRequest {
  lang: LangId;
  code: string;
  stdin?: string;
  ref?: RunRef;
}

/** RunResult as shown to users: identical fields minus nothing sensitive. */
export interface PublicRunResult {
  status: RunStatus;
  exitCode: number | null;
  signal?: string | null;
  stdout: string;
  stderr: string;
  compileOutput?: string;
  stdoutBytes: number;
  stderrBytes: number;
  truncated: { stdout: boolean; stderr: boolean };
  runMs: number;
  compileMs: number;
  message?: string;
}

export interface GradeTestResult {
  name: string;
  passed: boolean;
  /** Hidden tests never carry expected/actual. */
  hidden?: boolean;
  expected?: string;
  actual?: string;
  message?: string;
}

export interface GradeResult {
  passed: boolean;
  /** 0..1 fraction of tests passed. */
  score: number;
  tests: GradeTestResult[];
  feedback?: string;
}

export interface RunApiResponse {
  runId: string;
  result: PublicRunResult;
  quota: QuotaInfo;
  /** Present when `ref` is a lesson exercise or a challenge with auto-graded tests. */
  grade?: GradeResult;
}

export interface LanguageAvailability {
  id: LangId;
  available: boolean;
  version?: string;
}

export interface LanguagesApiResponse {
  languages: LanguageAvailability[];
  /** "up" runner answered; "down" configured but unreachable; "unconfigured" no RUNNER_URL. */
  runner: "up" | "down" | "unconfigured";
}

export interface RunSummary {
  id: string;
  lang: LangId;
  status: RunStatus;
  exitCode: number | null;
  runMs: number;
  stdoutBytes: number;
  success: boolean;
  ref: RunRef;
  createdAt: string; // ISO
}

export interface RunsApiResponse {
  runs: RunSummary[];
  /** Pass as ?before= to page back. */
  next?: string;
}

/** GET /api/lab/runs/:id (own runs only) */
export interface RunDetail extends RunSummary {
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  compileOutput?: string;
}

export interface SnippetCreateRequest {
  lang: LangId;
  code: string;
  stdin?: string;
  title?: string;
}

export interface SnippetCreateResponse {
  id: string;
  /** Path on the site, e.g. /code-lab/s/?id=abc123 */
  path: string;
}

/** Snippets are immutable and public by link. No author identity beyond a display name. */
export interface Snippet {
  id: string;
  lang: LangId;
  code: string;
  stdin: string;
  title?: string;
  authorName?: string;
  createdAt: string;
}

/** GET /api/lab/progress — lab exercises the signed-in learner has passed (server is the source of truth). */
export interface LabProgressResponse {
  /** refs: `${track}/${lesson}/${exerciseId}` */
  passed: { ref: string; at: string }[];
}

// ── Challenges ───────────────────────────────────────────────────────────────

export interface ChallengeStat {
  id: string;
  solves: number;
  /** First solver; absent until someone solves it. */
  firstBlood?: { name: string; username?: string; at: string };
  /** Median minutes from first open to solve across solvers, when >= 3 solves. */
  medianSolveMinutes?: number;
  /** Signed-in only. */
  mine?: { solved: boolean; points: number; attempts: number; solvedAt?: string; hintsUsed: number; minutesToSolve?: number };
}

export interface ChallengesApiResponse {
  stats: ChallengeStat[];
  me?: { points: number; solved: number; rank?: number };
}

export interface SubmitRequest {
  /** kind "flag" challenges */
  flag?: string;
  /** kind "code" | "output" challenges */
  lang?: LangId;
  code?: string;
}

export interface SubmitResponse {
  correct: boolean;
  /** Points awarded by THIS submission (0 when already solved or incorrect). */
  awarded: number;
  alreadySolved: boolean;
  firstBlood: boolean;
  feedback?: string;
  grade?: GradeResult;
  /** Present for code/output submissions that ran on the runner. */
  result?: PublicRunResult;
  quota?: QuotaInfo;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  username?: string;
  avatar?: string;
  points: number;
  solves: number;
  firstBloods: number;
  lastSolveAt?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  me?: LeaderboardEntry;
  /** track filter echoed back ("all" when none). */
  track: string;
  period: "all" | "week";
}

// ── Certificates ─────────────────────────────────────────────────────────────

export interface CertificateVerifyResponse {
  valid: boolean;
  code?: string;
  track?: string;
  recipient?: string;
  issuedAt?: string;
}

// ── Instructor analytics ─────────────────────────────────────────────────────

export interface ExerciseAnalytics {
  exercise: string; // "track/lesson/exerciseId" or "challenge:<id>"
  attempts: number;
  learners: number;
  passRate: number; // 0..1 over learners who tried
  medianRunMs: number;
  /** Most common failure reasons, e.g. {"compile_error": 12, "wrong_output": 30}. */
  failures: Record<string, number>;
  /** Anonymised most common first error lines (compile/runtime), top 5. */
  commonErrors: { text: string; count: number }[];
}

export interface TrackAnalytics {
  track: string;
  learners: number;
  /** Learners who completed every lesson of the track (synced state). */
  completed: number;
  completionRate: number;
  /** Median minutes between first lesson visit and completion, when known. */
  medianMinutesToComplete?: number;
}

export interface InstructorAnalytics {
  generatedAt: string;
  days: number;
  runs: { total: number; success: number; byLang: Record<string, number>; byStatus: Record<string, number> };
  tracks: TrackAnalytics[];
  exercises: ExerciseAnalytics[];
  challenges: { id: string; solves: number; attempts: number; medianMinutesToSolve?: number }[];
}

export interface AuditEntry {
  id: number;
  at: string;
  userId?: string;
  action: string; // e.g. "abuse.auto_suspend", "abuse.signal", "role.change"
  detail: string;
}
