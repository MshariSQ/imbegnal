import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { guardPreviewScripts, guardScript, scriptKind } from "../../lib/codelab/loop-guard";
import { buildPreviewDocument, loopGuardName, parseWebMessage } from "../../lib/codelab/web-sandbox";
import { BROWSER_LIMITS, runInBrowser, type WebHost } from "../../lib/codelab/browser-runner";

const G = "__imbLoop_test";
const guard = (src: string, opts: { module?: boolean; firstLine?: number } = {}) => guardScript(src, { fn: G, ...opts });
const calls = (src: string) => [...src.matchAll(new RegExp(`${G}\\((\\d+)\\);`, "g"))].map((m) => Number(m[1]));
const lineOf = (s: string, needle: string) => s.slice(0, s.indexOf(needle)).split("\n").length;

/** Runs `code` in a fresh context where the guard is `guardFn`; returns what it logged. */
function runInVm(code: string, guardFn: (line: number) => void = () => undefined): string[] {
  const logs: string[] = [];
  const ctx = vm.createContext({ console: { log: (...a: unknown[]) => logs.push(a.map(String).join(" ")) }, [G]: guardFn });
  vm.runInContext(code, ctx, { timeout: 2000 });
  return logs;
}

// ── The transform ────────────────────────────────────────────────────────────

test("every kind of loop gets a guard call at the top of its body", () => {
  assert.equal(guard("while (true) {}"), `while (true) {${G}(1);}`);
  assert.equal(guard("for (;;) { tick(); }"), `for (;;) {${G}(1); tick(); }`);
  assert.equal(guard("do { n++; } while (n < 3);"), `do {${G}(1); n++; } while (n < 3);`);
  assert.equal(guard("for (const x of xs) { f(x); }"), `for (const x of xs) {${G}(1); f(x); }`);
  assert.equal(guard("for (var k in o) { f(k); }"), `for (var k in o) {${G}(1); f(k); }`);
  assert.equal(guard("async function f() { for await (const x of xs) { g(x); } }"), `async function f() { for await (const x of xs) {${G}(1); g(x); } }`);
});

test("a body without braces is wrapped in braces, including an empty one", () => {
  assert.equal(guard("while (x) y++"), `while (x) {${G}(1);y++}`);
  assert.equal(guard("while (x) y++;\nz();"), `while (x) {${G}(1);y++;}\nz();`);
  assert.equal(guard("for (;;);"), `for (;;){${G}(1);;}`);
  assert.equal(guard("do n++; while (n < 3)"), `do {${G}(1);n++;} while (n < 3)`);
  assert.equal(guard("if (a) while (b) c(); else d();"), `if (a) while (b) {${G}(1);c();} else d();`);
});

test("nested loops each get their own guard, and the result still parses", () => {
  const src = "for (let i = 0; i < 3; i++)\n  for (let j = 0; j < 3; j++)\n    while (k < j) k++;";
  const out = guard(src);
  assert.deepEqual(calls(out), [1, 2, 3]);
  assert.doesNotThrow(() => new vm.Script(out));
});

test("labels stay on their loops, so break/continue label keep working", () => {
  const src = [
    "outer: for (var i = 0; i < 4; i++) {",
    "  inner: for (var j = 0; j < 4; j++) {",
    "    if (j === 2) continue outer;",
    "    if (i === 3) break outer;",
    "    console.log(i + ':' + j);",
    "  }",
    "}",
    "a: b: while (true) { break a; }",
    "console.log('end');",
  ].join("\n");
  const out = guard(src);
  assert.match(out, /^outer: for /);
  assert.match(out, /a: b: while \(true\) \{__imbLoop_test\(8\);/);
  assert.deepEqual(runInVm(out), runInVm(src));
});

test("loops inside functions, arrow functions, methods, generators and event handlers are guarded", () => {
  const src = [
    "function f(n) { while (n > 0) n--; return n; }",
    "const g = () => { for (;;) { break; } };",
    "class C { m() { do {} while (false); } static { for (const x of []) {} } }",
    "function* gen() { while (true) yield 1; }",
    'button.addEventListener("click", function () { for (var i = 0; i < 9; i++) { draw(i); } });',
    "setTimeout(() => { while (busy()) {} }, 100);",
  ].join("\n");
  assert.deepEqual(calls(guard(src)), [1, 2, 3, 3, 4, 5, 6]);
});

test("module scripts are parsed as modules (import, export, top-level await)", () => {
  const src = 'import { x } from "./x.js";\nexport const y = 1;\nfor (const v of await x()) {}\n';
  assert.equal(guard(src), src, "a module does not parse as a classic script: left unchanged");
  const out = guard(src, { module: true });
  assert.deepEqual(calls(out), [3]);
  assert.match(out, /^import \{ x \} from "\.\/x\.js";\nexport const y = 1;\n/);
});

test("a script with a syntax error, or without loops, is returned unchanged", () => {
  for (const src of ["while (true {", "for (;;) { ", "let let = 1; while(1){}", "console.log('no loops')", ""]) {
    assert.equal(guard(src), src);
  }
});

test("inserted text never adds a line: statements stay on their lines", () => {
  const src = [
    "let n = 0;",
    "while (n < 10)",
    "  n++;",
    "for (const ch of 'abc')",
    "  console.log(ch);",
    "do",
    "  n--;",
    "while (n > 0);",
    "undefinedFunction();",
  ].join("\n");
  const out = guard(src, { firstLine: 20 });
  assert.equal(out.split("\n").length, src.split("\n").length);
  for (const needle of ["n++;", "console.log(ch);", "n--;", "while (n > 0);", "undefinedFunction();"]) {
    assert.equal(lineOf(out, needle), lineOf(src, needle), needle);
  }
  // Calls carry the loop's line in the learner's document (script starts on line 20).
  assert.deepEqual(calls(out), [21, 23, 25]);
  // Inserted code is plain ES5: it parses as ES5 when the learner's code does.
  assert.doesNotThrow(() => new vm.Script(guard("var i = 0; while (i < 3) { i++; } do i--; while (i);")));
});

test("terminating programs behave exactly the same after the transform", () => {
  const programs = [
    "var s = 0; for (var i = 0; i < 100; i++) s += i; console.log(s);",
    "var a = [3, 1, 2]; for (var k in a) console.log(k, a[k]); for (const v of a.sort()) console.log(v);",
    "let n = 5, out = []; do out.push(n--); while (n > 0) console.log(out.join(','));",
    "function fib(n) { let a = 0, b = 1; while (n-- > 0) [a, b] = [b, a + b]; return a; } console.log(fib(30));",
    "var grid = ''; for (var r = 0; r < 3; r++) { for (var c = 0; c < 3; c++) { if (c === r) continue; grid += r + '' + c + ' '; } } console.log(grid);",
    "var q = 2; if (q) while (q) console.log(q--); else console.log('else'); console.log('after');",
    "var m = new Map([[1, 'a'], [2, 'b']]); for (var [k, v] of m) console.log(k + v); loop: for (;;) { for (;;) break loop; }",
  ];
  for (const p of programs) {
    let guardCalls = 0;
    const out = guard(p);
    assert.notEqual(out, p);
    assert.deepEqual(runInVm(out, () => void guardCalls++), runInVm(p), p);
    assert.ok(guardCalls > 0, p);
  }
});

test("a guard that throws stops a loop that never ends", () => {
  let n = 0;
  const stop = () => {
    if (++n > 1000) throw new RangeError("stopped");
  };
  assert.throws(() => runInVm(guard("while (true) {}"), stop), /stopped/);
  n = 0;
  assert.throws(() => runInVm(guard("for (;;);"), stop), /stopped/);
  n = 0;
  assert.throws(() => runInVm(guard("var x = 0; while (x >= 0) x = 1"), stop), /stopped/);
});

// ── Picking the scripts out of a page ─────────────────────────────────────────

test("only inline JavaScript scripts are rewritten", () => {
  assert.equal(scriptKind(""), "classic");
  assert.equal(scriptKind(' type="text/javascript"'), "classic");
  assert.equal(scriptKind(" type='application/javascript' defer"), "classic");
  assert.equal(scriptKind(' type=" Module "'), "module");
  assert.equal(scriptKind(" type=module"), "module");
  assert.equal(scriptKind(' type="application/json"'), null);
  assert.equal(scriptKind(' type="importmap"'), null);
  assert.equal(scriptKind(' type="text/template"'), null);
  assert.equal(scriptKind(' src="app.js"'), null);
  assert.equal(scriptKind(' data-src="x" type="text/javascript"'), "classic");
});

test("a page's inline scripts get guards with document line numbers; everything else is untouched", () => {
  const page = [
    "<!doctype html>", //                                                      1
    "<html><head>", //                                                         2
    '<script type="application/json">{"while": true}</script>', //            3
    '<script type="importmap">{"imports": {}}</script>', //                   4
    "<!-- <script>while (true) {}</script> -->", //                            5
    "<textarea><script>while (true) {}</script></textarea>", //               6
    '<script data-note="a > b">', //                                           7
    "let i = 0;", //                                                           8
    "while (true) {}", //                                                      9
    "</script>", //                                                            10
    '<script type="module">for (const x of [1]) {}</script>', //              11
    '<script src="x.js">while (true) {}</script>', //                         12
    "<script>while (true {</script>", //                                       13
    "</head><body><SCRIPT>do {} while (false)</SCRIPT></body></html>", //      14
  ].join("\n");
  const out = guardPreviewScripts(page, G);
  assert.deepEqual(calls(out), [9, 11, 14]);
  assert.equal(out.split("\n").length, page.split("\n").length);
  const lines = out.split("\n");
  const orig = page.split("\n");
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 13]) assert.equal(lines[n - 1], orig[n - 1], `line ${n}`);
  assert.equal(guardPreviewScripts("<p>no scripts</p>", G), "<p>no scripts</p>");
});

// ── The harness's guard, for real ───────────────────────────────────────────

/** Runs the harness of a built preview document in a vm "window", then `userCode`. */
function runPreview(userCode: string, loopMs: number) {
  const token = "abc123";
  const doc = buildPreviewDocument(guardPreviewScripts(`<script>${userCode}</script>`, loopGuardName(token)), token, { keepChars: 1024, loopMs });
  const scripts = [...doc.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.equal(scripts.length, 2, "harness + the user's script");
  const sent: unknown[] = [];
  const ctx = vm.createContext({
    parent: { postMessage: (m: unknown) => sent.push(m) },
    performance,
    setTimeout,
    console: { log() {}, info() {}, debug() {}, warn() {}, error() {} },
  });
  vm.runInContext("var window = globalThis; window.addEventListener = function () {};", ctx);
  vm.runInContext(scripts[0], ctx);
  return { sent, run: () => vm.runInContext(scripts[1], ctx, { timeout: 10_000 }), ctx, token };
}

test("the harness guard throws inside the page once a loop keeps it busy past the limit, and tells the parent", () => {
  const p = runPreview("var spins = 0;\nwhile (true) { spins++; }", 150);
  const t0 = performance.now();
  assert.throws(p.run, (e: Error) => e.name === "RangeError" && /Code Lab stopped a loop that ran longer than 0\.15 s \(line 2\)/.test(e.message));
  const took = performance.now() - t0;
  assert.ok(took >= 150 && took < 2000, `stopped after ${took} ms`);
  const msgs = p.sent.map((m) => parseWebMessage(m, p.token)).filter((m) => m?.t === "loop");
  assert.deepEqual(msgs, [{ imb: p.token, t: "loop", line: 2 }]);
});

test("the guard cannot be removed or replaced by the page", () => {
  const p = runPreview("", 1000);
  const name = loopGuardName(p.token);
  assert.equal(vm.runInContext(`typeof ${name}`, p.ctx), "function");
  vm.runInContext(`try { ${name} = null; delete window.${name}; } catch (e) {}`, p.ctx);
  assert.equal(vm.runInContext(`typeof ${name}`, p.ctx), "function");
});

test("a loop that awaits a timer between steps is never stopped; one that only awaits microtasks is", async () => {
  const p = runPreview(
    [
      "window.result = new Promise(function (resolve) {",
      "  (async function () {",
      "    var start = performance.now(), steps = 0;",
      "    while (performance.now() - start < 400) { await new Promise(function (r) { setTimeout(r, 5); }); steps++; }",
      "    var spins = 0;",
      "    try { while (true) { await null; spins++; } } catch (e) { resolve({ steps: steps, error: e.message }); }",
      "  })();",
      "});",
    ].join("\n"),
    150
  );
  p.run();
  const r = (await vm.runInContext("window.result", p.ctx)) as { steps: number; error: string };
  assert.ok(r.steps > 5, `the timer loop ran for 400 ms past a 150 ms budget (${r.steps} steps)`);
  assert.match(r.error, /ran longer than 0\.15 s \(line 6\)/);
});

// ── The runner turns the guard's report into a timeout ────────────────────────

test("the Web runner reports a guard stop as a timeout on the loop's line and removes the page", async () => {
  const g = globalThis as unknown as { window?: EventTarget };
  const hadWindow = "window" in g;
  const win = new EventTarget();
  g.window = win;
  try {
    const frame = {};
    let mounted: string | null = null;
    let unmounted = 0;
    const host: WebHost = {
      mount: (doc) => void (mounted = doc),
      unmount: () => void unmounted++,
      frameWindow: () => frame as Window,
    };
    const run = runInBrowser({ lang: "web", code: "<script>\nwhile (true) {}\n</script>", stdin: "", web: host, timeoutMs: 60_000 });
    while (mounted === null) await new Promise((r) => setTimeout(r, 5));
    const doc: string = mounted;
    const token = /var T="([a-z0-9]+)"/.exec(doc)?.[1] ?? "";
    assert.ok(token, "the harness carries the run token");
    assert.ok(doc.includes(`while (true) {${loopGuardName(token)}(2);}`), "the learner's loop is guarded with the run's guard");
    assert.match(doc, /LIM=60000;/, "the guard's budget is the run's time limit");
    const post = (data: unknown) => win.dispatchEvent(Object.assign(new Event("message"), { data, source: frame }));
    post({ imb: "forged", t: "loop", line: 1 });
    post({ imb: token, t: "log", level: "log", text: "before" });
    post({ imb: token, t: "loop", line: 2 });
    const out = await run;
    assert.equal(out.status, "timeout");
    assert.equal(out.errorLine, 2);
    assert.equal(out.stdout, "before\n");
    assert.equal(unmounted, 1);
  } finally {
    if (hadWindow) g.window = win;
    else delete g.window;
  }
});

test("the Web watchdog and the in-page guard share one budget", () => {
  assert.equal(BROWSER_LIMITS.webTimeoutMs, 5_000);
  const doc = buildPreviewDocument("<p>x</p>", "tok");
  assert.match(doc, /LIM=5000;/);
});
