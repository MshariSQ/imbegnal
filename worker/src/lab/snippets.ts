// Shareable snippets: immutable, public by link, no author identity beyond the
// account's display name. There is deliberately no update or delete endpoint.
import type { QuotaError, Snippet, SnippetCreateResponse } from "../../../shared/api";
import type { LangId } from "../../../shared/languages";
import { snippetHref } from "../../../shared/links";
import { type Env, json } from "../util";
import { SNIPPET_MAX_PER_HOUR, SNIPPET_MAX_PER_USER, SNIPPET_TITLE_CHARS } from "./config";
import { apiError, readBody, reply, requireActiveUser, toIso } from "./http";
import { parseCode, parseLang, parseStdin, sanitizeTitle } from "./validate";

const ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"; // 64 symbols: no modulo bias
const ID_LENGTH = 10;
const SNIPPET_ID_RE = /^[A-Za-z0-9_-]{6,40}$/;

function newSnippetId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  return Array.from(bytes, (b) => ID_ALPHABET[b & 63]).join("");
}

// ── POST /api/lab/snippets ────────────────────────────────────────────────────
export async function handleSnippetCreate(req: Request, env: Env, origin: string): Promise<Response> {
  const auth = await requireActiveUser(req, env, origin);
  if (!auth.ok) return auth.response;
  const userId = auth.user.sub;

  const body = await readBody(req);
  if (!body.ok) return apiError("invalid_request", 400, origin, "The body must be a JSON object of at most 200 KiB.");
  const lang = parseLang(body.body.lang);
  if (!lang) return apiError("invalid_request", 400, origin, "unknown language");
  const code = parseCode(body.body.code);
  if (!code.ok) return apiError("invalid_request", 400, origin, code.message);
  const stdin = parseStdin(body.body.stdin);
  if (!stdin.ok) return apiError("invalid_request", 400, origin, stdin.message);
  const title = sanitizeTitle(body.body.title, SNIPPET_TITLE_CHARS) ?? null;

  // The caps are part of the INSERT so parallel requests cannot all slip under them.
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = newSnippetId();
    try {
      const res = await env.DB.prepare(
        `INSERT INTO lab_snippets (id, user_id, lang, code, stdin, title)
         SELECT ?1, ?2, ?3, ?4, ?5, ?6
         WHERE (SELECT COUNT(*) FROM lab_snippets WHERE user_id = ?2) < ?7
           AND (SELECT COUNT(*) FROM lab_snippets WHERE user_id = ?2 AND created_at >= datetime('now', '-1 hour')) < ?8`,
      ).bind(id, userId, lang, code.value, stdin.value, title, SNIPPET_MAX_PER_USER, SNIPPET_MAX_PER_HOUR).run();

      if (res.meta.changes === 0) {
        const hourly = await env.DB.prepare("SELECT COUNT(*) AS n FROM lab_snippets WHERE user_id = ? AND created_at >= datetime('now', '-1 hour')")
          .bind(userId)
          .first<{ n: number }>();
        if ((hourly?.n ?? 0) >= SNIPPET_MAX_PER_HOUR) {
          return reply({ error: "rate_limited", message: "Too many snippets created this hour.", scope: "rate", retryAfterSec: 600 } satisfies QuotaError, 429, origin, { "Retry-After": "600" });
        }
        return reply({ error: "quota_exceeded", message: `You can keep at most ${SNIPPET_MAX_PER_USER} snippets.`, scope: "user" } satisfies QuotaError, 429, origin);
      }
      const created: SnippetCreateResponse = { id, path: snippetHref(id) };
      return reply(created, 201, origin);
    } catch (e) {
      // A duplicate random id is astronomically unlikely; retry with a fresh one. Anything else is a real failure.
      if (!(e instanceof Error) || !/UNIQUE|PRIMARY KEY|constraint/i.test(e.message)) {
        console.error("snippet create failed", e instanceof Error ? e.message : "unknown");
        return apiError("internal_error", 500, origin, "Could not save the snippet.");
      }
    }
  }
  return apiError("internal_error", 500, origin, "Could not save the snippet.");
}

// ── GET /api/lab/snippets/:id ─────────────────────────────────────────────────
export async function handleSnippetGet(env: Env, origin: string, id: string): Promise<Response> {
  if (!SNIPPET_ID_RE.test(id)) return apiError("not_found", 404, origin);
  const row = await env.DB.prepare(
    `SELECT s.id, s.lang, s.code, s.stdin, s.title, s.created_at, u.name AS author_name
     FROM lab_snippets s LEFT JOIN users u ON u.github_id = s.user_id
     WHERE s.id = ?`,
  ).bind(id).first<{ id: string; lang: string; code: string; stdin: string; title: string | null; created_at: string; author_name: string | null }>();
  if (!row) return apiError("not_found", 404, origin);

  const snippet: Snippet = {
    id: row.id,
    lang: row.lang as LangId,
    code: row.code,
    stdin: row.stdin,
    ...(row.title ? { title: row.title } : {}),
    ...(row.author_name ? { authorName: row.author_name } : {}),
    createdAt: toIso(row.created_at),
  };
  // Immutable public content: safe to cache briefly (an account deletion may take this long to show).
  return json(snippet, 200, origin, { "Cache-Control": "public, max-age=300" });
}
