// Code Lab HTTP handlers: run, quota, history, progress, languages.
// Snippets live in snippets.ts; the router at the bottom serves /api/lab/*.
//
// Every handler authenticates BEFORE touching D1 with user input, uses
// parameterized SQL only, validates ids, and answers JSON with the stable
// `error` codes documented at the top of shared/api.ts. Exceptions are logged
// without user data and never echoed.
import type { LabProgressResponse, RunApiResponse, RunDetail, RunRef, RunsApiResponse, RunSummary } from "../../../shared/api";
import type { LangId } from "../../../shared/languages";
import { getLanguage } from "../../../shared/languages";
import type { RunResult, RunStatus } from "../../../shared/protocol";
import { recordAbuseSignal } from "../abuse";
import { type Env, json } from "../util";
import { getQuotaInfo, recordRun, reserveQuota, settleQuota, toPublicResult } from "./execute";
import { findLab, gradeLab } from "./grade";
import { apiError, authenticate, readBody, reply, requireActiveUser, toIso } from "./http";
import { getLanguages, runOnRunner } from "./runner";
import { handleSnippetCreate, handleSnippetGet } from "./snippets";
import { looksLikeNetworkProbe } from "./suspicious";
import { parseRunRequest } from "./validate";

const RESOURCE_STATUSES: ReadonlySet<RunStatus> = new Set(["timeout", "memory_limit", "output_limit"]);

// ── GET /api/lab/languages ────────────────────────────────────────────────────
async function handleLanguages(env: Env, origin: string): Promise<Response> {
  return json(await getLanguages(env), 200, origin, { "Cache-Control": "public, max-age=10" });
}

// ── POST /api/lab/run ─────────────────────────────────────────────────────────
async function handleRun(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await authenticate(req, env);
  if (!user) return apiError("unauthorized", 401, origin);

  const body = await readBody(req);
  if (!body.ok) return apiError("invalid_request", 400, origin, "The body must be a JSON object of at most 200 KiB.");
  const parsed = parseRunRequest(body.body);
  if (!parsed.ok) return apiError("invalid_request", 400, origin, parsed.message);
  const { lang, code, stdin, ref } = parsed.value;

  // Challenges are graded by their own endpoint (hidden tests, flags, points).
  if (ref.kind === "challenge") return apiError("invalid_request", 400, origin, "Challenge submissions go to POST /api/challenges/:id/submit.");

  // Rejections below cost the learner nothing: they happen before the quota is reserved.
  const lab = ref.kind === "lesson" ? findLab(`${ref.track}/${ref.lesson}/${ref.exercise}`) : null;
  if (ref.kind === "lesson") {
    if (!lab) return apiError("not_found", 404, origin, "Unknown lab exercise.");
    if (lab.lang !== lang) return apiError("invalid_request", 400, origin, `This exercise must be solved in ${getLanguage(lab.lang)?.label ?? lab.lang}.`);
  }

  const reserved = await reserveQuota(env, user, 1, origin);
  if (!reserved.ok) return reserved.response;
  const { reservation } = reserved;

  try {
    let result: RunResult;
    let runs: RunResult[];
    let stdinUsed = stdin;
    let grade: RunApiResponse["grade"];
    if (lab && lab.tests.length > 0) {
      const graded = await gradeLab(env, lab, code);
      ({ shown: result, runs, grade } = graded);
      stdinUsed = graded.shownStdin;
    } else {
      result = await runOnRunner(env, { lang, code, stdin });
      runs = [result];
    }

    // Advisory abuse signals: none of them can fail or delay the response.
    if (runs.some((r) => RESOURCE_STATUSES.has(r.status))) await recordAbuseSignal(env, user.sub, "resource", `${lang} run hit ${result.status}`);
    if (looksLikeNetworkProbe(code)) await recordAbuseSignal(env, user.sub, "network_probe", `${lang} code matched a network-probe signature`);

    const infraFailure = runs.some((r) => r.status === "internal_error");
    const outcome: RunStatus = infraFailure ? "internal_error" : runs.some((r) => r.status === "unsupported") ? "unsupported" : result.status;
    const runId = await recordRun(env, {
      id: reservation.runId,
      userId: user.sub,
      ref,
      lang,
      result,
      passed: grade && !infraFailure ? grade.passed : null,
      code,
      stdin: stdinUsed,
    });
    if (ref.kind === "lesson" && grade?.passed) {
      await env.DB.prepare("INSERT OR IGNORE INTO lab_progress (user_id, ref) VALUES (?, ?)").bind(user.sub, `${ref.track}/${ref.lesson}/${ref.exercise}`).run();
    }
    const quota = await settleQuota(env, reservation, outcome);

    if (result.status === "internal_error" && result.message === "runner_unavailable") {
      return apiError("runner_unavailable", 503, origin, "The code runner is unavailable. This run was not counted.", { quota, runId });
    }
    const response: RunApiResponse = { runId, result: toPublicResult(result), quota, ...(grade ? { grade } : {}) };
    return reply(response, 200, origin);
  } catch (e) {
    console.error("lab run failed", e instanceof Error ? e.message : "unknown");
    await settleQuota(env, reservation, "internal_error").catch(() => {});
    return apiError("internal_error", 500, origin, "Something went wrong. This run was not counted.");
  }
}

// ── GET /api/lab/quota ────────────────────────────────────────────────────────
async function handleQuota(req: Request, env: Env, origin: string): Promise<Response> {
  const auth = await requireActiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  return reply(await getQuotaInfo(env, auth.user), 200, origin);
}

// ── GET /api/lab/runs ─────────────────────────────────────────────────────────
const RUN_ID_RE = /^[0-9a-f-]{36}$/;
const CURSOR_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})Z_([0-9a-f-]{36})$/;
const DEFAULT_PAGE = 20;
const MAX_PAGE = 50;

interface RunRow {
  id: string;
  lang: string;
  status: string;
  exit_code: number | null;
  run_ms: number | null;
  stdout_bytes: number | null;
  success: number;
  ref_kind: string;
  track: string | null;
  lesson: string | null;
  exercise: string | null;
  challenge_id: string | null;
  created_at: string;
}

const SUMMARY_COLUMNS = "id, lang, status, exit_code, run_ms, stdout_bytes, success, ref_kind, track, lesson, exercise, challenge_id, created_at";

function rowRef(r: RunRow): RunRef {
  if (r.ref_kind === "lesson" && r.track && r.lesson && r.exercise) return { kind: "lesson", track: r.track, lesson: r.lesson, exercise: r.exercise };
  if (r.ref_kind === "challenge" && r.challenge_id) return { kind: "challenge", id: r.challenge_id };
  return { kind: "free" };
}

function toSummary(r: RunRow): RunSummary {
  return {
    id: r.id,
    lang: r.lang as LangId,
    status: r.status as RunStatus,
    exitCode: r.exit_code,
    runMs: r.run_ms ?? 0,
    stdoutBytes: r.stdout_bytes ?? 0,
    success: r.success === 1,
    ref: rowRef(r),
    createdAt: toIso(r.created_at),
  };
}

async function handleRuns(req: Request, env: Env, origin: string): Promise<Response> {
  const auth = await requireActiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  const q = new URL(req.url).searchParams;

  const limitRaw = q.get("limit");
  const limit = limitRaw === null ? DEFAULT_PAGE : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1) return apiError("invalid_request", 400, origin, "limit must be a positive integer.");
  const pageSize = Math.min(limit, MAX_PAGE);

  const before = q.get("before");
  const cursor = before === null ? null : CURSOR_RE.exec(before);
  if (before !== null && !cursor) return apiError("invalid_request", 400, origin, "before must be a cursor returned by this endpoint.");

  // In-flight reservations (status 'running') are not history.
  const rows = cursor
    ? await env.DB.prepare(
        `SELECT ${SUMMARY_COLUMNS} FROM lab_runs
         WHERE user_id = ?1 AND status != 'running' AND (created_at < ?2 OR (created_at = ?2 AND id < ?3))
         ORDER BY created_at DESC, id DESC LIMIT ?4`,
      ).bind(auth.user.sub, `${cursor[1]} ${cursor[2]}`, cursor[3], pageSize + 1).all<RunRow>()
    : await env.DB.prepare(
        `SELECT ${SUMMARY_COLUMNS} FROM lab_runs WHERE user_id = ?1 AND status != 'running'
         ORDER BY created_at DESC, id DESC LIMIT ?2`,
      ).bind(auth.user.sub, pageSize + 1).all<RunRow>();

  const page = rows.results.slice(0, pageSize);
  const last = page[page.length - 1];
  const body: RunsApiResponse = {
    runs: page.map(toSummary),
    ...(rows.results.length > pageSize && last ? { next: `${toIso(last.created_at)}_${last.id}` } : {}),
  };
  return reply(body, 200, origin);
}

// ── GET /api/lab/runs/:id ─────────────────────────────────────────────────────
async function handleRunDetail(req: Request, env: Env, origin: string, id: string): Promise<Response> {
  const auth = await requireActiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  // Other users' runs and malformed ids are indistinguishable from missing ones.
  if (!RUN_ID_RE.test(id)) return apiError("not_found", 404, origin);
  const r = await env.DB.prepare(`SELECT ${SUMMARY_COLUMNS}, code, stdin, stdout, stderr FROM lab_runs WHERE id = ? AND user_id = ? AND status != 'running'`)
    .bind(id, auth.user.sub)
    .first<RunRow & { code: string | null; stdin: string | null; stdout: string | null; stderr: string | null }>();
  if (!r) return apiError("not_found", 404, origin);
  const detail: RunDetail = { ...toSummary(r), code: r.code ?? "", stdin: r.stdin ?? "", stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
  return reply(detail, 200, origin);
}

// ── GET /api/lab/progress ─────────────────────────────────────────────────────
async function handleProgress(req: Request, env: Env, origin: string): Promise<Response> {
  const auth = await requireActiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  const rows = await env.DB.prepare("SELECT ref, passed_at FROM lab_progress WHERE user_id = ? ORDER BY passed_at, ref LIMIT 2000")
    .bind(auth.user.sub)
    .all<{ ref: string; passed_at: string }>();
  const body: LabProgressResponse = { passed: rows.results.map((r) => ({ ref: r.ref, at: toIso(r.passed_at) })) };
  return reply(body, 200, origin);
}

// ── Router: everything under /api/lab/ ────────────────────────────────────────
const methodNotAllowed = (origin: string, allow: string): Response => apiError("method_not_allowed", 405, origin, `Use ${allow}.`);

export async function handleLab(req: Request, env: Env, origin: string, pathname: string): Promise<Response> {
  const m = req.method;
  const only = (allow: "GET" | "POST", run: () => Promise<Response>) => (m === allow ? run() : Promise.resolve(methodNotAllowed(origin, allow)));

  switch (pathname) {
    case "/api/lab/languages":
      return only("GET", () => handleLanguages(env, origin));
    case "/api/lab/run":
      return only("POST", () => handleRun(req, env, origin));
    case "/api/lab/quota":
      return only("GET", () => handleQuota(req, env, origin));
    case "/api/lab/runs":
      return only("GET", () => handleRuns(req, env, origin));
    case "/api/lab/progress":
      return only("GET", () => handleProgress(req, env, origin));
    case "/api/lab/snippets":
      return only("POST", () => handleSnippetCreate(req, env, origin));
  }
  const run = /^\/api\/lab\/runs\/([^/]+)$/.exec(pathname);
  if (run) return only("GET", () => handleRunDetail(req, env, origin, run[1]));
  const snippet = /^\/api\/lab\/snippets\/([^/]+)$/.exec(pathname);
  if (snippet) return only("GET", () => handleSnippetGet(env, origin, snippet[1]));
  return apiError("not_found", 404, origin);
}
