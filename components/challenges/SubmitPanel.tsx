"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Flag, Loader2, Send, Terminal } from "lucide-react";
import { LANGUAGES, LANG_IDS, type LangId } from "@/shared/languages";
import type { ChallengeMeta } from "@/shared/challenges";
import { codeLabHref } from "@/shared/links";
import { useLang } from "@/lib/lang-context";
import { fmt } from "@/lib/ctf/format";
import { formatCountdown } from "@/lib/ctf/time";
import type { ChallengeListItem } from "@/lib/ctf/types";
import ResultPanel from "./ResultPanel";
import { useSubmission } from "./useSubmission";

const inputCls =
  "w-full rounded-xl border border-line bg-bg px-3.5 text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-brand/60 focus-visible:outline-2 focus-visible:outline-brand";

/**
 * Submission area. Flag challenges get a monospace input; code/output
 * challenges point to Code Lab (where the program runs against the grader) and
 * offer a collapsed "Quick submit" for a solution the learner already has.
 */
export default function SubmitPanel({
  challenge,
  solved,
  next,
}: {
  challenge: Pick<ChallengeMeta, "id" | "kind" | "flagFormat" | "lang" | "allowedLangs" | "starterCode">;
  solved: boolean;
  next?: ChallengeListItem;
}) {
  const { state, submit, cooldown } = useSubmission(challenge.id);
  const resultRef = useRef<HTMLDivElement>(null);
  const pending = state.phase === "pending";
  const blocked = pending || cooldown > 0;

  // Move focus to the outcome once a submit finishes so keyboard/screen-reader users land on it.
  const phase = state.phase;
  useEffect(() => {
    if (phase === "done" || phase === "error") resultRef.current?.focus();
  }, [phase, state]);

  const result = <ResultPanel ref={resultRef} state={state} kind={challenge.kind} next={next} cooldown={cooldown} />;

  if (challenge.kind === "flag") {
    return <FlagForm challenge={challenge} solved={solved} submit={(flag) => submit({ flag })} blocked={blocked} pending={pending} cooldown={cooldown} result={result} />;
  }
  return <CodeSubmit challenge={challenge} solved={solved} submit={(lang, code) => submit({ lang, code })} blocked={blocked} pending={pending} cooldown={cooldown} result={result} />;
}

function SubmitButton({ pending, cooldown, disabled, children }: { pending: boolean; cooldown: number; disabled?: boolean; children: React.ReactNode }) {
  const { tx } = useLang();
  return (
    <button
      type="submit"
      disabled={pending || cooldown > 0 || disabled}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} aria-hidden className="animate-spin" /> : <Send size={16} aria-hidden className="rtl-flip" />}
      {pending ? tx.ctf.submit.checking : cooldown > 0 ? fmt(tx.ctf.errors.retryIn, { time: formatCountdown(cooldown) }) : children}
    </button>
  );
}

function FlagForm({
  challenge,
  solved,
  submit,
  blocked,
  pending,
  cooldown,
  result,
}: {
  challenge: Pick<ChallengeMeta, "flagFormat">;
  solved: boolean;
  submit: (flag: string) => void;
  blocked: boolean;
  pending: boolean;
  cooldown: number;
  result: React.ReactNode;
}) {
  const { tx } = useLang();
  const t = tx.ctf.submit;
  const id = useId();
  const [flag, setFlag] = useState("");
  const help = challenge.flagFormat ? fmt(t.flagHelp, { format: challenge.flagFormat }) : undefined;

  return (
    <section aria-labelledby={`${id}-h`} className="card p-5">
      <h2 id={`${id}-h`} className="mb-4 flex items-center gap-2 text-base font-bold text-fg">
        <Flag size={17} aria-hidden className="text-emerald-400" />
        {t.flagTitle}
      </h2>
      {solved && <p className="mb-3 text-sm text-fg-muted">{t.solvedAlready}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (blocked || !flag.trim()) return;
          submit(flag.trim());
        }}
        className="space-y-3"
      >
        <div>
          <label htmlFor={`${id}-flag`} className="mb-1.5 block text-sm font-semibold text-fg-soft">
            {t.flagLabel}
          </label>
          <input
            id={`${id}-flag`}
            name="flag"
            type="text"
            dir="ltr"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder={challenge.flagFormat ?? t.flagPlaceholder}
            aria-describedby={help ? `${id}-help` : undefined}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={`${inputCls} h-12 text-start font-mono text-sm`}
          />
          {help && (
            <p id={`${id}-help`} className="mt-1.5 text-xs text-fg-subtle">
              {help}
            </p>
          )}
        </div>
        <SubmitButton pending={pending} cooldown={cooldown} disabled={!flag.trim()}>
          {t.button}
        </SubmitButton>
      </form>
      {result}
    </section>
  );
}

function CodeSubmit({
  challenge,
  solved,
  submit,
  blocked,
  pending,
  cooldown,
  result,
}: {
  challenge: Pick<ChallengeMeta, "id" | "lang" | "allowedLangs" | "starterCode">;
  solved: boolean;
  submit: (lang: LangId, code: string) => void;
  blocked: boolean;
  pending: boolean;
  cooldown: number;
  result: React.ReactNode;
}) {
  const { tx } = useLang();
  const t = tx.ctf.submit;
  const id = useId();
  const allowed: readonly LangId[] = challenge.allowedLangs?.length ? challenge.allowedLangs : LANG_IDS;
  const [lang, setLang] = useState<LangId>(challenge.lang && allowed.includes(challenge.lang) ? challenge.lang : allowed[0]);
  const [code, setCode] = useState(challenge.starterCode?.[lang] ?? "");
  const [dirty, setDirty] = useState(false);
  const [empty, setEmpty] = useState(false);

  function changeLang(next: LangId) {
    setLang(next);
    // Swap the starter code only while the learner has not typed anything of their own.
    if (!dirty) setCode(challenge.starterCode?.[next] ?? "");
  }

  return (
    <section aria-labelledby={`${id}-h`} className="card p-5">
      <h2 id={`${id}-h`} className="mb-2 flex items-center gap-2 text-base font-bold text-fg">
        <Terminal size={17} aria-hidden className="text-emerald-400" />
        {t.codeTitle}
      </h2>
      <p className="mb-4 text-sm text-fg-muted">{t.codeBody}</p>
      {solved && <p className="mb-3 text-sm text-fg-muted">{t.solvedAlready}</p>}

      <div className="mb-4">
        <label htmlFor={`${id}-lang`} className="mb-1.5 block text-sm font-semibold text-fg-soft">
          {t.language}
        </label>
        <select id={`${id}-lang`} value={lang} onChange={(e) => changeLang(e.target.value as LangId)} className={`${inputCls} h-11 text-sm`}>
          {LANGUAGES.filter((l) => allowed.includes(l.id)).map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <Link
        href={codeLabHref({ kind: "challenge", id: challenge.id, lang })}
        data-testid="open-code-lab"
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-strong"
      >
        <Terminal size={16} aria-hidden />
        {t.openCodeLab}
      </Link>

      <details className="mt-5 border-t border-line pt-4">
        <summary className="inline-flex min-h-10 cursor-pointer items-center text-sm font-semibold text-fg-soft">{t.quickTitle}</summary>
        <p className="mb-3 mt-1 text-sm text-fg-muted">{t.quickBody}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (blocked) return;
            if (!code.trim()) {
              setEmpty(true);
              return;
            }
            setEmpty(false);
            submit(lang, code);
          }}
          className="space-y-3"
        >
          <div>
            <label htmlFor={`${id}-code`} className="mb-1.5 block text-sm font-semibold text-fg-soft">
              {t.codeLabel}
            </label>
            <textarea
              id={`${id}-code`}
              dir="ltr"
              rows={10}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setDirty(true);
                setEmpty(false);
              }}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              aria-invalid={empty}
              aria-describedby={empty ? `${id}-empty` : undefined}
              className={`${inputCls} resize-y py-3 text-start font-mono text-[13px] leading-relaxed`}
            />
            {empty && (
              <p id={`${id}-empty`} role="alert" className="mt-1.5 text-xs text-red-400">
                {t.codeEmpty}
              </p>
            )}
          </div>
          <SubmitButton pending={pending} cooldown={cooldown}>
            {t.codeSubmit}
          </SubmitButton>
        </form>
      </details>
      {result}
    </section>
  );
}
