"use client";

/**
 * The one rule for the total XP the UI shows (dashboard and anywhere else), so every caller agrees:
 *  - guests: totalXp(study state) + the lab XP guests earned in this browser (lib/lab-progress.ts);
 *  - signed in: totalXp(study state) + the lab XP the Worker awarded that user (xp_ledger, kept by
 *    lib/lab-progress.ts from GET /api/lab/progress and graded runs). Guest awards never count here.
 * Lab XP is never part of the study state's `bonus` (except legacy passes, lib/lab-progress.ts).
 */
import { useAuthUser } from "./auth";
import { getGuestLabXp, serverLabXpOf, useGuestLabXp, useServerLabXp } from "./lab-progress";
import { getStudyState, totalXp, useStudy, type StudyState } from "./study-store";

/** `user` is null for guests; `serverLabXp` is the Worker's lab XP for `user`, `guestLabXp` this browser's guest awards. */
export function shownXp(state: StudyState, user: string | null, serverLabXp: number, guestLabXp: number): number {
  return totalXp(state) + (user ? serverLabXp : guestLabXp);
}

/** shownXp from the stores as they are now, for `user` (null: a guest). */
export function currentXp(user: string | null): number {
  return shownXp(getStudyState(), user, user ? serverLabXpOf(user) : 0, getGuestLabXp());
}

/** Total XP for whoever is using the site (hydration-safe: study state and auth start empty). */
export function useTotalXp(): number {
  const study = useStudy();
  const user = useAuthUser()?.sub ?? null;
  const server = useServerLabXp(user);
  const guest = useGuestLabXp();
  return shownXp(study, user, server, guest);
}
