import { test } from "node:test";
import assert from "node:assert/strict";
import {
  certificateHref,
  formatIssueDate,
  interpretVerifyResponse,
  normalizeCertificateCode,
  parseCertificateInput,
  verifyCertificate,
} from "../../lib/certificates/verify";
import { translations } from "../../lib/i18n";

const CODE = "IMB-ABCD-EFGH-2345";

test("normalizeCertificateCode mirrors the Worker rule", () => {
  assert.equal(normalizeCertificateCode(CODE), CODE);
  assert.equal(normalizeCertificateCode("  imb-abcd-efgh-2345\n"), CODE);
  // I, O, 0 and 1 are not in the alphabet; wrong group sizes and prefixes fail
  assert.equal(normalizeCertificateCode("IMB-ABCD-EFGH-2340"), null);
  assert.equal(normalizeCertificateCode("IMB-ABCI-EFGH-2345"), null);
  assert.equal(normalizeCertificateCode("IMB-ABC-EFGH-2345"), null);
  assert.equal(normalizeCertificateCode("XYZ-ABCD-EFGH-2345"), null);
  assert.equal(normalizeCertificateCode(""), null);
});

test("parseCertificateInput accepts spaces, typographic dashes and dashless codes", () => {
  assert.equal(parseCertificateInput(CODE), CODE);
  assert.equal(parseCertificateInput("imb abcd efgh 2345"), CODE);
  assert.equal(parseCertificateInput("IMB–ABCD—EFGH−2345"), CODE);
  assert.equal(parseCertificateInput("imbabcdefgh2345"), CODE);
  assert.equal(parseCertificateInput("IMB-ABCDEFGH-2345"), CODE);
  assert.equal(parseCertificateInput("IMB-ABCD-EFGH-234"), null);
  assert.equal(parseCertificateInput("hello"), null);
  assert.equal(parseCertificateInput("IMB-ABCD-EFGH-2345-EXTRA"), null);
});

test("interpretVerifyResponse maps the Worker answers", () => {
  const ok = interpretVerifyResponse(200, { valid: true, code: CODE, track: "frontend", recipient: " Layla Hassan ", issuedAt: "2026-06-15T10:00:00.000Z" }, CODE);
  assert.deepEqual(ok, { kind: "valid", certificate: { code: CODE, track: "frontend", recipient: "Layla Hassan", issuedAt: "2026-06-15T10:00:00.000Z" } });
  assert.deepEqual(interpretVerifyResponse(200, { valid: false }, CODE), { kind: "invalid" });
});

test("interpretVerifyResponse never calls an outage or a junk body 'invalid'", () => {
  for (const status of [0, 400, 404, 429, 500, 502, 503]) assert.deepEqual(interpretVerifyResponse(status, { valid: false }, CODE), { kind: "unavailable" }, String(status));
  assert.deepEqual(interpretVerifyResponse(200, null, CODE), { kind: "unavailable" });
  assert.deepEqual(interpretVerifyResponse(200, "ok", CODE), { kind: "unavailable" });
  assert.deepEqual(interpretVerifyResponse(200, {}, CODE), { kind: "unavailable" });
  assert.deepEqual(interpretVerifyResponse(200, { valid: "yes" }, CODE), { kind: "unavailable" });
});

test("interpretVerifyResponse tolerates a sparse valid answer and drops bad dates", () => {
  const sparse = interpretVerifyResponse(200, { valid: true, issuedAt: "not a date", recipient: "   " }, CODE);
  assert.deepEqual(sparse, { kind: "valid", certificate: { code: CODE, track: undefined, recipient: undefined, issuedAt: undefined } });
});

test("verifyCertificate calls the public endpoint without credentials and classifies failures", async () => {
  const calls: { url: string; headers: unknown }[] = [];
  const reply = (status: number, body: unknown): typeof fetch =>
    (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), headers: init?.headers });
      return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
    }) as typeof fetch;

  assert.deepEqual(await verifyCertificate(CODE, undefined, reply(200, { valid: false })), { kind: "invalid" });
  assert.match(calls[0].url, /\/api\/certificates\/verify\/IMB-ABCD-EFGH-2345$/);
  assert.equal(calls[0].headers, undefined, "no Authorization header on the public endpoint");
  assert.deepEqual(await verifyCertificate(CODE, undefined, reply(503, { error: "x" })), { kind: "unavailable" });
  assert.deepEqual(await verifyCertificate(CODE, undefined, reply(200, "<html>")), { kind: "unavailable" });
  const offline = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;
  assert.deepEqual(await verifyCertificate(CODE, undefined, offline), { kind: "unavailable" });
  const aborted = (async () => {
    throw new DOMException("aborted", "AbortError");
  }) as typeof fetch;
  await assert.rejects(() => verifyCertificate(CODE, undefined, aborted), { name: "AbortError" });
});

test("formatIssueDate is UTC-stable and uses Latin digits in Arabic", () => {
  assert.equal(formatIssueDate("2026-06-15T23:30:00.000Z", "en"), "June 15, 2026");
  const ar = formatIssueDate("2026-06-15T23:30:00.000Z", "ar");
  assert.match(ar, /15/);
  assert.match(ar, /2026/);
  assert.match(ar, /[؀-ۿ]/);
  assert.doesNotMatch(ar, /[٠-٩]/);
  assert.equal(formatIssueDate("garbage", "en"), "");
});

test("certificateHref", () => {
  assert.equal(certificateHref(), "/certificate/");
  assert.equal(certificateHref(CODE), "/certificate/?code=IMB-ABCD-EFGH-2345");
});

test("certVerify and instructor dictionaries are complete in both languages", () => {
  const keys = (o: unknown, prefix = ""): string[] =>
    o && typeof o === "object" ? Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [prefix + k] : keys(v, `${prefix}${k}.`))) : [];
  for (const section of ["certVerify", "instructor"] as const) {
    const en = keys(translations.en[section]);
    const ar = keys(translations.ar[section]);
    for (const k of en.filter((k) => !/\.(zero|two|few|many)$/.test(k))) assert.ok(ar.includes(k), `ar.${section}.${k} missing`);
  }
  // Arabic carries no leftover English sentences (letters only allowed in codes, product names and units)
  const strip = (s: string) => s.replace(/IMBEGNAL|IMB-XXXX-XXXX-XXXX|GitHub|\{\w+\}/g, "");
  for (const section of ["certVerify", "instructor"] as const) {
    for (const k of keys(translations.ar[section])) {
      const value = k.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], translations.ar[section]) as string;
      assert.doesNotMatch(strip(value), /[A-Za-z]{3,}/, `ar.${section}.${k}: ${value}`);
    }
  }
});
