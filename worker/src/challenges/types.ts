// Dependency seams of the Challenges / certificates / instructor handlers.
//
// The handlers receive everything that talks to the outside world (runner, quota, abuse
// protection, roles, clock) through `ChallengeDeps`. Production wiring lives in deps.ts
// (the real ../lab/execute, ../abuse, ../roles modules); tests inject doubles. The interfaces
// below are structural copies of those modules' signatures, so a drift is a compile error in
// deps.ts rather than a runtime surprise.
import type { PublicRunResult, Plan, QuotaInfo, RunRef } from "../../../shared/api";
import type { Catalog } from "../../../shared/catalog";
import type { LangId } from "../../../shared/languages";
import type { RunLimits, RunResult, RunStatus } from "../../../shared/protocol";
import type { Env } from "../util";
import type { ChallengeRegistry } from "../graders/registry";

export interface LabUserLike {
  sub: string;
  username?: string;
  name?: string;
}

export interface ReservationLike {
  userId: string;
  plan: Plan;
  day: string;
  units: number;
}

export interface LabApi {
  reserveQuota(env: Env, user: LabUserLike, units?: number): Promise<{ ok: true; reservation: ReservationLike; plan: Plan } | { ok: false; response: Response }>;
  settleQuota(env: Env, reservation: ReservationLike, outcome: RunStatus | "rejected"): Promise<QuotaInfo>;
  runOnRunner(env: Env, req: { lang: LangId; code: string; stdin: string; limits?: RunLimits }): Promise<RunResult>;
  recordRun(
    env: Env,
    row: { id?: string; userId: string; ref: RunRef; lang: LangId; result: RunResult; passed?: boolean | null; code?: string; stdin?: string },
  ): Promise<string>;
  toPublicResult(r: RunResult): PublicRunResult;
}

export type AbuseKind = "resource" | "network_probe" | "flood" | "bruteforce" | "volume";

export interface AbuseApi {
  recordAbuseSignal(env: Env, userId: string, kind: AbuseKind, detail: string): Promise<void>;
  isSuspended(env: Env, userId: string): Promise<boolean>;
}

export type RoleCheck = (
  req: Request,
  env: Env,
  origin: string,
  min: "instructor" | "admin",
) => Promise<{ ok: true; user: { sub: string } } | { ok: false; response: Response }>;

export interface ChallengeDeps {
  registry: ChallengeRegistry;
  lab: LabApi;
  abuse: AbuseApi;
  requireRole: RoleCheck;
  /** Generated course catalog (lesson order per track). */
  catalog: Catalog;
  /** Roadmap ids from data/roadmaps.ts: the only valid leaderboard `track` filters. */
  roadmapIds: ReadonlySet<string>;
  /** Epoch milliseconds. */
  now(): number;
}
