/**
 * Where a run executes. One pure decision shared by the Run button, the
 * language picker and the tests:
 *
 *   web                          always the browser (nothing to run on a server)
 *   javascript / python          browser for guests; for signed-in users the
 *                                server, unless they chose "this browser" or the
 *                                runner is known to be down
 *   every other language         server; guests are asked to sign in
 */
import type { LangId } from "../../shared/languages";
import { getLabLanguage, type LabLangId } from "./langs";

export type RunTarget = "server" | "browser" | "signin" | "unavailable";

export interface AvailabilityMap {
  /** "unknown" until GET /api/lab/languages answered (or when it failed). */
  state: "loading" | "ready" | "failed";
  runner?: "up" | "down" | "unconfigured";
  byLang: Partial<Record<LangId, boolean>>;
}

export const UNKNOWN_AVAILABILITY: AvailabilityMap = { state: "loading", byLang: {} };

/** false only when we positively know the server cannot run this language. */
export function serverCanRun(lang: LabLangId, availability: AvailabilityMap): boolean {
  if (lang === "web") return false;
  if (availability.state !== "ready") return true; // unknown: let the server decide
  if (availability.runner === "down" || availability.runner === "unconfigured") return false;
  return availability.byLang[lang] !== false;
}

export function decideRunTarget(args: {
  lang: LabLangId;
  signedIn: boolean;
  preferBrowser: boolean;
  availability: AvailabilityMap;
}): RunTarget {
  const { lang, signedIn, preferBrowser, availability } = args;
  const spec = getLabLanguage(lang);
  if (spec.browserOnly) return "browser";
  if (spec.browser) {
    if (!signedIn || preferBrowser) return "browser";
    return serverCanRun(lang, availability) ? "server" : "browser";
  }
  if (!signedIn) return "signin";
  return serverCanRun(lang, availability) ? "server" : "unavailable";
}
