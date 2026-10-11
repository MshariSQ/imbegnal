"use client";

/**
 * The one rule for the total XP the UI shows (dashboard and anywhere else), so every
 * caller agrees: guests see totalXp(study state); signed-in learners also get the lab
 * XP the Worker awarded them (xp_ledger, kept by lib/lab-progress.ts from
 * GET /api/lab/progress), which is no longer added to the study state's `bonus`.
 */
import { useAuthUser } from "./auth";
import { useServerLabXp } from "./lab-progress";
import { totalXp, useStudy, type StudyState } from "./study-store";

/** `serverLabXp` is null for guests. */
export function shownXp(state: StudyState, serverLabXp: number | null): number {
  return totalXp(state) + (serverLabXp ?? 0);
}

/** Total XP for whoever is using the site (hydration-safe: study state and auth start empty). */
export function useTotalXp(): number {
  const study = useStudy();
  const user = useAuthUser();
  const lab = useServerLabXp(user?.sub ?? null);
  return shownXp(study, user ? lab : null);
}
