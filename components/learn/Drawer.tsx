"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/** Off-canvas panel for small screens. `side` is logical, so it mirrors in RTL. */
export default function Drawer({
  open,
  onClose,
  side = "start",
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  side?: "start" | "end";
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in" />
      <div
        className={`absolute top-0 bottom-0 ${side === "start" ? "start-0 border-e" : "end-0 border-s"} w-[min(24rem,92vw)] bg-bg border-line flex flex-col animate-fade-in`}
      >
        <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-line">
          <span className="text-sm font-bold text-fg">{title}</span>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 grid place-items-center rounded-lg text-fg-muted hover:bg-fg/5">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
