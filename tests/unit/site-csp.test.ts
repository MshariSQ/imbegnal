import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsp } from "../../lib/site";

const connectSrc = (csp: string) => csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("connect-src "))?.split(/\s+/).slice(1) ?? [];

test("connect-src allows exactly the configured API origin, Pyodide's CDN and the site itself", () => {
  assert.deepEqual(connectSrc(buildCsp("https://skillforge-api.skillforge.workers.dev")), ["'self'", "https://cdn.jsdelivr.net", "https://skillforge-api.skillforge.workers.dev"]);
  // A custom API domain and the local full-stack E2E Worker are reachable too.
  assert.ok(connectSrc(buildCsp("https://api.imbegnal.com/")).includes("https://api.imbegnal.com"));
  assert.ok(connectSrc(buildCsp("http://127.0.0.1:8787")).includes("http://127.0.0.1:8787"));
});

test("no wildcard hosts: other *.workers.dev origins stay blocked", () => {
  const csp = buildCsp("https://skillforge-api.skillforge.workers.dev");
  assert.doesNotMatch(csp, /\*\.workers\.dev/);
  assert.ok(connectSrc(csp).every((src) => !src.includes("*")));
});

test("keeps the hardening directives", () => {
  const csp = buildCsp("https://skillforge-api.skillforge.workers.dev");
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
});
