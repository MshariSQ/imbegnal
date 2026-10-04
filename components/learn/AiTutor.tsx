"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Bot, RotateCcw, Square, Sparkles, LogIn } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { getToken, useAuthUser } from "@/lib/auth";
import { ApiError, streamTutor, type TutorMessage } from "@/lib/api";
import { track as trackEvent } from "@/lib/track";

const MAX_TURNS = 9; // last few turns only (odd count, ending with the student) — keeps requests small and cheap

/** Chat with the AI tutor, grounded in the current lesson. */
export default function AiTutor({
  track,
  lesson,
  lessonTitle,
  context,
  pendingQuestion,
  onPendingConsumed,
}: {
  track: string;
  lesson: string;
  lessonTitle: string;
  context: string;
  /** A question queued from elsewhere (e.g. "Ask AI" on selected text). */
  pendingQuestion?: string | null;
  onPendingConsumed?: () => void;
}) {
  const { tx, lang } = useLang();
  const user = useAuthUser();
  const signedIn = !!user;
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question: string) {
    const token = getToken();
    const q = question.trim();
    if (!q || busy || !token) return;
    setError(null);
    setInput("");

    // Keep a window of recent turns that starts with a student message
    let history: TutorMessage[] = [...messages, { role: "user", content: q }];
    while (history.length > MAX_TURNS) history = history.slice(2);
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    trackEvent("ai_question", `${track}/${lesson}`);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let answer = "";
    try {
      await streamTutor(
        { track, lesson, lessonTitle, context, lang, messages: history },
        token,
        (chunk) => {
          answer += chunk;
          setMessages([...history, { role: "assistant", content: answer }]);
        },
        ctrl.signal
      );
    } catch (e) {
      if (ctrl.signal.aborted) {
        // user pressed stop — keep the partial answer
      } else {
        const status = e instanceof ApiError ? e.status : 0;
        const code = e instanceof ApiError ? e.code : "";
        setError(
          status === 401 ? tx.ai.signInRequired
            : status === 429 ? (code === "capacity" ? tx.ai.capacity : tx.ai.limitReached)
            : tx.ai.unavailable
        );
      }
    } finally {
      if (!answer) setMessages(history.slice(0, -1)); // drop the empty turn so history stays valid
      else setMessages([...history, { role: "assistant", content: answer }]);
      setBusy(false);
      abortRef.current = null;
    }
  }

  // Questions queued from the lesson (e.g. selected text). Deferred to a task
  // so the request starts after mount; cleanup cancels StrictMode's dry run.
  useEffect(() => {
    if (!pendingQuestion || !signedIn) return;
    const id = setTimeout(() => {
      onPendingConsumed?.();
      void ask(pendingQuestion);
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ask/onPendingConsumed change every render; react only to new questions
  }, [pendingQuestion, signedIn]);

  if (!user) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-4">
        <span className="w-12 h-12 rounded-2xl bg-brand/15 grid place-items-center mb-4">
          <Sparkles size={22} className="text-emerald-400" />
        </span>
        <p className="text-sm text-fg-muted mb-5 max-w-64">{tx.ai.signInRequired}</p>
        <Link href="/login/" className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-brand hover:bg-brand-strong text-brand-fg text-sm font-semibold">
          <LogIn size={15} /> {tx.auth.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pe-1" aria-live="polite">
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-fg-muted mb-4">{tx.ai.subtitle}</p>
            <div className="flex flex-col gap-2">
              {tx.ai.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="text-start text-sm px-3.5 py-2.5 rounded-xl border border-line hover:border-brand/50 hover:bg-brand/5 text-fg-soft transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-ee-md bg-brand text-brand-fg px-3.5 py-2 text-sm whitespace-pre-wrap">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-2.5">
              <span className="w-7 h-7 shrink-0 rounded-lg bg-brand/15 grid place-items-center mt-0.5">
                <Bot size={15} className="text-emerald-400" />
              </span>
              <div className="min-w-0 flex-1 text-sm text-fg-soft leading-relaxed [&_p]:mb-2.5 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:mb-1 [&_strong]:text-fg [&_pre]:bg-surface-2 [&_pre]:border [&_pre]:border-line [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre]:text-start [&_code]:font-mono [&_code]:text-[12.5px] [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold">
                {m.content ? (
                  <ReactMarkdown
                    components={{
                      pre: (props) => <pre dir="ltr" {...props} />,
                      a: (props) => <a target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline" {...props} />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  <span className="inline-flex gap-1 py-2" aria-label={tx.common.loading}>
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-fg-subtle animate-pulse" style={{ animationDelay: `${d * 150}ms` }} />
                    ))}
                  </span>
                )}
              </div>
            </div>
          )
        )}
        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="mt-3 pt-3 border-t border-line"
      >
        <div className="flex items-end gap-2 rounded-xl border border-line-strong focus-within:border-brand/60 bg-surface p-1.5 ps-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 4000))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void ask(input);
              }
            }}
            rows={1}
            placeholder={tx.ai.placeholder}
            aria-label={tx.ai.placeholder}
            className="flex-1 resize-none bg-transparent outline-none text-sm text-fg placeholder:text-fg-faint py-1.5 max-h-32"
          />
          {busy ? (
            <button type="button" onClick={() => abortRef.current?.abort()} aria-label={tx.ai.stop} className="w-8 h-8 grid place-items-center rounded-lg bg-fg/10 text-fg">
              <Square size={13} />
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()} aria-label={tx.ai.send} className="w-8 h-8 grid place-items-center rounded-lg bg-brand text-brand-fg disabled:opacity-30">
              <ArrowUp size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-fg-faint">{tx.ai.disclaimer}</span>
          {messages.length > 0 && !busy && (
            <button type="button" onClick={() => { setMessages([]); setError(null); }} className="inline-flex items-center gap-1 text-[11px] text-fg-subtle hover:text-fg">
              <RotateCcw size={11} /> {tx.ai.clear}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
