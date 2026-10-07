/** Pure-logic tests: no Docker, no network. */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ReplayGuard, sign, verifyRequest } from "../src/auth";
import { ConfigError, loadConfig } from "../src/config";
import { buildCreateArgs, cliEnvironment, containerName } from "../src/docker";
import { allRecipes, detectJavaTarget, getRecipe, isRejection, stripJavaNoise, formatVersion } from "../src/languages";
import { resolveLimits } from "../src/limits";
import { buildRecord, createLogger } from "../src/log";
import { OutputCollector, completeUtf8Length } from "../src/output";
import { BusyError, SlotQueue } from "../src/queue";
import { classifyStep, signalFromExitCode } from "../src/status";
import { MAX_BODY_BYTES, validateRunRequest } from "../src/validate";
import { LANG_IDS, LANGUAGES } from "../../shared/languages";
import { RUNNER_CEILING, SIGNATURE_WINDOW_MS } from "../../shared/protocol";

const SECRET = "s".repeat(40);
const JOB = "11111111-2222-3333-4444-555555555555";

function body(over: Record<string, unknown> = {}): Buffer {
  return Buffer.from(JSON.stringify({ jobId: JOB, lang: "python", code: "print(1)", stdin: "", ...over }));
}

describe("HMAC authentication", () => {
  const now = 1_800_000_000_000;
  const raw = Buffer.from('{"a":1}');
  const ts = String(now);
  const good = sign(SECRET, ts, raw);

  test("accepts a correct signature", () => {
    assert.equal(verifyRequest({ secret: SECRET, timestamp: ts, signature: good, rawBody: raw, now }), null);
  });
  test("signature is hex(HMAC-SHA256(secret, `${timestamp}.${body}`))", () => {
    assert.match(good, /^[0-9a-f]{64}$/);
    assert.notEqual(sign(SECRET, ts, Buffer.from('{"a":2}')), good);
    assert.notEqual(sign("t".repeat(40), ts, raw), good);
    assert.notEqual(sign(SECRET, String(now + 1), raw), good);
  });
  test("rejects a wrong signature, wrong body, wrong secret", () => {
    const bad = good.replace(/^./, good[0] === "a" ? "b" : "a");
    assert.equal(verifyRequest({ secret: SECRET, timestamp: ts, signature: bad, rawBody: raw, now }), "bad_signature");
    assert.equal(verifyRequest({ secret: SECRET, timestamp: ts, signature: good, rawBody: Buffer.from('{"a":2}'), now }), "bad_signature");
    assert.equal(verifyRequest({ secret: "t".repeat(40), timestamp: ts, signature: good, rawBody: raw, now }), "bad_signature");
  });
  test("rejects malformed signatures without throwing", () => {
    for (const s of ["", "zz", "a".repeat(63), "a".repeat(65), good + "00"]) {
      assert.equal(verifyRequest({ secret: SECRET, timestamp: ts, signature: s, rawBody: raw, now }), "bad_signature");
    }
  });
  test("rejects missing headers", () => {
    assert.equal(verifyRequest({ secret: SECRET, timestamp: undefined, signature: good, rawBody: raw, now }), "missing_headers");
    assert.equal(verifyRequest({ secret: SECRET, timestamp: ts, signature: undefined, rawBody: raw, now }), "missing_headers");
  });
  test("enforces the timestamp window in both directions", () => {
    const at = (t: number) => {
      const s = String(t);
      return verifyRequest({ secret: SECRET, timestamp: s, signature: sign(SECRET, s, raw), rawBody: raw, now });
    };
    assert.equal(at(now - SIGNATURE_WINDOW_MS), null);
    assert.equal(at(now + SIGNATURE_WINDOW_MS), null);
    assert.equal(at(now - SIGNATURE_WINDOW_MS - 1), "stale_timestamp");
    assert.equal(at(now + SIGNATURE_WINDOW_MS + 1), "stale_timestamp");
  });
  test("rejects non-numeric timestamps", () => {
    for (const t of ["abc", "-1", "1e12", "12.5", "", "0x10", "9".repeat(30)]) {
      assert.notEqual(verifyRequest({ secret: SECRET, timestamp: t, signature: good, rawBody: raw, now }), null);
    }
  });
});

describe("replay guard", () => {
  test("remembers a jobId until the TTL passes", () => {
    let t = 1000;
    const g = new ReplayGuard(500, 100, () => t);
    assert.equal(g.claim("job-aaaaaaaa"), true);
    assert.equal(g.claim("job-aaaaaaaa"), false);
    assert.equal(g.claim("job-bbbbbbbb"), true);
    t += 499;
    assert.equal(g.claim("job-aaaaaaaa"), false);
    t += 2;
    assert.equal(g.claim("job-aaaaaaaa"), true);
  });
  test("release lets a never-started job retry", () => {
    const g = new ReplayGuard(10_000);
    assert.equal(g.claim("job-cccccccc"), true);
    g.release("job-cccccccc");
    assert.equal(g.claim("job-cccccccc"), true);
  });
  test("memory is bounded", () => {
    const g = new ReplayGuard(10_000_000, 50);
    for (let i = 0; i < 500; i++) g.claim(`job-${String(i).padStart(8, "0")}`);
    assert.ok(g.size <= 51, `size ${g.size}`);
  });
});

describe("request validation", () => {
  const rejects = (raw: Buffer | string, status: 400 | 413, re?: RegExp) => {
    const r = validateRunRequest(Buffer.isBuffer(raw) ? raw : Buffer.from(raw));
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.status, status);
      if (re) assert.match(r.message, re);
    }
  };

  test("accepts a minimal valid request and a request with lower limits", () => {
    const r = validateRunRequest(body());
    assert.ok(r.ok);
    const l = validateRunRequest(body({ limits: { runTimeoutMs: 1000, memoryMb: 128, compileTimeoutMs: 2000 } }));
    assert.ok(l.ok && l.request.limits?.runTimeoutMs === 1000);
  });
  test("every language id is accepted, everything else is not", () => {
    for (const lang of LANG_IDS) assert.ok(validateRunRequest(body({ lang })).ok, lang);
    for (const lang of ["", "Python", "py", "rm -rf /", "__proto__", null, 5]) rejects(body({ lang }), 400);
  });
  test("jobId must be uuid-like (it ends up in a container name)", () => {
    for (const jobId of ["", "short", "a b c d e f g h", "../../etc/passwd-xx", "id;rm -rf /", "-leading-dash-00", "x".repeat(65), 7, null]) {
      rejects(body({ jobId }), 400, /jobId/);
    }
    assert.ok(validateRunRequest(body({ jobId: "abcdef12-3456" })).ok);
  });
  test("code and stdin must be strings within the ceiling", () => {
    rejects(body({ code: 5 }), 400);
    rejects(body({ stdin: ["x"] }), 400);
    rejects(body({ code: "a".repeat(RUNNER_CEILING.codeBytes + 1) }), 413);
    rejects(body({ stdin: "a".repeat(RUNNER_CEILING.stdinBytes + 1) }), 413);
    assert.ok(validateRunRequest(body({ code: "a".repeat(RUNNER_CEILING.codeBytes) })).ok);
    // the ceiling is in BYTES, not characters
    rejects(body({ code: "é".repeat(RUNNER_CEILING.codeBytes / 2 + 1) }), 413);
  });
  test("NUL bytes in code are rejected", () => {
    rejects(body({ code: "print(1)\u0000" }), 400, /NUL/);
    rejects(`{"jobId":"${JOB}","lang":"python","code":"a\\u0000b","stdin":""}`, 400, /NUL/);
  });
  test("limits can only be lower than the ceilings", () => {
    rejects(body({ limits: { runTimeoutMs: RUNNER_CEILING.runTimeoutMs + 1 } }), 400, /ceiling/);
    rejects(body({ limits: { compileTimeoutMs: RUNNER_CEILING.compileTimeoutMs + 1 } }), 400, /ceiling/);
    rejects(body({ limits: { memoryMb: RUNNER_CEILING.memoryMb + 1 } }), 400, /ceiling/);
    for (const bad of [0, -5, 1.5, "100", null, Number.NaN]) rejects(body({ limits: { runTimeoutMs: bad } }), 400);
    rejects(body({ limits: { cpus: 64 } }), 400, /not a known limit/);
    rejects(body({ limits: [] }), 400);
  });
  test("unknown fields, non-objects and broken JSON are rejected without echoing input", () => {
    rejects(body({ network: true }), 400, /unknown field/);
    rejects("[]", 400);
    rejects("null", 400);
    rejects("", 400);
    rejects('{"jobId": "secret-looking-text', 400, /^body is not valid JSON$/);
  });
  test("oversized bodies are 413 before parsing", () => {
    rejects(Buffer.alloc(MAX_BODY_BYTES + 1, 0x20), 413);
  });
});

describe("limit resolution", () => {
  const d = getRecipe("python").defaults;
  test("defaults apply when nothing is requested", () => {
    const l = resolveLimits(d);
    assert.equal(l.runTimeoutMs, d.runTimeoutMs);
    assert.equal(l.compileTimeoutMs, d.compileTimeoutMs);
    assert.equal(l.memoryMb, d.memoryMb);
  });
  test("callers can only lower limits", () => {
    const low = resolveLimits(d, { runTimeoutMs: 1000, memoryMb: 64 });
    assert.equal(low.runTimeoutMs, 1000);
    assert.equal(low.memoryMb, 64);
    const high = resolveLimits(d, { runTimeoutMs: 15_000, memoryMb: 1024, compileTimeoutMs: 20_000 });
    assert.equal(high.runTimeoutMs, d.runTimeoutMs);
    assert.equal(high.memoryMb, d.memoryMb);
    assert.equal(high.compileTimeoutMs, d.compileTimeoutMs);
  });
  test("tiny values are raised to a workable floor", () => {
    const l = resolveLimits(getRecipe("java").defaults, { memoryMb: 1, runTimeoutMs: 1 });
    assert.ok(l.memoryMb >= 128);
    assert.ok(l.runTimeoutMs >= 200);
  });
  test("no recipe ever exceeds the runner ceiling", () => {
    for (const r of allRecipes()) {
      const l = resolveLimits(r.defaults);
      assert.ok(l.compileTimeoutMs <= RUNNER_CEILING.compileTimeoutMs, r.id);
      assert.ok(l.runTimeoutMs <= RUNNER_CEILING.runTimeoutMs, r.id);
      assert.ok(l.memoryMb <= RUNNER_CEILING.memoryMb && l.compileMemoryMb <= RUNNER_CEILING.memoryMb, r.id);
      assert.ok(l.compileMemoryMb >= l.memoryMb, r.id);
    }
  });
});

describe("Java class detection", () => {
  const ok = (code: string) => {
    const t = detectJavaTarget(code);
    assert.ok(!("error" in t), JSON.stringify(t));
    return t as { fileClass: string; mainClass: string };
  };
  test("the Hello World template maps to Main.java / Main", () => {
    const hello = LANGUAGES.find((l) => l.id === "java")?.hello ?? "";
    assert.deepEqual(ok(hello), { fileClass: "Main", mainClass: "Main" });
  });
  test("a public class names the file; the main class is found", () => {
    assert.deepEqual(ok("public class Greeter { public static void main(String[] a) {} }"), { fileClass: "Greeter", mainClass: "Greeter" });
    assert.deepEqual(ok("class Helper {}\npublic class App { public static void main(String[] a) {} }"), { fileClass: "App", mainClass: "App" });
    assert.deepEqual(ok("class Solo { public static void main(String[] a) {} }"), { fileClass: "Main", mainClass: "Solo" });
  });
  test("falls back to Main when nothing is declared", () => {
    assert.deepEqual(ok("// nothing here"), { fileClass: "Main", mainClass: "Main" });
  });
  test("packages are validated and qualify the main class", () => {
    assert.equal(ok("package a.b; public class Main { public static void main(String[] x){} }").mainClass, "a.b.Main");
  });
  test("strings, comments and text blocks do not fool the scanner", () => {
    const code = 'public class Real {\n String s = "public class Fake";\n // class Evil\n /* class Evil2 */\n public static void main(String[] a){}\n}';
    assert.equal(ok(code).fileClass, "Real");
    assert.ok(!stripJavaNoise('x "class Foo" y').includes("Foo"));
  });
  test("injection attempts are rejected", () => {
    const attempts = [
      "public class a$(touch x) { }",
      "public class a;touch x { }",
      "public class a`id` { }",
      "public class ../../etc/passwd { }",
      "public class a/b { }",
      "public class a\\b { }",
      "public class é { }",
      "public class a-b { }",
      "public class a.b { }",
      "public class a\nb { }",
      "public class $x { }",
      "public class " + "A".repeat(65) + " { }",
      "package a.$(id); public class Main {}",
      "package ../x; public class Main {}",
      "package a b; public class Main {}",
    ];
    for (const code of attempts) {
      const t = detectJavaTarget(code);
      if ("error" in t) continue;
      // If it parsed at all, every name it produced must be a plain identifier chain.
      assert.match(t.fileClass, /^[A-Za-z_][A-Za-z0-9_]*$/, code);
      assert.match(t.mainClass, /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/, code);
    }
    for (const code of ["public class a$(touch x) { }", "public class ../../etc/passwd { }", "public class a-b { }", "public class é { }", "public class " + "A".repeat(65) + " { }"]) {
      assert.ok("error" in detectJavaTarget(code), code);
    }
  });
  test("the Java recipe rejects bad names without any container", () => {
    const l = resolveLimits(getRecipe("java").defaults);
    const p = getRecipe("java").plan("public class a$(touch x) { }", l);
    assert.ok(isRejection(p));
  });
});

describe("language recipes", () => {
  const l = resolveLimits(getRecipe("python").defaults);
  test("one recipe per language, with the fixed file names of shared/languages.ts", () => {
    assert.equal(allRecipes().length, LANG_IDS.length);
    for (const spec of LANGUAGES) {
      if (spec.id === "java") continue;
      const p = getRecipe(spec.id).plan(spec.hello, resolveLimits(getRecipe(spec.id).defaults));
      assert.ok(!isRejection(p));
      if (!isRejection(p)) assert.equal(p.filename, spec.filename, spec.id);
    }
  });
  test("argv arrays never contain user code", () => {
    const marker = "UNIQUE_MARKER_$(id)_`id`_;rm";
    for (const spec of LANGUAGES) {
      const p = getRecipe(spec.id).plan(`// ${marker}\n${spec.hello}`, l);
      if (isRejection(p)) continue;
      const all = [...(p.compile?.argv ?? []), ...p.run.argv, p.filename].join("\u0000");
      assert.ok(!all.includes("UNIQUE_MARKER"), spec.id);
    }
  });
  test("no recipe uses a shell", () => {
    for (const spec of LANGUAGES) {
      const p = getRecipe(spec.id).plan(spec.hello, resolveLimits(getRecipe(spec.id).defaults));
      if (isRejection(p)) continue;
      for (const c of [p.compile, p.run]) {
        if (!c) continue;
        assert.ok(!["sh", "bash", "dash"].includes(c.argv[0]) || spec.id === "bash", `${spec.id} runs ${c.argv[0]}`);
      }
    }
  });
  test("version parsing", () => {
    assert.equal(formatVersion("python", "Python 3.12.3\n"), "Python 3.12.3");
    assert.equal(formatVersion("javascript", "v22.23.3\n"), "Node.js 22.23.3");
    assert.equal(formatVersion("java", 'openjdk version "21.0.12.1" 2026-08-18\nOpenJDK Runtime'), "OpenJDK 21.0.12.1");
    assert.equal(formatVersion("c", "gcc (Ubuntu 13.3.0-6ubuntu2~24.04.1) 13.3.0\nCopyright"), "GCC 13.3.0");
    assert.equal(formatVersion("rust", "rustc 1.75.0 (82e1608df 2023-12-21)"), "Rust 1.75.0");
    assert.equal(formatVersion("go", "go version go1.22.2 linux/amd64"), "Go 1.22.2");
  });
});

describe("output capture", () => {
  test("keeps the first keepBytes, counts everything, reports the kill cap", () => {
    const c = new OutputCollector(10, 25);
    assert.equal(c.push(Buffer.from("hello")), false);
    assert.equal(c.push(Buffer.from("world!!!")), false);
    assert.equal(c.text(), "helloworld");
    assert.equal(c.total, 13);
    assert.equal(c.truncated, true);
    assert.equal(c.push(Buffer.alloc(13, 0x61)), true);
    assert.equal(c.exceededKillCap, true);
    assert.equal(c.total, 26);
  });
  test("not truncated when everything fits", () => {
    const c = new OutputCollector(100, 1000);
    c.push(Buffer.from("abc"));
    assert.equal(c.truncated, false);
    assert.equal(c.text(), "abc");
  });
  test("a cut inside a multi-byte character is trimmed, invalid bytes are replaced", () => {
    const c = new OutputCollector(4, 100);
    c.push(Buffer.from("abé€")); // a b (2 bytes) (3 bytes): cut after 4 bytes lands inside "€"
    assert.equal(c.text(), "abé");
    const bad = new OutputCollector(100, 1000);
    bad.push(Buffer.from([0x61, 0xff, 0x62]));
    assert.equal(bad.text(), "a�b");
    assert.equal(completeUtf8Length(Buffer.from("é")), 2);
    assert.equal(completeUtf8Length(Buffer.from("€").subarray(0, 2)), 0);
  });
  test("memory stays bounded however much is printed", () => {
    const c = new OutputCollector(1024, 1 << 30);
    for (let i = 0; i < 2000; i++) c.push(Buffer.alloc(4096, 0x78));
    assert.equal(c.text().length, 1024);
    assert.equal(c.total, 2000 * 4096);
  });
});

describe("status mapping", () => {
  const ctx = { step: "run", timeoutMs: 5000, memoryMb: 256, outputKillBytes: 1024 * 1024 } as const;
  const f = { exitCode: 0, timedOut: false, outputLimit: false, oomKilled: false };
  test("ok / runtime_error / signals", () => {
    assert.equal(classifyStep(f, ctx).status, "ok");
    const e = classifyStep({ ...f, exitCode: 3 }, ctx);
    assert.equal(e.status, "runtime_error");
    assert.match(e.message ?? "", /code 3/);
    const s = classifyStep({ ...f, exitCode: 139 }, ctx);
    assert.equal(s.status, "runtime_error");
    assert.equal(s.signal, "SIGSEGV");
    assert.equal(signalFromExitCode(134), "SIGABRT");
    assert.equal(signalFromExitCode(1), null);
    assert.equal(signalFromExitCode(128), null);
    assert.equal(signalFromExitCode(null), null);
  });
  test("timeout, output limit and OOM, in priority order", () => {
    assert.equal(classifyStep({ ...f, exitCode: null, timedOut: true }, ctx).message, "Time limit exceeded (5s)");
    assert.equal(classifyStep({ ...f, exitCode: 137, oomKilled: true }, ctx).status, "memory_limit");
    assert.equal(classifyStep({ ...f, exitCode: 137, oomKilled: true, timedOut: true }, ctx).status, "memory_limit");
    assert.equal(classifyStep({ ...f, exitCode: null, outputLimit: true, timedOut: true, oomKilled: true }, ctx).status, "output_limit");
    assert.match(classifyStep({ ...f, outputLimit: true }, ctx).message ?? "", /1 MiB/);
  });
  test("compile step: non-zero is compile_error; timeouts keep their own status", () => {
    const c = { ...ctx, step: "compile", timeoutMs: 10_000 } as const;
    assert.equal(classifyStep({ ...f, exitCode: 1 }, c).status, "compile_error");
    assert.equal(classifyStep({ ...f, exitCode: 139 }, c).status, "compile_error");
    assert.match(classifyStep({ ...f, exitCode: null, timedOut: true }, c).message ?? "", /Compilation time limit exceeded \(10s\)/);
  });
  test("the verdict never depends on program output (it is not even an input)", () => {
    assert.deepEqual(Object.keys(f).sort(), ["exitCode", "oomKilled", "outputLimit", "timedOut"]);
  });
});

describe("configuration", () => {
  const env = (o: Record<string, string> = {}) => ({ RUNNER_SECRET: "x".repeat(32), ...o });
  test("refuses to start without a strong secret, never echoing it", () => {
    assert.throws(() => loadConfig({}), ConfigError);
    assert.throws(() => loadConfig({ RUNNER_SECRET: "x".repeat(31) }), (e: unknown) => e instanceof ConfigError && !String(e.message).includes("xxxx"));
    assert.doesNotThrow(() => loadConfig(env()));
  });
  test("defaults", () => {
    const c = loadConfig(env());
    assert.equal(c.host, "127.0.0.1");
    assert.equal(c.port, 4242);
    assert.equal(c.image, "imbegnal-runner:full");
    assert.equal(c.maxConcurrency, 4);
    assert.equal(c.queueMax, 16);
    assert.equal(c.dockerRuntime, null);
  });
  test("overrides and validation", () => {
    const c = loadConfig(env({ RUNNER_MAX_CONCURRENCY: "2", RUNNER_QUEUE_MAX: "0", RUNNER_DOCKER_RUNTIME: "runsc", RUNNER_LANGS: "python, c" }));
    assert.equal(c.maxConcurrency, 2);
    assert.equal(c.queueMax, 0);
    assert.equal(c.dockerRuntime, "runsc");
    assert.deepEqual([...c.enabledLangs], ["python", "c"]);
    for (const bad of <Record<string, string>[]>[{ RUNNER_PORT: "x" }, { RUNNER_MAX_CONCURRENCY: "0" }, { RUNNER_IMAGE: "bad image; rm" }, { RUNNER_DOCKER_RUNTIME: "a b" }, { RUNNER_LANGS: "cobol" }, { RUNNER_LOG_LEVEL: "loud" }]) {
      assert.throws(() => loadConfig(env(bad)), ConfigError, JSON.stringify(bad));
    }
  });
});

describe("docker create flags", () => {
  const base = {
    name: containerName("job-12345678"),
    jobId: "job-12345678",
    memoryMb: 256,
    cpus: 1,
    pids: 64,
    tmpfsMb: 64,
    fsizeBytes: 64 * 1024 * 1024,
    cpuSeconds: 20,
    image: "imbegnal-runner:slim",
    runtime: null,
    owner: "owner1",
    extraLabels: [] as string[],
  };
  const args = buildCreateArgs(base);
  const pair = (flag: string, value: string) => args.some((a, i) => a === flag && args[i + 1] === value);

  test("every isolation flag is present", () => {
    assert.ok(pair("--network", "none"));
    assert.ok(args.includes("--read-only"));
    assert.ok(pair("--user", "65534:65534"));
    assert.ok(pair("--cap-drop", "ALL"));
    assert.ok(pair("--security-opt", "no-new-privileges"));
    assert.ok(pair("--pids-limit", "64"));
    assert.ok(pair("--memory", "256m"));
    assert.ok(pair("--memory-swap", "256m"));
    assert.ok(pair("--cpus", "1"));
    assert.ok(pair("--label", "imbegnal.runner=1"));
    assert.ok(pair("--stop-timeout", "0"));
    assert.ok(pair("--pull", "never"));
    assert.ok(args.includes("--init"));
    for (const u of ["nofile=1024:1024", "core=0:0"]) assert.ok(pair("--ulimit", u), u);
    assert.ok(args.some((a) => a.startsWith("fsize=")));
    assert.ok(args.some((a) => a.startsWith("nproc=")));
  });
  test("tmpfs work dir is size-capped and allows exec", () => {
    const t = args.filter((a, i) => args[i - 1] === "--tmpfs");
    assert.equal(t.length, 2);
    assert.ok(t[0].startsWith("/work:") && t[0].includes("size=64m") && t[0].includes("exec") && t[0].includes("nosuid"));
  });
  test("nothing dangerous is ever requested", () => {
    for (const bad of ["--privileged", "--cap-add", "--volume", "-v", "--mount", "--network=host", "--pid", "--ipc", "--device", "--userns", "--security-opt=seccomp=unconfined"]) {
      assert.ok(!args.some((a) => a === bad || a.startsWith(`${bad}=`)), bad);
    }
    assert.ok(!args.some((a) => /docker\.sock|unconfined|seccomp/i.test(a)));
    assert.ok(!args.some((a) => a === "/"));
  });
  test("environment is fixed and clean", () => {
    const envs = args.filter((a, i) => args[i - 1] === "-e");
    assert.deepEqual(envs.map((e) => e.split("=")[0]).sort(), ["HOME", "LANG", "PATH", "TMPDIR"]);
    assert.ok(envs.includes("HOME=/work") && envs.includes("TMPDIR=/work/tmp"));
  });
  test("runtime and extra labels are opt-in; image and command come last", () => {
    const r = buildCreateArgs({ ...base, runtime: "runsc", extraLabels: ["imbegnal.test=1"] });
    assert.ok(r.some((a, i) => a === "--runtime" && r[i + 1] === "runsc"));
    assert.ok(r.some((a, i) => a === "--label" && r[i + 1] === "imbegnal.test=1"));
    assert.ok(!args.includes("--runtime"));
    assert.deepEqual(r.slice(-3), ["imbegnal-runner:slim", "sleep", "infinity"]);
  });
  test("the docker CLI never inherits the runner's secrets", () => {
    const e = cliEnvironment(null, { PATH: "/bin", HOME: "/h", RUNNER_SECRET: "topsecret", AWS_SECRET_ACCESS_KEY: "k" });
    assert.deepEqual(Object.keys(e).sort(), ["HOME", "PATH"]);
    assert.equal(cliEnvironment("unix:///x.sock", {}).DOCKER_HOST, "unix:///x.sock");
  });
});

describe("structured logging", () => {
  test("only allow-listed scalar fields get through, control characters are stripped", () => {
    const rec = buildRecord("info", "job finished", {
      jobId: "abc",
      status: "ok",
      code: "line1\nline2",
      // fields outside the allow-list must be dropped even if a caller sneaks them in
      stdin: "SECRET-INPUT",
      stdout: "SECRET-OUTPUT",
      source: "SECRET-CODE",
    });
    const line = JSON.stringify(rec);
    assert.ok(!line.includes("SECRET"));
    assert.equal(rec.code, "line1 line2");
    assert.equal(rec.jobId, "abc");
  });
  test("level filtering", () => {
    const out: string[] = [];
    const log = createLogger({ level: "warn", sink: (l) => out.push(l) });
    log.info("hidden");
    log.warn("shown");
    assert.equal(out.length, 1);
    assert.equal(JSON.parse(out[0]).msg, "shown");
  });
});

describe("slot queue", () => {
  test("never exceeds max running; FIFO; refuses beyond the queue", async () => {
    const q = new SlotQueue(2, 2, 5000);
    const a = await q.acquire();
    const b = await q.acquire();
    assert.equal(q.runningCount, 2);
    const order: string[] = [];
    const c = q.acquire().then((s) => (order.push("c"), s));
    const d = q.acquire().then((s) => (order.push("d"), s));
    await assert.rejects(q.acquire(), (e: unknown) => e instanceof BusyError && e.reason === "queue_full");
    assert.equal(q.queuedCount, 2);
    a.release();
    const cs = await c;
    assert.equal(q.runningCount, 2);
    b.release();
    const ds = await d;
    assert.deepEqual(order, ["c", "d"]);
    cs.release();
    ds.release();
    assert.equal(q.runningCount, 0);
  });
  test("a double release does not free two slots", async () => {
    const q = new SlotQueue(1, 0, 100);
    const a = await q.acquire();
    a.release();
    a.release();
    const b = await q.acquire();
    await assert.rejects(q.acquire(), BusyError);
    b.release();
  });
  test("waiting too long is busy; close rejects waiters", async () => {
    const q = new SlotQueue(1, 5, 50);
    const a = await q.acquire();
    await assert.rejects(q.acquire(), (e: unknown) => e instanceof BusyError && e.reason === "wait_timeout");
    const w = q.acquire();
    q.close();
    await assert.rejects(w, BusyError);
    a.release();
  });
  test("an aborted waiter leaves the queue", async () => {
    const q = new SlotQueue(1, 5, 5000);
    const a = await q.acquire();
    const ac = new AbortController();
    const w = q.acquire({ signal: ac.signal });
    ac.abort();
    await assert.rejects(w, BusyError);
    assert.equal(q.queuedCount, 0);
    a.release();
  });
});
