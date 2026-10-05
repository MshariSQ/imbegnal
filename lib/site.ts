/** Canonical site origin, used for SEO metadata, sitemap and JSON-LD. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://imbegnal.com").replace(/\/$/, "");

/**
 * Worker API origin. Production builds fall back to the live Worker so a build
 * without env vars (e.g. Cloudflare's Git integration) can never ship a
 * localhost URL; an empty NEXT_PUBLIC_API_URL counts as unset.
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "https://skillforge-api.skillforge.workers.dev" : "http://localhost:8787")
).replace(/\/$/, "");

export const GITHUB_REPO = "https://github.com/MshariSQ/imbegnal";
