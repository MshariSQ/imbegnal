"use client";

import { useSyncExternalStore } from "react";
import { Sparkles } from "lucide-react";

// Minimal global toast queue — one message at a time, auto-dismissed.
let current: { id: number; text: string } | null = null;
const listeners = new Set<() => void>();
let seq = 0;

export function toast(text: string, ms = 2600) {
  const id = ++seq;
  current = { id, text };
  listeners.forEach((l) => l());
  setTimeout(() => {
    if (current?.id === id) {
      current = null;
      listeners.forEach((l) => l());
    }
  }, ms);
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function Toaster() {
  const t = useSyncExternalStore(subscribe, () => current, () => null);
  if (!t) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 inset-x-0 z-[60] flex justify-center pointer-events-none px-4">
      <div key={t.id} className="card px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-fg animate-fade-up shadow-xl">
        <Sparkles size={15} className="text-amber-400" /> {t.text}
      </div>
    </div>
  );
}
