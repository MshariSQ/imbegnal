// Email + password accounts.
// Passwords are hashed with PBKDF2-SHA256 (100k iterations — the Workers
// runtime maximum) and a per-user random salt. Stored as
// `pbkdf2$<iterations>$<salt b64>$<hash b64>` so parameters can evolve.
import { type Env, b64ToBytes, bytesToB64, issueToken, json, newTokenVersion, readJson, uniqueUsername } from "./util";

const ITERATIONS = 100_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${bytesToB64(salt)}$${bytesToB64(hash)}`;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, iter, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !salt || !hash) return false;
  const actual = await derive(password, b64ToBytes(salt), Number(iter));
  return timingSafeEqual(actual, b64ToBytes(hash));
}

// A fixed hash used when the email is unknown, so response time doesn't reveal
// whether an account exists.
const DUMMY_HASH = `pbkdf2$${ITERATIONS}$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`;

function readCredentials(body: Record<string, unknown> | null) {
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  return { email, password };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
export async function handleRegister(req: Request, env: Env, origin: string): Promise<Response> {
  const body = await readJson(req);
  const { email, password } = readCredentials(body);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";

  if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: "invalid_email" }, 400, origin);
  if (password.length < 8 || password.length > 128) return json({ error: "weak_password" }, 400, origin);

  const exists = await env.DB.prepare("SELECT 1 FROM users WHERE email = ? AND provider = 'email'").bind(email).first();
  if (exists) return json({ error: "email_taken" }, 409, origin);

  // Deterministic, like GitHub ("<id>") and Google ("google:<sub>") keys, so deleting the account and
  // registering again with the same email gets the same key back, and with it the counters that account
  // deletion keeps (lab/account-data.ts). Keyed with JWT_SECRET because the key is the JWT `sub`: a plain
  // hash would let anyone confirm a guessed email. Accounts created before this keep their
  // email:<uuid> key (login looks them up by email).
  const mac = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey("raw", new TextEncoder().encode(env.JWT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]),
    new TextEncoder().encode(`imbegnal:email-account:v1|${email}`),
  );
  const sub = `email:${Array.from(new Uint8Array(mac).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("")}`;
  if (await env.DB.prepare("SELECT 1 FROM users WHERE github_id = ?").bind(sub).first()) return json({ error: "email_taken" }, 409, origin);
  const displayName = name || email.split("@")[0];
  const username = await uniqueUsername(env, displayName);
  await env.DB.prepare(
    `INSERT INTO users (github_id, username, name, avatar_url, email, bio, provider, password_hash, last_login, token_version)
     VALUES (?, ?, ?, '', ?, '', 'email', ?, CURRENT_TIMESTAMP, ?)`
  ).bind(sub, username, displayName, email, await hashPassword(password), newTokenVersion()).run(); // random start: util.ts newTokenVersion

  const token = await issueToken({ sub, username, name: displayName, avatar: "" }, env);
  return json({ token }, 201, origin, { "Cache-Control": "no-store" });
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export async function handleLogin(req: Request, env: Env, origin: string): Promise<Response> {
  const { email, password } = readCredentials(await readJson(req));
  if (!email || !password) return json({ error: "invalid_credentials" }, 401, origin);

  const row = await env.DB.prepare(
    "SELECT github_id, username, name, avatar_url, password_hash FROM users WHERE email = ? AND provider = 'email'"
  ).bind(email).first<{ github_id: string; username: string; name: string; avatar_url: string; password_hash: string }>();

  const ok = await verifyPassword(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !ok) return json({ error: "invalid_credentials" }, 401, origin);

  await env.DB.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE github_id = ?").bind(row.github_id).run();
  const token = await issueToken({ sub: row.github_id, username: row.username, name: row.name, avatar: row.avatar_url ?? "" }, env);
  return json({ token }, 200, origin, { "Cache-Control": "no-store" });
}
