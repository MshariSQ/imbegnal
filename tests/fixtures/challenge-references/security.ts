/**
 * The "spoiler vault" for the security group: reference solvers and solutions that prove every
 * challenge is solvable. Intentionally public in this open-source repo; used only by tests.
 *
 * Flag references never hold a constant: each solver DERIVES the flag from the public puzzle
 * files exactly as a learner would (the same `files` that ship in data/challenges/security.ts).
 */
import { createHash } from "node:crypto";
import type { ChallengeReference } from "../../../shared/challenges";
import { securityChallenges } from "../../../data/challenges/security";

/** Content of a public puzzle file, by challenge id and file name. */
export function puzzleFile(id: string, name: string): string {
  const content = securityChallenges.find((c) => c.id === id)?.files?.find((f) => f.name === name)?.content;
  if (content === undefined) throw new Error(`puzzle file ${id}/${name} not found`);
  return content;
}

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

// ── sec-auth-log-hunt ─────────────────────────────────────────────────────────

/** IP with the most failures BEFORE its first success; flag from `ip|user|count`. */
export function solveAuthLogHunt(log: string): string {
  const failures = new Map<string, number>();
  const firstLogin = new Map<string, string>();
  const re = /(Failed|Accepted) password for (?:invalid user )?(\S+) from (\S+)/;
  for (const line of log.split("\n")) {
    const m = re.exec(line);
    if (!m) continue;
    const [, verb, user, ip] = m;
    if (firstLogin.has(ip)) continue; // everything after the first success is ignored
    if (verb === "Accepted") firstLogin.set(ip, user);
    else failures.set(ip, (failures.get(ip) ?? 0) + 1);
  }
  const ranked = [...firstLogin.keys()].sort((a, b) => (failures.get(b) ?? 0) - (failures.get(a) ?? 0));
  const ip = ranked[0];
  return `IMB{${sha256(`${ip}|${firstLogin.get(ip)}|${failures.get(ip) ?? 0}`).slice(0, 16)}}`;
}

export const securityReferences: ChallengeReference[] = [
  { id: "sec-auth-log-hunt", flag: solveAuthLogHunt(puzzleFile("sec-auth-log-hunt", "auth.log")) },
];
