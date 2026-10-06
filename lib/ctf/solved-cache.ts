/**
 * Local cache of the signed-in learner's solved challenge ids, so the list can
 * show solved badges instantly while live stats load. It is only a hint: the
 * Worker is the source of truth and replaces it as soon as stats arrive.
 *
 * Pure functions take a Storage-like object so they are unit-testable; the
 * React binding lives in use-ctf.ts. Every access is try/catch'd (private
 * windows and blocked storage must never break the page).
 */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const PREFIX = "imb-ctf-solved:";
export const solvedKey = (userSub: string) => `${PREFIX}${userSub}`;

const ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

/** Tolerant parser: anything that is not a JSON array of plausible ids is dropped. */
export function parseSolved(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return [...new Set(v.filter((x): x is string => typeof x === "string" && ID_RE.test(x)))];
  } catch {
    return [];
  }
}

export function readSolvedRaw(storage: StorageLike | null, userSub: string): string {
  try {
    return storage?.getItem(solvedKey(userSub)) ?? "";
  } catch {
    return "";
  }
}

export function writeSolved(storage: StorageLike | null, userSub: string, ids: Iterable<string>): void {
  try {
    storage?.setItem(solvedKey(userSub), JSON.stringify([...new Set(ids)].sort()));
  } catch {
    // quota / blocked storage: the cache is optional
  }
}

export function addSolved(storage: StorageLike | null, userSub: string, id: string): void {
  writeSolved(storage, userSub, [...parseSolved(readSolvedRaw(storage, userSub)), id]);
}

/** Replace the cache with the server's answer (drops ids the server no longer reports as solved). */
export function syncSolved(storage: StorageLike | null, userSub: string, serverSolved: Iterable<string>): void {
  const next = [...new Set(serverSolved)].sort();
  const prev = parseSolved(readSolvedRaw(storage, userSub)).sort();
  if (JSON.stringify(next) !== JSON.stringify(prev)) writeSolved(storage, userSub, next);
}
