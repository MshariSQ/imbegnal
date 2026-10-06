/**
 * Sparse product analytics for Code Lab. Only ever the language id: never
 * code, stdin, output or anything a learner typed.
 */
import { track, type EventName } from "../track";

type LabEvent = "codelab_run" | "codelab_share";

export function trackLab(event: LabEvent, lang: string): void {
  // `EventName` is owned by lib/track.ts; the Worker accepts any short name.
  track(event as EventName, lang);
}
