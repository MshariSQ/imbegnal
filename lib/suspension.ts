/**
 * Suspended accounts. Every guarded Worker route answers a suspended account with
 * 403 {error:"account_suspended", message, until?} (worker/src/auth/guard.ts; `until` is ISO and only
 * present when the suspension has an end). That is never a reason to sign out or to drop local data:
 * the token is still valid and the suspension may end on its own. Screens that call a guarded route
 * show a suspension message instead of their generic error, with the end date when there is one.
 */
import { intlLocale } from "./codelab/format";

export interface Suspension {
  /** ISO end of the suspension; absent when an operator has to lift it. */
  until?: string;
}

/** The suspension described by a Worker answer, or null when the answer is something else. */
export function suspensionOf(status: number, body: unknown): Suspension | null {
  if (status !== 403 || typeof body !== "object" || body === null) return null;
  const b = body as { error?: unknown; until?: unknown };
  if (b.error !== "account_suspended") return null;
  return typeof b.until === "string" && Number.isFinite(Date.parse(b.until)) ? { until: b.until } : {};
}

/** The end of a suspension as a date and time in the reader's language and time zone. */
export function formatSuspensionEnd(until: string, lang: "en" | "ar"): string {
  return formatSuspensionEndIn(until, intlLocale(lang));
}

/** formatSuspensionEnd for an Intl locale tag (intlLocale(lang)), for callers that carry the tag. */
export function formatSuspensionEndIn(until: string, locale: string): string {
  const t = Date.parse(until);
  if (!Number.isFinite(t)) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(t);
}

/** `copy.until` with {date} filled in when the suspension has an end, else `copy.open`. */
export function suspensionMessage(s: Suspension, copy: { open: string; until: string }, lang: "en" | "ar"): string {
  const date = s.until ? formatSuspensionEnd(s.until, lang) : "";
  return date ? copy.until.replace("{date}", date) : copy.open;
}
