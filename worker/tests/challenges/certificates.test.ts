// Certificates: eligibility from the synced study state, idempotent issue, verification,
// code properties, and the structure of the generated PDF (checked by an independent parser).
import { test } from "node:test";
import assert from "node:assert/strict";
import type { CertificateVerifyResponse } from "../../../shared/api";
import type { CertificateIneligibleBody, CertificateInfo } from "../../../shared/challenges";
import { CERTIFICATE_CODE_RE, certificateCode } from "../../src/certificates/code";
import { buildCertificatePdf, isWinAnsiRepresentable, pdfSafeName, pdfString } from "../../src/certificates/pdf";
import { makeWorld, T0, type World } from "./helpers/world";

// ── An independent PDF structure checker (does not share code with the writer) ──

interface ParsedPdf {
  objects: Map<number, string>;
  trailer: string;
  /** Strings drawn with Tj, unescaped. */
  texts: string[];
  stream: string;
}

function parsePdf(bytes: Uint8Array): ParsedPdf {
  const raw = Buffer.from(bytes).toString("latin1");
  assert.ok(raw.startsWith("%PDF-1."), "header");
  assert.ok(raw.endsWith("%%EOF\n"), "ends with %%EOF");
  const m = /startxref\n(\d+)\n%%EOF\n$/.exec(raw);
  assert.ok(m, "startxref");
  const xrefAt = Number(m[1]);
  assert.ok(raw.startsWith("xref\n", xrefAt), "startxref points at the xref table");
  const lines = raw.slice(xrefAt).split("\n");
  const [first, count] = lines[1].split(" ").map(Number);
  assert.equal(first, 0);
  assert.equal(lines[2], "0000000000 65535 f ", "free-list head entry");
  const objects = new Map<number, string>();
  for (let i = 1; i < count; i++) {
    const entry = lines[2 + i];
    assert.match(entry, /^\d{10} 00000 n $/, `xref entry ${i} is exactly 20 bytes with its newline`);
    const off = Number(entry.slice(0, 10));
    assert.ok(raw.startsWith(`${i} 0 obj\n`, off), `object ${i} is at its xref offset`);
    const end = raw.indexOf("\nendobj\n", off);
    assert.ok(end > off, `object ${i} is terminated`);
    objects.set(i, raw.slice(off + `${i} 0 obj\n`.length, end));
  }
  const trailerAt = raw.indexOf("trailer\n", xrefAt);
  const trailer = raw.slice(trailerAt, raw.indexOf("startxref", trailerAt));
  assert.match(trailer, new RegExp(`/Size ${count}\\b`));
  assert.match(trailer, /\/Root 1 0 R/);

  // Stream length must be exact.
  const contents = objects.get(4) ?? "";
  const len = Number(/\/Length (\d+)/.exec(contents)?.[1]);
  const body = contents.slice(contents.indexOf("stream\n") + 7, contents.lastIndexOf("\nendstream"));
  assert.equal(body.length, len, "/Length matches the stream");

  const texts: string[] = [];
  const re = /\(((?:\\.|[^\\)])*)\) Tj/g;
  for (let t = re.exec(body); t; t = re.exec(body)) {
    texts.push(t[1].replace(/\\([0-7]{3})/g, (_, o: string) => String.fromCharCode(parseInt(o, 8))).replace(/\\(.)/g, "$1"));
  }
  return { objects, trailer, texts, stream: body };
}

function assertValidCertificatePdf(bytes: Uint8Array): ParsedPdf {
  const pdf = parsePdf(bytes);
  assert.match(pdf.objects.get(1) ?? "", /\/Type \/Catalog \/Pages 2 0 R/);
  assert.match(pdf.objects.get(2) ?? "", /\/Count 1\b/);
  assert.match(pdf.objects.get(3) ?? "", /\/MediaBox \[0 0 842 595\]/, "A4 landscape");
  for (const n of [5, 6, 7]) assert.match(pdf.objects.get(n) ?? "", /\/Subtype \/Type1 \/BaseFont \/Helvetica/);
  // Only printable ASCII in the body (the header's binary comment is the single exception).
  const raw = Buffer.from(bytes).toString("latin1");
  const afterHeader = raw.slice(raw.indexOf("\n", raw.indexOf("\n") + 1));
  assert.ok(!/[^\x09\x0a\x0d\x20-\x7e]/.test(afterHeader), "no binary or control bytes outside the header comment");
  return pdf;
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const stateWith = (done: string[], extra: Record<string, unknown> = {}) =>
  JSON.stringify({ v: 1, lessons: { ...Object.fromEntries(done.map((k, i) => [k, { visited: T0 - 1000, done: T0 + i }])), ...extra }, notes: {}, days: [] });
const CYBER = ["cyber-security/setup", "cyber-security/networking", "cyber-security/linux"];

async function learner(w: World, sub: string, opts: { name?: string | null; username?: string; state?: string | null } = {}) {
  await w.addUser({ sub, username: opts.username ?? `user-${sub}`, name: opts.name });
  if (opts.state !== null) w.db.insert("INSERT INTO user_state (github_id, data) VALUES (?, ?)", sub, opts.state ?? stateWith(CYBER));
  return w.token(sub);
}
const cert = (w: World, track: string, token: string | null, qs = "") => w.call(`/api/certificates/${track}${qs}`, { token });

// ── Tests ─────────────────────────────────────────────────────────────────────

test("auth and track validation: 401 anonymous, 404 unknown / lesson-less / malformed track ids", async () => {
  const w = await makeWorld();
  const t = await learner(w, "u1");
  assert.equal((await cert(w, "cyber-security", null)).status, 401);
  assert.equal((await cert(w, "cyber-security", await w.token("ghost"))).status, 401);
  for (const id of ["nope", "empty-track", "data-structures-algorithms", "UPPER", "a".repeat(80)]) assert.equal((await cert(w, id, t)).status, 404, id);
  assert.equal((await w.call("/api/certificates/cyber-security", { method: "POST", token: t })).status, 405);
});

test("ineligible: 403 with the number of lessons remaining, and nothing is issued", async () => {
  const w = await makeWorld();
  const t = await learner(w, "u1", { state: stateWith(CYBER.slice(0, 2)) });
  const r = await w.api<CertificateIneligibleBody>("/api/certificates/cyber-security", { token: t });
  assert.equal(r.status, 403);
  assert.deepEqual({ error: r.body.error, total: r.body.total, done: r.body.done, remaining: r.body.remaining }, { error: "not_eligible", total: 3, done: 2, remaining: 1 });
  assert.equal(w.db.rows("SELECT * FROM certificates").length, 0);

  const none = await learner(w, "u2", { state: null });
  assert.equal((await w.api<CertificateIneligibleBody>("/api/certificates/cyber-security", { token: none })).body.remaining, 3, "no synced state at all");
});

test("only real completions count: visited-only, done:0, other tracks, unknown lessons and corrupt state do not", async () => {
  const w = await makeWorld();
  const mixed = stateWith(["cyber-security/setup", "frontend/html-css", "frontend/javascript", "cyber-security/not-a-lesson"], {
    "cyber-security/networking": { visited: T0 },
    "cyber-security/linux": { done: 0 },
  });
  const t = await learner(w, "u1", { state: mixed });
  const r = await w.api<CertificateIneligibleBody>("/api/certificates/cyber-security", { token: t });
  assert.equal(r.status, 403);
  assert.equal(r.body.done, 1);
  const bad = await learner(w, "u2", { state: "{not json" });
  assert.equal((await w.api<CertificateIneligibleBody>("/api/certificates/cyber-security", { token: bad })).body.done, 0);
  const odd = await learner(w, "u3", { state: JSON.stringify({ lessons: "nope" }) });
  assert.equal((await cert(w, "cyber-security", odd)).status, 403);
  const nullState = await learner(w, "u4", { state: "null" });
  assert.equal((await cert(w, "cyber-security", nullState)).status, 403);
});

test("eligible: a valid single-page landscape A4 PDF with the certificate details", async () => {
  const w = await makeWorld();
  const t = await learner(w, "u1", { name: "Ada Lovelace" });
  const res = await cert(w, "cyber-security", t);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "application/pdf");
  assert.match(res.headers.get("Content-Disposition") ?? "", /^attachment; filename="imbegnal-cyber-security-certificate\.pdf"$/);
  assert.equal(res.headers.get("X-Content-Type-Options"), "nosniff");
  const code = res.headers.get("X-Certificate-Code") ?? "";
  assert.match(code, CERTIFICATE_CODE_RE);
  const pdf = assertValidCertificatePdf(new Uint8Array(await res.arrayBuffer()));
  assert.ok(pdf.texts.includes("Ada Lovelace"));
  assert.ok(pdf.texts.includes("Cyber Security"));
  assert.ok(pdf.texts.includes("Completed on 1 June 2026"));
  assert.ok(pdf.texts.includes(`Certificate code: ${code}`));
  assert.ok(pdf.texts.includes(`Verify at https://imbegnal.com/certificate/?code=${code}`), "verification URL built from FRONTEND_URL");
  assert.match(pdf.objects.get(8) ?? "", /Certificate of Completion - Cyber Security/);
  const row = w.db.one<{ code: string; user_id: string; track: string; recipient: string }>("SELECT * FROM certificates");
  assert.deepEqual({ ...row, issued_at: undefined }, { code, user_id: "u1", track: "cyber-security", recipient: "Ada Lovelace", issued_at: undefined });
});

test("idempotent: the same code and issue date come back, one row, and an issued certificate is never revoked", async () => {
  const w = await makeWorld();
  const t = await learner(w, "u1", { name: "Ada" });
  const a = await w.api<CertificateInfo>("/api/certificates/cyber-security?format=json", { token: t });
  w.clock.now += 30 * 86_400_000;
  w.db.insert("UPDATE user_state SET data = ? WHERE github_id = 'u1'", stateWith([])); // learner "un-completes" everything
  const b = await w.api<CertificateInfo>("/api/certificates/cyber-security?format=json", { token: t });
  assert.equal(a.status, 200);
  assert.deepEqual(b.body, a.body);
  assert.equal(a.body.issuedAt, new Date(T0).toISOString());
  assert.equal(a.body.verifyUrl, `https://imbegnal.com/certificate/?code=${a.body.code}`);
  assert.equal(w.db.rows("SELECT * FROM certificates").length, 1);
  const pdf = parsePdf(new Uint8Array(await (await cert(w, "cyber-security", t)).arrayBuffer()));
  assert.ok(pdf.texts.includes("Completed on 1 June 2026"), "the date is the issue date, not today");
});

test("concurrent first requests converge on one certificate", async () => {
  const w = await makeWorld();
  const t = await learner(w, "u1", { name: "Ada" });
  const res = await Promise.all([1, 2, 3, 4].map(() => w.api<CertificateInfo>("/api/certificates/cyber-security?format=json", { token: t })));
  assert.equal(new Set(res.map((r) => r.body.code)).size, 1);
  assert.equal(w.db.rows("SELECT * FROM certificates").length, 1);
});

test("a different track needs its own completion; each user has their own code", async () => {
  const w = await makeWorld();
  const a = await learner(w, "u1", { name: "Ada", state: stateWith([...CYBER, "frontend/html-css", "frontend/javascript"]) });
  const b = await learner(w, "u2", { name: "Bob" });
  const ca = await w.api<CertificateInfo>("/api/certificates/cyber-security?format=json", { token: a });
  const fa = await w.api<CertificateInfo>("/api/certificates/frontend?format=json", { token: a });
  const cb = await w.api<CertificateInfo>("/api/certificates/cyber-security?format=json", { token: b });
  assert.equal((await cert(w, "frontend", b)).status, 403);
  assert.equal(new Set([ca.body.code, fa.body.code, cb.body.code]).size, 3);
});

test("certificate codes: format, determinism, secret-dependence, no collisions between inputs", async () => {
  const c = await certificateCode("secret-a", "u1", "cyber-security");
  assert.match(c, CERTIFICATE_CODE_RE);
  assert.equal(await certificateCode("secret-a", "u1", "cyber-security"), c);
  assert.notEqual(await certificateCode("secret-b", "u1", "cyber-security"), c, "unguessable without the secret");
  assert.notEqual(await certificateCode("secret-a", "u2", "cyber-security"), c);
  assert.notEqual(await certificateCode("secret-a", "u1", "frontend"), c);
  assert.notEqual(await certificateCode("secret-a", "a|b", "c"), await certificateCode("secret-a", "a", "b|c"), "no delimiter ambiguity");
  const many = new Set<string>();
  for (let i = 0; i < 500; i++) many.add(await certificateCode("secret-a", `user-${i}`, "cyber-security"));
  assert.equal(many.size, 500);
  for (const code of many) assert.match(code, CERTIFICATE_CODE_RE);
  // codes carry no readable user information
  assert.ok(!c.toLowerCase().includes("u1"));
});

test("verify: valid code returns the public facts only; unknown, malformed and wrong-case input behave", async () => {
  const w = await makeWorld();
  const t = await learner(w, "u1", { name: "Ada Lovelace", username: "ada" });
  const info = await w.api<CertificateInfo>("/api/certificates/cyber-security?format=json", { token: t });
  const ok = await w.api<CertificateVerifyResponse>(`/api/certificates/verify/${info.body.code}`);
  assert.equal(ok.status, 200);
  assert.deepEqual(ok.body, { valid: true, code: info.body.code, track: "cyber-security", recipient: "Ada Lovelace", issuedAt: new Date(T0).toISOString() });
  assert.ok(!JSON.stringify(ok.body).includes("u1") && !JSON.stringify(ok.body).includes("@"), "no user id or email");
  const lower = await w.api<CertificateVerifyResponse>(`/api/certificates/verify/${info.body.code.toLowerCase()}`);
  assert.equal(lower.body.valid, true);
  for (const bad of ["IMB-AAAA-AAAA-AAAA", "garbage", "IMB-0000-1111-IIII", "%27%20OR%201%3D1", "a".repeat(200)]) {
    const r = await w.api<CertificateVerifyResponse>(`/api/certificates/verify/${bad}`);
    assert.equal(r.status, 200, bad);
    assert.deepEqual(r.body, { valid: false });
  }
  assert.equal((await w.api("/api/certificates/verify/IMB-AAAA-AAAA-AAAA", { method: "POST", body: {} })).status, 405);
});

test("non-Latin names: the PDF stays valid and prints the username; the data endpoints keep the real name", async () => {
  const w = await makeWorld();
  const t = await learner(w, "u1", { name: "أحمد محمد", username: "ahmed_m" });
  const res = await cert(w, "cyber-security", t);
  assert.equal(res.status, 200);
  const pdf = assertValidCertificatePdf(new Uint8Array(await res.arrayBuffer()));
  assert.ok(pdf.texts.includes("ahmed_m"));
  assert.ok(!pdf.texts.some((s) => !s.startsWith("Verify at") && s.includes("?")), "no placeholder question marks where Arabic glyphs were dropped");
  const info = await w.api<CertificateInfo>("/api/certificates/cyber-security?format=json", { token: t });
  assert.equal(info.body.recipient, "أحمد محمد");
  assert.equal((await w.api<CertificateVerifyResponse>(`/api/certificates/verify/${info.body.code}`)).body.recipient, "أحمد محمد");

  const both = await learner(w, "u2", { name: "محمد", username: "مستخدم" });
  const p2 = assertValidCertificatePdf(new Uint8Array(await (await cert(w, "cyber-security", both)).arrayBuffer()));
  assert.ok(p2.texts.includes("IMBEGNAL Learner"), "neutral label when neither name is drawable");
});

test("accented Latin names are drawn (WinAnsi); PDF string escaping handles ( ) \\ and control characters", async () => {
  assert.equal(pdfSafeName("José Ñandú", "x"), "José Ñandú");
  assert.equal(isWinAnsiRepresentable("Zoë – “quoted” €"), true);
  assert.equal(isWinAnsiRepresentable("日本"), false);
  assert.equal(pdfSafeName("  A\u0000B\n C  ", "x"), "A B C");
  assert.equal(pdfString("a(b)c\\d"), "(a\\(b\\)c\\\\d)");
  assert.equal(pdfString("é"), "(\\351)");
  assert.equal(pdfString("日"), "(?)");

  const w = await makeWorld();
  const t = await learner(w, "u1", { name: "O'Brien (Jr.) \\ Ünal" });
  const pdf = assertValidCertificatePdf(new Uint8Array(await (await cert(w, "cyber-security", t)).arrayBuffer()));
  assert.ok(pdf.texts.includes("O'Brien (Jr.) \\ Ünal"), "round-trips through the escaping");
});

test("very long names and titles are shrunk or trimmed to fit, and the PDF stays valid", () => {
  const long = "W".repeat(200);
  const bytes = buildCertificatePdf({ recipient: pdfSafeName(long, null), trackTitle: long, completedOn: "1 June 2026", code: "IMB-AAAA-BBBB-CCCC", verifyUrl: `https://imbegnal.com/certificate/?code=${"x".repeat(300)}` }, new Date(T0));
  const pdf = assertValidCertificatePdf(bytes);
  assert.ok(pdf.texts.every((s) => s.length <= 300));
  assert.ok(pdf.texts.some((s) => s.startsWith("WWWW")));
});

test("buildCertificatePdf is deterministic for the same input", () => {
  const c = { recipient: "Ada", trackTitle: "T", completedOn: "1 June 2026", code: "IMB-AAAA-BBBB-CCCC", verifyUrl: "https://x.test/?code=IMB-AAAA-BBBB-CCCC" };
  assert.deepEqual(buildCertificatePdf(c, new Date(T0)), buildCertificatePdf(c, new Date(T0)));
});
