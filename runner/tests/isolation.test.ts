/**
 * Isolation: what user code can and cannot do, proven from INSIDE real containers, plus the
 * flags of the container itself via `docker inspect`.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { after, before, describe, test } from "node:test";
import { SKIP, TEST_IMAGE, ownedContainers, run, sleep, startServer, type TestServer } from "./helpers";

const CANARY = `host-canary-${process.pid}-${Date.now()}`;

describe("isolation", { skip: SKIP }, () => {
  let srv: TestServer;
  before(async () => {
    // Values that must never be visible inside a job container.
    process.env.RUNNER_TEST_CANARY = CANARY;
    process.env.AWS_SECRET_ACCESS_KEY = `aws-${CANARY}`;
    srv = await startServer({ env: { RUNNER_MAX_CONCURRENCY: "3" } });
  });
  after(async () => {
    await srv.close();
    delete process.env.RUNNER_TEST_CANARY;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  });

  describe("network is blocked", () => {
    test("python: connect() to 1.1.1.1:80 and DNS lookup fail", async () => {
      const code = [
        "import socket",
        "s = socket.socket()",
        "s.settimeout(3)",
        "try:",
        "    s.connect(('1.1.1.1', 80)); print('CONNECTED')",
        "except OSError as e:",
        "    print('BLOCKED connect', type(e).__name__)",
        "try:",
        "    print('RESOLVED', socket.gethostbyname('example.com'))",
        "except OSError as e:",
        "    print('BLOCKED dns', type(e).__name__)",
        "import os",
        "print('IFACES', sorted(os.listdir('/sys/class/net')))",
      ].join("\n");
      const r = await run(srv, "python", code, { limits: { runTimeoutMs: 12_000 } });
      assert.equal(r.status, "ok", r.stderr);
      assert.match(r.stdout, /BLOCKED connect/);
      assert.match(r.stdout, /BLOCKED dns/);
      assert.ok(!r.stdout.includes("CONNECTED") && !r.stdout.includes("RESOLVED"));
      assert.match(r.stdout, /IFACES \['lo'\]/, "only loopback may exist");
    });

    test("node: net.connect and http.get fail", async () => {
      const code = [
        'const net = require("net"); const http = require("http");',
        'let left = 2; const done = () => { if (--left === 0) process.exit(0); };',
        'const s = net.connect({ host: "1.1.1.1", port: 80, timeout: 3000 });',
        's.on("connect", () => { console.log("CONNECTED"); done(); });',
        's.on("error", (e) => { console.log("BLOCKED net", e.code); done(); });',
        's.on("timeout", () => { console.log("BLOCKED net timeout"); s.destroy(); });',
        'http.get("http://example.com/", { timeout: 3000 }, () => { console.log("HTTP-OK"); done(); })',
        '  .on("error", (e) => { console.log("BLOCKED http", e.code); done(); })',
        '  .on("timeout", function () { console.log("BLOCKED http timeout"); this.destroy(); });',
      ].join("\n");
      const r = await run(srv, "javascript", code, { limits: { runTimeoutMs: 12_000 } });
      assert.equal(r.status, "ok", r.stderr);
      assert.match(r.stdout, /BLOCKED net/);
      assert.match(r.stdout, /BLOCKED http/);
      assert.ok(!r.stdout.includes("CONNECTED") && !r.stdout.includes("HTTP-OK"));
    });

    test("bash: /dev/tcp fails", async () => {
      const r = await run(srv, "bash", 'if timeout 3 bash -c "exec 3<>/dev/tcp/1.1.1.1/80" 2>/dev/null; then echo CONNECTED; else echo BLOCKED; fi', { limits: { runTimeoutMs: 10_000 } });
      assert.equal(r.stdout, "BLOCKED\n");
    });

    test("C: connect() returns an error", async () => {
      const code = [
        "#include <stdio.h>",
        "#include <string.h>",
        "#include <errno.h>",
        "#include <unistd.h>",
        "#include <sys/socket.h>",
        "#include <netinet/in.h>",
        "#include <arpa/inet.h>",
        "int main(void){",
        "  int fd = socket(AF_INET, SOCK_STREAM, 0);",
        "  if (fd < 0) { printf(\"BLOCKED socket %s\\n\", strerror(errno)); return 0; }",
        "  struct sockaddr_in a; memset(&a, 0, sizeof a); a.sin_family = AF_INET; a.sin_port = htons(80);",
        "  inet_pton(AF_INET, \"1.1.1.1\", &a.sin_addr);",
        "  if (connect(fd, (struct sockaddr*)&a, sizeof a) == 0) { printf(\"CONNECTED\\n\"); return 0; }",
        "  printf(\"BLOCKED connect %s\\n\", strerror(errno)); return 0; }",
      ].join("\n");
      const r = await run(srv, "c", code, { limits: { runTimeoutMs: 10_000 } });
      assert.equal(r.status, "ok", r.compileOutput);
      assert.match(r.stdout, /^BLOCKED connect (Network is unreachable|Operation not permitted)/);
    });

    test("loopback is isolated from the host's services", async () => {
      // Nothing on the host's 127.0.0.1 (including this very runner) is reachable from a job.
      const port = new URL(srv.baseUrl).port;
      const code = `import socket\ns=socket.socket();s.settimeout(2)\ntry:\n    s.connect(("127.0.0.1", ${port})); print("REACHED-HOST")\nexcept OSError as e:\n    print("BLOCKED", type(e).__name__)\n`;
      const r = await run(srv, "python", code);
      assert.match(r.stdout, /^BLOCKED/);
    });
  });

  describe("filesystem", () => {
    test("root filesystem is read-only; /work and /work/tmp are writable", async () => {
      const script = [
        'echo "w:/etc"; (echo x > /etc/x) 2>&1 | head -1',
        'echo "w:/usr"; (touch /usr/x) 2>&1 | head -1',
        'echo "w:/"; (touch /x) 2>&1 | head -1',
        'echo "w:/tmp"; (touch /tmp/x) 2>&1 | head -1',
        'echo "w:/work"; touch /work/ok && echo WRITABLE',
        'echo "w:/work/tmp"; touch /work/tmp/ok && echo WRITABLE',
        "grep -E ' / ' /proc/mounts | head -1",
        "grep -E ' /work ' /proc/mounts",
      ].join("\n");
      const r = await run(srv, "bash", script);
      assert.equal(r.status, "ok", r.stderr);
      const out = r.stdout;
      for (const p of ["/etc", "/usr", "/", "/tmp"]) {
        const block = out.split(`w:${p}\n`)[1]?.split("\nw:")[0] ?? "";
        assert.match(block, /Read-only file system/, `${p} must not be writable: ${block}`);
      }
      assert.match(out.split("w:/work\n")[1] ?? "", /^WRITABLE/);
      assert.match(out.split("w:/work/tmp\n")[1] ?? "", /^WRITABLE/);
      assert.match(out, /overlay \/ overlay ro[ ,]/, "rootfs is mounted ro");
      assert.match(out, /tmpfs \/work tmpfs rw,nosuid,nodev,[^ ]*size=65536k/, "work dir is a size-capped tmpfs");
    });

    test("compiled executables can run from /work (tmpfs allows exec)", async () => {
      const r = await run(srv, "bash", 'cp /bin/true /work/t && /work/t && echo EXEC-OK');
      assert.equal(r.stdout, "EXEC-OK\n");
    });

    test("nothing persists between two runs", async () => {
      const first = await run(srv, "bash", 'echo secret > /work/marker; echo secret > /work/tmp/marker2; mkdir -p /work/dir; echo done; ls -A /work');
      assert.match(first.stdout, /marker/);
      const second = await run(srv, "bash", "ls -A /work /work/tmp; echo; test -e /work/marker && echo LEAK1; test -e /work/tmp/marker2 && echo LEAK2; test -d /work/dir && echo LEAK3; echo checked");
      assert.ok(!second.stdout.includes("LEAK"), second.stdout);
      assert.ok(!second.stdout.includes("marker"), second.stdout);
      assert.match(second.stdout, /checked/);
    });

    test("concurrent jobs do not see each other's files", async () => {
      const [a, b] = await Promise.all([
        run(srv, "bash", "echo A > /work/who; sleep 1; cat /work/who"),
        run(srv, "bash", "echo B > /work/who; sleep 1; cat /work/who"),
      ]);
      assert.equal(a.stdout, "A\n");
      assert.equal(b.stdout, "B\n");
    });

    test("no Docker socket and no host paths are visible", async () => {
      const script = [
        "for p in /var/run/docker.sock /run/docker.sock /docker.sock /var/lib/docker /home/user /root /host /mnt/host; do",
        '  if [ -e "$p" ] && [ "$p" != /root ]; then echo "VISIBLE $p"; fi',
        "done",
        "find / -xdev \\( -name 'docker.sock' -o -name 'containerd.sock' \\) 2>/dev/null | head",
        "find /proc/self/root/ -maxdepth 1 -name 'docker.sock' 2>/dev/null",
        "ls /root 2>&1 | head -1",
        "cat /proc/self/mountinfo",
      ].join("\n");
      const r = await run(srv, "bash", script);
      assert.ok(!r.stdout.includes("VISIBLE"), r.stdout);
      assert.ok(!/docker\.sock|containerd\.sock/.test(r.stdout.replace(/\/var\/lib\/docker\/containers\/[0-9a-f]+\/(hostname|hosts|resolv\.conf)/g, "")));
      assert.match(r.stdout, /Permission denied|cannot open/i, "/root must not be listable");
      // Mounts: overlay root, standard pseudo filesystems, docker's own hostname/hosts/resolv.conf files. No host directories.
      assert.ok(!r.stdout.includes(process.cwd()), "the repository path must not be mounted");
      assert.ok(!/\/home\//.test(r.stdout.split("\n").filter((l) => / - (ext4|xfs|btrfs|virtiofs|9p|nfs|fuse)/.test(l)).join("\n")));
      const hostBinds = r.stdout.split("\n").filter((l) => / - (ext4|xfs|btrfs|virtiofs|9p|nfs|fuse|zfs)/.test(l));
      for (const l of hostBinds) {
        assert.match(l, /\/var\/lib\/docker\/containers\/[0-9a-f]+\/(hostname|hosts|resolv\.conf)|\/etc\/(hostname|hosts|resolv\.conf)|\/usr\/libexec\/docker\/docker-init \/(usr\/)?sbin\/docker-init ro,/, `unexpected host mount: ${l}`);
      }
    });

    test("setuid binaries were removed from the image", async () => {
      const r = await run(srv, "bash", "find /usr /bin /sbin /lib /opt -xdev -perm /6000 -type f 2>/dev/null | head -5; echo end");
      assert.equal(r.stdout, "end\n");
    });
  });

  describe("identity and privileges", () => {
    test("runs as uid/gid 65534 with no capabilities, no_new_privs and seccomp", async () => {
      const r = await run(srv, "bash", 'id -u; id -g; id -G; grep -E "^(CapInh|CapPrm|CapEff|CapBnd|CapAmb|NoNewPrivs|Seccomp):" /proc/self/status');
      const lines = r.stdout.split("\n");
      assert.deepEqual(lines.slice(0, 3), ["65534", "65534", "65534"]);
      for (const k of ["CapInh", "CapPrm", "CapEff", "CapBnd", "CapAmb"]) {
        assert.match(r.stdout, new RegExp(`${k}:\\s+0000000000000000`), k);
      }
      assert.match(r.stdout, /NoNewPrivs:\s+1/);
      assert.match(r.stdout, /Seccomp:\s+2/, "the default seccomp profile is applied");
    });

    test("python sees the same, and cannot regain privileges", async () => {
      const code = [
        "import os",
        "print(os.getuid(), os.geteuid(), os.getgid())",
        "for call in (lambda: os.setuid(0), lambda: os.setgid(0), lambda: os.chown('/work', 0, 0)):",
        "    try:",
        "        call(); print('PRIVILEGED')",
        "    except OSError as e:",
        "        print('denied', e.errno)",
      ].join("\n");
      const r = await run(srv, "python", code);
      assert.equal(r.stdout, "65534 65534 65534\ndenied 1\ndenied 1\ndenied 1\n");
    });

    test("mount, mknod, unshare and chroot are refused", async () => {
      const script = [
        "mount -t tmpfs none /work/tmp 2>&1 | head -1",
        "mknod /work/n c 1 3 2>&1 | head -1",
        "unshare -Ur true 2>&1 | head -1; echo unshare-rc=$?",
        "chroot /work true 2>&1 | head -1",
        "{ echo 1 > /proc/sys/kernel/panic; } 2>&1 | head -1",
        "ls /dev | tr '\\n' ' '",
      ].join("\n");
      const r = await run(srv, "bash", script);
      const lines = r.stdout.split("\n");
      assert.match(lines[0], /must be superuser|permission denied|not permitted/i);
      assert.match(lines[1], /not permitted|Permission denied/i);
      assert.match(lines[2], /unshare failed: Operation not permitted/i, "user namespaces must be refused");
      assert.equal(lines[3], "unshare-rc=0"); // rc of `head`; the refusal itself is line 2
      assert.match(lines[4], /not permitted|Permission denied/i);
      assert.match(lines[5], /Read-only file system|Permission denied/);
      assert.ok(!/\b(sda|vda|nvme|kmsg|mem|kvm|fuse)\b/.test(lines[lines.length - 1]), `unexpected devices: ${lines[lines.length - 1]}`);
    });

    test("ulimits are applied inside the container", async () => {
      const r = await run(srv, "bash", "ulimit -c; ulimit -n; ulimit -f");
      const [core, nofile, fsize] = r.stdout.trim().split("\n");
      assert.equal(core, "0");
      assert.equal(nofile, "1024");
      assert.ok(Number(fsize) > 0 && Number(fsize) <= 64 * 1024 * 2, `fsize ${fsize}`);
    });
  });

  describe("no secrets or host environment inside", () => {
    test("env, /proc/self/environ and /proc/1/environ contain nothing from the host", async () => {
      const script = [
        "env",
        "echo ---",
        "tr '\\0' '\\n' < /proc/self/environ",
        "echo ---",
        "tr '\\0' '\\n' < /proc/1/environ",
        "echo ---",
        "cat /proc/1/cmdline | tr '\\0' ' '",
      ].join("\n");
      const r = await run(srv, "bash", script);
      assert.equal(r.status, "ok", r.stderr);
      const out = r.stdout;
      assert.ok(!out.includes(srv.secret), "RUNNER_SECRET leaked");
      assert.ok(!out.includes(CANARY), "host environment leaked");
      assert.ok(!/RUNNER_|AWS_|(HTTPS?|NO|ALL)_PROXY|TOKEN|SECRET|PASSWORD/i.test(out), `suspicious variable in:\n${out}`);
      const allowed = new Set(["PATH", "HOSTNAME", "HOME", "TMPDIR", "LANG", "PWD", "SHLVL", "_", "OLDPWD", "DEBIAN_FRONTEND", "GOPROXY", "GOFLAGS", "GOTOOLCHAIN", "GOTELEMETRY", "CARGO_NET_OFFLINE", "npm_config_offline", "PYTHONDONTWRITEBYTECODE", "DOTNET_CLI_TELEMETRY_OPTOUT"]);
      const keys = out.split("\n").filter((l) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(l)).map((l) => l.split("=")[0]);
      for (const k of keys) assert.ok(allowed.has(k), `unexpected variable ${k}`);
      assert.match(out, /HOME=\/work/);
      assert.match(out, /TMPDIR=\/work\/tmp/);
      assert.match(out, /---\n.*sleep infinity/s);
    });

    test("python and node see the same clean environment", async () => {
      const py = await run(srv, "python", "import os, json; print(json.dumps(sorted(os.environ)))");
      const js = await run(srv, "javascript", "console.log(JSON.stringify(Object.keys(process.env).sort()))");
      for (const out of [py.stdout, js.stdout]) {
        assert.ok(!/RUNNER|AWS|CANARY|SECRET/.test(out), out);
      }
    });
  });

  describe("container flags (docker inspect)", () => {
    test("a live job container carries every required flag", async () => {
      // Start a long job, inspect its container while it runs.
      const job = run(srv, "bash", "sleep 4; echo done", { limits: { runTimeoutMs: 8000 } });
      let name = "";
      for (let i = 0; i < 60 && !name; i++) {
        name = ownedContainers(srv, ["--filter", "status=running"])[0] ?? "";
        if (!name) await sleep(100);
      }
      assert.match(name, /^imb-run-[0-9a-f-]{36}$/, "container is named imb-run-<jobId>");
      const info = JSON.parse(execFileSync("docker", ["inspect", name], { encoding: "utf8" }))[0] as {
        Config: { User: string; Labels: Record<string, string>; Env: string[]; Cmd: string[] };
        HostConfig: Record<string, unknown> & {
          NetworkMode: string;
          ReadonlyRootfs: boolean;
          Privileged: boolean;
          CapDrop: string[];
          CapAdd: string[] | null;
          SecurityOpt: string[];
          Memory: number;
          MemorySwap: number;
          PidsLimit: number;
          NanoCpus: number;
          Init: boolean;
          Binds: string[] | null;
          Tmpfs: Record<string, string>;
          Ulimits: { Name: string; Soft: number; Hard: number }[];
          Runtime: string;
          PidMode: string;
          IpcMode: string;
          UsernsMode: string;
          Devices: unknown[] | null;
          PublishAllPorts: boolean;
        };
        Mounts: { Type: string; Source: string; Destination: string }[];
        State: { Running: boolean };
      };
      const h = info.HostConfig;
      assert.equal(h.NetworkMode, "none");
      assert.equal(h.ReadonlyRootfs, true);
      assert.equal(h.Privileged, false);
      assert.deepEqual(h.CapDrop, ["ALL"]);
      assert.ok(!h.CapAdd || h.CapAdd.length === 0);
      assert.ok(h.SecurityOpt?.includes("no-new-privileges"));
      assert.ok(!h.SecurityOpt?.some((o) => /unconfined|seccomp=/.test(o)), "default seccomp profile only");
      // init + keeper run as 65533; every job step is `docker exec --user 65534:65534`.
      assert.equal(info.Config.User, "65533:65533");
      assert.equal(h.Memory, 256 * 1024 * 1024);
      assert.equal(h.MemorySwap, h.Memory, "swap must equal memory (no swap)");
      assert.equal(h.PidsLimit, 64);
      assert.equal(h.NanoCpus, 1_000_000_000);
      assert.equal(h.Init, true);
      assert.ok(!h.Binds || h.Binds.length === 0, "no bind mounts");
      assert.ok(!h.Devices || h.Devices.length === 0);
      assert.ok(!["host"].includes(h.PidMode) && h.PidMode === "");
      assert.notEqual(h.IpcMode, "host");
      assert.deepEqual(Object.keys(h.Tmpfs).sort(), ["/work", "/work/tmp"]);
      assert.match(h.Tmpfs["/work"], /size=64m/);
      assert.match(h.Tmpfs["/work"], /\bexec\b/);
      const ul = Object.fromEntries(h.Ulimits.map((u) => [u.Name, u]));
      for (const n of ["nofile", "nproc", "fsize", "core", "cpu"]) assert.ok(ul[n], `ulimit ${n}`);
      assert.equal(ul.core.Soft, 0);
      assert.equal(info.Config.Labels["imbegnal.runner"], "1");
      assert.match(info.Config.Labels["imbegnal.job"] ?? "", /^[0-9a-f-]{36}$/);
      assert.ok(info.Mounts.every((m) => m.Type === "tmpfs"), `only tmpfs mounts: ${JSON.stringify(info.Mounts)}`);
      assert.ok(!info.Mounts.some((m) => /docker\.sock/.test(m.Source + m.Destination)));
      assert.ok(info.Config.Env.every((e) => !/RUNNER|SECRET|CANARY|AWS/.test(e)), "no host env in the container config");
      assert.deepEqual(info.Config.Cmd, ["sleep", "infinity"]);
      assert.equal((await job).stdout, "done\n");
    });
  });

  describe("a job cannot turn its own run into a refunded infrastructure failure", () => {
    test("the container's init and keeper belong to another uid: kill attempts are denied", async () => {
      const code = [
        "import os",
        "for pid in sorted(int(p) for p in os.listdir('/proc') if p.isdigit()):",
        "    try:",
        "        comm = open('/proc/%d/comm' % pid).read().strip()",
        "    except OSError:",
        "        continue",
        "    if comm in ('sleep', 'docker-init', 'tini'):",
        "        try:",
        "            os.kill(pid, 9); print('KILLED', comm)",
        "        except PermissionError:",
        "            print('denied', comm)",
        "print('still running')",
      ].join("\n");
      const r = await run(srv, "python", code);
      assert.equal(r.status, "ok", JSON.stringify(r));
      assert.doesNotMatch(r.stdout, /KILLED/);
      assert.match(r.stdout, /denied sleep/);
      assert.match(r.stdout, /still running/);
    });

    test("kill -9 -1 reaches nothing outside the job: the container survives and the run completes", async () => {
      // kill(-1) signals every process the caller may signal except itself; the keeper belongs to
      // another uid, so nothing is killed (before the fix this stopped the container -> refund).
      const r = await run(srv, "python", "import os\nos.kill(-1, 9)\nprint('still here')\n");
      assert.equal(r.status, "ok", JSON.stringify(r));
      assert.equal(r.stdout, "still here\n");
    });

    const hasGo = !SKIP && spawnSync("docker", ["run", "--rm", "--network", "none", "--entrypoint", "sh", TEST_IMAGE, "-c", "command -v go || test -x /usr/local/go/bin/go"], { encoding: "utf8", timeout: 60_000 }).status === 0;
    test("a Go build bigger than the run memory is a charged memory_limit, not internal_error", { skip: hasGo ? false : `go not in ${TEST_IMAGE}` }, async () => {
      const code = 'package main\n\nimport "fmt"\n\nvar big = [210 << 20]byte{1: 1, 100: 2}\n\nfunc main() { fmt.Println(big[1]) }\n';
      const r = await run(srv, "go", code, { limits: { compileTimeoutMs: 20_000 } });
      assert.notEqual(r.status, "internal_error", JSON.stringify(r));
      assert.ok(["memory_limit", "runtime_error", "compile_error"].includes(r.status), r.status);
    });
  });
});
