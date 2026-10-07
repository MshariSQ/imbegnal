/**
 * Printable certificate (`/certificate/?code=IMB-XXXX-XXXX-XXXX&print=1`): pure helpers, no React and no browser
 * globals, so they run under node:test. The browser lays the certificate out and shapes Arabic, which the Worker's
 * Helvetica-only PDF cannot do (worker/src/certificates/README.md, "Non-Latin names").
 */
import type { CertificateInfo } from "../../shared/challenges";
import type { Lang, Tx } from "../i18n";
import { trackTitle } from "../ctf/labels";
import { normalizeCertificateCode } from "./verify";

/** Query flag that opens the verification page straight into the printable view. */
export const PRINT_PARAM = "print";

/** `/certificate/?code=...&print=1` for a canonical code. */
export const printableCertificateHref = (code: string) => `/certificate/?${new URLSearchParams({ code, [PRINT_PARAM]: "1" }).toString()}`;

/** True for `print=1` (and `print` / `print=true`), the forms a person or a link would write. */
export function wantsPrintView(value: string | null | undefined): boolean {
  return value === "" || value === "1" || value === "true";
}

/**
 * The verification address printed on the certificate: the page's own origin (so a staging or self-hosted copy
 * prints its own address), `fallbackOrigin` when there is none (prerender), always `/certificate/?code=...`.
 */
export function certificateVerifyUrl(origin: string, code: string, fallbackOrigin: string): string {
  const base = (/^https?:\/\/[^/?#\s]+$/i.test(origin.replace(/\/+$/, "")) ? origin : fallbackOrigin).replace(/\/+$/, "");
  return `${base}/certificate/?code=${encodeURIComponent(code)}`;
}

/**
 * Course title in the certificate's language: the localized roadmap title when the dictionary has one, then the
 * canonical English title from roadmaps[] (`canonical`, id -> title), then the raw id. Empty when there is no track.
 */
export function certificateCourseTitle(tx: Tx, track: string | undefined, canonical: Record<string, string>): string {
  return track ? trackTitle(tx, track, canonical[track]) : "";
}

/** Direction of a certificate language. */
export const langDir = (lang: Lang): "rtl" | "ltr" => (lang === "ar" ? "rtl" : "ltr");

/**
 * Reads the code out of `GET /api/certificates/:track?format=json` (CertificateInfo). Null for anything that is not
 * a well-formed certificate code, so a junk body never becomes a link.
 */
export function certificateCodeFromInfo(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const code = (body as Partial<CertificateInfo>).code;
  return typeof code === "string" ? normalizeCertificateCode(code) : null;
}

/**
 * Font size of the recipient's name, in sheet units (1 unit = 1 mm on the printed A4 page): large for a typical
 * name, stepping down so a long one (up to the Worker's 200 characters) stays inside the frame on two lines at most.
 */
export function recipientNameSize(name: string): number {
  const n = Array.from(name.trim()).length;
  return n <= 22 ? 15 : n <= 34 ? 12 : n <= 52 ? 9.5 : n <= 90 ? 7 : 5;
}
