const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

async function apiFetch(path: string, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const getStats = () => apiFetch("/api/stats");
export const getMe = (token: string) => apiFetch("/api/auth/me", token);
export const getUserProfile = (username: string) => apiFetch(`/api/users/${username}`);

export function getLoginUrl(): string {
  return `${API}/api/auth/github`;
}
