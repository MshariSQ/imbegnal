"use client";

/**
 * Everything about executing code, shared by the lab and the permalink page:
 * where it runs (server or this browser), abort/stop, quota, availability of
 * the server toolchains, the web preview host, and mapping failures to
 * localized `Problem`s. State is plain React state; each run has a sequence
 * number so a stale (superseded or stopped) run can never overwrite a newer one.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GradeResult, PublicRunResult, QuotaInfo, RunRef, SubmitResponse } from "../../shared/api";
import type { LabTest } from "../../data/lessons/types";
import { useLang } from "@/lib/lang-context";
import { useAuthUser } from "@/lib/auth";
import { fetchLanguages, fetchQuota, runCode, submitChallenge } from "@/lib/codelab/api";
import { LabApiError, isAbortError } from "@/lib/codelab/api-error";
import { describeError, type Problem } from "@/lib/codelab/errors";
import { intlLocale } from "@/lib/codelab/format";
import { getLabLanguage, toServerLang, type LabLangId } from "@/lib/codelab/langs";
import { UNKNOWN_AVAILABILITY, type AvailabilityMap, type RunTarget } from "@/lib/codelab/run-target";
import { runInBrowser, type BrowserLang, type BrowserPhase, type WebHost } from "@/lib/codelab/browser-runner";
import { gradeLocally } from "@/lib/codelab/grading";
import { trackLab } from "@/lib/codelab/analytics";

export type RunPhase = "idle" | "loading-runtime" | "running" | "grading" | "submitting" | "done" | "failed" | "stopped";

export interface RunView {
  source: "server" | "browser";
  lang: LabLangId;
  result: PublicRunResult;
  /** 1-based error line in the learner's code, when the runtime reported one. */
  errorLine?: number;
  runId?: string;
}

export interface RunnerState {
  phase: RunPhase;
  view: RunView | null;
  problem: Problem | null;
  grade: GradeResult | null;
  gradeSource: "server" | "browser" | null;
  /** Increments whenever a run starts; the UI keys focus management on it. */
  seq: number;
}

const IDLE: RunnerState = { phase: "idle", view: null, problem: null, grade: null, gradeSource: null, seq: 0 };

export interface RunOptions {
  lang: LabLangId;
  code: string;
  stdin: string;
  target: RunTarget;
  ref?: RunRef;
  /** Visible lesson tests to grade in the browser (browser target only). */
  localTests?: LabTest[];
}

export interface RunOutcome {
  view: RunView | null;
  grade: GradeResult | null;
  gradeSource: "server" | "browser" | null;
  problem: Problem | null;
}

export interface PreviewState {
  doc: string;
  key: number;
}

/** GET /api/lab/languages, once on mount (cached in memory by the client). */
export function useAvailability(): AvailabilityMap {
  const [state, setState] = useState<AvailabilityMap>(UNKNOWN_AVAILABILITY);
  useEffect(() => {
    const ac = new AbortController();
    fetchLanguages({ signal: ac.signal })
      .then((res) => {
        const byLang: AvailabilityMap["byLang"] = {};
        for (const l of res.languages) byLang[l.id] = l.available;
        setState({ state: "ready", runner: res.runner, byLang });
      })
      .catch((err) => {
        if (!isAbortError(err)) setState({ state: "failed", byLang: {} });
      });
    return () => ac.abort();
  }, []);
  return state;
}

export function useRunner() {
  const { lang: uiLang, tx } = useLang();
  const user = useAuthUser();
  const signedIn = !!user;
  const userId = user?.sub;

  const [state, setState] = useState<RunnerState>(IDLE);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const acRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);
  const quotaRef = useRef<QuotaInfo | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const previewKey = useRef(0);

  const setQuotaBoth = useCallback((q: QuotaInfo | null) => {
    quotaRef.current = q;
    setQuota(q);
  }, []);

  // Quota for signed-in users; cleared on sign-out.
  useEffect(() => {
    if (!userId) {
      setQuotaBoth(null);
      return;
    }
    const ac = new AbortController();
    fetchQuota(ac.signal)
      .then(setQuotaBoth)
      .catch(() => {
        // The quota line is informational; a failure here must not block running.
      });
    return () => ac.abort();
  }, [userId, setQuotaBoth]);

  // Never let a run outlive the page.
  useEffect(() => () => acRef.current?.abort(), []);

  // Stable host for the Web runner: it only touches refs and a state setter.
  const web = useMemo<WebHost>(
    () => ({
      mount: (doc) => setPreview({ doc, key: ++previewKey.current }),
      unmount: () => setPreview(null),
      frameWindow: () => frameRef.current?.contentWindow ?? null,
    }),
    []
  );

  const problemFor = useCallback(
    (err: unknown, lang: LabLangId): Problem =>
      describeError(err, {
        tx: tx.codelab,
        locale: intlLocale(uiLang),
        langLabel: getLabLanguage(lang).label,
        signedIn,
        browserFallback: !!getLabLanguage(lang).browser,
        quota: quotaRef.current,
        now: Date.now(),
      }),
    [tx, uiLang, signedIn]
  );

  const stop = useCallback(() => {
    acRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    acRef.current?.abort();
    seqRef.current += 1;
    setPreview(null);
    setState((s) => ({ ...IDLE, seq: s.seq }));
  }, []);

  /** Shows a stored result (history) without running anything. */
  const showStored = useCallback((view: RunView) => {
    setState((s) => ({ ...IDLE, phase: "done", view, seq: s.seq }));
  }, []);

  const run = useCallback(
    async (opts: RunOptions): Promise<RunOutcome | null> => {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      const seq = ++seqRef.current;
      const current = () => seqRef.current === seq;
      const patch = (p: Partial<RunnerState>) => current() && setState((s) => ({ ...s, ...p }));
      const fail = (problem: Problem): RunOutcome => {
        patch({ phase: "failed", problem });
        return { view: null, grade: null, gradeSource: null, problem };
      };
      setPreview(null);
      setState((s) => ({ ...IDLE, phase: "running", seq: s.seq + 1 }));

      try {
        if (opts.target === "signin") {
          return fail(problemFor(new LabApiError(401, "unauthorized"), opts.lang));
        }
        if (opts.target === "unavailable") {
          return fail(problemFor(new LabApiError(503, "runner_unavailable"), opts.lang));
        }

        trackLab("codelab_run", opts.lang);

        if (opts.target === "server") {
          const serverLang = toServerLang(opts.lang);
          if (!serverLang) return fail(problemFor(new LabApiError(400, "invalid_request"), opts.lang));
          const res = await runCode({ lang: serverLang, code: opts.code, stdin: opts.stdin || undefined, ref: opts.ref }, ac.signal);
          setQuotaBoth(res.quota);
          const view: RunView = { source: "server", lang: opts.lang, result: res.result, runId: res.runId };
          patch({ phase: "done", view, grade: res.grade ?? null, gradeSource: res.grade ? "server" : null });
          return { view, grade: res.grade ?? null, gradeSource: res.grade ? "server" : null, problem: null };
        }

        // Browser target
        const spec = getLabLanguage(opts.lang);
        if (!spec.browser) return fail(problemFor(new LabApiError(503, "runner_unavailable"), opts.lang));
        const bl: BrowserLang = opts.lang === "web" ? "web" : (opts.lang as BrowserLang);
        const onPhase = (p: BrowserPhase) => patch({ phase: p === "loading-runtime" ? "loading-runtime" : "running" });
        const out = await runInBrowser({
          lang: bl,
          code: opts.code,
          stdin: opts.stdin,
          signal: ac.signal,
          onPhase,
          web,
        });
        const { errorLine, ...result } = out;
        const view: RunView = { source: "browser", lang: opts.lang, result, errorLine };
        patch({ phase: opts.localTests?.length ? "grading" : "done", view });

        let grade: GradeResult | null = null;
        if (opts.localTests?.length && bl !== "web") {
          grade = await gradeLocally({
            tests: opts.localTests,
            lang: uiLang,
            signal: ac.signal,
            hardFailure: ["timeout", "output_limit", "memory_limit"].includes(result.status) ? result.status : undefined,
            runOne: async (stdin) => {
              const r = await runInBrowser({ lang: bl, code: opts.code, stdin, signal: ac.signal, onPhase });
              return { stdout: r.stdout, result: r };
            },
          });
          patch({ phase: "done", grade, gradeSource: "browser" });
        }
        return { view, grade, gradeSource: grade ? "browser" : null, problem: null };
      } catch (err) {
        if (isAbortError(err)) {
          patch({ phase: "stopped" });
          return null;
        }
        if (err instanceof LabApiError && err.status === 429 && signedIn) {
          // The counters moved while we were refused: refresh the quota line.
          fetchQuota().then(setQuotaBoth, () => undefined);
        }
        return fail(problemFor(err, opts.lang));
      } finally {
        if (acRef.current === ac) acRef.current = null;
      }
    },
    [problemFor, setQuotaBoth, uiLang, web, signedIn]
  );

  /** Shows an error (sign-in prompt, share failure…) in the output panel. */
  const reportError = useCallback(
    (err: unknown, lang: LabLangId) => {
      acRef.current?.abort();
      seqRef.current += 1;
      setPreview(null);
      setState((s) => ({ ...IDLE, phase: "failed", problem: problemFor(err, lang), seq: s.seq + 1 }));
    },
    [problemFor]
  );

  /** POST /api/challenges/:id/submit; the response's run output and grade are shown like a run. */
  const submit = useCallback(
    async (id: string, lang: LabLangId, code: string): Promise<SubmitResponse | null> => {
      acRef.current?.abort();
      const ac = new AbortController();
      acRef.current = ac;
      const seq = ++seqRef.current;
      const serverLang = toServerLang(lang);
      setPreview(null);
      setState((s) => ({ ...IDLE, phase: "submitting", seq: s.seq + 1 }));
      try {
        if (!serverLang) throw new LabApiError(400, "invalid_request");
        const res = await submitChallenge(id, { lang: serverLang, code }, ac.signal);
        if (res.quota) setQuotaBoth(res.quota);
        if (seqRef.current !== seq) return null;
        const view: RunView | null = res.result ? { source: "server", lang, result: res.result } : null;
        setState((s) => ({ ...s, phase: "done", view, grade: res.grade ?? null, gradeSource: res.grade ? "server" : null }));
        return res;
      } catch (err) {
        if (seqRef.current !== seq) return null;
        if (isAbortError(err)) {
          setState((s) => ({ ...s, phase: "stopped" }));
          return null;
        }
        setState((s) => ({ ...s, phase: "failed", problem: problemFor(err, lang) }));
        return null;
      } finally {
        if (acRef.current === ac) acRef.current = null;
      }
    },
    [problemFor, setQuotaBoth]
  );

  const busy = state.phase === "running" || state.phase === "loading-runtime" || state.phase === "grading" || state.phase === "submitting";

  return { state, busy, quota, setQuota: setQuotaBoth, run, submit, reportError, stop, clear, showStored, preview, frameRef, signedIn, problemFor };
}
