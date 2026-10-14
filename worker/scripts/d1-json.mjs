// Output of `wrangler d1 execute --json`, read by d1-reconcile.mjs and grant-role.mjs.
//
// On success stdout holds a JSON array with one { results, success, meta } per statement. On failure wrangler
// exits 1 and stdout holds { "error": { "text": ... } }. wrangler 4 writes its notices (the proxy notice,
// warnings) to stderr; wrangler 3 printed the proxy notice on stdout, before the JSON.
//
// Pure helpers, exported for worker/tests/d1-json.test.ts.

/** Rows of every statement, in statement order. */
export function executeRows(stdout) {
  // The array starts a line of its own, so a notice line before it is skipped, also one carrying
  // brackets ("▲ [WARNING] ...").
  const start = /^\[/m.exec(stdout)?.index;
  if (start === undefined) throw new Error(`no JSON in wrangler output: ${stdout.slice(0, 500)}`);
  const parsed = JSON.parse(stdout.slice(start));
  if (!Array.isArray(parsed)) throw new Error(`unexpected JSON from wrangler: ${stdout.slice(start, start + 500)}`);
  return parsed.flatMap((x) => x.results ?? []);
}

/**
 * What a failed run said, for the error message: stderr (wrangler 4's notices, errors outside the query) and
 * then stdout (the query's JSON error), so a notice on stderr cannot hide the SQL error. Last 2000 characters.
 */
export function executeFailure(stdout, stderr) {
  return [stderr, stdout]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join("\n")
    .slice(-2000);
}
