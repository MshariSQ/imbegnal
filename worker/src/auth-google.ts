// "Continue with Google" — OAuth 2.0 authorization-code flow.
// Enabled only when GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are configured.
// Mirrors the GitHub flow: CSRF state round-trips through an HttpOnly cookie.
import { type Env, getCookie, json, redirectWithToken, uniqueUsername } from "./util";

const STATE_COOKIE = "imb_google_state";

function redirectUri(env: Env) {
  return `${env.WORKER_URL}/api/auth/google/callback`;
}

export function handleGoogleStart(env: Env, origin: string): Response {
  if (!env.GOOGLE_CLIENT_ID) return json({ error: "google_disabled" }, 404, origin);
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(env),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      "Set-Cookie": `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600`,
      "Cache-Control": "no-store",
    },
  });
}

export async function handleGoogleCallback(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const clearState = `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0`;
  const fail = (reason: string) => {
    console.error(`google callback failed: ${reason}`);
    return new Response(null, {
      status: 302,
      headers: { Location: `${env.FRONTEND_URL}/auth/callback/?error=auth_failed`, "Set-Cookie": clearState, "Cache-Control": "no-store" },
    });
  };

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return fail("disabled");
  if (!code) return fail("missing code");
  if (!state || state !== getCookie(req, STATE_COOKIE)) return fail("state mismatch");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri(env),
        grant_type: "authorization_code",
      }),
    });
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) return fail("token exchange failed");

    const profile = (await (
      await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${access_token}` } })
    ).json()) as { sub?: string; name?: string; email?: string; email_verified?: boolean; picture?: string };
    if (!profile.sub) return fail("no profile");

    const sub = `google:${profile.sub}`;
    const existing = await env.DB.prepare("SELECT username FROM users WHERE github_id = ?").bind(sub).first<{ username: string }>();
    const name = profile.name || profile.email?.split("@")[0] || "Learner";
    const username = existing?.username ?? (await uniqueUsername(env, name));

    await env.DB.prepare(
      `INSERT INTO users (github_id, username, name, avatar_url, email, bio, provider, last_login)
       VALUES (?, ?, ?, ?, ?, '', 'google', CURRENT_TIMESTAMP)
       ON CONFLICT(github_id) DO UPDATE SET
         name = excluded.name, avatar_url = excluded.avatar_url,
         email = excluded.email, last_login = CURRENT_TIMESTAMP`
    ).bind(sub, username, name, profile.picture ?? "", profile.email_verified ? profile.email ?? "" : "").run();

    return redirectWithToken({ sub, username, name, avatar: profile.picture ?? "" }, env, { "Set-Cookie": clearState });
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
