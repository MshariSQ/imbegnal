// Shared helpers for the IMBEGNAL API worker: env, JSON/CORS responses, JWT,
// request parsing. Route handlers live in index.ts and the feature modules.

export interface Env {
  DB: D1Database;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  WORKER_URL: string;
  // Optional features — each is disabled when its secret is not configured.
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  AI_MODEL?: string; // default claude-opus-5-5; claude-sonnet-5-5 / claude-haiku-4-5 are cheaper
  AI_DAILY_LIMIT_FREE?: string; // per user per day (default 20)
  AI_DAILY_LIMIT_PRO?: string; // (default 200)
  AI_DAILY_LIMIT_GLOBAL?: string; // all users combined per day (default 600) — spend kill switch
}

export interface TokenUser {
  sub: string;
  username: string;
  name: string;
  avatar: string;
}

// ── Encoding ──────────────────────────────────────────────────────────────────
export function b64url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function b64urlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

/** base64url of UTF-8 bytes — btoa(string) alone throws on non-Latin-1 text such as Arabic names. */
export function b64urlUtf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function b64urlDecodeUtf8(str: string): string {
  const bin = b64urlDecode(str);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function bytesToB64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

// ── JWT (HS256) ───────────────────────────────────────────────────────────────
async function hmacKey(secret: string, usage: ("sign" | "verify")[]) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usage);
}

export async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64urlUtf8(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const data = `${header}.${body}`;
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret, ["sign"]), new TextEncoder().encode(data));
  return `${data}.${b64url(String.fromCharCode(...new Uint8Array(sig)))}`;
}

export async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const sigBytes = b64ToBytes(sig.replace(/-/g, "+").replace(/_/g, "/"));
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(secret, ["verify"]), sigBytes, new TextEncoder().encode(`${header}.${body}`));
    if (!valid) return null;
    const p = JSON.parse(b64urlDecodeUtf8(body));
    // Tokens without an expiry would verify forever — reject them outright.
    if (typeof p.exp !== "number") return null;
    if (Date.now() / 1000 > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}

const TOKEN_TTL = 30 * 24 * 60 * 60;

export function issueToken(user: TokenUser, env: Env): Promise<string> {
  return signJWT({ ...user, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL }, env.JWT_SECRET);
}

export async function getUser(req: Request, env: Env) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyJWT(auth.slice(7), env.JWT_SECRET) as Promise<(Record<string, unknown> & { sub: string }) | null>;
}

// ── Requests & responses ──────────────────────────────────────────────────────
const ID_RE = /^[a-z0-9-]{1,64}$/;
export const isValidId = (v: unknown): v is string => typeof v === "string" && ID_RE.test(v);

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getCookie(req: Request, name: string): string | null {
  const cookie = req.headers.get("Cookie");
  if (!cookie) return null;
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? m[1] : null;
}

const ALLOWED_ORIGINS = [
  "https://imbegnal.com",
  "https://www.imbegnal.com",
  "https://msharisq.github.io",
  "http://localhost:3000",
  "http://localhost:3001",
];

export function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

export function json(data: unknown, status = 200, origin = "", extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}

export const NO_STORE = { "Cache-Control": "no-store" };

/** Redirect back to the frontend with a freshly issued token in the URL fragment. */
export async function redirectWithToken(user: TokenUser, env: Env, extraHeaders: Record<string, string> = {}): Promise<Response> {
  const token = await issueToken(user, env);
  // Fragments are never sent to servers, logged by proxies, or leaked via Referer.
  return new Response(null, {
    status: 302,
    headers: { Location: `${env.FRONTEND_URL}/auth/callback/#token=${token}`, "Cache-Control": "no-store", ...extraHeaders },
  });
}

/** Builds a unique, URL-safe username from a display name or email. */
export async function uniqueUsername(env: Env, seed: string): Promise<string> {
  const base = seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 28) || "learner";
  for (let i = 0; i < 6; i++) {
    const candidate = i === 0 ? base : `${base}-${crypto.getRandomValues(new Uint16Array(1))[0].toString(16)}`;
    const taken = await env.DB.prepare("SELECT 1 FROM users WHERE username = ?").bind(candidate).first();
    if (!taken) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
