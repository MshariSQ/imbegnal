export interface AuthUser {
  sub: string;
  username: string;
  name: string;
  avatar: string;
  exp: number;
}

const TOKEN_KEY = "sf_token";

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function parseToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as AuthUser;
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      removeToken();
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
}

export function signOut(): void {
  removeToken();
  window.location.href = "/skillforge/";
}
