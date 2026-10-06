/**
 * Builds a static export of the site with the Challenges FIXTURES temporarily
 * swapped into data/challenges/security.ts, then restores that file (also on
 * failure / Ctrl-C). The fixtures are never committed into data/.
 *
 *   node tests/e2e/challenges/build-fixture-site.mjs [outDir]
 *
 * outDir defaults to node_modules/.cache/ctf-e2e-site (git-ignored). The API
 * origin is baked in as https://imbegnal-e2e.workers.dev; the specs intercept it with
 * page.route, so no Worker has to run.
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const target = resolve(root, "data/challenges/security.ts");
const outDir = resolve(process.argv[2] ?? resolve(root, "node_modules/.cache/ctf-e2e-site"));
const original = readFileSync(target, "utf8");

const restore = () => writeFileSync(target, original);
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => (restore(), process.exit(130)));

let status = 1;
try {
  writeFileSync(
    target,
    `import type { ChallengeMeta } from "../../shared/challenges";\n` +
      `import { fixtureChallenges } from "../../tests/fixtures/challenges/challenges";\n\n` +
      `// TEMPORARY: written by tests/e2e/challenges/build-fixture-site.mjs, restored after the build.\n` +
      `export const securityChallenges: ChallengeMeta[] = fixtureChallenges;\n`
  );
  const r = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_API_URL: "https://imbegnal-e2e.workers.dev", NEXT_TELEMETRY_DISABLED: "1" },
  });
  status = r.status ?? 1;
} finally {
  restore();
}
if (status !== 0) process.exit(status);

if (!existsSync(resolve(root, "out/challenges/index.html"))) {
  console.error("build produced no out/challenges/index.html");
  process.exit(1);
}
rmSync(outDir, { recursive: true, force: true });
cpSync(resolve(root, "out"), outDir, { recursive: true });
// The default `out/` is rebuilt by `npm run build`; keep the fixture build out of it.
rmSync(resolve(root, "out"), { recursive: true, force: true });
console.log(`fixture site written to ${outDir}`);
