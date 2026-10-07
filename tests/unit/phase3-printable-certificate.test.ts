import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRINT_PARAM,
  certificateCodeFromInfo,
  certificateCourseTitle,
  certificateVerifyUrl,
  langDir,
  printableCertificateHref,
  wantsPrintView,
} from "../../lib/certificates/printable";
import { formatIssueDate } from "../../lib/certificates/verify";
import { translations, type Tx } from "../../lib/i18n";
import { roadmaps } from "../../data/roadmaps";

const CODE = "IMB-ABCD-EFGH-2345";
const canonical = Object.fromEntries(roadmaps.map((r) => [r.id, r.title]));
const en = translations.en as Tx;
const ar = translations.ar as unknown as Tx;

test("printableCertificateHref opens the verification page in the printable view", () => {
  assert.equal(printableCertificateHref(CODE), `/certificate/?code=${CODE}&print=1`);
  const url = new URL(printableCertificateHref(CODE), "https://example.test");
  assert.equal(url.searchParams.get("code"), CODE);
  assert.ok(wantsPrintView(url.searchParams.get(PRINT_PARAM)));
});

test("wantsPrintView accepts the obvious spellings only", () => {
  for (const v of ["1", "true", ""]) assert.equal(wantsPrintView(v), true, JSON.stringify(v));
  for (const v of [null, undefined, "0", "false", "yes please"]) assert.equal(wantsPrintView(v), false, JSON.stringify(v));
});

test("certificateVerifyUrl uses the page origin, falls back for a missing or odd one", () => {
  assert.equal(certificateVerifyUrl("https://imbegnal.com", CODE, "https://fallback.test"), `https://imbegnal.com/certificate/?code=${CODE}`);
  assert.equal(certificateVerifyUrl("http://127.0.0.1:4173/", CODE, "https://fallback.test"), `http://127.0.0.1:4173/certificate/?code=${CODE}`);
  assert.equal(certificateVerifyUrl("", CODE, "https://fallback.test/"), `https://fallback.test/certificate/?code=${CODE}`);
  // file:// and the opaque "null" origin are not addresses anyone can visit
  assert.equal(certificateVerifyUrl("null", CODE, "https://fallback.test"), `https://fallback.test/certificate/?code=${CODE}`);
  assert.equal(certificateVerifyUrl("file://", CODE, "https://fallback.test"), `https://fallback.test/certificate/?code=${CODE}`);
});

test("certificateCourseTitle prefers the localized roadmap title, then the canonical one, then the id", () => {
  const frontend = roadmaps.find((r) => r.id === "frontend")!;
  assert.equal(certificateCourseTitle(en, "frontend", canonical), en.tracks["frontend"]?.title ?? frontend.title);
  assert.equal(certificateCourseTitle(ar, "frontend", canonical), translations.ar.tracks["frontend"].title);
  assert.notEqual(certificateCourseTitle(ar, "frontend", canonical), frontend.title, "Arabic title, not the English one");
  assert.equal(certificateCourseTitle(en, "retired-track", { "retired-track": "Retired Track" }), "Retired Track");
  assert.equal(certificateCourseTitle(en, "retired-track", {}), "retired-track");
  assert.equal(certificateCourseTitle(en, undefined, canonical), "");
});

test("langDir", () => {
  assert.equal(langDir("ar"), "rtl");
  assert.equal(langDir("en"), "ltr");
});

test("certificateCodeFromInfo reads a canonical code from the JSON certificate, nothing else", () => {
  const info = { code: "imb-abcd-efgh-2345", track: "frontend", recipient: "ليلى حسن", issuedAt: "2026-06-15T23:30:00.000Z", verifyUrl: "x" };
  assert.equal(certificateCodeFromInfo(info), CODE);
  assert.equal(certificateCodeFromInfo({ code: "IMB-0000-0000-0000" }), null);
  assert.equal(certificateCodeFromInfo({ code: 42 }), null);
  assert.equal(certificateCodeFromInfo({}), null);
  assert.equal(certificateCodeFromInfo(null), null);
  assert.equal(certificateCodeFromInfo("%PDF-1.4"), null);
});

test("the printed date follows the certificate language, in UTC, with Latin digits", () => {
  // 23:30 UTC on the 15th is already the 16th east of UTC: the certificate must not move with the reader.
  assert.equal(formatIssueDate("2026-06-15T23:30:00.000Z", "en"), "June 15, 2026");
  const arDate = formatIssueDate("2026-06-15T23:30:00.000Z", "ar");
  assert.match(arDate, /15/);
  assert.match(arDate, /يونيو/);
  assert.match(arDate, /2026/);
  assert.doesNotMatch(arDate, /[٠-٩]/);
});

test("every new certificate string has an Arabic translation", () => {
  for (const group of ["printable", "sheet"] as const) {
    const keys = Object.keys(translations.en.certVerify[group]);
    assert.deepEqual(Object.keys(translations.ar.certVerify[group]).sort(), [...keys].sort(), group);
    for (const k of keys) {
      const v = (translations.ar.certVerify[group] as Record<string, string>)[k];
      assert.ok(v.trim() !== "" && v !== (translations.en.certVerify[group] as Record<string, string>)[k], `${group}.${k} is translated`);
    }
  }
  assert.equal(translations.en.certVerify.sheet.title, "Certificate of completion");
  assert.equal(translations.ar.certVerify.sheet.title, "شهادة إتمام");
});
