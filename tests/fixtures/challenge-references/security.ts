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

// ── sec-salted-wordlist ───────────────────────────────────────────────────────

/** Replays the wordlist against the admin's `$imb1$salt$digest` entry; flag from the SHA-256 of the password. */
export function solveSaltedWordlist(shadow: string, wordlist: string): string {
  const entry = shadow.split("\n").find((l) => l.startsWith("admin:"));
  if (!entry) throw new Error("no admin entry");
  const [, , salt, digest] = entry.slice("admin:".length).split("$");
  const password = wordlist.split("\n").find((w) => w !== "" && sha256(`${salt}:${w}`) === digest);
  if (password === undefined) throw new Error("password not in wordlist");
  return `IMB{${sha256(password).slice(0, 16)}}`;
}

// ── sec-crypto-ladder ─────────────────────────────────────────────────────────

const caesarShift = (text: string, k: number) =>
  text.replace(/[a-z]/gi, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + k + 26) % 26) + base);
  });

/** Caesar (try all 25 shifts) -> hex -> base64 -> repeating-key XOR recovered with the "FLAG=" crib. */
export function solveCryptoLadder(stage1: string, stage2: string, stage3: string): string {
  const shift = Array.from({ length: 25 }, (_, i) => i + 1).find((k) => /stage2\.txt/.test(caesarShift(stage1, -k)));
  if (shift === undefined) throw new Error("no Caesar shift reveals English");
  const note2 = Buffer.from(Buffer.from(stage2.trim(), "hex").toString("utf8"), "base64").toString("utf8");
  const keyLength = Number(/repeating key of exactly (\d+) bytes/.exec(note2)?.[1]);
  const cipher = Buffer.from(stage3.trim(), "hex");
  const crib = Buffer.from("FLAG=");
  const key = Buffer.from(Array.from({ length: keyLength }, (_, i) => cipher[i] ^ crib[i]));
  const plain = Buffer.from(cipher.map((b, i) => b ^ key[i % keyLength])).toString("utf8");
  if (!plain.startsWith("FLAG=")) throw new Error("crib mismatch");
  return plain.slice("FLAG=".length);
}

export const securityReferences: ChallengeReference[] = [
  { id: "sec-auth-log-hunt", flag: solveAuthLogHunt(puzzleFile("sec-auth-log-hunt", "auth.log")) },
  { id: "sec-salted-wordlist", flag: solveSaltedWordlist(puzzleFile("sec-salted-wordlist", "shadow.txt"), puzzleFile("sec-salted-wordlist", "wordlist.txt")) },
  {
    id: "sec-crypto-ladder",
    flag: solveCryptoLadder(
      puzzleFile("sec-crypto-ladder", "stage1.txt"),
      puzzleFile("sec-crypto-ladder", "stage2.txt"),
      puzzleFile("sec-crypto-ladder", "stage3.txt"),
    ),
  },
];
