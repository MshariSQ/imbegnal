const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

async function apiFetch(path: string, options?: RequestInit, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const getStats = () => apiFetch("/api/stats");
export const getMe = (token: string) => apiFetch("/api/auth/me", undefined, token);
export const getUserProfile = (username: string) => apiFetch(`/api/users/${username}`);

export function getLoginUrl(): string {
  return `${API}/api/auth/github`;
}

// ── Progress ──────────────────────────────────────────────────────────────────
export const getProgress = (roadmapId: string, token: string): Promise<{ completed: string[] }> =>
  apiFetch(`/api/progress?roadmap_id=${encodeURIComponent(roadmapId)}`, undefined, token);

export const markNodeDone = (roadmapId: string, nodeId: string, token: string) =>
  apiFetch("/api/progress", { method: "POST", body: JSON.stringify({ roadmap_id: roadmapId, node_id: nodeId }) }, token);

export const markNodeUndone = (roadmapId: string, nodeId: string, token: string) =>
  apiFetch("/api/progress", { method: "DELETE", body: JSON.stringify({ roadmap_id: roadmapId, node_id: nodeId }) }, token);

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const getBookmarks = (token: string): Promise<{ bookmarks: { type: string; item_id: string }[] }> =>
  apiFetch("/api/bookmarks", undefined, token);

export const addBookmark = (type: string, itemId: string, token: string) =>
  apiFetch("/api/bookmarks", { method: "POST", body: JSON.stringify({ type, item_id: itemId }) }, token);

export const removeBookmark = (type: string, itemId: string, token: string) =>
  apiFetch("/api/bookmarks", { method: "DELETE", body: JSON.stringify({ type, item_id: itemId }) }, token);

// ── Email/password auth ───────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(`API ${status}: ${code}`);
  }
}

async function postJson<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? "error");
  return data;
}

export const loginWithEmail = (email: string, password: string) =>
  postJson<{ token: string }>("/api/auth/login", { email, password });

export const registerWithEmail = (name: string, email: string, password: string) =>
  postJson<{ token: string }>("/api/auth/register", { name, email, password });

export function getGoogleLoginUrl(): string {
  return `${API}/api/auth/google`;
}

// ── Study state sync (progress, notes, streak) ────────────────────────────────
export const getStudyStateRemote = (token: string): Promise<{ data: unknown | null }> =>
  apiFetch("/api/state", undefined, token);

export const putStudyStateRemote = (data: unknown, token: string) =>
  apiFetch("/api/state", { method: "PUT", body: JSON.stringify({ data }) }, token);

// ── AI tutor (server-sent events) ─────────────────────────────────────────────
export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  track: string;
  lesson: string;
  lessonTitle: string;
  context: string; // lesson text the tutor should ground its answers in
  lang: "en" | "ar";
  messages: TutorMessage[];
}

/**
 * Streams the tutor's answer. Calls `onText` for each chunk; resolves when the
 * stream ends. Throws ApiError (401 sign-in needed, 429 daily limit, 503 off).
 */
export async function streamTutor(
  req: TutorRequest,
  token: string,
  onText: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, data.error ?? "error");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    // SSE frames are separated by a blank line; each carries `data: <json>`
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const evt = JSON.parse(line.slice(6)) as { t?: string; error?: string };
        if (evt.error) throw new ApiError(502, evt.error);
        if (evt.t) onText(evt.t);
      }
    }
  }
}
