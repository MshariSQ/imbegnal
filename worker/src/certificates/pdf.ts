// A minimal, dependency-free PDF writer for the completion certificate.
//
// Output: PDF 1.4, ONE landscape A4 page, the standard-14 Helvetica fonts only (nothing is
// embedded) with WinAnsiEncoding. Because of that, only Latin text can be drawn: callers pass
// text through `pdfSafeName` first, which falls back to a representable name instead of ever
// emitting bytes the font cannot show.
//
// The file is assembled as a "binary string" in which every character is one byte (< 256), so
// string offsets are byte offsets and the cross-reference table is exact.

export const PAGE_WIDTH = 842; // A4 landscape, in points
export const PAGE_HEIGHT = 595;

// ── Text encoding ─────────────────────────────────────────────────────────────

/** cp1252 code points in 0x80-0x9F that WinAnsiEncoding can draw. */
const WIN_ANSI_EXTRA: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88,
  0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93,
  0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
  0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

/** The WinAnsi byte for a character, or null when the font cannot draw it. */
function winAnsiByte(ch: string): number | null {
  const cp = ch.codePointAt(0) ?? 0;
  if (cp >= 0x20 && cp <= 0x7e) return cp;
  if (cp >= 0xa0 && cp <= 0xff) return cp; // WinAnsi matches Latin-1 here
  return WIN_ANSI_EXTRA[cp] ?? null;
}

/** True when every character can be drawn with Helvetica/WinAnsi. */
export function isWinAnsiRepresentable(text: string): boolean {
  for (const ch of text) if (winAnsiByte(ch) === null) return false;
  return true;
}

/**
 * The name to print. Helvetica cannot draw Arabic (or any non-Latin script), so a name that is not
 * fully representable is replaced by the account's username when that is, else by a neutral label.
 * Control characters and surrounding whitespace never reach the page.
 */
export function pdfSafeName(name: string | null | undefined, username: string | null | undefined): string {
  // eslint-disable-next-line no-control-regex -- stripping control characters is the point
  const clean = (s: string | null | undefined) => (s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const n = clean(name);
  if (n && isWinAnsiRepresentable(n)) return n;
  const u = clean(username);
  if (u && isWinAnsiRepresentable(u)) return u;
  return "IMBEGNAL Learner";
}

/** A PDF literal string: ASCII only on the wire, everything else as octal escapes. */
export function pdfString(text: string): string {
  let out = "(";
  for (const ch of text) {
    const b = winAnsiByte(ch) ?? 0x3f; // unrepresentable → "?"
    if (b === 0x28 || b === 0x29 || b === 0x5c) out += `\\${String.fromCharCode(b)}`;
    else if (b < 0x20 || b > 0x7e) out += `\\${b.toString(8).padStart(3, "0")}`;
    else out += String.fromCharCode(b);
  }
  return `${out})`;
}

// ── Metrics (Adobe Helvetica AFM widths, 1/1000 em, for code points 32..126) ──

// prettier-ignore
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
// prettier-ignore
const HELVETICA_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

export type FontKey = "regular" | "bold" | "italic";
const FONT_RES: Record<FontKey, string> = { regular: "F1", bold: "F2", italic: "F3" };
const FONT_BASE: Record<FontKey, string> = { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique" };

/** Width of `text` in points (Latin-1 accented letters are approximated by the average glyph). */
export function textWidth(text: string, font: FontKey, size: number): number {
  const table = font === "bold" ? HELVETICA_BOLD : HELVETICA; // Oblique shares Helvetica's metrics
  let units = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    units += cp >= 32 && cp <= 126 ? table[cp - 32] : 556;
  }
  return (units * size) / 1000;
}

/** Largest size ≤ `max` (but ≥ `min`) at which `text` fits `width`; the text is trimmed with "..." as a last resort. */
function fit(text: string, font: FontKey, max: number, min: number, width: number): { text: string; size: number } {
  let size = max;
  while (size > min && textWidth(text, font, size) > width) size -= 1;
  let t = text;
  while (t.length > 1 && textWidth(t, font, size) > width) t = `${t.slice(0, -2).trimEnd()}...`;
  return { text: t, size };
}

// ── Certificate ───────────────────────────────────────────────────────────────

export interface CertificateContent {
  /** Already passed through pdfSafeName. */
  recipient: string;
  trackTitle: string;
  /** e.g. "5 October 2026" */
  completedOn: string;
  code: string;
  verifyUrl: string;
}

const INK = "0.09 0.11 0.16";
const MUTED = "0.36 0.40 0.47";
const ACCENT = "0.02 0.52 0.38";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatCertificateDate(d: Date): string {
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function pdfDate(d: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `D:${p(d.getUTCFullYear(), 4)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

function pageContent(c: CertificateContent): string {
  const ops: string[] = [];
  const text = (s: string, font: FontKey, size: number, y: number, color: string, x?: number) => {
    const left = x ?? (PAGE_WIDTH - textWidth(s, font, size)) / 2;
    ops.push(`BT /${FONT_RES[font]} ${size} Tf ${color} rg ${left.toFixed(2)} ${y} Td ${pdfString(s)} Tj ET`);
  };
  const centered = (s: string, font: FontKey, max: number, min: number, y: number, color: string, width = 640) => {
    const f = fit(s, font, max, min, width);
    text(f.text, font, f.size, y, color);
  };

  // Double frame
  ops.push(`${ACCENT} RG 3 w 24 24 ${PAGE_WIDTH - 48} ${PAGE_HEIGHT - 48} re S`);
  ops.push(`${ACCENT} RG 0.8 w 33 33 ${PAGE_WIDTH - 66} ${PAGE_HEIGHT - 66} re S`);

  text("IMBEGNAL", "bold", 20, 502, ACCENT);
  centered("CERTIFICATE OF COMPLETION", "bold", 34, 24, 450, INK);
  text("This is to certify that", "italic", 16, 398, MUTED);
  const name = fit(c.recipient, "bold", 40, 20, 640);
  text(name.text, "bold", name.size, 340, INK);
  const rule = Math.max(220, Math.min(640, textWidth(name.text, "bold", name.size) + 40));
  ops.push(`${ACCENT} RG 1 w ${((PAGE_WIDTH - rule) / 2).toFixed(2)} 326 m ${((PAGE_WIDTH + rule) / 2).toFixed(2)} 326 l S`);
  text("has successfully completed every lesson of the course", "italic", 16, 292, MUTED);
  centered(c.trackTitle, "bold", 28, 16, 248, ACCENT);
  text(`Completed on ${c.completedOn}`, "regular", 14, 200, INK);

  text(`Certificate code: ${c.code}`, "bold", 11, 78, INK, 60);
  const verify = fit(`Verify at ${c.verifyUrl}`, "regular", 10, 6, PAGE_WIDTH - 120);
  text(verify.text, "regular", verify.size, 60, MUTED, 60);
  return ops.join("\n");
}

/** Builds the certificate as a complete PDF file. `created` stamps /CreationDate. */
export function buildCertificatePdf(content: CertificateContent, created: Date): Uint8Array {
  const stream = pageContent(content);
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    ...(["regular", "bold", "italic"] as FontKey[]).map((k) => `<< /Type /Font /Subtype /Type1 /BaseFont /${FONT_BASE[k]} /Encoding /WinAnsiEncoding >>`),
    `<< /Title ${pdfString(`Certificate of Completion - ${content.trackTitle}`)} /Producer (IMBEGNAL) /CreationDate (${pdfDate(created)}) >>`,
  ];

  // Header + a binary comment so transfer tools treat the file as binary.
  let out = "%PDF-1.4\n%âãÏÓ\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefAt = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) out += `${String(off).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}
