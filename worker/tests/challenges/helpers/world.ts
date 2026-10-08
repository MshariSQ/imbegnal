// Test world for the Challenges handlers: D1 shim, env, fixtures, and doubles for the modules
// another branch owns (runner/quota, abuse protection, roles). The handlers under test are the
// real ones; only their ChallengeDeps are replaced.
import type { ChallengeGrader, ChallengeMeta, L10nText } from "../../../../shared/challenges";
import type { Catalog } from "../../../../shared/catalog";
import type { QuotaInfo } from "../../../../shared/api";
import type { LangId } from "../../../../shared/languages";
import type { RunResult, RunStatus } from "../../../../shared/protocol";
import { hashFlag } from "../../../src/graders/engine";
import { createRegistry, type HintTexts } from "../../../src/graders/registry";
import { routeChallengesApi } from "../../../src/challenges/routes";
import type { AbuseKind, ChallengeDeps, LabApi, ReservationLike } from "../../../src/challenges/types";
import { type Env, getUser, issueToken, json } from "../../../src/util";
import { D1Shim } from "./d1";

export const ORIGIN = "https://imbegnal.com";
export const T0 = Date.UTC(2026, 5, 1, 12, 0, 0); // the fixed "now" of the test world

// ── Fixtures ──────────────────────────────────────────────────────────────────

export const FLAG = "IMB{hello_world}";
export const FLAG_CI = "IMB{CaseFlag}";

const text = (en: string) => ({ en, ar: `${en} (ar)` });

function meta(over: Partial<ChallengeMeta> & Pick<ChallengeMeta, "id" | "kind">): ChallengeMeta {
  return {
    track: "cyber-security",
    topic: "test",
    title: text(over.id),
    summary: text("summary"),
    description: text("description"),
    difficulty: 1,
    points: 100,
    estMinutes: 10,
    ...over,
  };
}

export const metas: ChallengeMeta[] = [
  meta({ id: "flag-basic", kind: "flag", points: 100, hints: [{ cost: 20 }, { cost: 30 }, { cost: 90 }] }),
  meta({ id: "flag-ci", kind: "flag", points: 50 }),
  meta({ id: "flag-algo", kind: "flag", track: "data-structures-algorithms", points: 40 }),
  meta({ id: "out-sum", kind: "output", track: "data-structures-algorithms", points: 60, allowedLangs: ["python", "javascript"] }),
  meta({ id: "out-hidden", kind: "output", track: "data-structures-algorithms", points: 70 }),
  meta({ id: "code-double", kind: "code", track: "data-structures-algorithms", points: 80 }),
  meta({ id: "no-grader", kind: "flag" }), // public half only: must not be playable
];

/** The Worker-only hint texts of the fixtures (the public metas above carry just the costs). */
export const hintTexts: Record<string, L10nText[]> = {
  "flag-basic": [text("hint zero"), text("hint one"), text("hint two")],
};

export async function buildGraders(): Promise<ChallengeGrader[]> {
  return [
    { id: "flag-basic", kind: "flag", flagHash: await hashFlag(FLAG) },
    { id: "flag-ci", kind: "flag", flagHash: await hashFlag(FLAG_CI, true), caseInsensitive: true },
    { id: "flag-algo", kind: "flag", flagHash: await hashFlag("IMB{algo}") },
    {
      id: "out-sum",
      kind: "output",
      tests: [
        { name: "small", stdin: "1 2", expected: "3" },
        { name: "negatives", stdin: "-5 2", expected: "-3" },
        { name: "hidden big", stdin: "1000 2000", expected: "3000", hidden: true },
      ],
    },
    {
      id: "out-hidden",
      kind: "output",
      tests: [
        { name: "visible", stdin: "a", expected: "A" },
        { name: "hidden", stdin: "secret-in", expected: "SECRET-OUT-9", hidden: true },
      ],
    },
    {
      id: "code-double",
      kind: "code",
      harness: { python: "{{CODE}}\nprint(double(int(input())))\n", javascript: "{{CODE}}\nconsole.log(double(Number(require('fs').readFileSync(0,'utf8'))))\n" },
      tests: [
        { name: "two", stdin: "2", expected: "4" },
        { name: "hidden ten", stdin: "10", expected: "20", hidden: true },
      ],
    },
    // grader without a public half: must not be playable either
    { id: "grader-only", kind: "flag", flagHash: await hashFlag("IMB{x}") },
    // a mismatched kind must not be playable
    { id: "no-grader", kind: "output", tests: [{ name: "t", stdin: "", expected: "x" }] },
  ];
}

export const catalog: Catalog = {
  tracks: [
    { id: "cyber-security", title: "Cyber Security", lessons: ["setup", "networking", "linux"] },
    { id: "frontend", title: "Frontend Development", lessons: ["html-css", "javascript"] },
    { id: "empty-track", title: "Empty Track", lessons: [] },
  ],
  labs: [],
};

export const roadmapIds = new Set(["cyber-security", "frontend", "data-structures-algorithms", "empty-track"]);

// ── Runner double ─────────────────────────────────────────────────────────────

export function runResult(over: Partial<RunResult> & { status?: RunStatus } = {}): RunResult {
  return {
    jobId: "job",
    status: "ok",
    exitCode: 0,
    stdout: "",
    stderr: "",
    stdoutBytes: (over.stdout ?? "").length,
    stderrBytes: (over.stderr ?? "").length,
    truncated: { stdout: false, stderr: false },
    runMs: 12,
    compileMs: 0,
    ...over,
  };
}

/**
 * Behaviour is chosen by a marker in the program text:
 *   #SUM sums the numbers on stdin · #DOUBLE doubles the number · #UPPER upper-cases stdin
 *   #UPPERVISIBLE upper-cases stdin only for "a", garbage otherwise · #FIRSTONLY right for stdin "1 2" only
 *   #WRONG prints "nope" · #TIMEOUT · #COMPILE · #CRASH · #INFRA · #UNSUPPORTED · #NOISY prints 200 KiB (truncated)
 */
export function scriptedRunner(req: { lang: LangId; code: string; stdin: string }): RunResult {
  const { code, stdin } = req;
  const nums = stdin.split(/\s+/).filter(Boolean).map(Number);
  if (code.includes("#INFRA")) return runResult({ status: "internal_error", exitCode: null, message: "runner_unavailable" });
  if (code.includes("#UNSUPPORTED")) return runResult({ status: "unsupported", exitCode: null, message: "no toolchain" });
  if (code.includes("#COMPILE")) return runResult({ status: "compile_error", exitCode: 1, stderr: "main.c:3: error: expected ';'", compileOutput: "main.c:3: error: expected ';'" });
  if (code.includes("#TIMEOUT")) return runResult({ status: "timeout", exitCode: null, runMs: 5000, message: "Time limit exceeded (5s)" });
  if (code.includes("#CRASH")) return runResult({ status: "runtime_error", exitCode: 1, stderr: `Traceback: bad input ${stdin}` });
  if (code.includes("#WRONG")) return runResult({ stdout: "nope\n" });
  if (code.includes("#NOISY")) return runResult({ stdout: "x".repeat(1000), truncated: { stdout: true, stderr: false } });
  if (code.includes("#SUM")) return runResult({ stdout: `${nums.reduce((a, b) => a + b, 0)}\n` });
  if (code.includes("#DOUBLE")) return runResult({ stdout: `${nums[0] * 2}\n` });
  if (code.includes("#UPPERVISIBLE")) return runResult({ stdout: stdin === "a" ? "A\n" : "garbage-from-hidden\n" });
  if (code.includes("#UPPER")) return runResult({ stdout: `${stdin.toUpperCase()}\n` });
  if (code.includes("#FIRSTONLY")) return runResult({ stdout: stdin === "1 2" ? "3\n" : "0\n" });
  return runResult({ stdout: "\n" });
}

// ── The world ─────────────────────────────────────────────────────────────────

export interface WorldLog {
  reserve: { user: string; units: number | undefined }[];
  settle: (RunStatus | "rejected")[];
  runs: { lang: LangId; code: string; stdin: string; limits?: unknown }[];
  signals: { userId: string; kind: AbuseKind; detail: string }[];
}

export interface WorldOptions {
  runner?: (req: { lang: LangId; code: string; stdin: string }) => RunResult | Promise<RunResult>;
  /** Make reserveQuota refuse with this scope (simulates an exhausted quota). */
  quotaDenied?: boolean;
  /** Replace the metas/graders (parity and registry tests). */
  metas?: ChallengeMeta[];
  graders?: ChallengeGrader[];
  /** Replace the Worker-only hint texts (default: `hintTexts`). */
  hints?: HintTexts;
}

export interface World {
  db: D1Shim;
  env: Env;
  deps: ChallengeDeps;
  log: WorldLog;
  clock: { now: number };
  addUser(u: { sub: string; username?: string; name?: string | null; role?: "student" | "instructor" | "admin"; status?: "active" | "suspended"; avatar?: string }): Promise<string>;
  /** Issues a bearer token for `sub` (the account need not exist; use addUser for that). */
  token(sub: string, name?: string): Promise<string>;
  call(path: string, init?: { method?: string; token?: string | null; body?: unknown; rawBody?: string; headers?: Record<string, string> }): Promise<Response>;
  /** call() + JSON parse. */
  api<T = Record<string, unknown>>(path: string, init?: Parameters<World["call"]>[1]): Promise<{ status: number; body: T; res: Response }>;
}

const QUOTA: QuotaInfo = { plan: "free", used: 1, limit: 50, remaining: 49, resetAt: "2026-06-02T00:00:00.000Z", perMinute: 10 };

export async function makeWorld(opts: WorldOptions = {}): Promise<World> {
  const db = new D1Shim();
  const env = { DB: db, JWT_SECRET: "test-secret-0123456789", FRONTEND_URL: "https://imbegnal.com/", WORKER_URL: "https://api.test", GITHUB_CLIENT_ID: "", GITHUB_CLIENT_SECRET: "" } as unknown as Env;
  const clock = { now: T0 };
  const log: WorldLog = { reserve: [], settle: [], runs: [], signals: [] };
  const runner = opts.runner ?? scriptedRunner;

  const lab: LabApi = {
    async reserveQuota(_env, user, units) {
      log.reserve.push({ user: user.sub, units });
      if (opts.quotaDenied) return { ok: false, response: json({ error: "quota_exceeded", scope: "user" }, 429, ORIGIN) };
      const reservation: ReservationLike = { userId: user.sub, plan: "free", day: "2026-06-01", units: units ?? 1 };
      return { ok: true, reservation, plan: "free" };
    },
    async settleQuota(_env, _reservation, outcome) {
      log.settle.push(outcome);
      return QUOTA;
    },
    async runOnRunner(_env, req) {
      log.runs.push({ lang: req.lang, code: req.code, stdin: req.stdin, limits: req.limits });
      return runner(req);
    },
    async recordRun(_env, row) {
      const id = row.id ?? crypto.randomUUID();
      const r = row.result;
      const firstError = (r.compileOutput ?? r.stderr).split("\n").find((l) => l.trim())?.trim().slice(0, 200) ?? null;
      db.insert(
        `INSERT INTO lab_runs (id, user_id, ref_kind, challenge_id, lang, status, exit_code, run_ms, compile_ms, stdout_bytes, stderr_bytes, success, passed, first_error, code, stdin, stdout, stderr)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, row.userId, row.ref.kind, row.ref.kind === "challenge" ? row.ref.id : null, row.lang, r.status, r.exitCode, r.runMs, r.compileMs,
        r.stdoutBytes, r.stderrBytes, r.status === "ok" ? 1 : 0, row.passed === undefined || row.passed === null ? null : row.passed ? 1 : 0,
        firstError, row.code ?? null, row.stdin ?? null, r.stdout, r.stderr,
      );
      return id;
    },
    toPublicResult: (r) => {
      const { jobId: _jobId, ...rest } = r;
      void _jobId;
      return rest;
    },
  };

  const metasIn = opts.metas ?? metas;
  const gradersIn = opts.graders ?? (await buildGraders());
  const deps: ChallengeDeps = {
    registry: createRegistry(metasIn, gradersIn, opts.hints ?? hintTexts),
    lab,
    abuse: {
      async recordAbuseSignal(_env, userId, kind, detail) {
        log.signals.push({ userId, kind, detail });
      },
      async isSuspended(_env, userId) {
        return db.one<{ status: string }>("SELECT status FROM users WHERE github_id = ?", userId)?.status === "suspended";
      },
    },
    async requireRole(req, _env, origin, min) {
      const u = await getUser(req, env);
      if (!u) return { ok: false, response: json({ error: "unauthorized" }, 401, origin) };
      const role = db.one<{ role: string }>("SELECT role FROM users WHERE github_id = ?", u.sub)?.role ?? "student";
      const ok = role === "admin" || (min === "instructor" && role === "instructor");
      return ok ? { ok: true, user: { sub: u.sub } } : { ok: false, response: json({ error: "forbidden" }, 403, origin) };
    },
    catalog,
    roadmapIds,
    now: () => clock.now,
  };

  const world: World = {
    db,
    env,
    deps,
    log,
    clock,
    async addUser(u) {
      db.insert("INSERT INTO users (github_id, username, name, avatar_url, email, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)", u.sub, u.username ?? `user-${u.sub}`, u.name === undefined ? `Name ${u.sub}` : u.name, u.avatar ?? "", `${u.sub}@private.example`, u.role ?? "student", u.status ?? "active");
      return u.sub;
    },
    token: (sub, name) => issueToken({ sub, username: `user-${sub}`, name: name ?? `Name ${sub}`, avatar: "" }, env),
    async call(path, init = {}) {
      const headers: Record<string, string> = { Origin: ORIGIN, ...init.headers };
      if (init.token) headers.Authorization = `Bearer ${init.token}`;
      let body: string | undefined = init.rawBody;
      if (body === undefined && init.body !== undefined) {
        body = JSON.stringify(init.body);
        headers["Content-Type"] = "application/json";
      }
      const req = new Request(`https://api.test${path}`, { method: init.method ?? (body === undefined ? "GET" : "POST"), headers, body });
      const res = await routeChallengesApi(req, env, ORIGIN, deps);
      if (!res) throw new Error(`route not handled: ${path}`);
      return res;
    },
    async api(path, init) {
      const res = await world.call(path, init);
      const textBody = await res.text();
      return { status: res.status, body: (textBody ? JSON.parse(textBody) : {}) as never, res };
    },
  };
  return world;
}

/** Seeds a solve row directly (leaderboard/analytics tests). */
export function seedSolve(db: D1Shim, s: { challenge: string; user: string; points: number; at: string; firstBlood?: boolean; minutes?: number | null }): void {
  db.insert("INSERT INTO challenge_solves (challenge_id, user_id, points, first_blood, minutes_to_solve, solved_at) VALUES (?, ?, ?, ?, ?, ?)", s.challenge, s.user, s.points, s.firstBlood ? 1 : 0, s.minutes ?? null, s.at);
}
