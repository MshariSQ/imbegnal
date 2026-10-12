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

/**
 * A route's openGraph metadata. Next.js merges metadata shallowly: a route that sets openGraph (for its
 * own og:url, title and description) replaces the root layout's whole object, and with it the site-wide
 * fields and the share image (app/opengraph-image.png, which the file convention only adds where no
 * segment overrides openGraph). This restates them, so link previews of every route keep the image.
 */
export function pageOpenGraph(page: { title: string; description: string; url: string; type?: "website" | "article" }) {
  return {
    type: "website" as "website" | "article",
    siteName: "IMBEGNAL",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, type: "image/png" }],
    ...page,
  };
}

/**
 * The site's Content-Security-Policy (a <meta> tag: GitHub Pages cannot set headers).
 * 'unsafe-inline'/'unsafe-eval' are required by Next hydration, the pre-paint theme script,
 * the exercise test harness (new Function) and Pyodide (wasm). `connect-src` allows exactly the
 * API origin this build talks to (plus Pyodide's CDN), not a wildcard: a script injected into
 * the page cannot send data to an arbitrary *.workers.dev host.
 */
export function buildCsp(apiUrl: string = API_URL): string {
  const api = new URL(apiUrl).origin;
  return (
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src * data:; " +
    `connect-src 'self' https://cdn.jsdelivr.net ${api}; ` +
    "object-src 'none'; base-uri 'self'"
  );
}
