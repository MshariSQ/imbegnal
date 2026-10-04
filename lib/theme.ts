"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "imb-theme";

/**
 * Runs synchronously in <head> before first paint (see app/layout.tsx) so the
 * page never flashes the wrong theme or text direction. Keep it tiny and
 * dependency-free — it is inlined as a string.
 */
export const PRE_PAINT_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("${KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}d.setAttribute("data-theme",t);var l=localStorage.getItem("sf-lang");if(l==="ar"){d.lang="ar";d.dir="rtl";d.classList.add("font-arabic")}}catch(e){}})()`;

function read(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function setTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(KEY, t);
  } catch {
    // storage blocked — theme still applies for this page view
  }
  listeners.forEach((l) => l());
}

/** Current theme, kept in sync with the <html data-theme> attribute. */
export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  return [theme, setTheme];
}
