import type { TestResult } from "./web-sandbox";

export interface PythonRunResult {
  stdout: string;
  error: string | null;
  testResults: TestResult[];
  timedOut?: boolean;
}

const TIMEOUT_MS = 10_000;
let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    worker = new Worker(`${base}/pyodide-worker.js`);
  }
  return worker;
}

export function runPython(
  code: string,
  tests: string[],
  onStatus: (s: "loading" | "ready") => void
): Promise<PythonRunResult> {
  return new Promise((resolve) => {
    const w = getWorker();
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      w.removeEventListener("message", onMsg);
      // A hung run means the Pyodide instance is stuck — kill and recreate.
      w.terminate();
      worker = null;
      resolve({ stdout: "", error: null, testResults: [], timedOut: true });
    }, TIMEOUT_MS);

    function onMsg(e: MessageEvent) {
      const msg = e.data;
      if (msg.t === "loading" || msg.t === "ready") {
        onStatus(msg.t);
        return;
      }
      if (settled) return;
      if (msg.t === "result") {
        settled = true;
        clearTimeout(timer);
        w.removeEventListener("message", onMsg);
        resolve({ stdout: msg.stdout ?? "", error: msg.error ?? null, testResults: msg.testResults ?? [] });
      } else if (msg.t === "fatal") {
        settled = true;
        clearTimeout(timer);
        w.removeEventListener("message", onMsg);
        worker?.terminate();
        worker = null;
        resolve({ stdout: "", error: msg.message, testResults: [] });
      }
    }

    w.addEventListener("message", onMsg);
    w.postMessage({ cmd: "run", code, tests });
  });
}
