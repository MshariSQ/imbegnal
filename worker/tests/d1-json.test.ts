// worker/scripts/d1-json.mjs: how d1-reconcile.mjs and grant-role.mjs read `wrangler d1 execute --json`.
// The fixtures are verbatim output of wrangler 3.114.17 and 4.151.0 (local D1, behind an HTTPS proxy, which
// is what makes wrangler print its proxy notice). The last tests run the wrangler installed in worker/.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
// @ts-expect-error: plain .mjs module without type declarations
import { executeFailure, executeRows } from "../scripts/d1-json.mjs";

const rows = (stdout: string) => executeRows(stdout) as Record<string, unknown>[];
const PROXY_NOTICE = "Proxy environment variables detected. We'll use your proxy for fetch requests.";
const MIGRATIONS = '[\n  {\n    "results": [\n      {\n        "name": "0001_base.sql"\n      },\n      {\n        "name": "0002_accounts_sync_ai.sql"\n      }\n    ],\n    "success": true,\n    "meta": {\n      "duration": 0\n    }\n  }\n]\n';
const SYNTAX_ERROR = '\n{\n  "error": {\n    "text": "near \\"SELEC\\": syntax error at offset 0: SQLITE_ERROR"\n  }\n}\n';
const V4_STDERR = `\u001b[33m▲ \u001b[43;33m[\u001b[43;30mWARNING\u001b[43;33m]\u001b[0m \u001b[1m${PROXY_NOTICE}\u001b[0m\n\n\n`;
const NAMES = [{ name: "0001_base.sql" }, { name: "0002_accounts_sync_ai.sql" }];

describe("rows", () => {
  test("wrangler 4: stdout is the JSON alone (its proxy notice goes to stderr)", () => {
    assert.deepEqual(rows(MIGRATIONS), NAMES);
  });

  test("wrangler 3: the proxy notice on stdout before the JSON is skipped", () => {
    assert.deepEqual(rows(`${PROXY_NOTICE}\n${MIGRATIONS.replace('"duration": 0', '"duration": 1')}`), NAMES);
  });

  test("a notice line with brackets before the JSON is skipped too", () => {
    // The old reader took everything from the first "[": here that is "[WARNING]", which is not JSON.
    assert.deepEqual(rows(`▲ [WARNING] something wrangler wanted to say\n\n${MIGRATIONS}`), NAMES);
    assert.deepEqual(rows(`${V4_STDERR}${MIGRATIONS}`), NAMES);
  });

  test("several statements: their rows, in order; statements without rows add none", () => {
    const out = JSON.stringify([
      { results: [], success: true, meta: { duration: 0 } },
      { results: [{ a: 1 }], success: true, meta: { duration: 0 } },
      { success: true, meta: {} },
      { results: [{ b: 2 }, { b: 3 }], success: true, meta: { duration: 0 } },
    ], null, 2);
    assert.deepEqual(rows(out), [{ a: 1 }, { b: 2 }, { b: 3 }]);
  });

  test("no JSON array, or the error object instead of one, is an error", () => {
    assert.throws(() => rows(`${PROXY_NOTICE}\n`), /no JSON in wrangler output/);
    assert.throws(() => rows(SYNTAX_ERROR), /no JSON in wrangler output/);
    assert.throws(() => rows("[ not json"), SyntaxError);
  });
});

describe("failure message", () => {
  test("wrangler 4: the SQL error on stdout is kept next to the notice on stderr", () => {
    const msg = executeFailure(SYNTAX_ERROR, V4_STDERR);
    assert.match(msg, /Proxy environment variables detected/);
    assert.match(msg, /syntax error at offset 0: SQLITE_ERROR/);
  });

  test("wrangler 3 (nothing on stderr) and errors with nothing on stdout", () => {
    assert.match(executeFailure(`${PROXY_NOTICE}\n${SYNTAX_ERROR}`, ""), /syntax error/);
    assert.equal(executeFailure("", "✘ [ERROR] Authentication error [code: 10000]\n"), "✘ [ERROR] Authentication error [code: 10000]");
    assert.equal(executeFailure(undefined, undefined), "");
  });

  test("a long stderr cannot push the SQL error out of the message", () => {
    const msg = executeFailure(SYNTAX_ERROR, "x".repeat(5000));
    assert.equal(msg.length, 2000);
    assert.match(msg, /syntax error at offset 0: SQLITE_ERROR"\n  }\n}$/);
  });
});

const WORKER_DIR = join(__dirname, "..");
const WRANGLER = join(WORKER_DIR, "node_modules/wrangler/bin/wrangler.js");

describe("the installed wrangler", { skip: !existsSync(WRANGLER) && "worker dependencies are not installed (cd worker && npm ci)" }, () => {
  const execute = (dir: string, sql: string) =>
    spawnSync(process.execPath, [WRANGLER, "d1", "execute", "skillforge-db", "--config", "wrangler.toml", "--local", "--persist-to", dir, "--json", "--command", sql], {
      cwd: WORKER_DIR,
      encoding: "utf8",
      env: { ...process.env, CI: "1", WRANGLER_SEND_METRICS: "false" },
      timeout: 120_000,
    });

  test("prints what executeRows reads, and a failure executeFailure reports", () => {
    const dir = mkdtempSync(join(tmpdir(), "d1-json-"));
    try {
      const ok = execute(dir, "CREATE TABLE t (a INTEGER, b TEXT); INSERT INTO t VALUES (1, NULL), (2, 'x'); SELECT a, b FROM t ORDER BY a; SELECT 'second' AS s");
      assert.equal(ok.status, 0, ok.stderr || ok.stdout);
      assert.deepEqual(rows(ok.stdout), [{ a: 1, b: null }, { a: 2, b: "x" }, { s: "second" }], "SQL NULL is JSON null");

      const bad = execute(dir, "SELECT * FROM missing_table");
      assert.equal(bad.status, 1);
      assert.match(executeFailure(bad.stdout, bad.stderr), /no such table: missing_table/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
