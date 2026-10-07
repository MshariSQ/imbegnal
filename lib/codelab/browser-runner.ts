/**
 * In-browser runners: JavaScript (Web Worker), Python (Pyodide worker) and Web
 * pages (sandboxed iframe). They back guests and the offline fallback, and
 * produce the same `PublicRunResult` shape the Output panel renders for server runs.
 *
 * Hard limits (all enforced here, not trusted to the program):
 *  - wall-clock timeout that TERMINATES the worker (JS, Python) or removes the
 *    iframe (Web), so an infinite loop cannot outlive the run. For Web the loop
 *    guards inserted into the page's scripts (loop-guard.ts) stop a runaway loop
 *    inside the frame too, for browsers where the frame shares this page's thread
 *    and this timer could never fire;
 *  - output cap: we keep the first `keepChars` of each stream and abort the run
 *    when a stream passes `killChars`;
 *  - Stop (AbortSignal) terminates the same way.
 */
import type { PublicRunResult } from "../../shared/api";
import { RuntimeLoadError } from "./errors";
import { buildPythonProgram, parsePythonOutput } from "./py-wrapper";
import { WEB_LIMITS, buildPreviewDocument, loopGuardName, parseWebMessage } from "./web-sandbox";
import type { JsRunRequest, JsWorkerMessage } from "./js-worker";

export type BrowserLang = "javascript" | "python" | "web";

export const BROWSER_LIMITS = {
  jsTimeoutMs: 5_000,
  pythonTimeoutMs: 10_000,
  /** Also the loop guard's budget inside the preview frame. */
  webTimeoutMs: WEB_LIMITS.loopMs,
  /** Download + start-up of Pyodide (~10 MB) on a slow connection. */
  pythonLoadTimeoutMs: 120_000,
  keepChars: 64 * 1024,
  killChars: 1024 * 1024,
} as const;

export type BrowserPhase = "loading-runtime" | "running";

/** How the Web runner reaches the preview iframe that the UI renders. */
export interface WebHost {
  mount(srcDoc: string): void;
  unmount(): void;
  frameWindow(): Window | null;
}

export interface BrowserRunOptions {
  lang: BrowserLang;
  code: string;
  stdin: string;
  signal?: AbortSignal;
  onPhase?: (phase: BrowserPhase) => void;
  /** Required for lang "web". */
  web?: WebHost;
  /** Override the wall-clock limit (tests). */
  timeoutMs?: number;
}

export interface BrowserRunOutcome extends PublicRunResult {
  /** 1-based line of the first error in the learner's code, when the runtime reported one. */
  errorLine?: number;
}

const utf8Length = (s: string) => new TextEncoder().encode(s).length;

export function abortError(): DOMException {
  return new DOMException("The run was stopped", "AbortError");
}

function randomToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface StreamBuf {
  text: string;
  /** Characters seen, including dropped ones. */
  total: number;
  truncated: boolean;
}
const newBuf = (): StreamBuf => ({ text: "", total: 0, truncated: false });

function appendCapped(buf: StreamBuf, chunk: string, keep: number) {
  buf.total += chunk.length;
  if (buf.text.length < keep) {
    const room = keep - buf.text.length;
    buf.text += chunk.length > room ? chunk.slice(0, room) : chunk;
  }
  if (buf.total > keep) buf.truncated = true;
}

function resultOf(args: {
  status: PublicRunResult["status"];
  exitCode: number | null;
  stdout: StreamBuf;
  stderr: StreamBuf;
  compileOutput?: string;
  runMs: number;
  message?: string;
  signal?: string;
}): PublicRunResult {
  return {
    status: args.status,
    exitCode: args.exitCode,
    signal: args.signal ?? null,
    stdout: args.stdout.text,
    stderr: args.stderr.text,
    compileOutput: args.compileOutput,
    stdoutBytes: utf8Length(args.stdout.text) + Math.max(0, args.stdout.total - args.stdout.text.length),
    stderrBytes: utf8Length(args.stderr.text) + Math.max(0, args.stderr.total - args.stderr.text.length),
    truncated: { stdout: args.stdout.truncated, stderr: args.stderr.truncated },
    runMs: Math.round(args.runMs),
    compileMs: 0,
    message: args.message,
  };
}

export function runInBrowser(opts: BrowserRunOptions): Promise<BrowserRunOutcome> {
  if (opts.signal?.aborted) return Promise.reject(abortError());
  switch (opts.lang) {
    case "javascript":
      return runJavaScript(opts);
    case "python":
      return runPythonCode(opts);
    case "web":
      return runWeb(opts);
  }
}

// ── JavaScript ───────────────────────────────────────────────────────────────

function runJavaScript(opts: BrowserRunOptions): Promise<BrowserRunOutcome> {
  return new Promise((resolve, reject) => {
    const timeoutMs = opts.timeoutMs ?? BROWSER_LIMITS.jsTimeoutMs;
    let worker: Worker;
    try {
      worker = new Worker(new URL("./js-worker.ts", import.meta.url));
    } catch (err) {
      reject(new RuntimeLoadError("javascript", err));
      return;
    }
    const stdout = newBuf();
    const stderr = newBuf();
    const t0 = performance.now();
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      fn();
    };
    const onAbort = () => finish(() => reject(abortError()));
    opts.signal?.addEventListener("abort", onAbort, { once: true });

    const timer = setTimeout(
      () =>
        finish(() =>
          resolve(resultOf({ status: "timeout", exitCode: null, signal: "SIGKILL", stdout, stderr, runMs: performance.now() - t0 }))
        ),
      timeoutMs
    );

    worker.onmessage = (e: MessageEvent<JsWorkerMessage>) => {
      const m = e.data;
      if (m.type === "out") {
        appendCapped(m.stream === "stdout" ? stdout : stderr, m.text, BROWSER_LIMITS.keepChars);
      } else if (m.type === "flood") {
        // Everything past the kept prefix was dropped; say so.
        (m.stream === "stderr" ? stderr : stdout).truncated = true;
        finish(() => resolve(resultOf({ status: "output_limit", exitCode: null, signal: "SIGKILL", stdout, stderr, runMs: performance.now() - t0 })));
      } else if (m.type === "done") {
        // The worker only forwards the kept prefix; its totals tell us what was dropped.
        stdout.total = Math.max(stdout.total, m.totals.stdout);
        stderr.total = Math.max(stderr.total, m.totals.stderr);
        stdout.truncated = stdout.total > stdout.text.length;
        stderr.truncated = stderr.total > stderr.text.length;
        finish(() =>
          resolve({
            ...resultOf({ status: m.exitCode === 0 ? "ok" : "runtime_error", exitCode: m.exitCode, stdout, stderr, runMs: performance.now() - t0 }),
            errorLine: m.errorLine,
          })
        );
      }
    };
    worker.onerror = (e) => {
      e.preventDefault();
      finish(() =>
        resolve(
          resultOf({
            status: "internal_error",
            exitCode: null,
            stdout,
            stderr,
            runMs: performance.now() - t0,
            message: e.message || "The JavaScript worker failed to start.",
          })
        )
      );
    };

    const req: JsRunRequest = {
      type: "run",
      code: opts.code,
      stdin: opts.stdin,
      keepChars: BROWSER_LIMITS.keepChars,
      killChars: BROWSER_LIMITS.killChars,
    };
    opts.onPhase?.("running");
    worker.postMessage(req);
  });
}

// ── Python (Pyodide) ─────────────────────────────────────────────────────────

let pyWorker: Worker | null = null;
let pyReady = false;

function getPyWorker(): Worker {
  if (!pyWorker) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    pyWorker = new Worker(`${base}/pyodide-worker.js`);
    pyReady = false;
  }
  return pyWorker;
}

function killPyWorker(w: Worker) {
  try {
    w.terminate();
  } catch {
    // already gone
  }
  if (pyWorker === w) {
    pyWorker = null;
    pyReady = false;
  }
}

const SYNTAX_ERRORS = /^(SyntaxError|IndentationError|TabError)\b/;

function runPythonCode(opts: BrowserRunOptions): Promise<BrowserRunOutcome> {
  return new Promise((resolve, reject) => {
    const token = randomToken();
    const program = buildPythonProgram(opts.code, opts.stdin, token);
    const timeoutMs = opts.timeoutMs ?? BROWSER_LIMITS.pythonTimeoutMs;
    let w: Worker;
    try {
      w = getPyWorker();
    } catch (err) {
      reject(new RuntimeLoadError("python", err));
      return;
    }
    let settled = false;
    let runStart = 0;
    let runTimer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      settled = true;
      clearTimeout(runTimer);
      clearTimeout(loadTimer);
      w.removeEventListener("message", onMsg);
      w.removeEventListener("error", onWorkerError);
      opts.signal?.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      if (settled) return;
      cleanup();
      killPyWorker(w);
      reject(abortError());
    };
    opts.signal?.addEventListener("abort", onAbort, { once: true });

    const loadTimer = setTimeout(() => {
      if (settled) return;
      cleanup();
      killPyWorker(w);
      reject(new RuntimeLoadError("python"));
    }, BROWSER_LIMITS.pythonLoadTimeoutMs);

    const startRunTimer = () => {
      runStart = performance.now();
      clearTimeout(loadTimer);
      runTimer = setTimeout(() => {
        if (settled) return;
        cleanup();
        killPyWorker(w); // a stuck interpreter cannot be interrupted: throw it away
        resolve(
          resultOf({ status: "timeout", exitCode: null, signal: "SIGKILL", stdout: newBuf(), stderr: newBuf(), runMs: performance.now() - runStart })
        );
      }, timeoutMs);
    };

    function onMsg(e: MessageEvent) {
      if (settled) return;
      const msg = e.data as { t?: string; stdout?: string; error?: string | null; message?: string };
      if (msg.t === "loading") {
        if (!pyReady) opts.onPhase?.("loading-runtime");
      } else if (msg.t === "ready") {
        pyReady = true;
        opts.onPhase?.("running");
        startRunTimer();
      } else if (msg.t === "result") {
        const ranFor = performance.now() - (runStart || performance.now());
        cleanup();
        const parsed = parsePythonOutput(msg.stdout ?? "", token);
        const out = newBuf();
        const err = newBuf();
        appendCapped(out, parsed.stdout, BROWSER_LIMITS.keepChars);
        // `error` is set only if the wrapper itself failed (e.g. out of memory): surface it.
        appendCapped(err, parsed.stderr || (msg.error ? `${msg.error}\n` : ""), BROWSER_LIMITS.keepChars);
        const lastLine = err.text.trim().split("\n").pop() ?? "";
        if (parsed.exitCode !== 0 && SYNTAX_ERRORS.test(lastLine)) {
          resolve({
            ...resultOf({ status: "compile_error", exitCode: 1, stdout: out, stderr: newBuf(), compileOutput: err.text, runMs: ranFor }),
            errorLine: pythonErrorLine(err.text),
          });
          return;
        }
        resolve({
          ...resultOf({ status: parsed.exitCode === 0 ? "ok" : "runtime_error", exitCode: parsed.exitCode, stdout: out, stderr: err, runMs: ranFor }),
          errorLine: parsed.exitCode === 0 ? undefined : pythonErrorLine(err.text),
        });
      } else if (msg.t === "fatal") {
        const loaded = runStart > 0;
        cleanup();
        killPyWorker(w);
        if (!loaded) reject(new RuntimeLoadError("python", msg.message));
        else
          resolve(
            resultOf({ status: "internal_error", exitCode: null, stdout: newBuf(), stderr: newBuf(), runMs: performance.now() - runStart, message: msg.message })
          );
      }
    }
    function onWorkerError() {
      if (settled) return;
      cleanup();
      killPyWorker(w);
      reject(new RuntimeLoadError("python"));
    }
    w.addEventListener("message", onMsg);
    w.addEventListener("error", onWorkerError);
    w.postMessage({ cmd: "run", code: program, tests: [] });
  });
}

/** The line of the last `File "main.py", line N` frame (where it failed in the learner's code). */
export function pythonErrorLine(stderr: string): number | undefined {
  let line: number | undefined;
  for (const m of stderr.matchAll(/File "main\.py", line (\d+)/g)) line = Number(m[1]);
  return line;
}

// ── Web (HTML/CSS/JS) ────────────────────────────────────────────────────────

/**
 * Inserts the loop guards. acorn is loaded only now, so pages that never run Web
 * code do not download it. If the chunk cannot load (offline, stale deploy) the
 * page runs unguarded: the parent watchdog still applies where it can.
 */
async function guardLoops(code: string, token: string): Promise<string> {
  try {
    const { guardPreviewScripts } = await import("./loop-guard");
    return guardPreviewScripts(code, loopGuardName(token));
  } catch {
    return code;
  }
}

async function runWeb(opts: BrowserRunOptions): Promise<BrowserRunOutcome> {
  if (!opts.web) throw new Error("The web runner needs a preview host");
  const token = randomToken();
  const code = await guardLoops(opts.code, token);
  if (opts.signal?.aborted) throw abortError();
  return runWebPage(opts, opts.web, token, code);
}

function runWebPage(opts: BrowserRunOptions, web: WebHost, token: string, code: string): Promise<BrowserRunOutcome> {
  return new Promise((resolve, reject) => {
    const timeoutMs = opts.timeoutMs ?? BROWSER_LIMITS.webTimeoutMs;
    const stdout = newBuf();
    const stderr = newBuf();
    const t0 = performance.now();
    let settled = false;
    let firstErrorLine: number | undefined;
    let sawError = false;

    const cleanup = () => {
      settled = true;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      opts.signal?.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      if (settled) return;
      cleanup();
      web.unmount();
      reject(abortError());
    };
    opts.signal?.addEventListener("abort", onAbort, { once: true });

    const timer = setTimeout(() => {
      if (settled) return;
      cleanup();
      web.unmount(); // removing the frame stops its scripts
      resolve(resultOf({ status: "timeout", exitCode: null, signal: "SIGKILL", stdout, stderr, runMs: performance.now() - t0 }));
    }, timeoutMs);

    function onMessage(e: MessageEvent) {
      const frame = web.frameWindow();
      if (settled || !frame || e.source !== frame) return;
      const m = parseWebMessage(e.data, token);
      if (!m) return;
      if (m.t === "log") {
        appendCapped(m.level === "error" ? stderr : stdout, `${m.text}\n`, WEB_LIMITS.keepChars);
      } else if (m.t === "error") {
        sawError = true;
        if (firstErrorLine === undefined && m.line) firstErrorLine = m.line;
        appendCapped(stderr, `${m.line ? `Line ${m.line}: ` : ""}${m.message}\n`, WEB_LIMITS.keepChars);
      } else if (m.t === "loop") {
        // A loop guard fired inside the frame: the same outcome as the watchdog,
        // but it also knows which loop. Stop the page like the watchdog does.
        cleanup();
        web.unmount();
        resolve({
          ...resultOf({ status: "timeout", exitCode: null, signal: "SIGKILL", stdout, stderr, runMs: performance.now() - t0 }),
          errorLine: m.line,
        });
      } else if (m.t === "done") {
        // The page stays mounted so the learner can use it; only the run is over.
        cleanup();
        resolve({
          ...resultOf({ status: sawError ? "runtime_error" : "ok", exitCode: sawError ? 1 : 0, stdout, stderr, runMs: performance.now() - t0 }),
          errorLine: firstErrorLine,
        });
      }
    }
    window.addEventListener("message", onMessage);
    web.mount(buildPreviewDocument(code, token, { ...WEB_LIMITS, loopMs: timeoutMs }));
    opts.onPhase?.("running");
  });
}
