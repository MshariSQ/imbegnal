"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, ArrowRight, BookOpen, Bot, CheckCircle2, Circle, Clock, Code2, HelpCircle,
  ListTree, NotebookPen, PanelRight, Sparkles, ScrollText,
} from "lucide-react";
import type { L10n, Lesson } from "@/data/lessons/types";
import { MODULE_ORDER, type ModuleKey } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";
import { getToken } from "@/lib/auth";
import { markNodeDone } from "@/lib/api";
import { useStudy, visitLesson, completeLesson, awardXp, recordQuiz, XP } from "@/lib/study-store";
import { lessonContext, lessonOutline, lessonSummary } from "@/lib/lesson-utils";
import LessonView, { sectionId } from "@/components/lesson/LessonView";
import ProgressBar from "@/components/ui/ProgressBar";
import { toast } from "@/components/ui/Toast";
import Drawer from "./Drawer";
import NotesPanel from "./NotesPanel";
import AiTutor from "./AiTutor";

export interface PlayerOutlineItem {
  lessonId: string;
  title: L10n;
  minutes: number;
  module: ModuleKey;
}

type ToolTab = "summary" | "notes" | "ai";

export default function LessonPlayer({
  trackId,
  trackIcon,
  lesson,
  outline,
}: {
  trackId: string;
  trackIcon: string;
  lesson: Lesson;
  outline: PlayerOutlineItem[];
}) {
  const { tx, lang } = useLang();
  const study = useStudy();
  const key = `${trackId}/${lesson.nodeId}`;
  const done = !!study.lessons[key]?.done;

  const [outlineOpen, setOutlineOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [tab, setTab] = useState<ToolTab>("summary");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  const index = outline.findIndex((l) => l.lessonId === lesson.nodeId);
  const prev = index > 0 ? outline[index - 1] : null;
  const next = index >= 0 && index < outline.length - 1 ? outline[index + 1] : null;
  const courseDone = outline.filter((l) => study.lessons[`${trackId}/${l.lessonId}`]?.done).length;

  const toc = useMemo(() => lessonOutline(lesson), [lesson]);
  const summary = useMemo(() => lessonSummary(lesson), [lesson]);
  const context = useMemo(() => lessonContext(lesson, lang), [lesson, lang]);
  const stats = useMemo(
    () => ({
      exercises: lesson.sections.filter((s) => s.type === "exercise").length,
      quizzes: lesson.sections.filter((s) => s.type === "quiz").length,
    }),
    [lesson]
  );

  useEffect(() => {
    visitLesson(key);
  }, [key]);

  const finish = useCallback(() => {
    const xp = completeLesson(key);
    if (xp) toast(`${tx.player.done} · ${tx.player.xpGained.replace("{n}", String(xp))}`);
    const token = getToken();
    if (token) markNodeDone(trackId, lesson.nodeId, token).catch(() => {});
  }, [key, trackId, lesson.nodeId, tx]);

  function onSectionPassed(kind: "ex" | "quiz") {
    const xp = kind === "ex" ? XP.exercise : XP.quiz;
    awardXp(key, xp);
    toast(tx.player.xpGained.replace("{n}", String(xp)));
  }

  // "Ask AI" bubble for selected lesson text
  function onMouseUp() {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!sel || text.length < 3 || text.length > 600 || !articleRef.current?.contains(sel.anchorNode)) {
      setSelection(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top });
  }

  function askAboutSelection() {
    if (!selection) return;
    const q = lang === "ar" ? `اشرح لي هذا الجزء من الدرس:\n\n"${selection.text}"` : `Explain this part of the lesson:\n\n"${selection.text}"`;
    setPendingQuestion(q);
    setTab("ai");
    setToolsOpen(true);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  const modules = MODULE_ORDER.map((m) => ({ key: m, items: outline.filter((l) => l.module === m) })).filter((m) => m.items.length);

  const outlineNav = (
    <nav aria-label={tx.player.outline} className="p-3">
      {modules.map((m) => (
        <div key={m.key} className="mb-4">
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-fg-subtle">{tx.modules[m.key]}</div>
          {m.items.map((l) => {
            const active = l.lessonId === lesson.nodeId;
            const isDone = !!study.lessons[`${trackId}/${l.lessonId}`]?.done;
            return (
              <div key={l.lessonId}>
                <Link
                  href={`/learn/${trackId}/${l.lessonId}/`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOutlineOpen(false)}
                  className={`flex items-start gap-2.5 px-2 py-2 rounded-lg text-[13px] transition-colors ${
                    active ? "bg-brand/10 text-fg font-semibold" : "text-fg-muted hover:bg-fg/5 hover:text-fg"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-px" />
                  ) : (
                    <Circle size={16} className={`shrink-0 mt-px ${active ? "text-emerald-400" : "text-fg-faint"}`} />
                  )}
                  <span className="leading-snug">{l.title[lang]}</span>
                </Link>
                {active && toc.length > 1 && (
                  <ul className="ms-[1.15rem] my-1 border-s border-line">
                    {toc.map((h) => (
                      <li key={h.index}>
                        <a
                          href={`#${sectionId(h.index)}`}
                          onClick={() => setOutlineOpen(false)}
                          className="block ps-3 py-1 text-xs text-fg-subtle hover:text-fg truncate"
                        >
                          {h.title[lang].replace(/\s*[\p{Extended_Pictographic}️]+\s*$/u, "")}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const tabs: { id: ToolTab; label: string; icon: React.ReactNode }[] = [
    { id: "summary", label: tx.player.tabSummary, icon: <ScrollText size={14} /> },
    { id: "notes", label: tx.player.tabNotes, icon: <NotebookPen size={14} /> },
    { id: "ai", label: tx.player.tabAi, icon: <Bot size={14} /> },
  ];

  const toolsPanel = (
    <div className="flex flex-col h-full min-h-0 p-4">
      <div role="tablist" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-2 mb-4 shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-colors ${
              tab === t.id ? "bg-surface text-fg shadow-sm" : "text-fg-subtle hover:text-fg"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {tab === "summary" && (
          <div className="h-full overflow-y-auto">
            {summary && (
              <>
                <h3 className="text-sm font-bold text-fg mb-3">
                  {summary.kind === "summary" ? tx.player.summaryTitle : tx.player.objectivesTitle}
                </h3>
                <div className="text-sm text-fg-soft leading-relaxed [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:mb-1.5 [&_p]:mb-3 [&_strong]:text-fg [&_code]:font-mono [&_code]:text-[12.5px] [&_code]:text-emerald-300 [&_pre]:hidden">
                  <ReactMarkdown>{summary.body[lang]}</ReactMarkdown>
                </div>
              </>
            )}
            <button
              onClick={() => setTab("ai")}
              className="mt-4 w-full flex items-center gap-2 px-3.5 py-3 rounded-xl border border-dashed border-line-strong text-sm text-fg-muted hover:text-fg hover:border-brand/50"
            >
              <Sparkles size={15} className="text-emerald-400" /> {tx.ai.suggestions[0]}
            </button>
          </div>
        )}
        {tab === "notes" && <NotesPanel noteKey={key} lessonTitle={lesson.title[lang]} />}
        {tab === "ai" && (
          <AiTutor
            track={trackId}
            lesson={lesson.nodeId}
            lessonTitle={lesson.title.en}
            context={context}
            pendingQuestion={pendingQuestion}
            onPendingConsumed={() => setPendingQuestion(null)}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="pt-16">
      {/* Sub-header: course context + progress */}
      <div className="sticky top-16 z-40 bg-bg/90 backdrop-blur-xl border-b border-line">
        <div className="h-12 px-3 sm:px-5 flex items-center gap-3">
          <button onClick={() => setOutlineOpen(true)} className="lg:hidden w-8 h-8 grid place-items-center rounded-lg text-fg-muted hover:bg-fg/5" aria-label={tx.player.outline}>
            <ListTree size={17} />
          </button>
          <Link href={`/learn/${trackId}/`} className="flex items-center gap-2 min-w-0 text-sm text-fg-muted hover:text-fg">
            <span>{trackIcon}</span>
            <span className="truncate font-medium">{tx.tracks[trackId]?.title}</span>
          </Link>
          <div className="hidden sm:flex items-center gap-3 ms-auto w-56">
            <ProgressBar value={outline.length ? courseDone / outline.length : 0} className="flex-1" label={tx.learn.courseProgress} />
            <span className="text-xs text-fg-subtle tabular-nums" dir="ltr">{courseDone}/{outline.length}</span>
          </div>
          <button
            onClick={() => setToolsOpen(true)}
            className="xl:hidden ms-auto sm:ms-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-line text-xs font-semibold text-fg-soft hover:bg-fg/5"
          >
            <PanelRight size={14} className="rtl-flip" /> {tx.player.tools}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_23rem]">
        {/* Course outline (desktop) */}
        <aside className="hidden lg:block border-e border-line">
          <div className="sticky top-28 h-[calc(100dvh-7rem)] overflow-y-auto">{outlineNav}</div>
        </aside>

        {/* Lesson */}
        <main ref={articleRef} onMouseUp={onMouseUp} className="min-w-0 px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
          <article className="max-w-3xl mx-auto">
            <header className="mb-8 animate-fade-up">
              <div className="text-xs font-semibold text-emerald-400 mb-2">
                {tx.modules[outline[index]?.module ?? "required"]} · {tx.common.lesson} {index + 1}/{outline.length}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-fg leading-tight">{lesson.title[lang]}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-fg-subtle">
                <span className="flex items-center gap-1.5"><Clock size={14} /> {lesson.estMinutes} {tx.common.minutes}</span>
                {stats.exercises > 0 && <span className="flex items-center gap-1.5"><Code2 size={14} /> {stats.exercises} {tx.lesson.exercisesLabel}</span>}
                {stats.quizzes > 0 && <span className="flex items-center gap-1.5"><HelpCircle size={14} /> {stats.quizzes} {tx.lesson.quizzesLabel}</span>}
                {done && <span className="flex items-center gap-1.5 text-emerald-400 font-semibold"><CheckCircle2 size={14} /> {tx.player.done}</span>}
              </div>
            </header>

            <LessonView
              key={lesson.nodeId}
              lesson={lesson}
              roadmapId={trackId}
              onLessonComplete={finish}
              onSectionPassed={onSectionPassed}
              onQuizScore={(acc) => recordQuiz(key, acc)}
              hideHeader
            />

            {/* Completion + navigation */}
            <div className="mt-12 pt-8 border-t border-line">
              {!done && (
                <button
                  onClick={finish}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-semibold mb-8"
                >
                  <CheckCircle2 size={17} /> {tx.player.markDone}
                </button>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                {prev ? (
                  <Link href={`/learn/${trackId}/${prev.lessonId}/`} className="card card-hover p-4 group">
                    <div className="flex items-center gap-1.5 text-xs text-fg-subtle mb-1"><ArrowLeft size={13} className="rtl-flip" /> {tx.player.prev}</div>
                    <div className="text-sm font-semibold text-fg group-hover:text-emerald-400 line-clamp-1">{prev.title[lang]}</div>
                  </Link>
                ) : <span className="hidden sm:block" />}
                {next ? (
                  <Link href={`/learn/${trackId}/${next.lessonId}/`} className="card card-hover p-4 group text-end">
                    <div className="flex items-center justify-end gap-1.5 text-xs text-fg-subtle mb-1">{tx.player.next} <ArrowRight size={13} className="rtl-flip" /></div>
                    <div className="text-sm font-semibold text-fg group-hover:text-emerald-400 line-clamp-1">{next.title[lang]}</div>
                  </Link>
                ) : (
                  <Link href={`/learn/${trackId}/`} className="card card-hover p-4 group text-end">
                    <div className="flex items-center justify-end gap-1.5 text-xs text-fg-subtle mb-1">{tx.player.finishCourse} <BookOpen size={13} /></div>
                    <div className="text-sm font-semibold text-fg group-hover:text-emerald-400">{tx.tracks[trackId]?.title}</div>
                  </Link>
                )}
              </div>
            </div>
          </article>
        </main>

        {/* Study tools (desktop) */}
        <aside className="hidden xl:block border-s border-line">
          <div className="sticky top-28 h-[calc(100dvh-7rem)]">{toolsPanel}</div>
        </aside>
      </div>

      {/* Mobile/tablet drawers */}
      <Drawer open={outlineOpen} onClose={() => setOutlineOpen(false)} side="start" title={tx.player.outline}>
        {outlineNav}
      </Drawer>
      <Drawer open={toolsOpen} onClose={() => setToolsOpen(false)} side="end" title={tx.player.tools}>
        <div className="h-full">{toolsPanel}</div>
      </Drawer>

      {selection && (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={askAboutSelection}
          style={{ left: selection.x, top: Math.max(72, selection.y - 44) }}
          className="fixed z-50 -translate-x-1/2 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-fg text-bg text-xs font-semibold shadow-xl animate-fade-in"
        >
          <Sparkles size={13} /> {tx.player.askAi}
        </button>
      )}
    </div>
  );
}
