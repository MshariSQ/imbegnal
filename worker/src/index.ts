// IMBEGNAL API — Cloudflare Worker + D1.
// Routes: auth (GitHub, Google, email), profile, roadmap progress, bookmarks,
// study-state sync and the AI tutor. Shared helpers live in util.ts.
import { type Env, NO_STORE, corsHeaders, getCookie, getUser, isValidId, json, readJson, redirectWithToken } from "./util";
import { handleLogin, handleRegister } from "./auth-email";
import { handleGoogleCallback, handleGoogleStart } from "./auth-google";
import { handleStateGet, handleStatePut } from "./state";
import { handleTutor } from "./ai";
import { handleAccountDelete, handleEvent } from "./account";
import { handleLab } from "./lab/handlers";
import { handleChallengesApi } from "./challenges";

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Best-effort per-isolate sliding window. Not global (each Worker isolate has
// its own memory) but free and good enough at this scale.
const RATE_GENERAL = { limit: 60, windowMs: 60_000 };
const RATE_AUTH = { limit: 10, windowMs: 60_000 };
const rateBuckets = new Map<string, number[]>();

function rateLimited(ip: string, isAuth: boolean): boolean {
  const { limit, windowMs } = isAuth ? RATE_AUTH : RATE_GENERAL;
  const now = Date.now();
  const key = `${isAuth ? "a" : "g"}:${ip}`;
  if (rateBuckets.size > 10_000) rateBuckets.clear(); // memory cap
  const hits = (rateBuckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) { rateBuckets.set(key, hits); return true; }
  hits.push(now);
  rateBuckets.set(key, hits);
  return false;
}

// ── GET /api/health ───────────────────────────────────────────────────────────
function handleHealth(): Response {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json", "X-Content-Type-Options": "nosniff" },
  });
}

// ── GET /api/stats ────────────────────────────────────────────────────────────
async function handleStats(env: Env, origin: string): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT COUNT(*) as total,
     COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) as today
     FROM users`
  ).first<{ total: number; today: number }>();
  return json({ total_users: row?.total ?? 0, new_today: row?.today ?? 0 }, 200, origin);
}

// ── GET /api/badge ────────────────────────────────────────────────────────────
async function handleBadge(env: Env): Promise<Response> {
  const row = await env.DB.prepare("SELECT COUNT(*) as total FROM users").first<{ total: number }>();
  const count = row?.total ?? 0;
  const value = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  const lw = 50, vw = value.length * 7 + 14, tw = lw + vw;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <rect rx="3" width="${tw}" height="20" fill="#555"/>
  <rect rx="3" x="${lw}" width="${vw}" height="20" fill="#10b981"/>
  <rect rx="3" width="${tw}" height="20" fill="url(#s)"/>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${lw / 2}" y="15" fill="#010101" fill-opacity=".3">users</text>
    <text x="${lw / 2}" y="14">users</text>
    <text x="${lw + vw / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${lw + vw / 2}" y="14">${value}</text>
  </g>
</svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache, max-age=0",
    },
  });
}

// ── GET /api/auth/github ──────────────────────────────────────────────────────
function handleAuthGitHub(env: Env): Response {
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.WORKER_URL}/api/auth/callback`,
    scope: "user:email read:user",
    state,
  });
  // The state round-trips through an HttpOnly cookie on the worker origin so
  // the callback can prove the flow started here (CSRF protection).
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      "Set-Cookie": `sf_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=600`,
      "Cache-Control": "no-store",
    },
  });
}

// ── GET /api/auth/callback ────────────────────────────────────────────────────
async function handleAuthCallback(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = getCookie(req, "sf_oauth_state");
  const clearState = `sf_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=0`;

  const fail = (reason: string) => {
    console.error(`auth callback failed: ${reason}`);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${env.FRONTEND_URL}/auth/callback/?error=auth_failed`,
        "Set-Cookie": clearState,
        "Cache-Control": "no-store",
      },
    });
  };

  if (!code) return fail("missing code");
  if (!state || !cookieState || state !== cookieState) return fail("state mismatch");

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${env.WORKER_URL}/api/auth/callback`,
      }),
    });
    const { access_token } = await tokenRes.json() as { access_token?: string };
    if (!access_token) return fail("token exchange failed");

    const ghUser = await (await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "IMBEGNAL" },
    })).json() as { id: number; login: string; name: string; avatar_url: string; email: string; bio: string };

    await env.DB.prepare(`
      INSERT INTO users (github_id, username, name, avatar_url, email, bio, last_login)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(github_id) DO UPDATE SET
        username = excluded.username, name = excluded.name,
        avatar_url = excluded.avatar_url, email = excluded.email,
        bio = excluded.bio, last_login = CURRENT_TIMESTAMP
    `).bind(String(ghUser.id), ghUser.login, ghUser.name || ghUser.login,
      ghUser.avatar_url, ghUser.email || "", ghUser.bio || "").run();

    return redirectWithToken(
      { sub: String(ghUser.id), username: ghUser.login, name: ghUser.name || ghUser.login, avatar: ghUser.avatar_url },
      env,
      { "Set-Cookie": clearState }
    );
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
async function handleMe(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const row = await env.DB.prepare("SELECT github_id, username, name, avatar_url, email, bio, provider, plan, created_at FROM users WHERE github_id = ?").bind(user.sub).first();
  return json(row, 200, origin, NO_STORE);
}

// ── GET /api/users/:username ──────────────────────────────────────────────────
async function handleProfile(username: string, env: Env, origin: string): Promise<Response> {
  if (!/^[A-Za-z0-9-]{1,39}$/.test(username)) return json({ error: "Invalid username" }, 400, origin);
  const row = await env.DB.prepare(
    "SELECT github_id, username, name, avatar_url, bio, created_at FROM users WHERE username = ?"
  ).bind(username).first() as Record<string, unknown> | null;
  if (!row) return json({ error: "User not found" }, 404, origin);

  const progressStats = await env.DB.prepare(`
    SELECT roadmap_id, COUNT(*) as completed
    FROM user_roadmap_progress WHERE github_id = ?
    GROUP BY roadmap_id
  `).bind(row.github_id).all();

  const bookmarkStats = await env.DB.prepare(`
    SELECT type, COUNT(*) as count
    FROM user_bookmarks WHERE github_id = ?
    GROUP BY type
  `).bind(row.github_id).all();

  const nodesCompleted = (progressStats.results as { completed: number }[])
    .reduce((sum, r) => sum + r.completed, 0);
  const roadmapsStarted = progressStats.results.length;
  const certCount = (bookmarkStats.results as { type: string; count: number }[])
    .find(r => r.type === "certification")?.count ?? 0;
  const courseCount = (bookmarkStats.results as { type: string; count: number }[])
    .find(r => r.type === "course")?.count ?? 0;

  return json({
    ...row,
    stats: {
      roadmaps_started: roadmapsStarted,
      nodes_completed: nodesCompleted,
      certs_bookmarked: certCount,
      courses_bookmarked: courseCount,
    },
    progress: progressStats.results,
  }, 200, origin);
}

// ── GET /api/progress?roadmap_id=xxx ─────────────────────────────────────────
async function handleProgressGet(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const roadmapId = new URL(req.url).searchParams.get("roadmap_id");
  if (!isValidId(roadmapId)) return json({ error: "invalid roadmap_id" }, 400, origin);
  const rows = await env.DB.prepare(
    "SELECT node_id FROM user_roadmap_progress WHERE github_id = ? AND roadmap_id = ?"
  ).bind(user.sub, roadmapId).all();
  return json({ completed: (rows.results as { node_id: string }[]).map(r => r.node_id) }, 200, origin, NO_STORE);
}

// ── POST /api/progress ────────────────────────────────────────────────────────
async function handleProgressPost(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const body = await readJson(req);
  if (!body || !isValidId(body.roadmap_id) || !isValidId(body.node_id)) {
    return json({ error: "invalid roadmap_id or node_id" }, 400, origin);
  }
  await env.DB.prepare(
    "INSERT OR IGNORE INTO user_roadmap_progress (github_id, roadmap_id, node_id) VALUES (?, ?, ?)"
  ).bind(user.sub, body.roadmap_id, body.node_id).run();
  return json({ ok: true }, 200, origin);
}

// ── DELETE /api/progress ──────────────────────────────────────────────────────
async function handleProgressDelete(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const body = await readJson(req);
  if (!body || !isValidId(body.roadmap_id) || !isValidId(body.node_id)) {
    return json({ error: "invalid roadmap_id or node_id" }, 400, origin);
  }
  await env.DB.prepare(
    "DELETE FROM user_roadmap_progress WHERE github_id = ? AND roadmap_id = ? AND node_id = ?"
  ).bind(user.sub, body.roadmap_id, body.node_id).run();
  return json({ ok: true }, 200, origin);
}

// ── GET /api/bookmarks ────────────────────────────────────────────────────────
async function handleBookmarksGet(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const rows = await env.DB.prepare(
    "SELECT type, item_id, created_at FROM user_bookmarks WHERE github_id = ? ORDER BY created_at DESC"
  ).bind(user.sub).all();
  return json({ bookmarks: rows.results }, 200, origin, NO_STORE);
}

// ── POST /api/bookmarks ───────────────────────────────────────────────────────
async function handleBookmarksPost(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const body = await readJson(req);
  if (!body || (body.type !== "certification" && body.type !== "course") || !isValidId(body.item_id)) {
    return json({ error: "invalid type or item_id" }, 400, origin);
  }
  await env.DB.prepare(
    "INSERT OR IGNORE INTO user_bookmarks (github_id, type, item_id) VALUES (?, ?, ?)"
  ).bind(user.sub, body.type, body.item_id).run();
  return json({ ok: true }, 200, origin);
}

// ── DELETE /api/bookmarks ─────────────────────────────────────────────────────
async function handleBookmarksDelete(req: Request, env: Env, origin: string): Promise<Response> {
  const user = await getUser(req, env);
  if (!user) return json({ error: "Unauthorized" }, 401, origin, NO_STORE);
  const body = await readJson(req);
  if (!body || (body.type !== "certification" && body.type !== "course") || !isValidId(body.item_id)) {
    return json({ error: "invalid type or item_id" }, 400, origin);
  }
  await env.DB.prepare(
    "DELETE FROM user_bookmarks WHERE github_id = ? AND type = ? AND item_id = ?"
  ).bind(user.sub, body.type, body.item_id).run();
  return json({ ok: true }, 200, origin);
}

// ── Router ────────────────────────────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(req.url);
    const origin = req.headers.get("Origin") ?? "";

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

    const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
    const isAuthPath = pathname.startsWith("/api/auth/");
    if (rateLimited(ip, isAuthPath)) {
      return json({ error: "Too many requests" }, 429, origin, { "Retry-After": "60" });
    }

    if (pathname === "/api/health") return handleHealth();
    if (pathname === "/api/stats") return handleStats(env, origin);
    if (pathname === "/api/badge") return handleBadge(env);
    if (pathname === "/api/auth/github") return handleAuthGitHub(env);
    if (pathname === "/api/auth/callback") return handleAuthCallback(req, env);
    if (pathname === "/api/auth/me") return handleMe(req, env, origin);
    if (pathname === "/api/auth/google") return handleGoogleStart(env, origin);
    if (pathname === "/api/auth/google/callback") return handleGoogleCallback(req, env);
    if (pathname === "/api/auth/register" && req.method === "POST") return handleRegister(req, env, origin);
    if (pathname === "/api/auth/login" && req.method === "POST") return handleLogin(req, env, origin);

    if (pathname === "/api/state") {
      if (req.method === "GET") return handleStateGet(req, env, origin);
      if (req.method === "PUT") return handleStatePut(req, env, origin);
    }

    if (pathname === "/api/ai/chat" && req.method === "POST") return handleTutor(req, env, origin, ctx);
    if (pathname === "/api/event" && req.method === "POST") return handleEvent(req, env, origin);
    if (pathname === "/api/account" && req.method === "DELETE") return handleAccountDelete(req, env, origin);

    if (pathname === "/api/progress") {
      if (req.method === "GET") return handleProgressGet(req, env, origin);
      if (req.method === "POST") return handleProgressPost(req, env, origin);
      if (req.method === "DELETE") return handleProgressDelete(req, env, origin);
    }

    if (pathname === "/api/bookmarks") {
      if (req.method === "GET") return handleBookmarksGet(req, env, origin);
      if (req.method === "POST") return handleBookmarksPost(req, env, origin);
      if (req.method === "DELETE") return handleBookmarksDelete(req, env, origin);
    }

    // ── Code Lab (run, quota, history, snippets, progress, languages) ──────────
    if (pathname.startsWith("/api/lab/")) return handleLab(req, env, origin, pathname);
    // ── end Code Lab ───────────────────────────────────────────────────────────
    // ── Challenges (CTF), leaderboard, certificates, instructor analytics, admin audit ──
    // /api/challenges[/:id/(open|hint|submit)], /api/leaderboard, /api/certificates/*,
    // /api/instructor/analytics, /api/admin/audit — see worker/src/challenges/routes.ts
    const challengesResponse = await handleChallengesApi(req, env, origin);
    if (challengesResponse) return challengesResponse;
    // ── end Challenges block ──

    const profileMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
    if (profileMatch) return handleProfile(profileMatch[1], env, origin);

    return json({ error: "Not found" }, 404, origin);
  },
};
