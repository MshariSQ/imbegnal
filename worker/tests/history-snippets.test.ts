// History, quota, progress and snippet endpoints through the real router.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import type { LabProgressResponse, QuotaInfo, RunDetail, RunsApiResponse, Snippet, SnippetCreateResponse } from "../../shared/api";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { RUNNER_SECRET, type RunnerStub, addUser, call, jsonOf, makeEnv, okResult, stubRunner, tokenFor } from "./helpers/harness";

let db: TestD1;
let env: Env;
let stub: RunnerStub | null = null;
let t1: string;
let t2: string;

beforeEach(async () => {
  db = new TestD1();
  env = makeEnv(db, { RUN_PER_MINUTE_FREE: "1000", RUN_MAX_CONCURRENT: "100" });
  addUser(db, { id: "u1", name: "Ada Lovelace" });
  addUser(db, { id: "u2", name: null });
  t1 = await tokenFor("u1");
  t2 = await tokenFor("u2");
  stub = stubRunner(() => okResult());
});

afterEach(() => {
  stub?.restore();
  stub = null;
});

const run = (token: string, code: string) => call(env, "/api/lab/run", { method: "POST", token, body: { lang: "python", code } });

/** Seeds history rows directly so ordering and pagination do not depend on wall-clock seconds. */
function seedRuns(user: string, n: number, at = "2026-10-01 10:00:00", batch = 0): string[] {
  const ids: string[] = [];
  for (let i = 0; i < n; i++) {
    const id = `00000000-0000-4000-8000-${String(user.charCodeAt(1) * 100000 + batch * 1000 + i).padStart(12, "0")}`;
    ids.push(id);
    db.execute(
      "INSERT INTO lab_runs (id, user_id, ref_kind, lang, status, success, run_ms, stdout_bytes, code, stdin, stdout, stderr, created_at) VALUES (?, ?, 'free', 'python', 'ok', 1, 5, 3, ?, '', 'out', '', ?)",
      id,
      user,
      `print(${i})`,
      at,
    );
  }
  return ids;
}

describe("GET /api/lab/runs", () => {
  test("requires a token", async () => {
    assert.equal((await call(env, "/api/lab/runs")).status, 401);
    assert.equal((await call(env, "/api/lab/runs/00000000-0000-4000-8000-000000000001")).status, 401);
  });

  test("lists the caller's runs newest first without code or output, no-store", async () => {
    await run(t1, "print(1)");
    await run(t1, "print(2)");
    const res = await call(env, "/api/lab/runs", { token: t1 });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Cache-Control"), "no-store");
    const body = await jsonOf<RunsApiResponse>(res);
    assert.equal(body.runs.length, 2);
    assert.equal(body.next, undefined);
    const first = body.runs[0] as unknown as Record<string, unknown>;
    assert.equal(first.lang, "python");
    assert.equal(first.status, "ok");
    assert.equal(first.success, true);
    assert.ok(!("code" in first) && !("stdout" in first) && !("stderr" in first));
  });

  test("never shows other users' runs", async () => {
    seedRuns("u2", 3);
    await run(t1, "print(1)");
    const body = await jsonOf<RunsApiResponse>(await call(env, "/api/lab/runs", { token: t1 }));
    assert.equal(body.runs.length, 1);
    const other = await jsonOf<RunsApiResponse>(await call(env, "/api/lab/runs", { token: t2 }));
    assert.equal(other.runs.length, 3);
  });

  test("cursor pagination walks every row exactly once, including rows that share a timestamp", async () => {
    const older = seedRuns("u1", 7, "2026-10-01 10:00:00", 0); // all share one timestamp
    const newer = seedRuns("u1", 5, "2026-10-02 10:00:00", 1);
    assert.equal(older.length + newer.length, 12);

    const seen: string[] = [];
    let before: string | undefined;
    for (let pages = 0; pages < 10; pages++) {
      const q = `/api/lab/runs?limit=5${before ? `&before=${encodeURIComponent(before)}` : ""}`;
      const body = await jsonOf<RunsApiResponse>(await call(env, q, { token: t1 }));
      assert.ok(body.runs.length <= 5);
      seen.push(...body.runs.map((r) => r.id));
      if (!body.next) break;
      before = body.next;
    }
    assert.equal(seen.length, 12);
    assert.equal(new Set(seen).size, 12);
    assert.deepEqual(new Set(seen.slice(0, 5)), new Set(newer), "the newer day comes first");
  });

  test("limit and cursor are validated; limit is capped at 50", async () => {
    seedRuns("u1", 60);
    for (const q of ["limit=0", "limit=abc", "limit=-1", "limit=1.5", "before=garbage", "before=2026-10-01T10:00:00Z_x"]) {
      const res = await call(env, `/api/lab/runs?${q}`, { token: t1 });
      assert.equal(res.status, 400, q);
      assert.equal((await jsonOf<{ error: string }>(res)).error, "invalid_request");
    }
    const body = await jsonOf<RunsApiResponse>(await call(env, "/api/lab/runs?limit=500", { token: t1 }));
    assert.equal(body.runs.length, 50);
    assert.ok(body.next);
  });

  test("in-flight reservations are not history", async () => {
    db.execute("INSERT INTO lab_runs (id, user_id, ref_kind, lang, status) VALUES ('00000000-0000-4000-8000-0000000000ff', 'u1', 'free', 'python', 'running')");
    const body = await jsonOf<RunsApiResponse>(await call(env, "/api/lab/runs", { token: t1 }));
    assert.equal(body.runs.length, 0);
  });

  test("a SQL-looking cursor or id never reaches the query", async () => {
    const res = await call(env, `/api/lab/runs?before=${encodeURIComponent("2026-10-01T10:00:00Z_' OR 1=1 --")}`, { token: t1 });
    assert.equal(res.status, 400);
  });
});

describe("GET /api/lab/runs/:id", () => {
  test("returns the stored code, stdin and output of an own run", async () => {
    const res = await run(t1, "print('mine')");
    const { runId } = await jsonOf<{ runId: string }>(res);
    const detail = await call(env, `/api/lab/runs/${runId}`, { token: t1 });
    assert.equal(detail.status, 200);
    const body = await jsonOf<RunDetail>(detail);
    assert.equal(body.id, runId);
    assert.equal(body.code, "print('mine')");
    assert.equal(body.stdout, "Hello, World!\n");
  });

  test("another user's run, an unknown id and a malformed id are all the same 404", async () => {
    const [id] = seedRuns("u2", 1);
    for (const target of [id, "00000000-0000-4000-8000-00000000dead", "not-a-uuid", "1%27%20OR%201=1"]) {
      const res = await call(env, `/api/lab/runs/${target}`, { token: t1 });
      assert.equal(res.status, 404, target);
      assert.equal((await jsonOf<{ error: string }>(res)).error, "not_found");
    }
    assert.equal((await call(env, `/api/lab/runs/${id}`, { token: t2 })).status, 200);
  });
});

describe("GET /api/lab/quota and /api/lab/progress", () => {
  test("quota reflects usage and the plan", async () => {
    await run(t1, "print(1)");
    const q = await jsonOf<QuotaInfo>(await call(env, "/api/lab/quota", { token: t1 }));
    assert.equal(q.plan, "free");
    assert.equal(q.used, 1);
    assert.equal(q.limit, 50);
    assert.equal(q.remaining, 49);
    assert.ok(Date.parse(q.resetAt) > Date.now());
  });

  test("both require a token and a live account", async () => {
    for (const p of ["/api/lab/quota", "/api/lab/progress"]) {
      assert.equal((await call(env, p)).status, 401);
      assert.equal((await call(env, p, { token: await tokenFor("ghost") })).status, 401);
    }
  });

  test("progress lists only the caller's passed exercises", async () => {
    db.execute("INSERT INTO lab_progress (user_id, ref, passed_at) VALUES ('u1', 'python/basics/add', '2026-10-01 10:00:00'), ('u2', 'python/basics/other', '2026-10-01 11:00:00')");
    const body = await jsonOf<LabProgressResponse>(await call(env, "/api/lab/progress", { token: t1 }));
    assert.deepEqual(body.passed, [{ ref: "python/basics/add", at: "2026-10-01T10:00:00Z" }]);
  });

  test("suspended users are refused by every authenticated lab endpoint", async () => {
    addUser(db, { id: "bad", status: "suspended", suspendedUntil: "2999-01-01 00:00:00" });
    const tok = await tokenFor("bad");
    for (const [path, method] of [
      ["/api/lab/quota", "GET"],
      ["/api/lab/runs", "GET"],
      ["/api/lab/progress", "GET"],
      ["/api/lab/snippets", "POST"],
    ] as const) {
      const res = await call(env, path, { method, token: tok, ...(method === "POST" ? { body: { lang: "python", code: "x" } } : {}) });
      assert.equal(res.status, 403, path);
      assert.equal((await jsonOf<{ error: string }>(res)).error, "account_suspended");
    }
  });
});

describe("snippets", () => {
  const create = (token: string | null, body: unknown) => call(env, "/api/lab/snippets", { method: "POST", token, body });

  test("create then fetch publicly; the id is 10 url-safe characters", async () => {
    const res = await create(t1, { lang: "python", code: "print('hi')", stdin: "5\n", title: "Greeting" });
    assert.equal(res.status, 201);
    const made = await jsonOf<SnippetCreateResponse>(res);
    assert.match(made.id, /^[A-Za-z0-9_-]{10}$/);
    assert.ok(made.path.includes(made.id));

    const got = await call(env, `/api/lab/snippets/${made.id}`); // no token: public
    assert.equal(got.status, 200);
    assert.match(got.headers.get("Cache-Control") ?? "", /public, max-age=\d+/);
    const snip = await jsonOf<Snippet>(got);
    assert.deepEqual({ ...snip, createdAt: undefined }, { id: made.id, lang: "python", code: "print('hi')", stdin: "5\n", title: "Greeting", authorName: "Ada Lovelace", createdAt: undefined });
  });

  test("the public view exposes the display name only, never ids or emails", async () => {
    db.execute("UPDATE users SET email = 'ada@example.com' WHERE github_id = 'u1'");
    const { id } = await jsonOf<SnippetCreateResponse>(await create(t1, { lang: "python", code: "x" }));
    const text = await (await call(env, `/api/lab/snippets/${id}`)).text();
    assert.ok(!text.includes("u1") && !text.includes("ada@example.com") && !text.includes("user_id"));
  });

  test("a user without a display name has no authorName; no title means no title", async () => {
    const { id } = await jsonOf<SnippetCreateResponse>(await create(t2, { lang: "python", code: "x" }));
    const snip = await jsonOf<Record<string, unknown>>(await call(env, `/api/lab/snippets/${id}`));
    assert.ok(!("authorName" in snip) && !("title" in snip));
    assert.equal(snip.stdin, "");
  });

  test("creating requires a token; unknown ids and bad shapes are 404", async () => {
    assert.equal((await create(null, { lang: "python", code: "x" })).status, 401);
    for (const id of ["nope", "a", "x".repeat(41), "bad id", "%27%20OR%201=1"]) {
      assert.equal((await call(env, `/api/lab/snippets/${id}`)).status, 404, id);
    }
  });

  test("validation: language, code size, NUL, stdin, body shape", async () => {
    const cases: unknown[] = [
      { lang: "cobol", code: "x" },
      { lang: "python" },
      { lang: "python", code: "" },
      { lang: "python", code: "a".repeat(64 * 1024 + 1) },
      { lang: "python", code: "a\0b" },
      { lang: "python", code: "x", stdin: 5 },
      { lang: "python", code: "x", stdin: "b".repeat(64 * 1024 + 1) },
    ];
    for (const body of cases) {
      const res = await create(t1, body);
      assert.equal(res.status, 400, JSON.stringify(body).slice(0, 60));
      assert.equal((await jsonOf<{ error: string }>(res)).error, "invalid_request");
    }
    assert.equal((await call(env, "/api/lab/snippets", { method: "POST", token: t1, rawBody: "[]" })).status, 400);
    assert.equal(db.query<{ n: number }>("SELECT COUNT(*) AS n FROM lab_snippets")[0].n, 0);
    assert.equal((await create(t1, { lang: "python", code: "a".repeat(64 * 1024) })).status, 201);
  });

  test("titles are trimmed to 80 characters; markup is stored inertly as plain text; control and bidi characters are removed", async () => {
    const evil = `  <img src=x onerror=alert(1)>‮\u0000 ${"é".repeat(100)}  `;
    const { id } = await jsonOf<SnippetCreateResponse>(await create(t1, { lang: "python", code: "x", title: evil }));
    const snip = await jsonOf<Snippet>(await call(env, `/api/lab/snippets/${id}`));
    assert.ok(snip.title);
    assert.ok(Array.from(snip.title).length <= 80);
    assert.ok(snip.title.startsWith("<img src=x onerror=alert(1)>"));
    assert.ok(!/[‮\u0000]/.test(snip.title));
    // The API answers application/json, so the browser never interprets it as markup.
    assert.match((await call(env, `/api/lab/snippets/${id}`)).headers.get("Content-Type") ?? "", /application\/json/);
    const blank = await jsonOf<SnippetCreateResponse>(await create(t1, { lang: "python", code: "x", title: "  ​  " }));
    assert.ok(!("title" in (await jsonOf<Record<string, unknown>>(await call(env, `/api/lab/snippets/${blank.id}`)))));
  });

  test("snippets are immutable: there is no update or delete route", async () => {
    const { id } = await jsonOf<SnippetCreateResponse>(await create(t1, { lang: "python", code: "original" }));
    for (const method of ["PUT", "PATCH", "DELETE", "POST"]) {
      const res = await call(env, `/api/lab/snippets/${id}`, { method, token: t1, rawBody: method === "DELETE" ? undefined : JSON.stringify({ code: "hacked" }) });
      assert.equal(res.status, 405, method);
    }
    assert.equal((await jsonOf<Snippet>(await call(env, `/api/lab/snippets/${id}`))).code, "original");
  });

  test("20 per hour per user: the 21st is 429 rate_limited with Retry-After; other users are unaffected", async () => {
    for (let i = 0; i < 20; i++) assert.equal((await create(t1, { lang: "python", code: `print(${i})` })).status, 201);
    const res = await create(t1, { lang: "python", code: "one too many" });
    assert.equal(res.status, 429);
    const body = await jsonOf<{ error: string; scope: string }>(res);
    assert.equal(body.error, "rate_limited");
    assert.equal(body.scope, "rate");
    assert.ok(res.headers.get("Retry-After"));
    assert.equal((await create(t2, { lang: "python", code: "fine" })).status, 201);
  });

  test("200 snippets per user in total: the cap is quota_exceeded scope user", async () => {
    const stmt = db.prepare("INSERT INTO lab_snippets (id, user_id, lang, code, created_at) VALUES (?, 'u1', 'python', 'x', '2026-01-01 00:00:00')");
    for (let i = 0; i < 200; i++) await stmt.bind(`old${String(i).padStart(7, "0")}`).run();
    const res = await create(t1, { lang: "python", code: "no room" });
    assert.equal(res.status, 429);
    const body = await jsonOf<{ error: string; scope: string }>(res);
    assert.equal(body.error, "quota_exceeded");
    assert.equal(body.scope, "user");
  });

  test("responses never contain the runner secret", async () => {
    const { id } = await jsonOf<SnippetCreateResponse>(await create(t1, { lang: "python", code: "x" }));
    for (const res of [await call(env, `/api/lab/snippets/${id}`), await call(env, "/api/lab/runs", { token: t1 }), await call(env, "/api/lab/languages")]) {
      assert.ok(!(await res.text()).includes(RUNNER_SECRET));
    }
  });
});
