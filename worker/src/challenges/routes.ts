// Router for: challenges, leaderboard, certificates, instructor analytics, admin audit.
// Returns null for paths it does not own so index.ts can fall through to its 404.
import { handleCertificate, handleCertificateVerify } from "../certificates/handlers";
import { handleAdminAudit, handleInstructorAnalytics } from "../instructor/analytics";
import { type Env, json } from "../util";
import { apiError } from "./http";
import { handleLeaderboard } from "./leaderboard";
import { handleHint, handleOpen } from "./progress";
import { handleChallengeList } from "./stats";
import { handleSubmit } from "./submit";
import type { ChallengeDeps } from "./types";

const CHALLENGE_ACTION = /^\/api\/challenges\/([^/]+)\/(open|hint|submit)$/;
const CERT_VERIFY = /^\/api\/certificates\/verify\/([^/]+)$/;
const CERT_TRACK = /^\/api\/certificates\/([^/]+)$/;

function notAllowed(origin: string, allow: string): Response {
  return json({ error: "method_not_allowed" }, 405, origin, { Allow: allow, "Cache-Control": "no-store" });
}

export async function routeChallengesApi(req: Request, env: Env, origin: string, deps: ChallengeDeps): Promise<Response | null> {
  const { pathname } = new URL(req.url);
  const method = req.method;

  try {
    if (pathname === "/api/challenges") return method === "GET" ? await handleChallengeList(req, env, origin, deps) : notAllowed(origin, "GET");

    const action = pathname.match(CHALLENGE_ACTION);
    if (action) {
      if (method !== "POST") return notAllowed(origin, "POST");
      const [, id, name] = action;
      if (name === "open") return await handleOpen(req, env, origin, id, deps);
      if (name === "hint") return await handleHint(req, env, origin, id, deps);
      return await handleSubmit(req, env, origin, id, deps);
    }

    if (pathname === "/api/leaderboard") return method === "GET" ? await handleLeaderboard(req, env, origin, deps) : notAllowed(origin, "GET");

    const verify = pathname.match(CERT_VERIFY);
    if (verify) return method === "GET" ? await handleCertificateVerify(env, origin, verify[1]) : notAllowed(origin, "GET");
    const cert = pathname.match(CERT_TRACK);
    if (cert) return method === "GET" ? await handleCertificate(req, env, origin, cert[1], deps) : notAllowed(origin, "GET");

    if (pathname === "/api/instructor/analytics") return method === "GET" ? await handleInstructorAnalytics(req, env, origin, deps) : notAllowed(origin, "GET");
    if (pathname === "/api/admin/audit") return method === "GET" ? await handleAdminAudit(req, env, origin, deps) : notAllowed(origin, "GET");
  } catch (e) {
    // Never echo internals; the name is enough to find the failure in the Worker logs.
    console.error("challenges api failed", pathname, e instanceof Error ? e.message : "error");
    return apiError(origin, 500, "internal_error");
  }
  return null;
}
