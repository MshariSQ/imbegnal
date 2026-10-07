/**
 * Public certificate verification (`/certificate/?code=IMB-XXXX-XXXX-XXXX`).
 * Pure helpers plus one fetch wrapper; no React, no browser globals, so they run under node:test.
 *
 * The code format and its normaliser mirror the Worker (worker/src/certificates/code.ts), which the
 * site must not import. The Worker stays authoritative: it re-normalises whatever we send.
 */
import type { CertificateVerifyResponse } from "../../shared/api";
import { intlLocale } from "../codelab/format";
import { API_URL } from "../site";

/** IMB- plus three groups of four, in the Worker's alphabet (no I, O, 0, 1). */
export const CERTIFICATE_CODE_RE = /^IMB-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

/** Same rule as the Worker: trim, upper-case, then it must match the code format. Null when it cannot be a code. */
export function normalizeCertificateCode(input: string): string | null {
  const code = input.trim().toUpperCase();
  return CERTIFICATE_CODE_RE.test(code) ? code : null;
}

const DASHES = /[‐-―−﹘﹣－]/g;

/**
 * Forgiving front door for typed or pasted text: ignores spaces, accepts typographic dashes and a code written
 * without dashes ("imbabcdefgh2345"), then applies the Worker's normaliser. Returns the canonical code or null.
 */
export function parseCertificateInput(input: string): string | null {
  const compact = input.replace(DASHES, "-").replace(/\s+/g, "").toUpperCase();
  const m = /^IMB-?([A-Z2-9]{4})-?([A-Z2-9]{4})-?([A-Z2-9]{4})$/.exec(compact);
  return normalizeCertificateCode(m ? `IMB-${m[1]}-${m[2]}-${m[3]}` : compact);
}

export interface VerifiedCertificate {
  code: string;
  /** Roadmap id; the UI resolves the title at render time. */
  track?: string;
  recipient?: string;
  /** ISO instant. */
  issuedAt?: string;
}

export type VerifyOutcome =
  | { kind: "valid"; certificate: VerifiedCertificate }
  | { kind: "invalid" }
  /** Network failure, non-2xx, or a body that is not a verification answer: say "try again later", never "invalid". */
  | { kind: "unavailable" };

const text = (v: unknown, max: number): string | undefined => (typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : undefined);

/** Turns an HTTP status and parsed JSON body into one UI outcome. `requested` is the code we asked about. */
export function interpretVerifyResponse(status: number, body: unknown, requested: string): VerifyOutcome {
  if (status < 200 || status >= 300 || typeof body !== "object" || body === null) return { kind: "unavailable" };
  const b = body as Partial<CertificateVerifyResponse>;
  if (b.valid === false) return { kind: "invalid" };
  if (b.valid !== true) return { kind: "unavailable" };
  const issued = text(b.issuedAt, 40);
  return {
    kind: "valid",
    certificate: {
      code: normalizeCertificateCode(text(b.code, 40) ?? "") ?? requested,
      track: text(b.track, 100),
      recipient: text(b.recipient, 200),
      issuedAt: issued && !Number.isNaN(Date.parse(issued)) ? issued : undefined,
    },
  };
}

/** GET /api/certificates/verify/:code (public, no token). Aborts reject with the AbortError; every other failure is "unavailable". */
export async function verifyCertificate(code: string, signal?: AbortSignal, fetchFn: typeof fetch = fetch): Promise<VerifyOutcome> {
  try {
    const res = await fetchFn(`${API_URL}/api/certificates/verify/${encodeURIComponent(code)}`, { signal });
    const body: unknown = await res.json().catch(() => null);
    return interpretVerifyResponse(res.status, body, code);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { kind: "unavailable" };
  }
}

/** "15 June 2026" / "١٥ يونيو" with Latin digits. UTC, like the PDF, so the date never shifts with the reader's time zone. */
export function formatIssueDate(iso: string, lang: "en" | "ar"): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Intl.DateTimeFormat(intlLocale(lang), { dateStyle: "long", timeZone: "UTC" }).format(t);
}

/** `/certificate/?code=...` for a canonical code. */
export const certificateHref = (code?: string) => (code ? `/certificate/?code=${encodeURIComponent(code)}` : "/certificate/");
