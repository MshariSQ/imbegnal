#!/usr/bin/env node
// Owner-only role provisioning. Roles (student < instructor < admin) are never granted through the API:
// no route writes users.role, tokens carry no role, and the Worker reads the role from D1 on every request,
// so a change applies to the account's very next request (no sign-out needed). See docs/PLATFORM.md,
// "Owner provisioning".
//
//   cd worker
//   node scripts/grant-role.mjs --remote|--local [--persist-to DIR] (--github-id <digits> | --username <name>) --role admin|instructor|student [--yes]
//
// It prints the matching account, then the exact SQL, and runs it only with --yes. The SQL writes the
// role and an audit_log row ('role.grant', "<old> -> <new> (actor: cli)") in one `wrangler d1 execute`.
// Prefer --github-id (the numeric GitHub user id never changes; a username can be renamed or shared by
// a GitHub and an email/Google account, in which case the script refuses and asks for the id).
//
// `wrangler d1 execute` has no bind parameters, so only validated values ever reach the SQL text: a
// GitHub id of digits, a username of [A-Za-z0-9-] (1-39 characters) and the role enum. Nothing read
// from the database is put into SQL. The script holds no credentials: wrangler uses the operator's own
// login (`npx wrangler login`) or CLOUDFLARE_API_TOKEN from their environment.
//
// Pure helpers are exported for worker/tests/grant-role.test.ts.
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DATABASE = "skillforge-db";
export const ROLES = Object.freeze(["student", "instructor", "admin"]);
export const USAGE =
  "Usage: node scripts/grant-role.mjs --remote|--local [--persist-to DIR] (--github-id <digits> | --username <name>) --role admin|instructor|student [--yes]";

const GITHUB_ID_RE = /^[0-9]{1,20}$/;
const USERNAME_RE = /^[A-Za-z0-9-]{1,39}$/;
const WORKER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export class UsageError extends Error {}

export const isGithubId = (v) => typeof v === "string" && GITHUB_ID_RE.test(v);
export const isUsername = (v) => typeof v === "string" && USERNAME_RE.test(v);
export const isRole = (v) => typeof v === "string" && ROLES.includes(v);

/** argv (without node and the script path) -> options. Throws UsageError on anything unexpected. */
export function parseArgs(argv) {
  const out = { mode: null, persistTo: null, githubId: null, username: null, role: null, yes: false };
  const take = (i, flag, key) => {
    if (out[key] !== null) throw new UsageError(`${flag} was given twice`);
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) throw new UsageError(`${flag} needs a value`);
    out[key] = v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--remote" || a === "--local") {
      if (out.mode !== null && out.mode !== a) throw new UsageError("pass either --remote or --local, not both");
      out.mode = a;
    } else if (a === "--persist-to") take(i++, a, "persistTo");
    else if (a === "--github-id") take(i++, a, "githubId");
    else if (a === "--username") take(i++, a, "username");
    else if (a === "--role") take(i++, a, "role");
    else if (a === "--yes") out.yes = true;
    else throw new UsageError(`unknown argument: ${JSON.stringify(a)}`);
  }
  if (out.mode === null) throw new UsageError("pass --remote (the production database) or --local");
  if (out.persistTo !== null && out.mode !== "--local") throw new UsageError("--persist-to only applies to --local");
  if ((out.githubId === null) === (out.username === null)) throw new UsageError("pass exactly one of --github-id or --username");
  if (out.githubId !== null && !isGithubId(out.githubId)) throw new UsageError("--github-id must be the numeric GitHub user id (digits only)");
  if (out.username !== null && !isUsername(out.username)) throw new UsageError("--username must be 1-39 letters, digits or hyphens");
  if (out.role === null) throw new UsageError("--role is required");
  if (!isRole(out.role)) throw new UsageError(`--role must be one of: ${ROLES.join(", ")}`);
  return out;
}

/** WHERE condition for the target account. Re-validates, so no caller can put anything else into SQL. */
export function targetWhere(target) {
  if (target.githubId != null && target.username == null) {
    if (!isGithubId(target.githubId)) throw new UsageError("invalid --github-id");
    return `github_id = '${target.githubId}'`;
  }
  if (target.username != null && target.githubId == null) {
    if (!isUsername(target.username)) throw new UsageError("invalid --username");
    return `username = '${target.username}'`;
  }
  throw new UsageError("pass exactly one of --github-id or --username");
}

export function buildSelectSql(target) {
  return `SELECT github_id, username, name, provider, role, status FROM users WHERE ${targetWhere(target)}`;
}

/**
 * The grant: the audit row first (it records the role being replaced), then the update, under the same
 * condition. Nothing happens when the account already has the role or, for --username, when more than
 * one account has that username.
 */
export function buildGrantSql(target, role) {
  if (!isRole(role)) throw new UsageError(`--role must be one of: ${ROLES.join(", ")}`);
  const where = targetWhere(target);
  const unique = target.username != null ? ` AND (SELECT COUNT(*) FROM users WHERE ${where}) = 1` : "";
  const cond = `${where} AND role != '${role}'${unique}`;
  return [
    `INSERT INTO audit_log (user_id, action, detail) SELECT github_id, 'role.grant', role || ' -> ${role} (actor: cli)' FROM users WHERE ${cond};`,
    `UPDATE users SET role = '${role}' WHERE ${cond};`,
  ].join("\n");
}

/** argv for `npx`: the d1 execute call, run from worker/ so --config resolves. */
export function wranglerArgs(opts, sql) {
  const args = ["wrangler", "d1", "execute", DATABASE, "--config", "wrangler.toml", opts.mode, "--json", "--command", sql];
  if (opts.persistTo) args.push("--persist-to", opts.persistTo);
  return args;
}

function d1(opts, sql) {
  // argv, no shell: nothing in `sql` or the options is interpreted by a shell.
  const r = spawnSync("npx", wranglerArgs(opts, sql), { cwd: WORKER_DIR, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.error) throw new Error(`could not start wrangler: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`wrangler d1 execute failed (${r.status}): ${(r.stderr || r.stdout).trim().slice(-2000)}`);
  const start = r.stdout.indexOf("[");
  if (start < 0) throw new Error(`no JSON in wrangler output: ${r.stdout.slice(0, 500)}`);
  return JSON.parse(r.stdout.slice(start)).flatMap((x) => x.results ?? []);
}

// Rows are printed as JSON so a name with control characters cannot drive the operator's terminal.
const show = (rows) => rows.forEach((row) => console.log(`  ${JSON.stringify(row)}`));

function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    if (e instanceof UsageError) {
      console.error(`grant-role: ${e.message}\n${USAGE}`);
      return 2;
    }
    throw e;
  }
  const target = opts.githubId !== null ? `--github-id ${opts.githubId}` : `--username ${opts.username}`;
  console.log(`Database: ${DATABASE} (${opts.mode === "--remote" ? "REMOTE: production" : `local${opts.persistTo ? `, ${opts.persistTo}` : ""}`})`);

  const select = buildSelectSql(opts);
  const rows = d1(opts, select);
  console.log(`Accounts matching ${target}:`);
  show(rows);
  if (rows.length === 0) {
    console.error("grant-role: no account matches. Nothing changed.");
    return 1;
  }
  if (rows.length > 1) {
    console.error("grant-role: more than one account has this username. Pass --github-id for the GitHub account; an email or Google account sharing it needs a manual check. Nothing changed.");
    return 1;
  }
  if (rows[0].role === opts.role) {
    console.log(`The account is already ${opts.role}. Nothing to do.`);
    return 0;
  }

  const sql = buildGrantSql(opts, opts.role);
  console.log(`\nSQL${opts.yes ? "" : " (not run)"}:\n${sql}\n`);
  if (!opts.yes) {
    console.log("Dry run: nothing changed. Re-run with --yes to apply.");
    return 0;
  }
  d1(opts, sql);
  const after = d1(opts, select);
  console.log("After:");
  show(after);
  if (after.length !== 1 || after[0].role !== opts.role) {
    console.error("grant-role: the role did not change (did the account change in between?).");
    return 1;
  }
  console.log(`Done: ${JSON.stringify(rows[0].role)} -> ${opts.role}, with a role.grant row in audit_log. It applies to the account's next request.`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(`grant-role: ${e instanceof Error ? e.message : e}`);
    process.exitCode = 1;
  }
}
