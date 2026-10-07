// Strict validation of client input for Code Lab. Everything here treats the
// body as hostile: types, sizes, characters and id shapes are all checked.
import type { RunRef } from "../../../shared/api";
import { LANG_IDS, type LangId } from "../../../shared/languages";
import { isValidId } from "../util";
import { MAX_CODE_BYTES, MAX_STDIN_BYTES, utf8Bytes } from "./config";

export type Parsed<T> = { ok: true; value: T } | { ok: false; message: string };

const fail = (message: string): { ok: false; message: string } => ({ ok: false, message });

export function parseLang(v: unknown): LangId | null {
  return typeof v === "string" && (LANG_IDS as readonly string[]).includes(v) ? (v as LangId) : null;
}

/** Source code: 1 byte .. 64 KiB, no NUL. */
export function parseCode(v: unknown): Parsed<string> {
  if (typeof v !== "string" || v.length === 0) return fail("code must be a non-empty string");
  if (v.includes("\0")) return fail("code must not contain NUL characters");
  if (utf8Bytes(v) > MAX_CODE_BYTES) return fail("code is larger than 64 KiB");
  return { ok: true, value: v };
}

/** stdin: optional (default ""), up to 64 KiB, no NUL. */
export function parseStdin(v: unknown): Parsed<string> {
  if (v === undefined || v === null) return { ok: true, value: "" };
  if (typeof v !== "string") return fail("stdin must be a string");
  if (v.includes("\0")) return fail("stdin must not contain NUL characters");
  if (utf8Bytes(v) > MAX_STDIN_BYTES) return fail("stdin is larger than 64 KiB");
  return { ok: true, value: v };
}

export function parseRef(v: unknown): Parsed<RunRef> {
  if (v === undefined || v === null) return { ok: true, value: { kind: "free" } };
  if (typeof v !== "object" || Array.isArray(v)) return fail("ref must be an object");
  const r = v as Record<string, unknown>;
  switch (r.kind) {
    case "free":
      return { ok: true, value: { kind: "free" } };
    case "lesson":
      if (!isValidId(r.track) || !isValidId(r.lesson) || !isValidId(r.exercise)) return fail("ref.track, ref.lesson and ref.exercise must be valid ids");
      return { ok: true, value: { kind: "lesson", track: r.track, lesson: r.lesson, exercise: r.exercise } };
    case "challenge":
      if (!isValidId(r.id)) return fail("ref.id must be a valid id");
      return { ok: true, value: { kind: "challenge", id: r.id } };
    default:
      return fail("ref.kind must be free, lesson or challenge");
  }
}

export interface ParsedRun {
  lang: LangId;
  code: string;
  stdin: string;
  ref: RunRef;
}

export function parseRunRequest(body: Record<string, unknown>): Parsed<ParsedRun> {
  const lang = parseLang(body.lang);
  if (!lang) return fail("unknown language");
  const code = parseCode(body.code);
  if (!code.ok) return code;
  const stdin = parseStdin(body.stdin);
  if (!stdin.ok) return stdin;
  const ref = parseRef(body.ref);
  if (!ref.ok) return ref;
  return { ok: true, value: { lang, code: code.value, stdin: stdin.value, ref: ref.value } };
}

/** Snippet title: control, zero-width and bidi-override characters removed, whitespace collapsed, <= max chars. */
export function sanitizeTitle(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v
    // eslint-disable-next-line no-control-regex -- stripping control characters is the point
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t ? Array.from(t).slice(0, max).join("") : undefined;
}
