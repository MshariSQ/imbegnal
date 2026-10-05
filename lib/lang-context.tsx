"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { translations, type Lang, type Tx } from "./i18n";

const KEY = "sf-lang";
const listeners = new Set<() => void>();

function readLang(): Lang {
  try {
    return localStorage.getItem(KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function setLang(l: Lang) {
  try {
    localStorage.setItem(KEY, l);
  } catch {
    // storage blocked — language still switches for this page view
  }
  listeners.forEach((fn) => fn());
}

/**
 * Kept for API compatibility with the original context-based implementation;
 * language now lives in an external store so no provider state is needed.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Current UI language + translations. Prerenders in English. */
export function useLang(): { lang: Lang; tx: Tx; setLang: (l: Lang) => void } {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as Lang);
  return { lang, tx: translations[lang] as unknown as Tx, setLang };
}
