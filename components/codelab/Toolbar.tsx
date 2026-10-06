"use client";

import { Clock, Globe, HelpCircle, Minus, Play, Plus, RotateCcw, Server, Settings2, Share2, Square, WrapText } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { FONT_MAX, FONT_MIN, type LabPrefs } from "@/lib/codelab/storage";
import type { LabLanguage } from "@/lib/codelab/langs";
import { Popover, btnGhost, btnPrimary, focusRing, iconBtn, toolBtn } from "./ui";
import type { ReactNode } from "react";

export function RunButton({ busy, disabled, onRun, onStop, className = "" }: { busy: boolean; disabled: boolean; onRun: () => void; onStop: () => void; className?: string }) {
  const { tx } = useLang();
  const t = tx.codelab.toolbar;
  return busy ? (
    <button type="button" onClick={onStop} className={`${btnGhost} !border-red-500/50 !text-red-300 hover:!bg-red-500/10 ${className}`} data-testid="stop-button">
      <Square size={14} aria-hidden="true" className="fill-current" />
      {t.stop}
    </button>
  ) : (
    <button type="button" onClick={onRun} disabled={disabled} title={t.runTitle} className={`${btnPrimary} ${className}`} data-testid="run-button">
      <Play size={15} aria-hidden="true" className="fill-current" />
      {t.run}
    </button>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md border border-line-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-fg-soft">{children}</kbd>;
}

function ShortcutsPopover() {
  const { tx } = useLang();
  const s = tx.codelab.shortcuts;
  const rows: [string, ReactNode][] = [
    [s.run, <><Kbd>Ctrl/⌘</Kbd> + <Kbd>Enter</Kbd></>],
    [s.leave, <><Kbd>Esc</Kbd>, <Kbd>Tab</Kbd></>],
    [s.indent, <><Kbd>Tab</Kbd> / <Kbd>Shift</Kbd> + <Kbd>Tab</Kbd></>],
    [s.find, <><Kbd>Ctrl/⌘</Kbd> + <Kbd>F</Kbd></>],
    [s.undo, <><Kbd>Ctrl/⌘</Kbd> + <Kbd>Z</Kbd> / <Kbd>Y</Kbd></>],
    [s.comment, <><Kbd>Ctrl/⌘</Kbd> + <Kbd>/</Kbd></>],
  ];
  return (
    <Popover label={tx.codelab.toolbar.shortcuts} buttonClassName={iconBtn} button={<HelpCircle size={18} aria-hidden="true" />} panelClassName="w-[min(22rem,calc(100vw-2rem))]" testId="shortcuts-trigger">
      {() => (
        <div className="p-4">
          <h2 className="text-sm font-bold text-fg">{s.title}</h2>
          <dl className="mt-3 space-y-2">
            {rows.map(([name, keys]) => (
              <div key={name} className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-fg-soft">{name}</dt>
                <dd dir="ltr" className="m-0 flex shrink-0 items-center gap-1 text-fg-muted">{keys}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-fg-subtle">{s.tabNote}</p>
        </div>
      )}
    </Popover>
  );
}

function SettingsPopover({
  prefs,
  onPrefs,
  onReset,
  showRunOn,
  canReset,
}: {
  prefs: LabPrefs;
  onPrefs: (p: LabPrefs) => void;
  onReset: () => void;
  showRunOn: boolean;
  canReset: boolean;
}) {
  const { tx } = useLang();
  const t = tx.codelab;
  const seg = (active: boolean) =>
    `flex-1 inline-flex items-center justify-center gap-1.5 min-h-10 rounded-md text-sm font-semibold ${focusRing} ${active ? "bg-brand text-brand-fg" : "text-fg-soft hover:bg-fg/5"}`;
  return (
    <Popover label={t.toolbar.settings} buttonClassName={iconBtn} button={<Settings2 size={18} aria-hidden="true" />} panelClassName="w-[min(20rem,calc(100vw-2rem))]" testId="settings-trigger">
      {(close) => (
        <div className="p-4 space-y-4">
          <div>
            <p id="fs-label" className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{t.editor.fontSize}</p>
            <div role="group" aria-labelledby="fs-label" className="mt-2 flex items-center gap-2">
              <button type="button" aria-label={t.editor.smaller} disabled={prefs.fontSize <= FONT_MIN} onClick={() => onPrefs({ ...prefs, fontSize: prefs.fontSize - 1 })} className={`${btnGhost} !px-0 size-10`}>
                <Minus size={16} aria-hidden="true" />
              </button>
              <output aria-live="polite" className="min-w-14 text-center font-mono text-sm text-fg">{prefs.fontSize}px</output>
              <button type="button" aria-label={t.editor.larger} disabled={prefs.fontSize >= FONT_MAX} onClick={() => onPrefs({ ...prefs, fontSize: prefs.fontSize + 1 })} className={`${btnGhost} !px-0 size-10`}>
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-sm text-fg-soft">
            <span className="inline-flex items-center gap-2"><WrapText size={16} aria-hidden="true" />{t.editor.wrap}</span>
            <input type="checkbox" role="switch" checked={prefs.wrap} onChange={(e) => onPrefs({ ...prefs, wrap: e.target.checked })} className={`size-5 accent-[var(--brand)] ${focusRing}`} />
          </label>

          {showRunOn && (
            <div>
              <p id="runon-label" className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{t.toolbar.runIn}</p>
              <div role="radiogroup" aria-labelledby="runon-label" className="mt-2 flex gap-1 rounded-lg border border-line bg-bg p-1">
                <button type="button" role="radio" aria-checked={!prefs.preferBrowser} onClick={() => onPrefs({ ...prefs, preferBrowser: false })} className={seg(!prefs.preferBrowser)}>
                  <Server size={14} aria-hidden="true" />{t.toolbar.runServer}
                </button>
                <button type="button" role="radio" aria-checked={prefs.preferBrowser} onClick={() => onPrefs({ ...prefs, preferBrowser: true })} className={seg(prefs.preferBrowser)}>
                  <Globe size={14} aria-hidden="true" />{t.toolbar.runBrowser}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-fg-subtle">{t.toolbar.runInHint}</p>
            </div>
          )}

          {canReset && (
            <button type="button" onClick={() => { onReset(); close(); }} title={t.toolbar.resetTitle} className={`${btnGhost} w-full`}>
              <RotateCcw size={15} aria-hidden="true" />
              {t.toolbar.resetCode}
            </button>
          )}
        </div>
      )}
    </Popover>
  );
}

/** Top bar of the lab: language, filename, run (desktop), history, share, settings, shortcuts. */
export default function Toolbar({
  languageSlot,
  spec,
  busy,
  canRun,
  onRun,
  onStop,
  onHistory,
  onShare,
  prefs,
  onPrefs,
  onReset,
  showRunOn,
  canReset,
  readOnly,
}: {
  languageSlot: ReactNode;
  spec: LabLanguage;
  busy: boolean;
  canRun: boolean;
  onRun: () => void;
  onStop: () => void;
  onHistory?: () => void;
  onShare?: () => void;
  prefs: LabPrefs;
  onPrefs: (p: LabPrefs) => void;
  onReset: () => void;
  showRunOn: boolean;
  canReset: boolean;
  readOnly?: boolean;
}) {
  const { tx } = useLang();
  const t = tx.codelab.toolbar;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2" role="toolbar" aria-label={tx.codelab.title}>
      {languageSlot}
      <span dir="ltr" className="hidden sm:inline-flex items-center rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-xs text-fg-muted" data-testid="filename">
        {spec.filename}
      </span>
      {readOnly && <span className="rounded-md border border-line px-2 py-1 text-xs text-fg-muted">{tx.codelab.editor.readOnly}</span>}
      <div className="ms-auto flex items-center gap-1">
        {onHistory && (
          <button type="button" onClick={onHistory} className={toolBtn} aria-label={t.history} title={t.history} data-testid="history-button">
            <Clock size={18} aria-hidden="true" />
            <span className="hidden sm:inline">{t.history}</span>
          </button>
        )}
        {onShare && (
          <button type="button" onClick={onShare} className={toolBtn} aria-label={t.share} title={t.share} data-testid="share-button">
            <Share2 size={18} aria-hidden="true" />
            <span className="hidden sm:inline">{t.share}</span>
          </button>
        )}
        <SettingsPopover prefs={prefs} onPrefs={onPrefs} onReset={onReset} showRunOn={showRunOn} canReset={canReset} />
        <ShortcutsPopover />
        <RunButton busy={busy} disabled={!canRun} onRun={onRun} onStop={onStop} className="hidden lg:inline-flex ms-2" />
      </div>
    </div>
  );
}
