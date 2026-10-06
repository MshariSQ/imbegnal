/**
 * Service behaviour against the real daemon: concurrency and queueing, the orphan reaper,
 * graceful shutdown, language availability, runtime selection and log hygiene.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { after, describe, test } from "node:test";
import { JOB_PATH } from "../src/docker";
import { RUNNER_PATHS, type LanguagesResponse, type RunResult } from "../../shared/protocol";
import { LANG_IDS, getLanguage, type LangId } from "../../shared/languages";
import { SKIP, TEST_IMAGE, ownedContainers, run, signedFetch, sleep, startServer, type TestServer } from "./helpers";

const servers: TestServer[] = [];
async function server(env: Record<string, string> = {}, label?: string): Promise<TestServer> {
  const s = await startServer({ env, label });
  servers.push(s);
  return s;
}
after(async () => {
  await Promise.all(servers.map((s) => s.close()));
});

async function postRun(srv: TestServer, lang: string, code: string): Promise<{ status: number; json: unknown }> {
  const body = JSON.stringify({ jobId: randomUUID(), lang, code, stdin: "" });
  return signedFetch(srv, RUNNER_PATHS.run, { body });
}

describe("concurrency and queue", { skip: SKIP }, () => {
  test("never more containers than RUNNER_MAX_CONCURRENCY, every queued job completes", async () => {
    const srv = await server({ RUNNER_MAX_CONCURRENCY: "2", RUNNER_QUEUE_MAX: "8" });
    let peak = 0;
    let stop = false;
    const poller = (async () => {
      while (!stop) {
        peak = Math.max(peak, ownedContainers(srv).length);
        await sleep(50);
      }
    })();
    const results = await Promise.all(Array.from({ length: 6 }, (_, i) => run(srv, "bash", `sleep 0.8; echo job${i}`)));
    stop = true;
    await poller;
    assert.deepEqual(results.map((r) => r.status), Array(6).fill("ok"));
    assert.deepEqual(results.map((r) => r.stdout).sort(), ["job0\n", "job1\n", "job2\n", "job3\n", "job4\n", "job5\n"]);
    assert.ok(peak >= 2, `expected the two slots to be used at once, peak ${peak}`);
    assert.ok(peak <= 2, `peak containers ${peak} exceeded RUNNER_MAX_CONCURRENCY=2`);
    assert.equal(srv.service.slots.runningCount, 0);
    assert.equal(srv.service.slots.queuedCount, 0);
    assert.deepEqual(ownedContainers(srv), []);
  });

  test("overflow beyond the queue -> 503 busy; the refused job may be retried", async () => {
    const srv = await server({ RUNNER_MAX_CONCURRENCY: "1", RUNNER_QUEUE_MAX: "1" });
    const slow = (n: number) => postRun(srv, "bash", `sleep 2; echo ${n}`);
    const first = slow(1);
    await sleep(300);
    const second = slow(2); // waits in the queue
    await sleep(300);
    const third = await slow(3); // no room
    assert.equal(third.status, 503);
    assert.deepEqual(third.json, { error: "busy" });
    const [a, b] = await Promise.all([first, second]);
    assert.equal(a.status, 200);
    assert.equal(b.status, 200);
    assert.equal((a.json as RunResult).status, "ok");
    assert.equal((b.json as RunResult).status, "ok");
    // Same jobId again after the refusal works (a refused job does not burn its id).
    const jobId = randomUUID();
    const body = JSON.stringify({ jobId, lang: "bash", code: "echo retry", stdin: "" });
    const hold = slow(4);
    await sleep(300);
    const hold2 = slow(5);
    await sleep(300);
    assert.equal((await signedFetch(srv, RUNNER_PATHS.run, { body })).status, 503);
    await Promise.all([hold, hold2]);
    const retried = await signedFetch(srv, RUNNER_PATHS.run, { body });
    assert.equal(retried.status, 200);
    assert.equal((retried.json as RunResult).stdout, "retry\n");
  });

  test("waiting longer than RUNNER_QUEUE_TIMEOUT_MS -> 503 busy", async () => {
    const srv = await server({ RUNNER_MAX_CONCURRENCY: "1", RUNNER_QUEUE_MAX: "4", RUNNER_QUEUE_TIMEOUT_MS: "500" });
    const hold = postRun(srv, "bash", "sleep 2");
    await sleep(300);
    const waited = await postRun(srv, "bash", "echo late");
    assert.equal(waited.status, 503);
    await hold;
  });
});

describe("orphan reaper", { skip: SKIP }, () => {
  const create = (name: string, label: string, extra: string[] = []) =>
    execFileSync("docker", ["create", "--name", name, "--label", "imbegnal.runner=1", "--label", label, "--network", "none", ...extra, TEST_IMAGE, "sleep", "infinity"], { encoding: "utf8" }).trim();
  const exists = (name: string) => spawnSync("docker", ["inspect", name], { encoding: "utf8" }).status === 0;
  const cleanup = (...names: string[]) => spawnSync("docker", ["rm", "-f", ...names], { encoding: "utf8" });

  test("removes a stale labelled container this process does not own, keeps young and foreign ones", async () => {
    const label = `imbegnal.test=reap-${randomUUID().slice(0, 8)}`;
    const stale = `imb-run-stale-${randomUUID().slice(0, 8)}`;
    const young = `imb-run-young-${randomUUID().slice(0, 8)}`;
    const unlabelled = `imb-test-foreign-${randomUUID().slice(0, 8)}`;
    try {
      create(stale, label);
      execFileSync("docker", ["create", "--name", unlabelled, "--network", "none", TEST_IMAGE, "sleep", "infinity"]);
      const srv = await server({ RUNNER_REAP_AGE_MS: "2000", RUNNER_REAP_INTERVAL_MS: "3600000" }, label);
      await sleep(2200);
      create(young, label);
      const removed = await srv.service.reaper.reapOnce();
      assert.equal(removed, 1);
      assert.equal(exists(stale), false, "stale orphan must be removed");
      assert.equal(exists(young), true, "a young container may belong to a job in flight");
      assert.equal(exists(unlabelled), true, "containers without the runner label are never touched");
    } finally {
      cleanup(stale, young, unlabelled);
    }
  });

  test("sweeps at start-up", async () => {
    const label = `imbegnal.test=reap-${randomUUID().slice(0, 8)}`;
    const stale = `imb-run-boot-${randomUUID().slice(0, 8)}`;
    try {
      create(stale, label, ["--label", "imbegnal.owner=dead-process"]);
      await sleep(1200);
      await server({ RUNNER_REAP_AGE_MS: "1000", RUNNER_REAP_INTERVAL_MS: "3600000" }, label);
      assert.equal(exists(stale), false);
    } finally {
      cleanup(stale);
    }
  });

  test("the periodic reaper runs on its own and never touches a running job", async () => {
    const srv = await server({ RUNNER_REAP_AGE_MS: "1000", RUNNER_REAP_INTERVAL_MS: "300" });
    const stale = `imb-run-tick-${randomUUID().slice(0, 8)}`;
    try {
      create(stale, srv.label);
      const job = await run(srv, "bash", "sleep 2.5; echo survived", { limits: { runTimeoutMs: 8000 } });
      assert.equal(job.status, "ok", "a job older than the reap age must not be reaped while its owner runs it");
      assert.equal(job.stdout, "survived\n");
      assert.equal(exists(stale), false, "the timer must have removed the orphan meanwhile");
    } finally {
      cleanup(stale);
    }
  });
});

describe("shutdown", { skip: SKIP }, () => {
  test("running jobs finish within the grace period, then the server stops and no container is left", async () => {
    const srv = await startServer({ env: { RUNNER_SHUTDOWN_GRACE_MS: "10000" } });
    const job = postRun(srv, "bash", "sleep 1.5; echo finished");
    for (let i = 0; i < 50 && ownedContainers(srv).length === 0; i++) await sleep(100);
    const closing = srv.close();
    await sleep(100);
    // New work is refused while draining...
    const refused = await fetch(`${srv.baseUrl}/healthz`).then((r) => r.status).catch(() => "refused");
    assert.ok(refused === 503 || refused === "refused", `healthz while draining: ${refused}`);
    const res = await job;
    assert.equal(res.status, 200);
    assert.equal((res.json as RunResult).stdout, "finished\n");
    await closing;
    assert.deepEqual(ownedContainers(srv), []);
    await assert.rejects(fetch(`${srv.baseUrl}/healthz`));
  });

  test("jobs still running after the grace period are killed and their containers removed", async () => {
    const srv = await startServer({ env: { RUNNER_SHUTDOWN_GRACE_MS: "500" } });
    const job = postRun(srv, "bash", "sleep 60").catch(() => ({ status: 0, json: null }));
    for (let i = 0; i < 50 && ownedContainers(srv).length === 0; i++) await sleep(100);
    assert.equal(ownedContainers(srv).length, 1);
    const t0 = Date.now();
    await srv.close();
    assert.ok(Date.now() - t0 < 8000, "shutdown must not wait for the job's own limit");
    assert.deepEqual(ownedContainers(srv), []);
    await job;
  });
});

describe("language availability", { skip: SKIP }, () => {
  /** A language whose compiler is not in the test image (slim lacks go, rust, ...). */
  function missingLang(): LangId | null {
    for (const id of ["swift", "kotlin", "csharp", "rust", "go", "ruby", "php"] as const) {
      const bin = { swift: "swiftc", kotlin: "kotlinc", csharp: "mcs", rust: "rustc", go: "go", ruby: "ruby", php: "php" }[id];
      const r = spawnSync("docker", ["run", "--rm", "--network", "none", "-e", `PATH=${JOB_PATH}`, "--entrypoint", "sh", TEST_IMAGE, "-c", `command -v ${bin}`], { encoding: "utf8" });
      if (r.status !== 0) return id;
    }
    return null;
  }

  test("smoke tests report available + version; missing toolchains are unavailable and answer `unsupported`", async () => {
    const missing = missingLang();
    const langs: LangId[] = ["python", "javascript", "c", "bash", ...(missing ? [missing] : [])];
    const srv = await server({ RUNNER_SMOKE_ON_START: "1", RUNNER_LANGS: langs.join(",") });
    await srv.service.ready;
    const r = await signedFetch(srv, RUNNER_PATHS.languages);
    assert.equal(r.status, 200);
    const j = r.json as LanguagesResponse;
    assert.deepEqual(j.languages.map((l) => l.id), [...LANG_IDS]);
    const by = Object.fromEntries(j.languages.map((l) => [l.id, l]));
    assert.equal(by.python.available, true);
    assert.match(by.python.version ?? "", /^Python 3\.\d+\.\d+$/);
    assert.match(by.javascript.version ?? "", /^Node\.js \d+\.\d+\.\d+$/);
    assert.match(by.c.version ?? "", /^GCC \d+\.\d+/);
    assert.match(by.bash.version ?? "", /^Bash \d/);
    // not enabled on this runner
    assert.equal(by.java.available, false);
    assert.equal(by.java.version, undefined);
    const java = await run(srv, "java", getLanguage("java")?.hello ?? "");
    assert.equal(java.status, "unsupported");
    if (missing) {
      assert.equal(by[missing].available, false, `${missing} is not installed`);
      const u = await run(srv, missing, getLanguage(missing)?.hello ?? "");
      assert.equal(u.status, "unsupported");
      assert.match(u.message ?? "", /not available/);
      assert.equal(u.stdout, "");
    }
    // an available language still runs
    assert.equal((await run(srv, "python", 'print("ok")')).stdout, "ok\n");
  });

  test("results are cached: a second /v1/languages does not re-run the smoke tests", async () => {
    const srv = await server({ RUNNER_SMOKE_ON_START: "1", RUNNER_LANGS: "python", RUNNER_AVAILABILITY_TTL_MS: "60000" });
    await srv.service.ready;
    await signedFetch(srv, RUNNER_PATHS.languages);
    await signedFetch(srv, RUNNER_PATHS.languages);
    const finished = srv.logs.filter((l) => JSON.parse(l).msg === "language smoke tests finished");
    assert.equal(finished.length, 1);
    assert.deepEqual(ownedContainers(srv), []);
  });

  test("smoke tests respect RUNNER_MAX_CONCURRENCY", async () => {
    const srv = await server({ RUNNER_SMOKE_ON_START: "1", RUNNER_LANGS: "python,javascript,bash,c,cpp,java", RUNNER_MAX_CONCURRENCY: "1" });
    let peak = 0;
    let stop = false;
    const poller = (async () => {
      while (!stop) {
        peak = Math.max(peak, ownedContainers(srv).length);
        await sleep(50);
      }
    })();
    await srv.service.ready;
    stop = true;
    await poller;
    assert.ok(peak <= 1, `smoke peak ${peak}`);
  });
});

describe("runtime selection", { skip: SKIP }, () => {
  test("RUNNER_DOCKER_RUNTIME is passed to docker (runc here; runsc/gVisor in production)", async () => {
    const srv = await server({ RUNNER_DOCKER_RUNTIME: "runc" });
    const job = run(srv, "bash", "sleep 2; echo ran");
    let name = "";
    for (let i = 0; i < 50 && !name; i++) {
      name = ownedContainers(srv, ["--filter", "status=running"])[0] ?? "";
      if (!name) await sleep(100);
    }
    const rt = execFileSync("docker", ["inspect", "--format", "{{.HostConfig.Runtime}}", name], { encoding: "utf8" }).trim();
    assert.equal(rt, "runc");
    assert.equal((await job).stdout, "ran\n");
  });

  test("an unknown runtime is an infrastructure error, not a crash", async () => {
    const srv = await server({ RUNNER_DOCKER_RUNTIME: "no-such-runtime" });
    const r = await run(srv, "python", 'print("x")');
    assert.equal(r.status, "internal_error");
    assert.ok(!JSON.stringify(r).includes("no-such-runtime"), "runtime name must not leak in the result");
    assert.deepEqual(ownedContainers(srv), []);
  });

  test("a missing image is an infrastructure error", async () => {
    const srv = await server({ RUNNER_IMAGE: "imbegnal-runner:does-not-exist" });
    const r = await run(srv, "python", 'print("x")');
    assert.equal(r.status, "internal_error");
  });
});

describe("log hygiene", { skip: SKIP }, () => {
  test("logs never contain code, stdin or program output; one structured line per job", async () => {
    const srv = await server();
    const codeMarker = `CODE_${randomUUID().replace(/-/g, "")}`;
    const stdinMarker = `STDIN_${randomUUID().replace(/-/g, "")}`;
    const outMarker = `OUT_${randomUUID().replace(/-/g, "")}`;
    const code = `import sys\n# ${codeMarker}\nsys.stdin.read()\nprint("${outMarker}")\nprint("${outMarker}", file=sys.stderr)\n`;
    const r = await run(srv, "python", code, { stdin: stdinMarker });
    assert.equal(r.stdout, `${outMarker}\n`);
    // failing runs and compile errors too
    await run(srv, "c", `int main(){ ${codeMarker}_syntax }`, { stdin: stdinMarker });
    await run(srv, "bash", `echo ${outMarker} >&2; exit 3 # ${codeMarker}`);
    const all = srv.logs.join("\n");
    for (const m of [codeMarker, stdinMarker, outMarker, srv.secret]) assert.ok(!all.includes(m), `log leaked ${m.slice(0, 8)}…`);
    const jobs = srv.logs.map((l) => JSON.parse(l) as Record<string, unknown>).filter((l) => l.msg === "job finished");
    assert.equal(jobs.length, 3);
    for (const j of jobs) {
      assert.match(String(j.jobId), /^[0-9a-f-]{36}$/);
      assert.ok(["python", "c", "bash"].includes(String(j.lang)));
      assert.equal(typeof j.totalMs, "number");
      assert.equal(typeof j.stdoutBytes, "number");
    }
    assert.deepEqual(jobs.map((j) => j.status), ["ok", "compile_error", "runtime_error"]);
  });
});
