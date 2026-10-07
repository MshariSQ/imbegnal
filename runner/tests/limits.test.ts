/**
 * Resource limits against the real daemon: wall-clock timeout, memory, fork bomb, output
 * flood, disk fill, and the guarantee that every container is gone afterwards.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { after, before, describe, test } from "node:test";
import { RUNNER_CEILING } from "../../shared/protocol";
import { SKIP, ownedContainers, run, sleep, startServer, type TestServer } from "./helpers";

describe("resource limits", { skip: SKIP }, () => {
  let srv: TestServer;
  before(async () => {
    srv = await startServer({ env: { RUNNER_MAX_CONCURRENCY: "2" } });
  });
  after(async () => {
    await srv.close();
  });

  const noContainersLeft = () => assert.deepEqual(ownedContainers(srv), [], "job containers must be removed");

  test("infinite loop -> timeout within limit + 2 s, container removed", async () => {
    const limit = 1500;
    const t0 = Date.now();
    const r = await run(srv, "python", "while True:\n    pass\n", { limits: { runTimeoutMs: limit } });
    const wall = Date.now() - t0;
    assert.equal(r.status, "timeout");
    assert.equal(r.exitCode, null);
    assert.equal(r.message, "Time limit exceeded (1.5s)");
    assert.ok(r.runMs >= limit, `runMs ${r.runMs}`);
    assert.ok(r.runMs <= limit + 2000, `runMs ${r.runMs} must be within limit + 2 s`);
    assert.ok(wall < limit + 6000, `whole request took ${wall} ms`);
    noContainersLeft();
  });

  test("sleeping is wall-clock time too", async () => {
    const r = await run(srv, "bash", "sleep 30", { limits: { runTimeoutMs: 1000 } });
    assert.equal(r.status, "timeout");
    assert.ok(r.runMs <= 3000);
    noContainersLeft();
  });

  test("output printed before the timeout is returned", async () => {
    const r = await run(srv, "python", 'import time\nprint("started", flush=True)\ntime.sleep(60)\n', { limits: { runTimeoutMs: 1200 } });
    assert.equal(r.status, "timeout");
    assert.equal(r.stdout, "started\n");
  });

  test("a timed-out program cannot survive in the background", async () => {
    // Detached children die with the container; nothing may be left on the host either.
    const marker = `imb-surv-${Date.now()}`;
    const r = await run(srv, "bash", `(exec -a ${marker} sleep 120) &\nsleep 60`, { limits: { runTimeoutMs: 800 } });
    assert.equal(r.status, "timeout");
    await sleep(500);
    const ps = execFileSync("ps", ["-eo", "args"], { encoding: "utf8" });
    assert.ok(!ps.includes(marker), "background process leaked to the host");
    noContainersLeft();
  });

  test("compile step has its own time limit", async () => {
    const r = await run(srv, "typescript", 'console.log("x")', { limits: { compileTimeoutMs: 1000 } });
    assert.equal(r.status, "timeout");
    assert.match(r.message ?? "", /^Compilation time limit exceeded \(1s\)$/);
    assert.equal(r.runMs, 0);
    assert.ok(r.compileMs >= 1000 && r.compileMs <= 3500, `compileMs ${r.compileMs}`);
    noContainersLeft();
  });

  test("memory bomb (python) -> memory_limit", async () => {
    const r = await run(srv, "python", "a = []\nwhile True:\n    a.append(bytearray(10_000_000))\n", { limits: { memoryMb: 64, runTimeoutMs: 10_000 } });
    assert.equal(r.status, "memory_limit", `${r.status} ${r.message} ${r.stderr}`);
    assert.match(r.message ?? "", /Memory limit exceeded \(64 MB\)/);
    noContainersLeft();
  });

  test("memory bomb (C, one huge touch) -> memory_limit", async () => {
    const code = "#include <stdlib.h>\nint main(void){size_t n=900u*1024*1024;volatile char*p=malloc(n);if(!p)return 3;for(size_t i=0;i<n;i+=4096)p[i]=1;return 0;}\n";
    const r = await run(srv, "c", code, { limits: { memoryMb: 128 } });
    assert.equal(r.status, "memory_limit", `${r.status} exit ${r.exitCode}`);
    noContainersLeft();
  });

  test("filling the work directory fails cleanly instead of eating host memory", async () => {
    const r = await run(srv, "bash", "dd if=/dev/zero of=/work/big bs=1M count=500 2>&1 | tail -1; echo rc=$?", { limits: { runTimeoutMs: 10_000 } });
    assert.ok(["ok", "runtime_error", "memory_limit"].includes(r.status), r.status);
    assert.ok(!r.stdout.includes("500 MB"), "500 MB must not fit in a 64 MB work dir");
    noContainersLeft();
  });

  test("fork bomb is contained: bounded process count, host unaffected, container removed", async () => {
    const code = [
      "import os, time",
      "pids = []",
      "for _ in range(1000):",
      "    try:",
      "        pid = os.fork()",
      "    except OSError:",
      "        break",
      "    if pid == 0:",
      "        time.sleep(30)",
      "        os._exit(0)",
      "    pids.append(pid)",
      "print('forked', len(pids), flush=True)",
      "time.sleep(30)",
    ].join("\n");
    const before = execFileSync("ps", ["-e", "--no-headers"], { encoding: "utf8" }).split("\n").length;
    const r = await run(srv, "python", code, { limits: { runTimeoutMs: 2500 } });
    assert.equal(r.status, "timeout");
    const m = /forked (\d+)/.exec(r.stdout);
    assert.ok(m, `no fork count in ${JSON.stringify(r.stdout)}`);
    assert.ok(Number(m[1]) < 64, `forked ${m[1]} children, pids limit is 64`);
    await sleep(800);
    const after = execFileSync("ps", ["-e", "--no-headers"], { encoding: "utf8" }).split("\n").length;
    assert.ok(Math.abs(after - before) < 25, `host process count moved from ${before} to ${after}`);
    noContainersLeft();
    // and the runner still serves
    assert.equal((await run(srv, "python", 'print("alive")')).stdout, "alive\n");
  });

  test("classic bash fork bomb is contained", async () => {
    const r = await run(srv, "bash", ":(){ :|:& };:\nsleep 30", { limits: { runTimeoutMs: 2500 } });
    assert.ok(["timeout", "runtime_error", "ok"].includes(r.status), r.status);
    await sleep(500);
    noContainersLeft();
    assert.equal((await run(srv, "bash", "echo alive")).stdout, "alive\n");
  });

  test("infinite printing -> output_limit with truncated output", async () => {
    const r = await run(srv, "python", 'import sys\nwhile True:\n    sys.stdout.write("x" * 1000 + "\\n")\n', { limits: { runTimeoutMs: 15_000 } });
    assert.equal(r.status, "output_limit");
    assert.equal(r.truncated.stdout, true);
    assert.equal(r.stdout.length, RUNNER_CEILING.outputKeepBytes);
    assert.ok(r.stdoutBytes > RUNNER_CEILING.outputKillBytes);
    assert.ok(r.runMs < 10_000, `took ${r.runMs} ms`);
    assert.match(r.message ?? "", /Output limit exceeded/);
    noContainersLeft();
  });

  test("a stderr flood is capped too", async () => {
    const r = await run(srv, "python", 'import sys\nwhile True:\n    sys.stderr.write("e" * 1000 + "\\n")\n', { limits: { runTimeoutMs: 15_000 } });
    assert.equal(r.status, "output_limit");
    assert.equal(r.truncated.stderr, true);
    assert.equal(r.stderr.length, RUNNER_CEILING.outputKeepBytes);
    noContainersLeft();
  });

  test("one huge write is capped as well", async () => {
    const r = await run(srv, "c", '#include <stdio.h>\nint main(void){for(int i=0;i<5*1024;i++){static char b[1024];for(int j=0;j<1024;j++)b[j]=\'a\';fwrite(b,1,1024,stdout);}return 0;}\n');
    assert.equal(r.status, "output_limit");
    assert.equal(r.stdout.length, RUNNER_CEILING.outputKeepBytes);
  });

  test("output between the keep cap and the kill cap is truncated but still ok", async () => {
    const r = await run(srv, "python", 'import sys\nsys.stdout.write("y" * 200_000)\n');
    assert.equal(r.status, "ok");
    assert.equal(r.stdoutBytes, 200_000);
    assert.equal(r.stdout.length, RUNNER_CEILING.outputKeepBytes);
    assert.equal(r.truncated.stdout, true);
    assert.equal(r.truncated.stderr, false);
  });

  test("multi-byte output cut at the cap does not produce a broken character", async () => {
    const r = await run(srv, "python", 'import sys\nsys.stdout.write("€" * 30_000)\n');
    assert.equal(r.status, "ok");
    assert.ok(!r.stdout.includes("\uFFFD"));
    assert.equal(r.stdoutBytes, 90_000);
  });

  test("callers can lower but never raise limits", async () => {
    // Raising memory above the ceiling is a 400; asking for the maximum still gets the language default.
    const r = await run(srv, "python", "import time\nwhile True: pass", { limits: { runTimeoutMs: RUNNER_CEILING.runTimeoutMs } });
    assert.equal(r.status, "timeout");
    assert.match(r.message ?? "", /\(5s\)/); // python's default, not the 15 s ceiling
  });

  test("client disconnect kills the job and removes the container", async () => {
    const ac = new AbortController();
    const { sign } = await import("../src/auth");
    const body = JSON.stringify({ jobId: crypto.randomUUID(), lang: "bash", code: "sleep 30", stdin: "" });
    const ts = String(Date.now());
    const p = fetch(`${srv.baseUrl}/v1/run`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-imb-timestamp": ts, "x-imb-signature": sign(srv.secret, ts, body) },
      body,
      signal: ac.signal,
    }).catch(() => null);
    for (let i = 0; i < 50 && ownedContainers(srv).length === 0; i++) await sleep(100);
    assert.equal(ownedContainers(srv).length, 1, "job container should be running");
    ac.abort();
    await p;
    for (let i = 0; i < 80 && ownedContainers(srv).length > 0; i++) await sleep(100);
    noContainersLeft();
  });
});
