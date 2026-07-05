"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { Play, CheckCircle2, Loader2, Terminal, Eye } from "lucide-react";
import type { ExerciseTest, RunnerLang } from "@/data/lessons/types";
import { buildSrcdoc, type ConsoleEntry, type TestResult } from "@/lib/runner/web-sandbox";
import { runPython } from "@/lib/runner/python-client";
import { useLang } from "@/lib/lang-context";

const WATCHDOG_MS = 5_000;

function extensionsFor(lang: RunnerLang) {
  if (lang === "web") return [html()];
  if (lang === "python") return [python()];
  return [javascript()];
}

export default function CodeRunner({
  lang,
  value,
  onChange,
  tests,
  onCheck,
  editorHeight = "220px",
}: {
  lang: RunnerLang;
  value: string;
  onChange: (v: string) => void;
  tests: ExerciseTest[];
  onCheck?: (allPassed: boolean, results: TestResult[]) => void;
  editorHeight?: string;
}) {
  const { tx } = useLang();
  const L = tx.lesson;

  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [pyStatus, setPyStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [srcdoc, setSrcdoc] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkingRef = useRef(false);
  const onCheckRef = useRef(onCheck);
  useEffect(() => {
    onCheckRef.current = onCheck;
  }, [onCheck]);

  const clearWatchdog = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  };

  useEffect(() => {
    if (lang === "python") return;
    function onMessage(e: MessageEvent) {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      const msg = e.data;
      if (msg?.t === "console") {
        setConsoleEntries((prev) => [...prev.slice(-199), { level: msg.level, text: msg.text }]);
      } else if (msg?.t === "error") {
        setConsoleEntries((prev) => [...prev.slice(-199), { level: "error", text: msg.message }]);
      } else if (msg?.t === "tests") {
        if (checkingRef.current) {
          const results: TestResult[] = msg.results;
          onCheckRef.current?.(results.every((r) => r.pass), results);
        }
      } else if (msg?.t === "done") {
        clearWatchdog();
        setRunning(false);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [lang]);

  useEffect(() => () => clearWatchdog(), []);

  const execute = useCallback(
    async (checking: boolean) => {
      setConsoleEntries([]);
      setTimedOut(false);
      setRunning(true);
      checkingRef.current = checking;

      if (lang === "python") {
        const res = await runPython(value, checking ? tests.map((t) => t.check) : [], (s) =>
          setPyStatus(s === "loading" ? "loading" : "ready")
        );
        setRunning(false);
        if (res.timedOut) {
          setTimedOut(true);
          if (checking) onCheckRef.current?.(false, tests.map((_, i) => ({ i, pass: false, error: "timeout" })));
          return;
        }
        const entries: ConsoleEntry[] = [];
        if (res.stdout) entries.push({ level: "log", text: res.stdout });
        if (res.error) entries.push({ level: "error", text: res.error });
        setConsoleEntries(entries);
        if (checking) onCheckRef.current?.(res.testResults.every((r) => r.pass) && res.testResults.length > 0, res.testResults);
        return;
      }

      // web / js — rebuild the sandboxed iframe from scratch (clean state per run)
      setSrcdoc(buildSrcdoc(lang, value, checking ? tests : []));
      setRunId((n) => n + 1);
      clearWatchdog();
      watchdogRef.current = setTimeout(() => {
        setRunning(false);
        setTimedOut(true);
        if (checkingRef.current) {
          onCheckRef.current?.(false, tests.map((_, i) => ({ i, pass: false, error: "timeout" })));
        }
      }, WATCHDOG_MS);
    },
    [lang, value, tests]
  );

  const showPreview = lang === "web";

  return (
    <div className="border border-[#21262d] rounded-xl overflow-hidden bg-[#0D1117]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#161B22] border-b border-[#21262d]">
        <button
          onClick={() => execute(false)}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-all disabled:opacity-50"
        >
          {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
          {running ? L.running : L.run}
        </button>
        {tests.length > 0 && (
          <button
            onClick={() => execute(true)}
            disabled={running}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={12} /> {L.check}
          </button>
        )}
        {lang === "python" && pyStatus === "loading" && (
          <span className="text-[11px] text-amber-400 flex items-center gap-1.5">
            <Loader2 size={11} className="animate-spin" /> {L.pyLoading}
          </span>
        )}
      </div>

      {/* Editor — code is always LTR */}
      <div dir="ltr" className="text-[13px]">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensionsFor(lang)}
          theme="dark"
          height={editorHeight}
          basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: true }}
        />
      </div>

      {/* Preview (web only) */}
      {showPreview && (
        <div className="border-t border-[#21262d]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-[#161B22]">
            <Eye size={11} /> {L.preview}
          </div>
          <div dir="ltr" className="bg-white min-h-[120px] max-h-[300px] overflow-auto">
            {srcdoc !== null && (
              <iframe
                key={runId}
                ref={iframeRef}
                sandbox="allow-scripts"
                srcDoc={srcdoc}
                title="preview"
                className="w-full h-[300px] border-0"
              />
            )}
          </div>
        </div>
      )}
      {/* js runs in a hidden sandbox — console is the output */}
      {!showPreview && lang !== "python" && srcdoc !== null && (
        <iframe
          key={runId}
          ref={iframeRef}
          sandbox="allow-scripts"
          srcDoc={srcdoc}
          title="runner"
          className="hidden"
        />
      )}

      {/* Console */}
      <div className="border-t border-[#21262d]">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-[#161B22]">
          <Terminal size={11} /> {L.console}
        </div>
        <div dir="ltr" className="px-3 py-2 font-mono text-xs min-h-[44px] max-h-[180px] overflow-auto space-y-0.5">
          {timedOut && <div className="text-amber-400">{L.timeout}</div>}
          {!timedOut && consoleEntries.length === 0 && (
            <div className="text-gray-600">{L.consoleEmpty}</div>
          )}
          {consoleEntries.map((c, i) => (
            <div
              key={i}
              className={
                c.level === "error" ? "text-red-400 whitespace-pre-wrap" :
                c.level === "warn" ? "text-amber-400 whitespace-pre-wrap" :
                "text-gray-300 whitespace-pre-wrap"
              }
            >
              {c.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
