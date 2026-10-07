"use client";

/**
 * The Code Lab workspace (/code-lab/). One <LabSession> per deep link: the
 * parent re-mounts it when the intent changes, so every link starts from a
 * clean, fully-initialised state.
 *
 * Layout: >= 1024px the editor (60%) sits left, Input + Results (Output/Tests)
 * on the right; below that a segmented tab bar shows one panel at a time with
 * the Run button pinned to the bottom. Panels stay mounted (hidden with CSS) so
 * the editor keeps its undo history and scroll position when switching tabs.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, CircleSlash, Info, Send, Undo2 } from "lucide-react";
import { challengesHref, codeLabHref, courseHref, lessonHref, parseCodeLabQuery, type CodeLabIntent } from "../../shared/links";
import type { SubmitResponse } from "../../shared/api";
import { markLabPassed } from "@/lib/lab-progress";
import { useLang } from "@/lib/lang-context";
import { getRunDetail } from "@/lib/codelab/api";
import { useNow } from "@/lib/codelab/clock";
import { resolveContext, type LabContext, type Resolved } from "@/lib/codelab/context";
import { fill, intlLocale, timeAgo } from "@/lib/codelab/format";
import { challengeStart, intentKey, splitExerciseRef } from "@/lib/codelab/intent";
import { getLabLanguage, isLabLangId, parseLabLang, planLanguageSwitch, toServerLang, type LabLangId } from "@/lib/codelab/langs";
import { decideRunTarget } from "@/lib/codelab/run-target";
import {
  DEFAULT_PREFS,
  addLocalRun,
  browserStorage,
  clearLocalHistory,
  draftKey,
  getDraft,
  loadLocalHistory,
  loadPrefs,
  saveDraft,
  savePrefs,
  type DraftScope,
  type LabPrefs,
  type LocalRun,
} from "@/lib/codelab/storage";
import EditorSlot, { EditorSkeleton } from "./EditorSlot";
import HistoryPanel from "./HistoryPanel";
import InputPanel from "./InputPanel";
import LanguagePicker from "./LanguagePicker";
import OutputPanel, { StatusLine } from "./OutputPanel";
import QuotaBar from "./QuotaBar";
import { GradeBanner, SubmitBanner } from "./ResultBanners";
import ShareDialog from "./ShareDialog";
import TaskPanel from "./TaskPanel";
import TestsPanel from "./TestsPanel";
import Toolbar, { RunButton } from "./Toolbar";
import { Sheet, Skeleton, btnGhost, btnPrimary, focusRing } from "./ui";
import { useAvailability, useRunner } from "./use-runner";

type Tab = "task" | "code" | "input" | "output" | "tests";

export function LabSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-8" aria-busy="true">
      <Skeleton className="h-8 w-40" />
      <div className="mt-4 rounded-xl border border-line bg-surface overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="ms-auto h-10 w-24 hidden lg:block" />
        </div>
        <div className="grid lg:grid-cols-[3fr_2fr] lg:h-[calc(100dvh-14rem)] lg:min-h-[30rem]">
          <div className="min-h-[20rem]">
            <EditorSkeleton />
          </div>
          <div className="hidden lg:block border-s border-line p-4 space-y-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CodeLab() {
  const params = useSearchParams();
  const qs = params.toString();
  const intent = useMemo(() => parseCodeLabQuery(new URLSearchParams(qs)), [qs]);
  // shared/links only knows the 14 server languages; `?lang=web` selects the browser-only Web mode here.
  const webMode = intent.kind === "blank" && !intent.lang && parseLabLang(params.get("lang")) === "web";
  const returnTo = `/code-lab/${qs ? `?${qs}` : ""}`;
  return <LabSession key={`${intentKey(intent)}${webMode ? ":web" : ""}`} intent={intent} webMode={webMode} returnTo={returnTo} />;
}

type Boot = { status: "loading" } | { status: "error" } | { status: "notfound"; kind: "exercise" | "demo" | "challenge" | "snippet" } | { status: "ready" };

function scopeFor(ctx: LabContext, lang: LabLangId, home: LabLangId): DraftScope {
  switch (ctx.kind) {
    case "exercise":
      return { kind: "exercise", ref: ctx.ref };
    case "demo":
      return { kind: "demo", ref: ctx.ref };
    case "challenge":
      return { kind: "challenge", id: ctx.meta.id, lang };
    case "snippet":
      // Changing language leaves the fork behind: it becomes an ordinary free draft.
      return lang === home ? { kind: "fork", id: ctx.id } : { kind: "free", lang };
    default:
      return { kind: "free", lang };
  }
}

function LabSession({ intent, webMode, returnTo }: { intent: CodeLabIntent; webMode: boolean; returnTo: string }) {
  const { tx, lang: ui } = useLang();
  const t = tx.codelab;
  const runner = useRunner();
  const availability = useAvailability();
  const now = useNow();

  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [ctx, setCtx] = useState<LabContext>({ kind: "free" });
  const [allowed, setAllowed] = useState<LabLangId[] | undefined>();
  const [lang, setLang] = useState<LabLangId>("python");
  const [home, setHome] = useState<LabLangId>("python");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [baseCode, setBaseCode] = useState("");
  const [prefs, setPrefsState] = useState<LabPrefs>(DEFAULT_PREFS);
  const [localRuns, setLocalRuns] = useState<LocalRun[]>([]);

  const [tab, setTab] = useState<Tab>("code");
  const [resultTab, setResultTab] = useState<"output" | "tests">("output");
  const [taskOpen, setTaskOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<{ lang: LabLangId; at: number; undo: { lang: LabLangId; code: string; stdin: string } } | null>(null);
  const [ran, setRan] = useState<{ code: string; line?: number } | null>(null);
  const [failed, setFailed] = useState(0);
  const [pass, setPass] = useState<{ xp: number } | null>(null);
  const [submitRes, setSubmitRes] = useState<SubmitResponse | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const runBtnWrap = useRef<HTMLDivElement>(null);
  const latest = useRef({ code, stdin, lang, scopeKey: "" });

  const signedIn = runner.signedIn;

  // ── Boot: preferences + deep-link data + the draft for this scope ──────────
  useEffect(() => {
    const ac = new AbortController();
    const kv = browserStorage();
    const p = loadPrefs(kv);
    const local = loadLocalHistory(kv);
    resolveContext(intent, ac.signal)
      .then((res: Resolved) => {
        if (ac.signal.aborted) return;
        setPrefsState(p);
        setLocalRuns(local);
        if (res.status === "notfound") {
          setBoot({ status: "notfound", kind: res.kind });
          return;
        }
        const start = webMode ? { lang: "web" as const, code: getLabLanguage("web").hello, stdin: "" } : res.start;
        const startLang: LabLangId = start?.lang ?? parseLabLang(p.lastLang) ?? "python";
        const scope = scopeFor(res.ctx, startLang, startLang);
        const draft = getDraft(kv, draftKey(scope));
        setCtx(res.ctx);
        setAllowed(res.allowed);
        setHome(startLang);
        setLang(startLang);
        setBaseCode(start?.code ?? getLabLanguage(startLang).hello);
        setCode(draft?.code ?? start?.code ?? getLabLanguage(startLang).hello);
        setStdin(draft?.stdin ?? start?.stdin ?? "");
        setBoot({ status: "ready" });
      })
      .catch(() => {
        if (!ac.signal.aborted) setBoot({ status: "error" });
      });
    return () => ac.abort();
  }, [intent, webMode, attempt]);

  // ── Draft persistence (debounced; flushed when the page is hidden) ─────────
  const scope = useMemo(() => scopeFor(ctx, lang, home), [ctx, lang, home]);
  const scopeKey = draftKey(scope);
  useEffect(() => {
    latest.current = { code, stdin, lang, scopeKey };
  }, [code, stdin, lang, scopeKey]);
  const ready = boot.status === "ready";
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => saveDraft(browserStorage(), scopeKey, { code, stdin, at: Date.now() }), 400);
    return () => clearTimeout(id);
  }, [ready, scopeKey, code, stdin]);
  useEffect(() => {
    if (!ready) return;
    const flush = () => {
      const l = latest.current;
      saveDraft(browserStorage(), l.scopeKey, { code: l.code, stdin: l.stdin, at: Date.now() });
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [ready]);

  const updatePrefs = useCallback((p: LabPrefs) => {
    setPrefsState(p);
    savePrefs(browserStorage(), p);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const spec = getLabLanguage(lang);
  const exercise = ctx.kind === "exercise" ? ctx : null;
  const challenge = ctx.kind === "challenge" ? ctx : null;
  const hasTask = ctx.kind === "exercise" || ctx.kind === "demo" || ctx.kind === "challenge";
  const tests = exercise?.section.tests ?? [];
  const hasTests = tests.length > 0;
  const target = decideRunTarget({ lang, signedIn, preferBrowser: prefs.preferBrowser, availability });
  const canRun = target !== "unavailable";
  const showRunOn = signedIn && !!spec.browser && !spec.browserOnly;
  const template = useMemo(() => {
    if (ctx.kind === "exercise") return ctx.section.starterCode;
    if (ctx.kind === "challenge") return challengeStart(ctx.meta, toServerLang(lang) ?? undefined).code;
    if (ctx.kind === "demo" || (ctx.kind === "snippet" && lang === home)) return baseCode;
    return getLabLanguage(lang).hello;
  }, [ctx, lang, home, baseCode]);
  const errorLine = ran && ran.code === code ? ran.line : undefined;

  // ── Actions ────────────────────────────────────────────────────────────────
  const focusResults = useCallback(() => {
    // Keep typing flow: only pull focus when it is on the Run button or nowhere.
    const a = document.activeElement;
    if (a === document.body || (a instanceof HTMLElement && runBtnWrap.current?.contains(a))) resultsRef.current?.focus({ preventScroll: true });
  }, []);

  const doRun = useCallback(
    async (forceBrowser = false) => {
      if (runner.busy) return;
      const tgt = forceBrowser && spec.browser ? "browser" : target;
      if (tgt === "unavailable") return;
      setTab("output");
      setResultTab("output");
      setPass(null);
      setSubmitRes(null);
      const out = await runner.run({
        lang,
        code,
        stdin,
        target: tgt,
        ref: exercise && tgt === "server" ? { kind: "lesson", track: exercise.track, lesson: exercise.lessonId, exercise: exercise.ref.split("/")[2] } : undefined,
        localTests: exercise && tgt === "browser" ? exercise.section.tests : undefined,
      });
      if (!out) return;
      setRan({ code, line: out.view?.errorLine });
      const view = out.view;
      if (view && view.source === "browser") {
        const entry: LocalRun = {
          id: crypto.randomUUID(),
          lang,
          code,
          stdin,
          status: view.result.status,
          exitCode: view.result.exitCode,
          runMs: view.result.runMs,
          at: Date.now(),
        };
        setLocalRuns(addLocalRun(browserStorage(), entry));
      }
      if (out.grade && exercise) {
        setResultTab("tests");
        setTab("tests");
        if (out.grade.passed) setPass({ xp: markLabPassed(exercise.ref) });
        else setFailed((n) => n + 1);
      }
      focusResults();
    },
    [runner, spec.browser, target, lang, code, stdin, exercise, focusResults]
  );

  const doSubmit = useCallback(async () => {
    if (!challenge || runner.busy) return;
    setTab("output");
    setResultTab("output");
    if (!signedIn) {
      const { LabApiError } = await import("@/lib/codelab/api-error");
      runner.reportError(new LabApiError(401, "unauthorized"), lang);
      return;
    }
    setSubmitRes(null);
    const res = await runner.submit(challenge.meta.id, lang, code);
    if (res) {
      setSubmitRes(res);
      focusResults();
    }
  }, [challenge, runner, signedIn, lang, code, focusResults]);

  const switchLang = useCallback(
    (to: LabLangId) => {
      if (to === lang) return;
      const kv = browserStorage();
      const outgoing = scopeFor(ctx, lang, home);
      saveDraft(kv, draftKey(outgoing), { code, stdin, at: Date.now() });
      const incomingScope: DraftScope = ctx.kind === "challenge" ? { kind: "challenge", id: ctx.meta.id, lang: to } : { kind: "free", lang: to };
      const targetDraft = getDraft(kv, draftKey(incomingScope));
      // A challenge's own starter counts as "untouched" just like a Hello World template.
      const untouched = ctx.kind === "challenge" && code === template;
      const plan = planLanguageSwitch({ currentCode: untouched ? getLabLanguage(lang).hello : code, currentStdin: stdin, target: to, targetDraft });
      let nextCode = plan.code;
      let nextStdin = plan.stdin;
      if (plan.source === "template" && ctx.kind === "challenge") {
        nextCode = challengeStart(ctx.meta, toServerLang(to) ?? undefined).code;
        nextStdin = ctx.meta.sampleInput ?? nextStdin;
      }
      setLang(to);
      setCode(nextCode);
      setStdin(nextStdin);
      setRan(null);
      setPass(null);
      setSubmitRes(null);
      runner.clear();
      setNote(plan.source === "carried" ? fill(t.lang.switchedKeep, { lang: getLabLanguage(lang).label }) : null);
      updatePrefs({ ...prefs, lastLang: to });
    },
    [lang, ctx, home, code, stdin, template, runner, t.lang.switchedKeep, prefs, updatePrefs]
  );

  const reset = useCallback(() => {
    setCode(template);
    setStdin(ctx.kind === "exercise" ? (ctx.section.sampleInput ?? "") : ctx.kind === "challenge" ? (ctx.meta.sampleInput ?? "") : "");
    setRan(null);
    setNote(null);
  }, [template, ctx]);

  const applyLoaded = useCallback(
    (to: LabLangId, nextCode: string, nextStdin: string, at: number) => {
      setLoaded({ lang: to, at, undo: { lang, code, stdin } });
      setLang(to);
      setCode(nextCode);
      setStdin(nextStdin);
      setRan(null);
      setNote(null);
      setPass(null);
      setSubmitRes(null);
      setTab("code");
      setHistoryOpen(false);
    },
    [lang, code, stdin]
  );

  const langAllowed = useCallback((l: LabLangId) => (exercise ? l === lang : !allowed || allowed.includes(l)), [exercise, lang, allowed]);

  const openServerRun = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const d = await getRunDetail(id);
        if (!isLabLangId(d.lang) || !langAllowed(d.lang)) return false;
        applyLoaded(d.lang, d.code, d.stdin, Date.parse(d.createdAt));
        runner.showStored({
          source: "server",
          lang: d.lang,
          runId: d.id,
          result: {
            status: d.status,
            exitCode: d.exitCode,
            stdout: d.stdout,
            stderr: d.stderr,
            compileOutput: d.compileOutput,
            stdoutBytes: d.stdoutBytes,
            stderrBytes: d.stderr.length,
            truncated: { stdout: false, stderr: false },
            runMs: d.runMs,
            compileMs: 0,
          },
        });
        return true;
      } catch {
        return false;
      }
    },
    [applyLoaded, langAllowed, runner]
  );

  const openLocalRun = useCallback(
    (r: LocalRun) => {
      if (!isLabLangId(r.lang) || !langAllowed(r.lang)) return;
      applyLoaded(r.lang, r.code, r.stdin, r.at);
      runner.clear();
    },
    [applyLoaded, langAllowed, runner]
  );

  // Keep the active mobile tab valid when panels come and go.
  const tabs: { id: Tab; label: string }[] = [
    ...(hasTask ? [{ id: "task" as Tab, label: t.panels.task }] : []),
    { id: "code", label: t.panels.code },
    { id: "input", label: t.panels.input },
    { id: "output", label: t.panels.output },
    ...(hasTests ? [{ id: "tests" as Tab, label: t.panels.tests }] : []),
  ];
  const activeTab: Tab = tabs.some((x) => x.id === tab) ? tab : "code";

  // ── Boot states ────────────────────────────────────────────────────────────
  if (boot.status === "loading") return <LabSkeleton />;
  if (boot.status === "error") {
    return (
      <Shell>
        <div role="alert" className="card p-6 max-w-xl">
          <p className="flex items-center gap-2 font-bold text-fg">
            <AlertTriangle size={18} aria-hidden="true" className="text-amber-400" />
            {tx.codelab.exercise.loadFailed}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} onClick={() => { setBoot({ status: "loading" }); setAttempt((n) => n + 1); }}>
              {t.retry}
            </button>
            <Link href={codeLabHref({ kind: "blank" })} className={btnGhost}>
              {tx.codelab.snippet.newLab}
            </Link>
          </div>
        </div>
      </Shell>
    );
  }
  if (boot.status === "notfound") return <NotFound intent={intent} kind={boot.kind} />;

  const taskCtx = ctx.kind === "exercise" || ctx.kind === "demo" || ctx.kind === "challenge" ? ctx : null;
  const segBtn = (active: boolean) =>
    `flex-1 min-w-0 truncate min-h-11 px-1 text-sm font-semibold ${focusRing} ${active ? "text-brand-strong border-b-2 border-brand" : "text-fg-muted border-b-2 border-transparent hover:text-fg"}`;
  const pane = (id: Tab) => (activeTab === id ? "" : "max-lg:hidden");

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-fg">{t.title}</h1>
        {!signedIn && (
          <p className="flex items-start gap-1.5 text-xs text-fg-muted max-w-xl" data-testid="guest-note">
            <Info size={14} aria-hidden="true" className="mt-px shrink-0" />
            {t.guestNote}
          </p>
        )}
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface shadow-card" data-testid="lab">
        <Toolbar
          languageSlot={<LanguagePicker lang={lang} onSelect={switchLang} availability={availability} allowed={allowed} locked={!!exercise} />}
          spec={spec}
          busy={runner.busy}
          canRun={canRun}
          onRun={() => doRun()}
          onStop={runner.stop}
          onHistory={() => setHistoryOpen(true)}
          onShare={() => setShareOpen(true)}
          prefs={prefs}
          onPrefs={updatePrefs}
          onReset={reset}
          showRunOn={showRunOn}
          canReset={code !== template}
        />

        {(note || loaded) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-brand/10 px-3 py-2 text-sm text-fg-soft" role="status" data-testid="lab-note">
            <Info size={14} aria-hidden="true" className="shrink-0" />
            <span>
              {loaded
                ? fill(tx.codelab.history.loadedBanner, { lang: getLabLanguage(loaded.lang).label, when: now ? timeAgo(loaded.at, now, intlLocale(ui), tx.codelab.history.justNow) : "" })
                : note}
            </span>
            {loaded && (
              <button
                type="button"
                onClick={() => {
                  setLang(loaded.undo.lang);
                  setCode(loaded.undo.code);
                  setStdin(loaded.undo.stdin);
                  setLoaded(null);
                  runner.clear();
                }}
                className={`inline-flex items-center gap-1 font-semibold text-brand-strong hover:underline ${focusRing}`}
              >
                <Undo2 size={13} aria-hidden="true" />
                {tx.codelab.history.undo}
              </button>
            )}
            <button type="button" onClick={() => { setNote(null); setLoaded(null); }} className={`ms-auto text-xs text-fg-subtle hover:text-fg ${focusRing}`}>
              {t.close}
            </button>
          </div>
        )}

        {/* Mobile segmented tabs */}
        <div role="tablist" aria-label={t.panels.label} className="flex border-b border-line bg-surface lg:hidden">
          {tabs.map((x) => (
            <button key={x.id} type="button" role="tab" id={`tab-${x.id}`} aria-selected={activeTab === x.id} aria-controls={`pane-${x.id}`} onClick={() => setTab(x.id)} className={segBtn(activeTab === x.id)} data-testid={`tab-${x.id}`}>
              {x.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:h-[calc(100dvh-14.5rem)] lg:min-h-[32rem] lg:max-h-[58rem]">
          {/* Left: task + editor */}
          <div className="flex min-h-0 min-w-0 flex-col lg:border-e border-line">
            {taskCtx && (
              <section
                id="pane-task"
                role="tabpanel"
                aria-labelledby="tab-task"
                className={`${pane("task")} border-b border-line ${taskOpen ? "lg:max-h-[42%]" : ""} overflow-y-auto`}
              >
                <button
                  type="button"
                  onClick={() => setTaskOpen((v) => !v)}
                  aria-expanded={taskOpen}
                  className={`hidden lg:flex w-full items-center justify-between gap-2 bg-surface-2 px-3 min-h-10 text-start text-xs font-bold uppercase tracking-wider text-fg-subtle ${focusRing}`}
                >
                  <span>{t.panels.task}</span>
                  <span className="inline-flex items-center gap-1 normal-case tracking-normal font-medium">
                    {taskOpen ? t.exercise.collapse : t.exercise.expand}
                    {taskOpen ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                  </span>
                </button>
                <div className={taskOpen ? "" : "lg:hidden"}>
                  <TaskPanel key={ctx.kind === "exercise" ? ctx.ref : ctx.kind} ctx={taskCtx} failedChecks={failed} onResetStarter={ctx.kind === "exercise" ? reset : undefined} />
                </div>
              </section>
            )}
            <section
              id="pane-code"
              role="tabpanel"
              aria-labelledby="tab-code"
              className={`${pane("code")} flex-1 min-h-[22rem] lg:min-h-0 max-lg:h-[calc(100dvh-17rem)]`}
              data-testid="editor-pane"
            >
              <EditorSlot
                value={code}
                onChange={setCode}
                mode={spec.editor}
                ariaLabel={fill(t.editor.aria, { lang: spec.label })}
                fontSize={prefs.fontSize}
                wrap={prefs.wrap}
                errorLine={errorLine}
                onRun={() => doRun()}
                loadFailedText={t.editor.loadFailed}
              />
            </section>
          </div>

          {/* Right: input + results */}
          <div className="flex min-h-0 min-w-0 flex-col">
            <section id="pane-input" role="tabpanel" aria-labelledby="tab-input" className={`${pane("input")} border-b border-line shrink-0`}>
              <InputPanel
                value={stdin}
                onChange={setStdin}
                sample={exercise?.section.sampleInput ?? challenge?.meta.sampleInput}
                disabled={runner.busy}
                webMode={spec.id === "web"}
                rows={5}
              />
            </section>

            <section className={`${activeTab === "output" || activeTab === "tests" ? "" : "max-lg:hidden"} flex min-h-[18rem] flex-1 flex-col lg:min-h-0 bg-bg/40`} aria-label={t.panels.rightLabel}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-surface px-3 py-2">
                <div className="min-w-0 flex-1">
                  <StatusLine state={runner.state} />
                </div>
                {hasTests && (
                  <div role="tablist" aria-label={t.panels.rightLabel} className="hidden lg:flex gap-1">
                    {(["output", "tests"] as const).map((id) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={resultTab === id}
                        onClick={() => setResultTab(id)}
                        className={`min-h-9 rounded-md px-3 text-sm font-semibold ${focusRing} ${resultTab === id ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"}`}
                      >
                        {id === "output" ? t.panels.output : t.panels.tests}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {signedIn && runner.quota && (
                <div className="border-b border-line px-3 py-1.5">
                  <QuotaBar quota={runner.quota} />
                </div>
              )}
              <div ref={resultsRef} tabIndex={-1} aria-label={t.output.regionLabel} className="flex-1 min-h-0 overflow-y-auto outline-none">
                {exercise && runner.state.grade && (
                  <div className="p-3 sm:p-4 pb-0">
                    <GradeBanner grade={runner.state.grade} xp={pass?.xp ?? 0} track={exercise.track} lesson={exercise.lessonId} next={exercise.next} />
                  </div>
                )}
                {challenge && submitRes && (
                  <div className="p-3 sm:p-4 pb-0 space-y-3">
                    <SubmitBanner res={submitRes} challengeId={challenge.meta.id} track={challenge.meta.track} />
                    {submitRes.grade && <div className="-mx-3 sm:-mx-4"><TestsPanel tests={[]} grade={submitRes.grade} gradeSource="server" /></div>}
                  </div>
                )}
                <div id="pane-output" role="tabpanel" aria-label={t.panels.output} className={`${activeTab === "output" ? "" : "max-lg:hidden"} ${resultTab === "output" ? "" : "lg:hidden"}`}>
                  <OutputPanel
                    state={runner.state}
                    preview={runner.preview}
                    frameRef={runner.frameRef}
                    returnTo={returnTo}
                    onRetry={() => doRun()}
                    onRunInBrowser={() => doRun(true)}
                    extra={
                      !canRun ? (
                        <p className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/[0.07] p-3 text-sm text-fg-soft" data-testid="unavailable-note">
                          <CircleSlash size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-400" />
                          {fill(t.lang.unavailableNote, { lang: spec.label })}
                        </p>
                      ) : exercise && !signedIn && !spec.browser ? (
                        <p className="mb-3 text-sm text-fg-muted">{t.exercise.signInToGrade}</p>
                      ) : undefined
                    }
                  />
                </div>
                {hasTests && (
                  <div id="pane-tests" role="tabpanel" aria-label={t.panels.tests} className={`${activeTab === "tests" ? "" : "max-lg:hidden"} ${resultTab === "tests" ? "" : "lg:hidden"}`}>
                    <TestsPanel tests={tests} grade={runner.state.grade} gradeSource={runner.state.gradeSource} />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Challenge submit (desktop inline, mobile in the sticky bar) */}
      {challenge?.start.submittable && (
        <div className="mt-3 hidden lg:flex justify-end">
          <button type="button" onClick={doSubmit} disabled={runner.busy} className={btnPrimary} data-testid="submit-button">
            <Send size={15} aria-hidden="true" className="rtl-flip" />
            {runner.state.phase === "submitting" ? t.challenge.submitting : t.challenge.submit}
          </button>
        </div>
      )}

      {/* Mobile sticky action bar */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-3 border-t border-line bg-bg/95 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden" data-testid="mobile-bar">
        <div ref={runBtnWrap} className="flex items-center gap-2">
          <RunButton busy={runner.busy && runner.state.phase !== "submitting"} disabled={!canRun} onRun={() => doRun()} onStop={runner.stop} className="flex-1" />
          {challenge?.start.submittable && (
            <button type="button" onClick={doSubmit} disabled={runner.busy} className={`${btnPrimary} flex-1`} data-testid="submit-button-mobile">
              <Send size={15} aria-hidden="true" className="rtl-flip" />
              {t.challenge.submit}
            </button>
          )}
        </div>
      </div>

      <Sheet open={historyOpen} onClose={() => setHistoryOpen(false)} title={t.history.title} closeLabel={t.close}>
        <HistoryPanel
          signedIn={signedIn}
          localRuns={localRuns}
          returnTo={returnTo}
          onOpenServer={openServerRun}
          onOpenLocal={openLocalRun}
          onClearLocal={() => {
            clearLocalHistory(browserStorage());
            setLocalRuns([]);
          }}
        />
      </Sheet>
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} lang={lang} code={code} stdin={stdin} signedIn={signedIn} returnTo={returnTo} problemFor={runner.problemFor} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-8">{children}</div>;
}

function NotFound({ intent, kind }: { intent: CodeLabIntent; kind: "exercise" | "demo" | "challenge" | "snippet" }) {
  const { tx } = useLang();
  const e = tx.codelab.exercise;
  const c = tx.codelab.challenge;
  const s = tx.codelab.snippet;
  let title = s.notFoundTitle;
  let body = s.notFoundBody;
  let back: { href: string; label: string } | null = null;
  if (kind === "exercise" && intent.kind === "exercise") {
    title = e.notFoundTitle;
    body = e.notFoundBody;
    const r = splitExerciseRef(intent.ref);
    back = r ? { href: courseHref(r.track), label: e.backToCourse } : { href: "/learn/", label: e.browseCourses };
  } else if (kind === "demo" && intent.kind === "demo") {
    title = e.demoNotFoundTitle;
    body = e.demoNotFoundBody;
    back = { href: lessonHref(intent.track, intent.lesson), label: e.backToLesson };
  } else if (kind === "challenge" && intent.kind === "challenge") {
    title = c.notFoundTitle;
    body = c.notFoundBody;
    back = { href: challengesHref(), label: c.browseChallenges };
  }
  return (
    <Shell>
      <div className="card max-w-xl p-6 sm:p-8" role="alert" data-testid="lab-not-found">
        <h1 className="text-xl font-extrabold text-fg">{title}</h1>
        <p className="mt-2 text-sm text-fg-soft leading-relaxed">{body}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {back && (
            <Link href={back.href} className={btnPrimary}>
              {back.label}
            </Link>
          )}
          <Link href={codeLabHref({ kind: "blank" })} className={btnGhost}>
            {s.newLab}
          </Link>
        </div>
      </div>
    </Shell>
  );
}
