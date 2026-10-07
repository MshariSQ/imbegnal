"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Globe, Lock, Search, ServerOff } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { LAB_LANGUAGES, getLabLanguage, type LabLangId } from "@/lib/codelab/langs";
import { serverCanRun, type AvailabilityMap } from "@/lib/codelab/run-target";
import { fill } from "@/lib/codelab/format";
import { Popover, focusRing } from "./ui";

/** Searchable language list. Selecting an unavailable language is allowed; Run is what gets disabled. */
export default function LanguagePicker({
  lang,
  onSelect,
  availability,
  allowed,
  locked,
}: {
  lang: LabLangId;
  onSelect: (l: LabLangId) => void;
  availability: AvailabilityMap;
  /** Restrict the list (challenges with `allowedLangs`). */
  allowed?: readonly LabLangId[];
  /** The exercise fixes its language. */
  locked?: boolean;
}) {
  const { tx } = useLang();
  const t = tx.codelab.lang;
  const [q, setQ] = useState("");
  const current = getLabLanguage(lang);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LAB_LANGUAGES.filter((l) => (!allowed || allowed.includes(l.id)) && (!needle || l.label.toLowerCase().includes(needle) || l.id.includes(needle) || l.runtimeNote.toLowerCase().includes(needle)));
  }, [q, allowed]);

  const trigger = (
    <>
      <span className="font-semibold text-fg truncate">{current.label}</span>
      {locked ? <Lock size={14} aria-hidden="true" className="shrink-0 text-fg-subtle" /> : <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-fg-subtle" />}
    </>
  );
  const triggerClass = `inline-flex items-center justify-between gap-2 min-h-10 min-w-0 max-w-[13rem] rounded-lg border border-line bg-surface px-3 text-sm hover:border-line-strong ${focusRing}`;

  if (locked) {
    return (
      <span className={`${triggerClass} cursor-default`} title={t.locked} data-testid="lang-locked">
        <span className="sr-only">{t.label}: </span>
        {trigger}
        <span className="sr-only"> ({t.locked})</span>
      </span>
    );
  }

  return (
    <Popover
      label={`${t.label}: ${current.label}`}
      align="start"
      buttonClassName={triggerClass}
      button={trigger}
      panelClassName="w-[min(20rem,calc(100vw-2rem))]"
      testId="lang-trigger"
    >
      {(close) => (
        <div className="p-2">
          <label className="relative block">
            <span className="sr-only">{t.search}</span>
            <Search size={15} aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  e.currentTarget.closest("[role=dialog]")?.querySelector<HTMLElement>("li button")?.focus();
                }
              }}
              className={`w-full min-h-10 rounded-lg border border-line bg-bg ps-9 pe-3 text-sm text-fg placeholder:text-fg-subtle ${focusRing}`}
            />
          </label>
          <ul
            className="mt-2 max-h-72 overflow-y-auto"
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("button"));
              const i = items.indexOf(document.activeElement as HTMLElement);
              items[Math.min(items.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))]?.focus();
            }}
          >
            {list.map((l) => {
              const server = l.browserOnly ? false : serverCanRun(l.id, availability);
              const unavailable = !l.browserOnly && !server && !l.browser;
              const selected = l.id === lang;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    aria-current={selected ? "true" : undefined}
                    onClick={() => {
                      onSelect(l.id);
                      setQ("");
                      close();
                    }}
                    data-lang={l.id}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 min-h-11 text-start text-sm ${focusRing} ${selected ? "bg-brand/15 text-fg" : "text-fg-soft hover:bg-fg/5"}`}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium truncate">{l.label}</span>
                      <span className="block text-xs text-fg-subtle truncate">{l.filename}</span>
                    </span>
                    {l.browserOnly ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-fg-subtle"><Globe size={12} aria-hidden="true" />{t.browserOnly}</span>
                    ) : unavailable ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-amber-400"><ServerOff size={12} aria-hidden="true" />{t.unavailable}</span>
                    ) : l.browser ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-fg-subtle"><Globe size={12} aria-hidden="true" />{t.inBrowser}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="px-3 py-4 text-sm text-fg-subtle">{fill(t.none, { q })}</li>}
          </ul>
        </div>
      )}
    </Popover>
  );
}
