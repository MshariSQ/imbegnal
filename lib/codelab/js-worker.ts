/**
 * Web Worker that runs the learner's JavaScript for the browser fallback.
 *
 * Why a worker: the parent can `terminate()` it, so an infinite loop is killed
 * instead of freezing the page. It has no DOM, no cookies and no access to the
 * site's localStorage (the JWT), and we remove the network APIs before running
 * user code. It emulates the bits of Node.js that beginners use (console,
 * process.stdout.write/exit, require("fs"/"readline"/"util"/"os") for stdin) so
 * the same program behaves like the server's Node runner.
 *
 * Bundled by Next from `new Worker(new URL("./js-worker.ts", import.meta.url))`,
 * so it is served from our own origin (allowed by the site CSP). It must not
 * import anything: it is a standalone script.
 *
 * Protocol (parent <- worker):
 *   { type: "out", stream: "stdout" | "stderr", text }   output kept so far (capped)
 *   { type: "done", exitCode, totals: { stdout, stderr }, errorLine? }
 *   { type: "flood" }                                      the program wrote > killChars
 */

export interface JsRunRequest {
  type: "run";
  code: string;
  stdin: string;
  /** Characters of each stream forwarded to the page. */
  keepChars: number;
  /** Characters of one stream after which the run is aborted. */
  killChars: number;
}

export type JsWorkerMessage =
  | { type: "out"; stream: "stdout" | "stderr"; text: string }
  | { type: "done"; exitCode: number; totals: { stdout: number; stderr: number }; errorLine?: number }
  | { type: "flood" };

interface WorkerScope {
  postMessage(message: JsWorkerMessage): void;
  onmessage: ((e: MessageEvent<JsRunRequest>) => void) | null;
  addEventListener(type: string, listener: (e: never) => void): void;
}

const scope = self as unknown as WorkerScope;
const g = globalThis as unknown as Record<string, unknown>;

// Capture what the program must not be able to replace.
const post = scope.postMessage.bind(scope);
const nativeSetTimeout = globalThis.setTimeout.bind(globalThis);
const nativeClearTimeout = globalThis.clearTimeout.bind(globalThis);
const nativeSetInterval = globalThis.setInterval.bind(globalThis);
const nativeClearInterval = globalThis.clearInterval.bind(globalThis);

class ExitSignal {
  constructor(readonly code: number) {}
}
class FloodSignal {}

let started = false;

scope.onmessage = (e) => {
  if (started || !e.data || e.data.type !== "run") return;
  started = true;
  void main(e.data);
};

async function main(req: JsRunRequest): Promise<void> {
  const totals = { stdout: 0, stderr: 0 };
  const kept = { stdout: 0, stderr: 0 };
  let exitCode = 0;
  let errorLine: number | undefined;
  let halted = false;
  let flooded = false;
  let exitCodeSetByProgram: number | undefined;

  const emit = (stream: "stdout" | "stderr", text: string) => {
    if (flooded) throw new FloodSignal();
    totals[stream] += text.length;
    if (kept[stream] < req.keepChars) {
      const room = req.keepChars - kept[stream];
      const part = text.length > room ? text.slice(0, room) : text;
      kept[stream] += part.length;
      post({ type: "out", stream, text: part });
    }
    if (totals[stream] > req.killChars) {
      flooded = true;
      post({ type: "flood" });
      throw new FloodSignal();
    }
  };

  const finish = () => {
    if (halted) return;
    halted = true;
    post({ type: "done", exitCode: exitCodeSetByProgram !== undefined && exitCode === 0 ? exitCodeSetByProgram : exitCode, totals, errorLine });
  };

  // ── Output formatting (a small subset of Node's util.inspect) ──────────────
  const inspect = (v: unknown, depth = 0, seen: WeakSet<object> = new WeakSet()): string => {
    const top = depth === 0;
    switch (typeof v) {
      case "string":
        return top ? v : `'${v.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}'`;
      case "bigint":
        return `${v}n`;
      case "symbol":
        return v.toString();
      case "function":
        return `[Function${v.name ? `: ${v.name}` : " (anonymous)"}]`;
      case "undefined":
        return "undefined";
      case "object": {
        if (v === null) return "null";
        if (seen.has(v)) return "[Circular]";
        if (v instanceof Error) return v.stack || `${v.name}: ${v.message}`;
        if (depth > 2) return Array.isArray(v) ? "[Array]" : "[Object]";
        seen.add(v);
        try {
          if (Array.isArray(v)) {
            const items = v.slice(0, 100).map((x) => inspect(x, depth + 1, seen));
            if (v.length > 100) items.push(`... ${v.length - 100} more items`);
            return items.length ? `[ ${items.join(", ")} ]` : "[]";
          }
          if (v instanceof Map) {
            const items = [...v.entries()].slice(0, 100).map(([k, x]) => `${inspect(k, depth + 1, seen)} => ${inspect(x, depth + 1, seen)}`);
            return `Map(${v.size}) { ${items.join(", ")} }`;
          }
          if (v instanceof Set) {
            const items = [...v.values()].slice(0, 100).map((x) => inspect(x, depth + 1, seen));
            return `Set(${v.size}) { ${items.join(", ")} }`;
          }
          if (v instanceof Date) return v.toISOString();
          if (v instanceof RegExp) return String(v);
          const keys = Object.keys(v);
          const name = (v as { constructor?: { name?: string } }).constructor?.name;
          const prefix = name && name !== "Object" ? `${name} ` : "";
          if (!keys.length) return `${prefix}{}`;
          const items = keys.slice(0, 100).map((k) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`}: ${inspect((v as Record<string, unknown>)[k], depth + 1, seen)}`);
          return `${prefix}{ ${items.join(", ")} }`;
        } catch {
          return "[Object]";
        } finally {
          seen.delete(v);
        }
      }
      default:
        return String(v);
    }
  };

  const formatLog = (args: unknown[]): string => {
    if (typeof args[0] === "string" && /%[sdifjoO%]/.test(args[0])) {
      let i = 1;
      const first = (args[0] as string).replace(/%([sdifjoO%])/g, (m, c: string) => {
        if (c === "%") return "%";
        if (i >= args.length) return m;
        const a = args[i++];
        if (c === "s") return typeof a === "string" ? a : inspect(a, 1);
        if (c === "d" || c === "i") return String(c === "i" ? Math.trunc(Number(a)) : Number(a));
        if (c === "f") return String(parseFloat(String(a)));
        if (c === "j") {
          try {
            return JSON.stringify(a);
          } catch {
            return "[Circular]";
          }
        }
        return inspect(a, 1);
      });
      return [first, ...args.slice(i).map((a) => inspect(a))].join(" ");
    }
    return args.map((a) => inspect(a)).join(" ");
  };

  let groupIndent = "";
  const line = (stream: "stdout" | "stderr") => (...args: unknown[]) => {
    const text = formatLog(args);
    emit(stream, `${groupIndent ? text.split("\n").map((l) => groupIndent + l).join("\n") : text}\n`);
  };
  const counts = new Map<string, number>();
  const timers = new Map<string, number>();
  const fakeConsole = {
    log: line("stdout"),
    info: line("stdout"),
    debug: line("stdout"),
    dir: (v: unknown) => emit("stdout", `${inspect(v, 1)}\n`),
    table: line("stdout"),
    warn: line("stderr"),
    error: line("stderr"),
    trace: line("stderr"),
    assert: (cond: unknown, ...args: unknown[]) => {
      if (!cond) line("stderr")("Assertion failed" + (args.length ? ":" : ""), ...args);
    },
    count: (label = "default") => {
      const n = (counts.get(label) ?? 0) + 1;
      counts.set(label, n);
      line("stdout")(`${label}: ${n}`);
    },
    countReset: (label = "default") => void counts.delete(label),
    time: (label = "default") => void timers.set(label, performance.now()),
    timeEnd: (label = "default") => {
      const t = timers.get(label);
      if (t !== undefined) line("stdout")(`${label}: ${(performance.now() - t).toFixed(3)}ms`);
      timers.delete(label);
    },
    timeLog: (label = "default") => {
      const t = timers.get(label);
      if (t !== undefined) line("stdout")(`${label}: ${(performance.now() - t).toFixed(3)}ms`);
    },
    group: (...args: unknown[]) => {
      if (args.length) line("stdout")(...args);
      groupIndent += "  ";
    },
    groupEnd: () => {
      groupIndent = groupIndent.slice(2);
    },
    clear: () => {},
  };
  g.console = fakeConsole;

  // ── Pending-work tracking: a program is finished when nothing is scheduled ──
  const activeTimers = new Set<unknown>();
  let ioWaiters = 0;

  const guard = (fn: () => void) => {
    try {
      fn();
    } catch (err) {
      handleThrown(err);
    }
  };

  g.setTimeout = (fn: unknown, ms?: number, ...args: unknown[]) => {
    if (typeof fn !== "function") return 0;
    const id = nativeSetTimeout(() => {
      activeTimers.delete(id);
      guard(() => (fn as (...a: unknown[]) => void)(...args));
    }, ms);
    activeTimers.add(id);
    return id;
  };
  g.clearTimeout = (id: never) => {
    activeTimers.delete(id);
    nativeClearTimeout(id);
  };
  g.setInterval = (fn: unknown, ms?: number, ...args: unknown[]) => {
    if (typeof fn !== "function") return 0;
    const id = nativeSetInterval(() => guard(() => (fn as (...a: unknown[]) => void)(...args)), ms);
    activeTimers.add(id);
    return id;
  };
  g.clearInterval = (id: never) => {
    activeTimers.delete(id);
    nativeClearInterval(id);
  };
  g.setImmediate = (fn: unknown, ...args: unknown[]) => (g.setTimeout as (f: unknown, m: number, ...a: unknown[]) => unknown)(fn, 0, ...args);

  // ── Error reporting ────────────────────────────────────────────────────────
  const locate = (stack: string | undefined): { line?: number; frames: string[] } => {
    if (!stack) return { frames: [] };
    const frames = stack.split("\n").filter((l) => /main\.js:\d+/.test(l));
    const m = frames[0]?.match(/main\.js:(\d+)/);
    return { line: m ? Number(m[1]) : undefined, frames: frames.slice(0, 6) };
  };

  const reportError = (err: unknown) => {
    const e = err instanceof Error ? err : null;
    const head = e ? `${e.name}: ${e.message}` : `Uncaught ${inspect(err, 1)}`;
    const loc = locate(e?.stack);
    if (loc.line !== undefined && errorLine === undefined) errorLine = loc.line;
    const where = loc.line !== undefined ? `main.js:${loc.line}\n` : "";
    emit("stderr", `${where}${head}\n${loc.frames.map((f) => (f.startsWith("    ") ? f : `    ${f}`)).join("\n")}${loc.frames.length ? "\n" : ""}`);
  };

  function handleThrown(err: unknown) {
    if (err instanceof FloodSignal) {
      halted = true; // the page already got the "flood" message and terminates us
      return;
    }
    if (err instanceof ExitSignal) {
      exitCode = err.code;
      finish();
      return;
    }
    try {
      reportError(err);
    } catch {
      // the error text itself overflowed the output cap
    }
    exitCode = 1;
    finish();
  }

  scope.addEventListener("unhandledrejection", ((ev: { reason: unknown; preventDefault(): void }) => {
    ev.preventDefault();
    handleThrown(ev.reason);
  }) as never);
  scope.addEventListener("error", ((ev: { error?: unknown; message?: string; preventDefault(): void }) => {
    ev.preventDefault();
    handleThrown(ev.error ?? new Error(ev.message ?? "Uncaught error"));
  }) as never);

  // ── Node-flavoured globals ─────────────────────────────────────────────────
  const stdinText = req.stdin;
  const stdinLines = (() => {
    const parts = stdinText.replace(/\r\n?/g, "\n").split("\n");
    if (parts.length && parts[parts.length - 1] === "") parts.pop();
    return parts;
  })();

  type Listener = (...a: unknown[]) => void;
  const makeEmitter = () => {
    const map = new Map<string, Listener[]>();
    const api = {
      on(ev: string, fn: Listener) {
        map.set(ev, [...(map.get(ev) ?? []), fn]);
        return api;
      },
      once(ev: string, fn: Listener) {
        const wrapper: Listener = (...a) => {
          api.off(ev, wrapper);
          fn(...a);
        };
        return api.on(ev, wrapper);
      },
      off(ev: string, fn: Listener) {
        map.set(ev, (map.get(ev) ?? []).filter((f) => f !== fn));
        return api;
      },
      emit(ev: string, ...a: unknown[]) {
        for (const fn of map.get(ev) ?? []) fn(...a);
      },
      has: (ev: string) => (map.get(ev) ?? []).length > 0,
    };
    return api;
  };

  const stdout = { write: (s: unknown) => (emit("stdout", String(s)), true), isTTY: false, columns: 80 };
  const stderr = { write: (s: unknown) => (emit("stderr", String(s)), true), isTTY: false, columns: 80 };

  const stdinEmitter = makeEmitter();
  let stdinFlowing = false;
  const startStdinFlow = () => {
    if (stdinFlowing) return;
    stdinFlowing = true;
    ioWaiters++;
    (g.setTimeout as (f: () => void, m: number) => void)(() => {
      ioWaiters--;
      if (stdinText) stdinEmitter.emit("data", stdinText);
      stdinEmitter.emit("end");
      stdinEmitter.emit("close");
    }, 0);
  };
  const stdin = {
    on(ev: string, fn: Listener) {
      stdinEmitter.on(ev, fn);
      if (ev === "data" || ev === "end" || ev === "readable") startStdinFlow();
      return stdin;
    },
    once(ev: string, fn: Listener) {
      stdinEmitter.once(ev, fn);
      if (ev === "data" || ev === "end") startStdinFlow();
      return stdin;
    },
    setEncoding: () => stdin,
    resume: () => stdin,
    pause: () => stdin,
    read: () => null,
    isTTY: false,
    fd: 0,
  };

  const process = {
    argv: ["node", "main.js"],
    env: {} as Record<string, string>,
    platform: "browser",
    version: "browser",
    versions: {} as Record<string, string>,
    pid: 1,
    stdout,
    stderr,
    stdin,
    cwd: () => "/",
    hrtime: Object.assign((prev?: [number, number]) => {
      const t = performance.now();
      const s = Math.floor(t / 1000);
      const n = Math.floor((t % 1000) * 1e6);
      return prev ? [s - prev[0], n - prev[1]] : [s, n];
    }, { bigint: () => BigInt(Math.floor(performance.now() * 1e6)) }),
    nextTick: (fn: Listener, ...a: unknown[]) => queueMicrotask(() => guard(() => fn(...a))),
    memoryUsage: () => ({ rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }),
    on: () => process,
    exit: (code?: number) => {
      throw new ExitSignal(code ?? process.exitCode ?? 0);
    },
    exitCode: undefined as number | undefined,
  };
  g.process = process;

  const readline = {
    createInterface: () => {
      const em = makeEmitter();
      let cursor = 0;
      let closed = false;
      let pumping = false;
      const close = () => {
        if (closed) return;
        closed = true;
        em.emit("close");
      };
      const pump = () => {
        if (pumping) return;
        pumping = true;
        ioWaiters++;
        const step = () => {
          if (closed) {
            ioWaiters--;
            return;
          }
          if (cursor < stdinLines.length && em.has("line")) {
            em.emit("line", stdinLines[cursor++]);
            (g.setTimeout as (f: () => void, m: number) => void)(step, 0);
          } else if (cursor >= stdinLines.length) {
            ioWaiters--;
            close();
          } else {
            ioWaiters--;
            pumping = false;
          }
        };
        (g.setTimeout as (f: () => void, m: number) => void)(step, 0);
      };
      const rl = {
        on(ev: string, fn: Listener) {
          em.on(ev, fn);
          if (ev === "line" || ev === "close") pump();
          return rl;
        },
        once(ev: string, fn: Listener) {
          em.once(ev, fn);
          if (ev === "close") pump();
          return rl;
        },
        question(query: string, cb: (answer: string) => void) {
          emit("stdout", String(query));
          ioWaiters++;
          (g.setTimeout as (f: () => void, m: number) => void)(() => {
            ioWaiters--;
            if (cursor < stdinLines.length) cb(stdinLines[cursor++]);
            else close();
          }, 0);
        },
        setPrompt: () => {},
        prompt: () => {},
        pause: () => rl,
        resume: () => rl,
        close,
        [Symbol.asyncIterator]() {
          return {
            next: async (): Promise<IteratorResult<string>> => {
              if (cursor < stdinLines.length) return { value: stdinLines[cursor++], done: false };
              close();
              return { value: undefined, done: true };
            },
            return: async (): Promise<IteratorResult<string>> => ({ value: undefined, done: true }),
          };
        },
      };
      return rl;
    },
  };

  const util = {
    inspect: (v: unknown) => inspect(v, 1),
    format: (...a: unknown[]) => formatLog(a),
    promisify:
      (fn: (...a: unknown[]) => void) =>
      (...a: unknown[]) =>
        new Promise((resolve, reject) => fn(...a, (err: unknown, val: unknown) => (err ? reject(err) : resolve(val)))),
  };

  const fs = {
    readFileSync(path: unknown) {
      if (path === 0 || path === "/dev/stdin") return stdinText;
      const e = new Error(`ENOENT: no such file or directory, open '${String(path)}'`) as Error & { code?: string };
      e.code = "ENOENT";
      throw e;
    },
    writeSync(fd: number, data: unknown) {
      emit(fd === 2 ? "stderr" : "stdout", String(data));
    },
    existsSync: () => false,
  };

  const modules: Record<string, unknown> = {
    fs,
    readline,
    util,
    os: { EOL: "\n", platform: () => "browser" },
    "node:fs": fs,
    "node:readline": readline,
    "node:util": util,
    "node:os": { EOL: "\n", platform: () => "browser" },
  };
  const requireFn = (name: string) => {
    if (name in modules) return modules[name];
    const e = new Error(`Cannot find module '${name}'`) as Error & { code?: string };
    e.code = "MODULE_NOT_FOUND";
    throw e;
  };
  g.require = requireFn;
  g.module = { exports: {} };
  g.exports = (g.module as { exports: unknown }).exports;

  // ── Lock down everything that could leave the sandbox ──────────────────────
  for (const name of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "BroadcastChannel", "Worker", "SharedWorker"]) {
    try {
      Object.defineProperty(globalThis, name, { value: undefined, writable: false, configurable: false });
    } catch {
      // already non-configurable: nothing more we can do
    }
  }

  // ── Run ────────────────────────────────────────────────────────────────────
  try {
    (0, eval)(`${req.code}\n//# sourceURL=main.js`);
  } catch (err) {
    handleThrown(err);
  }

  // Wait until nothing is scheduled (timers, stdin readers), like Node's event loop.
  let idleTicks = 0;
  while (!halted && idleTicks < 3) {
    await new Promise<void>((resolve) => nativeSetTimeout(resolve, 0));
    idleTicks = activeTimers.size === 0 && ioWaiters === 0 ? idleTicks + 1 : 0;
  }
  if (typeof process.exitCode === "number") exitCodeSetByProgram = process.exitCode;
  finish();
}
