/**
 * Output comparison used by every grader (Worker challenge/lab grading, the
 * authoring test-suite, and the in-browser hint "expected vs actual" view).
 * One implementation so "what counts as a pass" cannot differ between them.
 * Pure; no imports except types.
 */
import type { MatchMode } from "./challenges";

const MAX_COMPARE_CHARS = 256 * 1024;

const norm = (s: string) => s.replace(/\r\n?/g, "\n");

/** Trailing whitespace of every line removed, trailing blank lines dropped. */
function lines(s: string): string[] {
  const out = norm(s).split("\n").map((l) => l.replace(/[ \t]+$/g, ""));
  while (out.length && out[out.length - 1] === "") out.pop();
  return out;
}

export function matchOutput(actual: string, expected: string, mode: MatchMode = "trim", epsilon = 1e-6): boolean {
  if (actual.length > MAX_COMPARE_CHARS) return false;
  switch (mode) {
    case "exact":
      return actual === expected;
    case "trim":
      return norm(actual).trimEnd() === norm(expected).trimEnd();
    case "lines": {
      const a = lines(actual);
      const e = lines(expected);
      return a.length === e.length && a.every((l, i) => l === e[i]);
    }
    case "contains":
      return norm(actual).includes(norm(expected).trimEnd());
    case "regex": {
      try {
        return new RegExp(expected, "s").test(norm(actual));
      } catch {
        return false;
      }
    }
    case "float": {
      const a = norm(actual).trim().split(/\s+/).filter(Boolean);
      const e = norm(expected).trim().split(/\s+/).filter(Boolean);
      if (a.length !== e.length) return false;
      return a.every((tok, i) => {
        const x = Number(tok);
        const y = Number(e[i]);
        return Number.isFinite(x) && Number.isFinite(y) ? Math.abs(x - y) <= epsilon : tok === e[i];
      });
    }
  }
}
