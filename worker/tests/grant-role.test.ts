// worker/scripts/grant-role.mjs: the owner's role-provisioning CLI. wrangler d1 execute has no bind
// parameters, so the tests pin down that only digits, [A-Za-z0-9-] usernames and the role enum can reach
// the SQL text, and run the SQL it builds against the real schema (and through the Worker's router).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, test } from "node:test";
// @ts-expect-error: plain .mjs module without type declarations
import { DATABASE, ROLES, UsageError, buildGrantSql, buildSelectSql, parseArgs, targetWhere, wranglerArgs } from "../scripts/grant-role.mjs";
import type { Env } from "../src/util";
import { TestD1 } from "./helpers/d1";
import { addUser, call, makeEnv, tokenFor } from "./helpers/harness";

const SCRIPT = join(__dirname, "../scripts/grant-role.mjs");

interface Opts {
  mode: string;
  persistTo: string | null;
  githubId: string | null;
  username: string | null;
  role: string | null;
  yes: boolean;
}
const parse = (argv: string[]) => parseArgs(argv) as Opts;
const rejects = (argv: string[], message: RegExp) =>
  assert.throws(() => parseArgs(argv), (e: unknown) => e instanceof UsageError && message.test((e as Error).message), argv.join(" "));

describe("argument parsing", () => {
  test("the documented forms", () => {
    assert.deepEqual(parse(["--remote", "--github-id", "583231", "--role", "admin"]), {
      mode: "--remote", persistTo: null, githubId: "583231", username: null, role: "admin", yes: false,
    });
    assert.deepEqual(parse(["--local", "--persist-to", ".wrangler/state", "--username", "Octo-Cat", "--role", "instructor", "--yes"]), {
      mode: "--local", persistTo: ".wrangler/state", githubId: null, username: "Octo-Cat", role: "instructor", yes: true,
    });
    assert.equal(parse(["--yes", "--role", "student", "--github-id", "1", "--remote"]).role, "student", "order does not matter");
    assert.deepEqual([...ROLES], ["student", "instructor", "admin"]);
  });

  test("mode, target and role are required, exactly once", () => {
    rejects(["--github-id", "1", "--role", "admin"], /--remote .*or --local/);
    rejects(["--remote", "--local", "--github-id", "1", "--role", "admin"], /not both/);
    rejects(["--remote", "--persist-to", "x", "--github-id", "1", "--role", "admin"], /--persist-to only applies to --local/);
    rejects(["--remote", "--role", "admin"], /exactly one of --github-id or --username/);
    rejects(["--remote", "--github-id", "1", "--username", "octo", "--role", "admin"], /exactly one/);
    rejects(["--remote", "--github-id", "1"], /--role is required/);
    rejects(["--remote", "--github-id", "1", "--role", "admin", "--role", "student"], /given twice/);
    rejects(["--remote", "--github-id", "1", "--github-id", "2", "--role", "admin"], /given twice/);
    rejects(["--remote", "--github-id", "1", "--role"], /--role needs a value/);
    rejects(["--remote", "--github-id", "--role", "admin"], /--github-id needs a value/);
  });

  test("unknown arguments, = forms and positionals are refused", () => {
    rejects(["--remote", "--github-id", "1", "--role=admin"], /unknown argument/);
    rejects(["--remote", "--github-id", "1", "--role", "admin", "--force"], /unknown argument/);
    rejects(["--remote", "--github-id", "1", "--role", "admin", "extra"], /unknown argument/);
    rejects(["--remote", "--database", "other-db", "--github-id", "1", "--role", "admin"], /unknown argument/);
  });

  test("roles outside the enum are refused (case-sensitive)", () => {
    for (const role of ["root", "Admin", "ADMIN", "admin ", " admin", "admin;", "admin'--", "superuser", "", "instructor,admin"]) {
      rejects(["--remote", "--github-id", "1", "--role", role], role === "" ? /must be one of|needs a value/ : /must be one of/);
    }
  });

  test("injection attempts in --github-id are refused", () => {
    for (const id of ["1; DROP TABLE users", "1' OR '1'='1", "1 OR 1=1", "12a", "-1", "+1", "1.0", "0x10", " 1", "1\n", "١٢٣", "email:abc", "google:77", "1".repeat(21), ""]) {
      rejects(["--remote", "--github-id", id, "--role", "admin"], id === "" ? /digits only|needs a value/ : /digits only/);
    }
  });

  test("injection attempts in --username are refused", () => {
    for (const name of ["o'brien", "a b", "name'); DROP TABLE users; --", "x' OR 'a'='a", "ünï", "a_b", "a.b", "a;b", "a\nb", "%27", "\u001b[31m", "a".repeat(40), ""]) {
      rejects(["--remote", "--username", name, "--role", "admin"], name === "" ? /letters, digits or hyphens|needs a value/ : /letters, digits or hyphens/);
    }
  });
});

describe("SQL building", () => {
  test("exact statements for a GitHub id and for a username", () => {
    assert.equal(buildSelectSql({ githubId: "583231", username: null }), "SELECT github_id, username, name, provider, role, status FROM users WHERE github_id = '583231'");
    assert.equal(
      buildGrantSql({ githubId: "583231", username: null }, "admin"),
      "INSERT INTO audit_log (user_id, action, detail) SELECT github_id, 'role.grant', role || ' -> admin (actor: cli)' FROM users WHERE github_id = '583231' AND role != 'admin';\n" +
        "UPDATE users SET role = 'admin' WHERE github_id = '583231' AND role != 'admin';",
    );
    assert.equal(
      buildGrantSql({ githubId: null, username: "octo-cat" }, "instructor"),
      "INSERT INTO audit_log (user_id, action, detail) SELECT github_id, 'role.grant', role || ' -> instructor (actor: cli)' FROM users WHERE username = 'octo-cat' AND role != 'instructor' AND (SELECT COUNT(*) FROM users WHERE username = 'octo-cat') = 1;\n" +
        "UPDATE users SET role = 'instructor' WHERE username = 'octo-cat' AND role != 'instructor' AND (SELECT COUNT(*) FROM users WHERE username = 'octo-cat') = 1;",
    );
  });

  test("the builders validate again: nothing unvalidated reaches SQL even when they are called directly", () => {
    const bad: [unknown, string][] = [
      [{ githubId: "1' OR '1'='1", username: null }, "admin"],
      [{ githubId: null, username: "x' --" }, "admin"],
      [{ githubId: "1", username: "octo" }, "admin"],
      [{ githubId: null, username: null }, "admin"],
      [{ githubId: 1, username: null }, "admin"],
      [{ githubId: "1", username: null }, "admin'; DROP TABLE users; --"],
    ];
    for (const [target, role] of bad) {
      assert.throws(() => buildGrantSql(target, role), UsageError, JSON.stringify([target, role]));
    }
    assert.throws(() => targetWhere({ githubId: "1;", username: null }), UsageError);
    assert.throws(() => buildSelectSql({ githubId: null, username: "a b" }), UsageError);
  });

  test("wrangler is called with argv (no shell), the fixed database and --json", () => {
    const sql = "SELECT 1";
    assert.deepEqual(wranglerArgs({ mode: "--remote", persistTo: null }, sql), ["wrangler", "d1", "execute", "skillforge-db", "--config", "wrangler.toml", "--remote", "--json", "--command", sql]);
    assert.deepEqual(wranglerArgs({ mode: "--local", persistTo: "/tmp/d1" }, sql).slice(-3), [sql, "--persist-to", "/tmp/d1"]);
    assert.equal(DATABASE, "skillforge-db");
  });

  test("the script holds no credentials and reads no environment of its own", () => {
    const src = readFileSync(SCRIPT, "utf8");
    assert.equal(src.includes("process.env"), false);
    assert.doesNotMatch(src, /shell:\s*true|exec\(|execSync/);
  });
});

describe("the SQL against the real schema", () => {
  let db: TestD1;
  let env: Env;
  beforeEach(() => {
    db = new TestD1();
    env = makeEnv(db);
  });
  const roleOf = (id: string) => db.query<{ role: string }>("SELECT role FROM users WHERE github_id = ?", id)[0]?.role;
  const audits = () => db.query<{ user_id: string; action: string; detail: string }>("SELECT user_id, action, detail FROM audit_log ORDER BY id");
  const run = (target: { githubId: string | null; username: string | null }, role: string) => db.sqlite.exec(buildGrantSql(target, role));

  test("grant by GitHub id: role + one role.grant audit row; repeating it changes nothing", () => {
    addUser(db, { id: "583231", username: "octo" });
    assert.deepEqual(db.query(buildSelectSql({ githubId: "583231", username: null })), [
      { github_id: "583231", username: "octo", name: "Name 583231", provider: "github", role: "student", status: "active" },
    ]);
    run({ githubId: "583231", username: null }, "admin");
    assert.equal(roleOf("583231"), "admin");
    assert.deepEqual(audits(), [{ user_id: "583231", action: "role.grant", detail: "student -> admin (actor: cli)" }]);
    run({ githubId: "583231", username: null }, "admin");
    assert.equal(audits().length, 1, "no change, no row");
    run({ githubId: "583231", username: null }, "student");
    assert.equal(roleOf("583231"), "student");
    assert.equal(audits()[1].detail, "admin -> student (actor: cli)");
  });

  test("grant by username applies only when exactly one account has it", () => {
    addUser(db, { id: "email:aaaa", username: "sam" });
    run({ githubId: null, username: "sam" }, "instructor");
    assert.equal(roleOf("email:aaaa"), "instructor");
    addUser(db, { id: "google:77", username: "sam" });
    run({ githubId: null, username: "sam" }, "admin");
    assert.equal(roleOf("email:aaaa"), "instructor", "ambiguous: untouched");
    assert.equal(roleOf("google:77"), "student", "ambiguous: untouched");
    assert.equal(audits().length, 1);
  });

  test("unknown accounts: nothing happens", () => {
    run({ githubId: "999", username: null }, "admin");
    assert.equal(audits().length, 0);
  });

  test("the Worker sees the grant on the account's next request, with the same token", async () => {
    addUser(db, { id: "583231" });
    const token = await tokenFor("583231");
    assert.equal((await call(env, "/api/admin/audit", { token })).status, 403);
    run({ githubId: "583231", username: null }, "admin");
    const res = await call(env, "/api/admin/audit", { token });
    assert.equal(res.status, 200);
    const entries = (await res.json()) as { action: string; detail: string }[];
    assert.equal(entries[0].action, "role.grant");
  });
});

describe("the CLI", () => {
  test("bad arguments exit 2 with the usage line, before wrangler is ever started", () => {
    for (const args of [[], ["--remote"], ["--remote", "--github-id", "1 OR 1=1", "--role", "admin"], ["--local", "--username", "x", "--role", "root"]]) {
      const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", env: { PATH: "" } }); // no PATH: npx could not start anyway
      assert.equal(r.status, 2, `${args.join(" ")}: ${r.stderr}`);
      assert.match(r.stderr, /^grant-role: .*\nUsage: node scripts\/grant-role\.mjs /);
      assert.equal(r.stdout, "");
    }
  });
});
