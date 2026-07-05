import type { ExerciseTest, RunnerLang } from "@/data/lessons/types";

export interface ConsoleEntry {
  level: "log" | "warn" | "error";
  text: string;
}

export interface TestResult {
  i: number;
  pass: boolean;
  error?: string;
}

export type SandboxMessage =
  | { t: "console"; level: ConsoleEntry["level"]; text: string }
  | { t: "error"; message: string }
  | { t: "tests"; results: TestResult[] }
  | { t: "done" };

// The harness runs INSIDE the sandboxed iframe (opaque origin — no access to the
// parent DOM, localStorage, cookies, or the JWT). It captures console output,
// reports runtime errors, and evaluates exercise checks, all via postMessage.
function buildHarness(tests: ExerciseTest[]): string {
  const checks = JSON.stringify(tests.map((t) => t.check));
  return `<script>
(function () {
  var __consoleLog = [];
  window.__consoleLog = __consoleLog;
  function send(msg) { parent.postMessage(msg, "*"); }
  function fmt(args) {
    return Array.prototype.map.call(args, function (a) {
      if (typeof a === "object" && a !== null) {
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      }
      return String(a);
    }).join(" ");
  }
  ["log", "warn", "error"].forEach(function (level) {
    var orig = console[level];
    console[level] = function () {
      var text = fmt(arguments);
      __consoleLog.push(text);
      send({ t: "console", level: level, text: text });
      orig.apply(console, arguments);
    };
  });
  window.onerror = function (message) {
    send({ t: "error", message: String(message) });
  };
  window.addEventListener("load", function () {
    setTimeout(function () {
      var checks = ${checks};
      if (checks.length) {
        var results = checks.map(function (check, i) {
          try {
            var pass = !!(new Function("return (" + check + ")"))();
            return { i: i, pass: pass };
          } catch (e) {
            return { i: i, pass: false, error: String(e && e.message || e) };
          }
        });
        send({ t: "tests", results: results });
      }
      send({ t: "done" });
    }, 50);
  });
})();
<\/script>`;
}

const JS_SHELL_STYLE = `<style>
  body { background:#0d1117; color:#e6edf3; font-family:ui-monospace,monospace;
         font-size:13px; padding:12px; margin:0; }
</style>`;

export function buildSrcdoc(lang: RunnerLang, code: string, tests: ExerciseTest[]): string {
  const harness = buildHarness(tests);
  if (lang === "js") {
    // Harness first so console patching catches everything the user logs.
    // User code runs as its own top-level script (NOT wrapped in try/catch):
    // top-level let/const must land in the global lexical scope so test
    // expressions can see them; uncaught errors reach window.onerror anyway.
    return `<!DOCTYPE html><html><head><meta charset="utf-8">${JS_SHELL_STYLE}${harness}</head><body><script>
${code}
<\/script></body></html>`;
  }
  // lang === "web": user supplies the document; inject harness at the start of <head>
  // (or prepend if no <head>) so console/error capture is active before user scripts run.
  const doc = code;
  const headMatch = doc.match(/<head[^>]*>/i);
  if (headMatch && headMatch.index !== undefined) {
    const insertAt = headMatch.index + headMatch[0].length;
    return doc.slice(0, insertAt) + harness + doc.slice(insertAt);
  }
  return harness + doc;
}
