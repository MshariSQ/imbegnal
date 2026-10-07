// Sandbox guarantees, exercised end to end through the Worker → runner path.
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { api, closeBrowser, newUser, type TestUser } from "./stack";
import type { RunApiResponse } from "../../../shared/api";

after(closeBrowser);

let user: TestUser;
async function run(lang: string, code: string, stdin = "") {
  user ??= await newUser("sandbox");
  const r = await api<RunApiResponse>("/api/lab/run", user, { body: { lang, code, stdin } });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  return r.body.result;
}

describe("sandbox · end to end", { timeout: 300_000 }, () => {
  it("rejects network calls (TCP connect and DNS)", async () => {
    const tcp = await run("python", 'import socket\ntry:\n    socket.create_connection(("1.1.1.1", 80), timeout=3)\n    print("CONNECTED")\nexcept OSError as e:\n    print("blocked:", e)\n');
    assert.doesNotMatch(tcp.stdout, /CONNECTED/);
    assert.match(tcp.stdout, /blocked:/);
    const dns = await run("python", 'import socket\ntry:\n    print(socket.gethostbyname("example.com"))\nexcept OSError as e:\n    print("blocked:", e)\n');
    assert.match(dns.stdout, /blocked:/);
    const node = await run("javascript", 'require("http").get("http://1.1.1.1/", () => console.log("CONNECTED")).on("error", (e) => console.log("blocked:", e.code));\n');
    assert.match(node.stdout, /blocked:/);
  });

  it("kills infinite loops at the time limit", async () => {
    const t0 = Date.now();
    const r = await run("python", "while True:\n    pass\n");
    assert.equal(r.status, "timeout");
    assert.ok(Date.now() - t0 < 20_000);
  });

  it("enforces the memory cap", async () => {
    const r = await run("python", "blocks = []\nwhile True:\n    blocks.append(bytearray(32 * 1024 * 1024))\n");
    assert.ok(["memory_limit", "runtime_error"].includes(r.status), r.status);
    if (r.status === "runtime_error") assert.match(r.stderr, /MemoryError/);
  });

  it("contains fork bombs and output floods", async () => {
    const fork = await run("bash", ":(){ :|:& };:\nsleep 2\necho survived\n");
    assert.notEqual(fork.status, "internal_error");
    const flood = await run("python", "while True:\n    print('x' * 1000)\n");
    assert.ok(["output_limit", "timeout"].includes(flood.status), flood.status);
    assert.ok(flood.truncated.stdout);
  });

  it("keeps nothing between runs and runs unprivileged on a read-only root", async () => {
    const write = await run("bash", "echo secret > /work/left-behind && id -u && (touch /etc/x 2>&1 || true)\n");
    assert.match(write.stdout, /^65534/m);
    assert.match(write.stdout + write.stderr, /Read-only file system|Permission denied/);
    const read = await run("bash", "ls /work/left-behind 2>&1 || echo gone\n");
    assert.match(read.stdout, /gone|No such file/);
  });
});
