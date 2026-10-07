import { test } from "node:test";
import assert from "node:assert/strict";
import { WEB_PREVIEW_CSP, buildPreviewDocument, parseWebMessage } from "../../lib/codelab/web-sandbox";
import { buildPythonProgram, outputMarker, parsePythonOutput } from "../../lib/codelab/py-wrapper";
import { gradeLocally } from "../../lib/codelab/grading";
import type { PublicRunResult } from "../../shared/api";
import type { LabTest } from "../../data/lessons/types";

test("the preview CSP blocks all network access and plugins", () => {
  assert.match(WEB_PREVIEW_CSP, /default-src 'none'/);
  assert.doesNotMatch(WEB_PREVIEW_CSP, /connect-src/);
  assert.doesNotMatch(WEB_PREVIEW_CSP, /https?:/);
  assert.match(WEB_PREVIEW_CSP, /form-action 'none'/);
});

test("the harness and CSP come before any user markup, in a document, a head-less html or a fragment", () => {
  const doc = buildPreviewDocument("<!doctype html><html><head><title>x</title></head><body><script>alert(1)</script></body></html>", "tok");
  assert.ok(doc.indexOf("Content-Security-Policy") < doc.indexOf("alert(1)"));
  assert.ok(doc.indexOf("Content-Security-Policy") < doc.indexOf("<title>"));
  const noHead = buildPreviewDocument("<html><body><p>hi</p></body></html>", "tok");
  assert.ok(noHead.indexOf("Content-Security-Policy") < noHead.indexOf("<p>hi"));
  const frag = buildPreviewDocument("<h1>hi</h1>", "tok");
  assert.match(frag, /^<!doctype html>/);
  assert.ok(frag.indexOf("Content-Security-Policy") < frag.indexOf("<h1>hi"));
});

/** True when `index` in `doc` sits inside an HTML comment (an unclosed `<!--` before it). */
const inComment = (doc: string, index: number) => {
  const before = doc.slice(0, index);
  return before.lastIndexOf("<!--") > before.lastIndexOf("-->");
};

test("a <head> mentioned in a comment, a string or a script cannot push the CSP and harness into it", () => {
  const cases = [
    "<!-- Tip: styles belong in <head> -->\n<ul id=\"l\"></ul>\n<script>for (var i = 0; i < 3; i++) l.innerHTML += i</script>",
    "<!doctype html>\n<!-- <head> --><html><head><title>t</title></head><body>x</body></html>",
    "<html><body><script>var s = \"<head>\";</script></body></html>",
    "<textarea><head></textarea><p>hi</p>",
  ];
  for (const code of cases) {
    const doc = buildPreviewDocument(code, "tok");
    const csp = doc.indexOf("Content-Security-Policy");
    assert.ok(csp >= 0 && !inComment(doc, csp), `CSP outside any comment: ${code}`);
    assert.ok(!inComment(doc, doc.indexOf("<script>(function(){")), `harness outside any comment: ${code}`);
    assert.ok(csp < doc.indexOf("<script>", csp + 1) || !code.includes("<script>"), `CSP before the learner's scripts: ${code}`);
  }
});

test("a learner script before <head> still runs after the CSP and the harness", () => {
  const code = "<!doctype html>\n<script>for (;;) {}</script>\n<html><head><title>t</title></head><body></body></html>";
  const doc = buildPreviewDocument(code, "tok");
  assert.ok(doc.indexOf("Content-Security-Policy") < doc.indexOf("for (;;)"));
  assert.ok(doc.indexOf("<script>(function(){") < doc.indexOf("for (;;)"));
});

test("a leading doctype (even after comments) stays first, so the page keeps its rendering mode", () => {
  for (const code of ["<!DOCTYPE html>\n<html><head></head><body>x</body></html>", "<!-- page -->\n<!doctype html>\n<html><body>x</body></html>"]) {
    const doc = buildPreviewDocument(code, "tok");
    const doctypeEnd = code.toLowerCase().indexOf("<!doctype html>") + "<!doctype html>".length;
    assert.equal(doc.slice(0, doctypeEnd), code.slice(0, doctypeEnd), "nothing is inserted before the doctype");
    assert.ok(doc.indexOf("Content-Security-Policy") >= doctypeEnd);
  }
  // A document without a doctype is not given one (it would change how the learner's page renders).
  assert.doesNotMatch(buildPreviewDocument("<html><body>x</body></html>", "tok"), /<!doctype/i);
});

test("the harness does not shift the user's line numbers", () => {
  const lineOf = (s: string, needle: string) => s.slice(0, s.indexOf(needle)).split("\n").length;
  for (const code of [
    "<!doctype html>\n<html>\n<head>\n<script>\nconsole.log(1)\n</script>\n</head></html>",
    "<!-- a\nmulti-line\ncomment -->\n<!doctype html>\n<script>\nconsole.log(1)\n</script>",
    "\n\n<html>\n<body>\n<script>console.log(1)</script></body></html>",
  ]) {
    const doc = buildPreviewDocument(code, "tok");
    assert.equal(lineOf(doc, "console.log(1)"), lineOf(code, "console.log(1)"), code);
  }
});

test("only messages carrying this run's token are accepted", () => {
  assert.deepEqual(parseWebMessage({ imb: "tok", t: "log", level: "warn", text: "hi" }, "tok"), { imb: "tok", t: "log", level: "warn", text: "hi" });
  assert.equal(parseWebMessage({ imb: "other", t: "done" }, "tok"), null);
  assert.equal(parseWebMessage({ t: "done" }, "tok"), null);
  assert.equal(parseWebMessage("done", "tok"), null);
  assert.equal(parseWebMessage({ imb: "tok", t: "log", text: 5 }, "tok"), null);
  assert.deepEqual(parseWebMessage({ imb: "tok", t: "error", message: "boom", line: 3 }, "tok"), { imb: "tok", t: "error", message: "boom", line: 3, col: undefined });
});

test("the Python wrapper embeds code and stdin as literals, never as source", () => {
  const evil = 'x = 1\n"""\nimport os; os.system("rm -rf /")\n';
  const program = buildPythonProgram(evil, 'in"put\n', "abc");
  assert.ok(program.includes(JSON.stringify(evil)));
  assert.ok(program.includes(JSON.stringify('in"put\n')));
  assert.ok(!program.split("\n").some((l) => l.startsWith("import os")));
  assert.ok(program.includes('compile(_imb_src, "main.py", "exec")'));
});

test("the Python output marker splits stdout, stderr and the exit code", () => {
  const m = outputMarker("abc");
  assert.deepEqual(parsePythonOutput(`out line\n${m}0:`, "abc"), { stdout: "out line\n", stderr: "", exitCode: 0 });
  assert.deepEqual(parsePythonOutput(`partial${m}1:Traceback...\nValueError: x\n`, "abc"), { stdout: "partial", stderr: "Traceback...\nValueError: x\n", exitCode: 1 });
  // A program printing a look-alike marker for another token cannot forge the result.
  assert.equal(parsePythonOutput(`${outputMarker("zzz")}0:${m}2:`, "abc").exitCode, 2);
  assert.deepEqual(parsePythonOutput("no marker", "abc"), { stdout: "no marker", stderr: "", exitCode: 1 });
});

const result = (over: Partial<PublicRunResult> = {}): PublicRunResult => ({
  status: "ok",
  exitCode: 0,
  stdout: "",
  stderr: "",
  stdoutBytes: 0,
  stderrBytes: 0,
  truncated: { stdout: false, stderr: false },
  runMs: 1,
  compileMs: 0,
  ...over,
});

const tests: LabTest[] = [
  { name: { en: "adds 1+2", ar: "يجمع 1+2" }, stdin: "1 2\n", expected: "3" },
  { name: { en: "adds 5+5", ar: "يجمع 5+5" }, stdin: "5 5\n", expected: "10", mode: "exact" },
];

test("local grading uses the shared matcher and reports expected/actual for failures", async () => {
  const grade = await gradeLocally({
    tests,
    lang: "en",
    runOne: async (stdin) => {
      const [a, b] = stdin.trim().split(" ").map(Number);
      const out = `${a + b}\n`;
      return { stdout: out, result: result({ stdout: out }) };
    },
  });
  assert.equal(grade.tests[0].passed, true, "trim mode ignores the trailing newline");
  assert.equal(grade.tests[1].passed, false, "exact mode does not");
  assert.equal(grade.tests[1].expected, "10");
  assert.equal(grade.tests[1].actual, "10\n");
  assert.equal(grade.passed, false);
  assert.equal(grade.score, 0.5);
});

test("test names are localized, and a crash fails the test with the runner's message", async () => {
  const grade = await gradeLocally({
    tests: [tests[0]],
    lang: "ar",
    runOne: async () => ({ stdout: "3", result: result({ status: "runtime_error", exitCode: 1, message: "ZeroDivisionError" }) }),
  });
  assert.equal(grade.tests[0].name, "يجمع 1+2");
  assert.equal(grade.tests[0].passed, false);
  assert.equal(grade.tests[0].message, "ZeroDivisionError");
});

test("a runaway program is not re-run for every remaining test", async () => {
  let calls = 0;
  const grade = await gradeLocally({
    tests: [tests[0], tests[1], tests[0]],
    lang: "en",
    runOne: async () => {
      calls += 1;
      return { stdout: "", result: result({ status: "timeout", exitCode: null }) };
    },
  });
  assert.equal(calls, 1);
  assert.deepEqual(grade.tests.map((t) => t.passed), [false, false, false]);
  assert.equal(grade.tests[2].message, "timeout");
  const skipped = await gradeLocally({ tests, lang: "en", hardFailure: "timeout", runOne: async () => { throw new Error("must not run"); } });
  assert.equal(skipped.passed, false);
});

test("grading stops when the run is aborted", async () => {
  const ac = new AbortController();
  ac.abort();
  await assert.rejects(gradeLocally({ tests, lang: "en", signal: ac.signal, runOne: async () => ({ stdout: "", result: result() }) }), { name: "AbortError" });
});
