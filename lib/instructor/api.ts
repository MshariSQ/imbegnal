/**
 * GET /api/instructor/analytics?days=<7|30|90> (role: instructor | admin). Errors are normalised into
 * CtfApiError so `classifyFailure` (lib/ctf/errors.ts) maps 401 -> signin, 403 -> forbidden / suspended.
 */
import type { ApiErrorBody, InstructorAnalytics } from "../../shared/api";
import { CtfApiError } from "../ctf/api";
import { API_URL } from "../site";
import { normalizeAnalytics, type Period } from "./analytics";

export async function fetchInstructorAnalytics(days: Period, token: string, signal?: AbortSignal, fetchFn: typeof fetch = fetch): Promise<InstructorAnalytics> {
  let res: Response;
  try {
    res = await fetchFn(`${API_URL}/api/instructor/analytics?days=${days}`, { headers: { Authorization: `Bearer ${token}` }, signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new CtfApiError(0, "network");
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const code = typeof (body as Partial<ApiErrorBody> | null)?.error === "string" ? (body as ApiErrorBody).error : "error";
    throw new CtfApiError(res.status, code);
  }
  const data = normalizeAnalytics(body);
  if (!data) throw new CtfApiError(res.status, "bad_response");
  return data;
}
