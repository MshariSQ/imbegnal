// GET /api/certificates/:track          the learner's completion certificate (PDF; ?format=json for the data)
// GET /api/certificates/verify/:code    public verification of a certificate code
import type { CertificateVerifyResponse } from "../../../shared/api";
import type { CertificateIneligibleBody, CertificateInfo } from "../../../shared/challenges";
import { apiError, parseSqlTime, requireLiveUser, toIso } from "../challenges/http";
import type { ChallengeDeps } from "../challenges/types";
import { type Env, corsHeaders, isValidId, json } from "../util";
import { certificateCode, normalizeCertificateCode } from "./code";
import { buildCertificatePdf, formatCertificateDate, pdfSafeName } from "./pdf";

interface CertRow {
  code: string;
  recipient: string;
  issued_at: string | null;
}

/** How many of `lessons` ("track/lesson" keys of the synced study state) are marked done. */
function countDone(stateJson: string | null, track: string, lessons: string[]): number {
  if (!stateJson) return 0;
  let state: unknown;
  try {
    state = JSON.parse(stateJson);
  } catch {
    return 0;
  }
  const records = (state as { lessons?: Record<string, { done?: unknown } | undefined> } | null)?.lessons;
  if (!records || typeof records !== "object") return 0;
  let done = 0;
  for (const lesson of lessons) {
    const d = records[`${track}/${lesson}`]?.done;
    if ((typeof d === "number" && d > 0) || d === true) done++;
  }
  return done;
}

function verifyUrl(env: Env, code: string): string {
  return `${env.FRONTEND_URL.replace(/\/+$/, "")}/certificate/?code=${code}`;
}

export async function handleCertificate(req: Request, env: Env, origin: string, track: string, deps: ChallengeDeps): Promise<Response> {
  const auth = await requireLiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  const course = isValidId(track) ? deps.catalog.tracks.find((t) => t.id === track && t.lessons.length > 0) : undefined;
  if (!course) return apiError(origin, 404, "not_found");
  const userId = auth.user.sub;

  const user = await env.DB.prepare("SELECT name, username FROM users WHERE github_id = ?").bind(userId).first<{ name: string | null; username: string | null }>();
  let cert = await env.DB.prepare("SELECT code, recipient, issued_at FROM certificates WHERE user_id = ? AND track = ?").bind(userId, track).first<CertRow>();

  if (!cert) {
    // An issued certificate is never revoked by later state changes; a new one needs every lesson done.
    const state = await env.DB.prepare("SELECT data FROM user_state WHERE github_id = ?").bind(userId).first<{ data: string }>();
    const done = countDone(state?.data ?? null, track, course.lessons);
    if (done < course.lessons.length) {
      const body: CertificateIneligibleBody = {
        error: "not_eligible",
        message: "Finish every lesson of this course to earn the certificate.",
        total: course.lessons.length,
        done,
        remaining: course.lessons.length - done,
      };
      return json(body, 403, origin, { "Cache-Control": "no-store" });
    }
    const code = await certificateCode(env.JWT_SECRET, userId, track);
    const recipient = (user?.name?.trim() || user?.username || "Learner").slice(0, 100);
    // OR IGNORE + re-read: two concurrent first requests converge on one row.
    await env.DB.prepare("INSERT OR IGNORE INTO certificates (code, user_id, track, recipient, issued_at) VALUES (?, ?, ?, ?, datetime(?, 'unixepoch'))")
      .bind(code, userId, track, recipient, Math.floor(deps.now() / 1000))
      .run();
    cert = await env.DB.prepare("SELECT code, recipient, issued_at FROM certificates WHERE user_id = ? AND track = ?").bind(userId, track).first<CertRow>();
    if (!cert) return apiError(origin, 500, "internal_error");
  }

  const issuedMs = cert.issued_at ? parseSqlTime(cert.issued_at) : NaN;
  const issued = new Date(Number.isNaN(issuedMs) ? deps.now() : issuedMs);
  const url = verifyUrl(env, cert.code);

  if (new URL(req.url).searchParams.get("format") === "json") {
    const info: CertificateInfo = { code: cert.code, track, recipient: cert.recipient, issuedAt: issued.toISOString(), verifyUrl: url };
    return json(info, 200, origin, { "Cache-Control": "no-store" });
  }

  const pdf = buildCertificatePdf(
    {
      recipient: pdfSafeName(cert.recipient, user?.username),
      trackTitle: course.title,
      completedOn: formatCertificateDate(issued),
      code: cert.code,
      verifyUrl: url,
    },
    issued,
  );
  return new Response(pdf, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="imbegnal-${track}-certificate.pdf"`,
      "Access-Control-Expose-Headers": "Content-Disposition, X-Certificate-Code",
      "X-Certificate-Code": cert.code,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function handleCertificateVerify(env: Env, origin: string, rawCode: string): Promise<Response> {
  const code = normalizeCertificateCode(rawCode);
  const headers = { "Cache-Control": "public, max-age=60" };
  if (!code) return json({ valid: false } satisfies CertificateVerifyResponse, 200, origin, headers);
  const row = await env.DB.prepare("SELECT code, track, recipient, issued_at FROM certificates WHERE code = ?").bind(code).first<CertRow & { track: string }>();
  if (!row) return json({ valid: false } satisfies CertificateVerifyResponse, 200, origin, headers);
  const body: CertificateVerifyResponse = { valid: true, code: row.code, track: row.track, recipient: row.recipient };
  const issuedAt = toIso(row.issued_at);
  if (issuedAt) body.issuedAt = issuedAt;
  return json(body, 200, origin, headers);
}
