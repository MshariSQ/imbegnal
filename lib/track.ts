/**
 * Anonymous product analytics. Sends a named event with a random per-browser
 * id (no account, no IP stored, no cookies) so we can measure the funnel:
 * visit → lesson_start → lesson_done → return. Respects Do Not Track.
 */
import { API_URL as API } from "./site";
const KEY = "imb-anon";

export type EventName = "lesson_start" | "lesson_done" | "ai_question" | "auth" | "pricing_view" | "pro_click";

export function track(name: EventName, meta?: string): void {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    // A string body goes out as text/plain: no CORS preflight, survives page unloads
    navigator.sendBeacon(`${API}/api/event`, JSON.stringify({ n: name, a: id, m: meta }));
  } catch {
    // analytics must never break the app
  }
}
