/**
 * Where deep links get their data: lessons (`?ex=`, `?demo=`) and challenges
 * (`?ch=`). Both are dynamic imports so the lab's first load does not carry
 * the curriculum. `window.__IMB_LAB_FIXTURES__` is a documented e2e seam: the
 * browser tests inject fabricated lessons/challenges there (data/** is owned
 * by the content engineers and must not be edited by tests). It is only read
 * on the client and can only change what the person who set it sees.
 */
import type { ChallengeMeta } from "../../shared/challenges";
import type { Lesson } from "../../data/lessons/types";

export interface LabFixtures {
  lessons?: Record<string, Lesson>;
  challenges?: Record<string, ChallengeMeta>;
}

declare global {
  interface Window {
    __IMB_LAB_FIXTURES__?: LabFixtures;
  }
}

function fixtures(): LabFixtures | undefined {
  return typeof window === "undefined" ? undefined : window.__IMB_LAB_FIXTURES__;
}

/** The lesson `track/lesson`, or null when it does not exist. Throws when the chunk fails to load. */
export async function loadLabLesson(track: string, lesson: string): Promise<Lesson | null> {
  const fixed = fixtures()?.lessons?.[`${track}/${lesson}`];
  if (fixed) return fixed;
  const { loadLesson } = await import("../../data/lessons");
  return loadLesson(track, lesson);
}

export async function loadLabChallenge(id: string): Promise<ChallengeMeta | null> {
  const fixed = fixtures()?.challenges?.[id];
  if (fixed) return fixed;
  const { getChallenge } = await import("../../data/challenges");
  return getChallenge(id) ?? null;
}
