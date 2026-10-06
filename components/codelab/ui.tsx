"use client";

/** Small shared building blocks for the Code Lab UI. */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-10 px-3.5";
export const btnPrimary = `${btnBase} bg-brand text-brand-fg hover:bg-brand-strong ${focusRing}`;
export const btnGhost = `${btnBase} border border-line text-fg-soft hover:bg-fg/5 hover:text-fg ${focusRing}`;
export const iconBtn = `inline-grid place-items-center size-10 rounded-lg text-fg-muted hover:bg-fg/5 hover:text-fg ${focusRing} disabled:opacity-50`;

/** Copy-to-clipboard button with a transient "copied" state announced politely. */
export function CopyButton({ text, label, copiedLabel, className = "" }: { text: string; label: string; copiedLabel: string; className?: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API blocked (insecure context, permissions): fall back to a selection copy.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // nothing more we can do
      }
      ta.remove();
    }
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 min-h-8 text-xs font-medium text-fg-muted hover:text-fg hover:bg-fg/5 ${focusRing} ${className}`}
    >
      {done ? <Check size={13} aria-hidden="true" className="text-brand-strong" /> : <Copy size={13} aria-hidden="true" />}
      <span>{done ? copiedLabel : label}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {done ? copiedLabel : ""}
      </span>
    </button>
  );
}

/** Modal side sheet with focus trap, Esc to close, scroll lock and focus return. */
export function Sheet({
  open,
  onClose,
  title,
  closeLabel,
  children,
  side = "end",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
  side?: "start" | "end";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restore.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = panel.current;
    const focusables = () =>
      node ? Array.from(node.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])')) : [];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restore.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-[2px] animate-fade-in" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-y-0 ${side === "end" ? "end-0 border-s" : "start-0 border-e"} w-[min(26rem,100vw)] bg-bg border-line flex flex-col animate-fade-in shadow-2xl`}
      >
        <div className="h-14 shrink-0 flex items-center justify-between ps-4 pe-2 border-b border-line">
          <h2 className="text-sm font-bold text-fg">{title}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} className={iconBtn}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden="true" style={style} className={`rounded-lg bg-fg/[0.06] motion-safe:animate-pulse ${className}`} />;
}

/**
 * Button + non-modal popover. Esc or an outside click closes it and returns
 * focus to the button; focus moves into the panel when it opens. The panel
 * aligns to the logical end edge, so it mirrors in RTL.
 */
export function Popover({
  button,
  label,
  buttonClassName,
  panelClassName = "",
  align = "end",
  children,
  testId,
}: {
  button: React.ReactNode;
  label: string;
  buttonClassName: string;
  panelClassName?: string;
  align?: "start" | "end";
  children: (close: () => void) => React.ReactNode;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const first = panel.current?.querySelector<HTMLElement>("input,button:not([disabled]),a[href],[tabindex]:not([tabindex='-1'])");
    first?.focus();
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={btn}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={label}
        title={label}
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
        data-testid={testId}
      >
        {button}
      </button>
      {open && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-label={label}
          className={`absolute top-full mt-2 z-40 ${align === "end" ? "end-0" : "start-0"} rounded-xl border border-line-strong bg-surface shadow-2xl ${panelClassName}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
