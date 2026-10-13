/**
 * Built-output check of every exported page's share metadata: og:url is the page's canonical URL, and
 * the share image (app/opengraph-image.png) is present for Open Graph and Twitter. A route that sets
 * its own openGraph replaces the root layout's whole object (Next.js merges metadata shallowly), so
 * routes go through lib/site.ts pageOpenGraph, which restates the image and the site-wide fields.
 *
 * Run (build first; reads `out/`, no browser or network needed):
 *   npm run build
 *   node --import tsx --test tests/e2e/phase3/metadata.spec.ts
 * Env: PHASE3_E2E_SITE_DIR (default out/).
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { SITE_DIR } from "./harness";

function pages(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "_next") pages(p, out);
    } else if (name === "index.html") out.push(p);
  }
  return out;
}

const attr = (html: string, re: RegExp) => html.match(re)?.[1];

describe("share metadata in the static export", () => {
  it("every page: og:url is its canonical URL, and Open Graph and Twitter carry the share image", () => {
    const files = pages(SITE_DIR);
    assert.ok(files.length > 100, `pages found: ${files.length}`);
    const problems: string[] = [];
    for (const file of files) {
      const html = readFileSync(file, "utf8");
      const page = relative(SITE_DIR, file);
      const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
      const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
      if (canonical && ogUrl !== canonical) problems.push(`${page}: og:url ${ogUrl} != canonical ${canonical}`);
      if (!/<meta property="og:image" content="https:\/\/[^"]*opengraph-image\.png[^"]*"/.test(html)) problems.push(`${page}: no og:image`);
      if (!/<meta name="twitter:image" content="https:\/\/[^"]*opengraph-image\.png[^"]*"/.test(html)) problems.push(`${page}: no twitter:image`);
      if (!/<meta property="og:site_name" content="IMBEGNAL"/.test(html)) problems.push(`${page}: no og:site_name`);
    }
    assert.deepEqual(problems, []);
  });
});
