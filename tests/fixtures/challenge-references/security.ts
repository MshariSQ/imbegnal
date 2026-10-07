/**
 * The "spoiler vault" for the security group: reference solvers and solutions that prove every
 * challenge is solvable. Intentionally public in this open-source repo; used only by tests.
 *
 * Flag references never hold a constant: each solver DERIVES the flag from the public puzzle
 * files exactly as a learner would (the same `files` that ship in data/challenges/security.ts).
 */
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
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

// ── re-js-unmask ──────────────────────────────────────────────────────────────

/** Dynamic analysis: run vault.js in an isolated context (no console, no I/O) and ask its builder for the secret. */
export function solveJsUnmask(source: string): string {
  const sandbox: { atob: typeof atob; console: { log: () => void }; __secret?: string } = { atob, console: { log: () => undefined } };
  runInNewContext(`${source}\n;globalThis.__secret = _0x71();`, sandbox, { timeout: 2000 });
  if (typeof sandbox.__secret !== "string") throw new Error("the builder returned nothing");
  return sandbox.__secret;
}

// ── re-crackme-checker ────────────────────────────────────────────────────────

const rotr8 = (v: number, n: number) => ((v >> n) | (v << (8 - n))) & 0xff;

/** Static analysis: read the target table out of crackme.py and run both stages backwards. */
export function solveCrackme(source: string): string {
  const table = /_T = bytes\.fromhex\("([0-9a-f]{32})"\)/.exec(source)?.[1];
  if (!table) throw new Error("target table not found");
  const target = [...Buffer.from(table, "hex")];
  // stage 2 (suffix fold): out[i] = T[i] ^ T[i+1], out[15] = T[15]
  const out = target.map((t, i) => (i < 15 ? t ^ target[i + 1] : t));
  // stage 1 (per character, in program order because `acc` depends on recovered characters)
  let acc = 0x5a;
  let serial = "";
  out.forEach((o, i) => {
    const c = rotr8((o - 7 * i) & 0xff, 3) ^ acc;
    serial += String.fromCharCode(c);
    acc = (acc * 3 + c + i) & 0xff;
  });
  return `IMB{${serial}}`;
}

// ── sec-password-strength ─────────────────────────────────────────────────────

const PASSWORD_STRENGTH_PY = String.raw`import math
import sys

COMMON = {"password", "123456", "12345678", "qwerty", "abc123", "letmein", "iloveyou", "admin"}


def rate(bits):
    if bits < 28:
        return "very weak"
    if bits < 36:
        return "weak"
    if bits < 60:
        return "reasonable"
    if bits < 128:
        return "strong"
    return "very strong"


lines = sys.stdin.read().split("\n")
n = int(lines[0])
for pw in lines[1:1 + n]:
    if pw.lower() in COMMON:
        bits = 0.0
    else:
        pool = 0
        if any("a" <= c <= "z" for c in pw):
            pool += 26
        if any("A" <= c <= "Z" for c in pw):
            pool += 26
        if any("0" <= c <= "9" for c in pw):
            pool += 10
        if any(not c.isascii() or not c.isalnum() for c in pw):
            pool += 33
        bits = len(pw) * math.log2(pool) if pool else 0.0
    print(f"{bits:.1f} {rate(bits)}")
`;

const PASSWORD_STRENGTH_JS = String.raw`const lines = require("fs").readFileSync(0, "utf8").split("\n");
const n = parseInt(lines[0], 10);
const COMMON = new Set(["password", "123456", "12345678", "qwerty", "abc123", "letmein", "iloveyou", "admin"]);

function rate(bits) {
  if (bits < 28) return "very weak";
  if (bits < 36) return "weak";
  if (bits < 60) return "reasonable";
  if (bits < 128) return "strong";
  return "very strong";
}

const out = [];
for (const pw of lines.slice(1, 1 + n)) {
  let bits = 0;
  if (!COMMON.has(pw.toLowerCase())) {
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
    if (pool > 0) bits = pw.length * Math.log2(pool);
  }
  out.push(bits.toFixed(1) + " " + rate(bits));
}
console.log(out.join("\n"));
`;

// ── re-stack-vm ───────────────────────────────────────────────────────────────

const STACK_VM_PY = String.raw`import sys

LIMIT = 100000


class Fault(Exception):
    pass


def run(code):
    out = []
    stack = []
    pc = 0
    steps = 0
    try:
        while pc < len(code):
            if steps >= LIMIT:
                out.append("LIMIT\n")
                break
            steps += 1
            op = code[pc]
            pc += 1
            if op == 0x00:
                break
            if op in (0x01, 0x0A, 0x0B, 0x0C):
                if pc >= len(code):
                    raise Fault()
                arg = code[pc]
                pc += 1
                if op == 0x01:
                    stack.append(arg)
                    continue
                if op == 0x0A:
                    taken = True
                else:
                    if not stack:
                        raise Fault()
                    v = stack.pop()
                    taken = (v == 0) if op == 0x0B else (v != 0)
                if taken:
                    if arg >= len(code):
                        raise Fault()
                    pc = arg
            elif op in (0x02, 0x03, 0x04, 0x0D):
                if len(stack) < 2:
                    raise Fault()
                b = stack.pop()
                a = stack.pop()
                stack.append(a + b if op == 0x02 else a - b if op == 0x03 else a * b if op == 0x04 else int(a < b))
            elif op == 0x05:
                if not stack:
                    raise Fault()
                stack.append(stack[-1])
            elif op == 0x06:
                if len(stack) < 2:
                    raise Fault()
                stack[-1], stack[-2] = stack[-2], stack[-1]
            elif op == 0x07:
                if not stack:
                    raise Fault()
                stack.pop()
            elif op == 0x08:
                if not stack:
                    raise Fault()
                out.append(str(stack.pop()) + "\n")
            elif op == 0x09:
                if not stack:
                    raise Fault()
                out.append(chr(stack.pop()))
            elif op == 0x0E:
                if len(stack) < 2:
                    raise Fault()
                stack.append(stack[-2])
            else:
                raise Fault()
    except Fault:
        out.append("FAULT\n")
    return "".join(out)


program = bytes(int(token, 16) for token in sys.stdin.read().split())
sys.stdout.write(run(program))
`;

const STACK_VM_JS = String.raw`const code = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map((t) => parseInt(t, 16));
const LIMIT = 100000;

class Fault extends Error {}

function run(program) {
  const out = [];
  const stack = [];
  let pc = 0;
  let steps = 0;
  const pop = () => {
    if (stack.length === 0) throw new Fault();
    return stack.pop();
  };
  try {
    while (pc < program.length) {
      if (steps >= LIMIT) {
        out.push("LIMIT\n");
        break;
      }
      steps++;
      const op = program[pc++];
      if (op === 0x00) break;
      if (op === 0x01 || op === 0x0a || op === 0x0b || op === 0x0c) {
        if (pc >= program.length) throw new Fault();
        const arg = program[pc++];
        if (op === 0x01) {
          stack.push(arg);
          continue;
        }
        let taken = true;
        if (op !== 0x0a) {
          const v = pop();
          taken = op === 0x0b ? v === 0 : v !== 0;
        }
        if (taken) {
          if (arg >= program.length) throw new Fault();
          pc = arg;
        }
      } else if (op === 0x02 || op === 0x03 || op === 0x04 || op === 0x0d) {
        if (stack.length < 2) throw new Fault();
        const b = stack.pop();
        const a = stack.pop();
        stack.push(op === 0x02 ? a + b : op === 0x03 ? a - b : op === 0x04 ? a * b : a < b ? 1 : 0);
      } else if (op === 0x05) {
        const v = pop();
        stack.push(v, v);
      } else if (op === 0x06) {
        if (stack.length < 2) throw new Fault();
        const b = stack.pop();
        const a = stack.pop();
        stack.push(b, a);
      } else if (op === 0x07) {
        pop();
      } else if (op === 0x08) {
        out.push(String(pop()) + "\n");
      } else if (op === 0x09) {
        out.push(String.fromCharCode(pop()));
      } else if (op === 0x0e) {
        if (stack.length < 2) throw new Fault();
        stack.push(stack[stack.length - 2]);
      } else {
        throw new Fault();
      }
    }
  } catch (e) {
    if (!(e instanceof Fault)) throw e;
    out.push("FAULT\n");
  }
  return out.join("");
}

process.stdout.write(run(code));
`;

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
  { id: "re-js-unmask", flag: solveJsUnmask(puzzleFile("re-js-unmask", "vault.js")) },
  { id: "re-crackme-checker", flag: solveCrackme(puzzleFile("re-crackme-checker", "crackme.py")) },
  { id: "sec-password-strength", solutions: { python: PASSWORD_STRENGTH_PY, javascript: PASSWORD_STRENGTH_JS } },
  { id: "re-stack-vm", solutions: { python: STACK_VM_PY, javascript: STACK_VM_JS } },
];
