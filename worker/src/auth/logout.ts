// POST /api/auth/logout: server-side revocation. Increments users.token_version, so every token
// issued for the account so far (this device and any other) fails auth/guard.ts from now on.
// Needs a valid, current token; allowed while suspended (signing out must always work).
// 200 {ok:true}; 401 unauthorized when the token is missing, invalid, expired or already revoked.
import { audit } from "../audit";
import { type Env, NO_STORE, json } from "../util";
import { guardFailureResponse, requireAuth } from "./guard";

export async function handleLogout(req: Request, env: Env, origin: string): Promise<Response> {
  const auth = await requireAuth(req, env, origin, { allowSuspended: true });
  if (!auth.ok) return auth.response;
  const { sub, tokenVersion } = auth.user;
  // Conditional on the version this token carries: of two concurrent logouts with one token, one bumps
  // the version and the other finds its token already revoked (401), so the version moves by one.
  const res = await env.DB.prepare("UPDATE users SET token_version = token_version + 1 WHERE github_id = ? AND token_version = ?")
    .bind(sub, tokenVersion)
    .run();
  if (res.meta.changes === 0) return guardFailureResponse({ reason: "unauthorized" }, origin);
  await audit(env, { userId: sub, action: "auth.logout", detail: `token version ${tokenVersion} -> ${tokenVersion + 1}` });
  return json({ ok: true }, 200, origin, NO_STORE);
}
