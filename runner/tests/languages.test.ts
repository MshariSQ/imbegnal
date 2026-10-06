/**
 * Language behaviour against the real image: Hello World per language, stdout/stderr
 * separation, stdin, exit codes, compile diagnostics. Languages whose toolchain is not in the
 * test image are skipped with a message, so the same suite works for slim and full images.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { after, before, describe, test } from "node:test";
import { LANGUAGES, type LangId } from "../../shared/languages";
import { getRecipe } from "../src/languages";
import { SKIP, TEST_IMAGE, run, startServer, type TestServer } from "./helpers";

/** Which toolchains exist in the image: one throw-away container, `command -v` per recipe binary. */
function installedLanguages(): Set<LangId> {
  const probes = LANGUAGES.map((l) => `${l.id}:${getRecipe(l.id).versionArgv[0]}`);
  // Fixed script, values come from our own recipes (never from a user).
  const script = `for p in ${probes.join(" ")}; do b="\${p#*:}"; command -v "$b" >/dev/null 2>&1 && echo "\${p%%:*}"; done`;
  const r = spawnSync("docker", ["run", "--rm", "--network", "none", "--entrypoint", "sh", TEST_IMAGE, "-c", script], { encoding: "utf8", timeout: 60_000 });
  const found = new Set<LangId>();
  for (const line of r.stdout.split("\n")) if (line.trim()) found.add(line.trim() as LangId);
  return found;
}

const have = SKIP ? new Set<LangId>() : installedLanguages();
const needs = (...langs: LangId[]): string | false => {
  if (SKIP) return SKIP;
  const missing = langs.filter((l) => !have.has(l));
  return missing.length ? `skipped: ${missing.join(", ")} not in image ${TEST_IMAGE}` : false;
};

describe("languages", { skip: SKIP }, () => {
  let srv: TestServer;
  before(async () => {
    srv = await startServer({ env: { RUNNER_MAX_CONCURRENCY: "4" } });
  });
  after(async () => {
    await srv.close();
  });

  describe("Hello World", () => {
    for (const spec of LANGUAGES) {
      test(spec.label, { skip: needs(spec.id) }, async () => {
        const r = await run(srv, spec.id, spec.hello);
        assert.equal(r.status, "ok", `${r.status}: ${r.message} ${r.compileOutput ?? ""} ${r.stderr}`);
        assert.equal(r.stdout, "Hello, World!\n");
        assert.equal(r.stderr, "");
        assert.equal(r.exitCode, 0);
        assert.equal(r.signal ?? null, null);
        assert.equal(r.stdoutBytes, 14);
        assert.deepEqual(r.truncated, { stdout: false, stderr: false });
        assert.ok(r.runMs > 0);
        if (getRecipe(spec.id).plan(spec.hello, { compileTimeoutMs: 1, runTimeoutMs: 1, memoryMb: 1, compileMemoryMb: 1, cpus: 1, pids: 1, tmpfsMb: 1 }) && ["c", "cpp", "java", "typescript", "csharp", "go", "rust", "kotlin", "swift"].includes(spec.id)) {
          assert.ok(r.compileMs > 0, "compiled languages report compileMs");
        }
      });
    }
  });

  describe("stdout and stderr stay separate", () => {
    test("python", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", 'import sys\nprint("out")\nprint("err", file=sys.stderr)\nprint("out2")\n');
      assert.equal(r.stdout, "out\nout2\n");
      assert.equal(r.stderr, "err\n");
      assert.equal(r.status, "ok");
    });
    test("node", { skip: needs("javascript") }, async () => {
      const r = await run(srv, "javascript", 'console.log("a"); console.error("b");');
      assert.equal(r.stdout, "a\n");
      assert.equal(r.stderr, "b\n");
    });
    test("c (compiled)", { skip: needs("c") }, async () => {
      const r = await run(srv, "c", '#include <stdio.h>\nint main(void){fprintf(stdout,"o\\n");fprintf(stderr,"e\\n");return 0;}\n');
      assert.equal(r.stdout, "o\n");
      assert.equal(r.stderr, "e\n");
    });
    test("java", { skip: needs("java") }, async () => {
      const r = await run(srv, "java", 'public class Main{public static void main(String[] a){System.out.println("o");System.err.println("e");}}');
      assert.equal(r.stdout, "o\n");
      assert.equal(r.stderr, "e\n");
    });
    test("program output can not forge runner data (status, compile output)", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", 'import sys\nprint(\'{"status":"ok","exitCode":0}\')\nprint("COMPILE ERROR", file=sys.stderr)\nsys.exit(4)\n');
      assert.equal(r.status, "runtime_error");
      assert.equal(r.exitCode, 4);
      assert.equal(r.compileOutput, undefined);
      assert.match(r.stdout, /"status":"ok"/);
    });
  });

  describe("stdin", () => {
    test("python round trip incl. UTF-8", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", "import sys\ndata = sys.stdin.read()\nprint(len(data), data.upper())\n", { stdin: "héllo wörld\nline2\n" });
      assert.equal(r.stdout, "18 HÉLLO WÖRLD\nLINE2\n\n");
    });
    test("node reads lines", { skip: needs("javascript") }, async () => {
      const r = await run(srv, "javascript", 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(s.trim().split("\\n").reverse().join(",")));', { stdin: "a\nb\nc\n" });
      assert.equal(r.stdout, "c,b,a\n");
    });
    test("c scanf", { skip: needs("c") }, async () => {
      const r = await run(srv, "c", '#include <stdio.h>\nint main(void){int a,b;scanf("%d %d",&a,&b);printf("%d\\n",a+b);return 0;}\n', { stdin: "40 2\n" });
      assert.equal(r.stdout, "42\n");
    });
    test("java Scanner", { skip: needs("java") }, async () => {
      const r = await run(srv, "java", "import java.util.*;\npublic class Main{public static void main(String[] x){Scanner s=new Scanner(System.in);System.out.println(s.nextInt()*2);}}", { stdin: "21" });
      assert.equal(r.stdout, "42\n");
    });
    test("bash read", { skip: needs("bash") }, async () => {
      const r = await run(srv, "bash", 'read -r a; read -r b; echo "$b-$a"', { stdin: "x\ny\n" });
      assert.equal(r.stdout, "y-x\n");
    });
    test("a program that never reads a 64 KiB stdin still finishes cleanly", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", 'print("done")', { stdin: "x".repeat(64 * 1024) });
      assert.equal(r.status, "ok");
      assert.equal(r.stdout, "done\n");
    });
    test("empty stdin means EOF, not a hang", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", 'import sys\nprint(repr(sys.stdin.read()))');
      assert.equal(r.stdout, "''\n");
    });
  });

  describe("exit codes and signals", () => {
    test("python sys.exit(3)", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", "import sys\nsys.exit(3)");
      assert.equal(r.status, "runtime_error");
      assert.equal(r.exitCode, 3);
      assert.match(r.message ?? "", /exited with code 3/);
    });
    test("python traceback goes to stderr", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", 'print("before")\nraise ValueError("boom")');
      assert.equal(r.status, "runtime_error");
      assert.equal(r.exitCode, 1);
      assert.equal(r.stdout, "before\n");
      assert.match(r.stderr, /ValueError: boom/);
    });
    test("bash exit 7", { skip: needs("bash") }, async () => {
      const r = await run(srv, "bash", "echo hi; exit 7");
      assert.equal(r.exitCode, 7);
      assert.equal(r.stdout, "hi\n");
    });
    test("node uncaught exception", { skip: needs("javascript") }, async () => {
      const r = await run(srv, "javascript", 'throw new Error("nope")');
      assert.equal(r.status, "runtime_error");
      assert.match(r.stderr, /nope/);
    });
    test("java System.exit(5) and uncaught exceptions", { skip: needs("java") }, async () => {
      const a = await run(srv, "java", "public class Main{public static void main(String[] x){System.exit(5);}}");
      assert.equal(a.status, "runtime_error");
      assert.equal(a.exitCode, 5);
      const b = await run(srv, "java", 'public class Main{public static void main(String[] x){throw new IllegalStateException("bad");}}');
      assert.equal(b.status, "runtime_error");
      assert.match(b.stderr, /IllegalStateException: bad/);
    });
    test("c segfault reports SIGSEGV", { skip: needs("c") }, async () => {
      const r = await run(srv, "c", "int main(void){volatile int *p=0;*p=1;return 0;}\n");
      assert.equal(r.status, "runtime_error");
      assert.equal(r.signal, "SIGSEGV");
      assert.equal(r.exitCode, 139);
      assert.match(r.message ?? "", /SIGSEGV/);
    });
    test("c abort reports SIGABRT; return value is the exit code", { skip: needs("c") }, async () => {
      const a = await run(srv, "c", "#include <stdlib.h>\nint main(void){abort();}\n");
      assert.equal(a.signal, "SIGABRT");
      const b = await run(srv, "c", "int main(void){return 9;}\n");
      assert.equal(b.status, "runtime_error");
      assert.equal(b.exitCode, 9);
      assert.equal(b.signal ?? null, null);
    });
    test("c output printed (line-buffered) before a crash is not lost", { skip: needs("c") }, async () => {
      const r = await run(srv, "c", '#include <stdio.h>\n#include <stdlib.h>\nint main(void){printf("before\\n");abort();}\n');
      assert.equal(r.stdout, "before\n");
    });
  });

  describe("compile errors", () => {
    test("c: diagnostics with file and line, nothing in stdout", { skip: needs("c") }, async () => {
      const r = await run(srv, "c", '#include <stdio.h>\nint main(void){\n  printf("x")\n  return 0;\n}\n');
      assert.equal(r.status, "compile_error");
      assert.notEqual(r.exitCode, 0);
      assert.match(r.compileOutput ?? "", /main\.c:\d+:\d+: error/);
      assert.equal(r.stdout, "");
      assert.equal(r.runMs, 0);
      assert.ok(r.compileMs > 0);
      assert.equal(r.message, "Compilation failed");
    });
    test("c++", { skip: needs("cpp") }, async () => {
      const r = await run(srv, "cpp", "int main(){ undefined_function(); }\n");
      assert.equal(r.status, "compile_error");
      assert.match(r.compileOutput ?? "", /main\.cpp:\d+:\d+: error: .undefined_function. was not declared/);
    });
    test("java", { skip: needs("java") }, async () => {
      const r = await run(srv, "java", 'public class Main{public static void main(String[] x){int y = "s";}}');
      assert.equal(r.status, "compile_error");
      assert.match(r.compileOutput ?? "", /Main\.java:1: error: incompatible types/);
    });
    test("typescript type error is a compile_error", { skip: needs("typescript") }, async () => {
      const r = await run(srv, "typescript", 'const n: number = "text";\nconsole.log(n);\n');
      assert.equal(r.status, "compile_error");
      assert.match(r.compileOutput ?? "", /main\.ts\(1,7\): error TS2322/);
      assert.equal(r.stdout, "");
    });
    test("typescript can use Node typings", { skip: needs("typescript") }, async () => {
      const r = await run(srv, "typescript", 'import { createHash } from "node:crypto";\nconst h: string = createHash("sha256").update("a").digest("hex");\nconsole.log(h.length, process.argv.length > 0);\n');
      assert.equal(r.status, "ok", r.compileOutput);
      assert.equal(r.stdout, "64 true\n");
    });
    test("python syntax error is reported as a compile error", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", "def f(:\n  pass\n");
      assert.equal(r.status, "compile_error");
      assert.match(r.compileOutput ?? "", /SyntaxError/);
      assert.equal(r.stdout, "");
    });
    test("bash syntax error", { skip: needs("bash") }, async () => {
      const r = await run(srv, "bash", 'if true; then echo "x"\n');
      assert.equal(r.status, "compile_error");
      assert.match(r.compileOutput ?? "", /syntax error/);
    });
    test("warnings of a successful compile are kept in compileOutput", { skip: needs("c") }, async () => {
      const r = await run(srv, "c", '#include <stdio.h>\nint main(void){int unused;printf("ok\\n");return 0;}\n');
      assert.equal(r.status, "ok");
      assert.match(r.compileOutput ?? "", /unused variable/);
      assert.equal(r.stdout, "ok\n");
    });
    test("an empty program is a valid compile for interpreted languages", { skip: needs("python") }, async () => {
      const r = await run(srv, "python", "");
      assert.equal(r.status, "ok");
      assert.equal(r.stdout, "");
    });
  });

  describe("Java specifics", { skip: needs("java") }, () => {
    test("a public class that is not Main works", async () => {
      const r = await run(srv, "java", 'public class Greeter { public static void main(String[] a) { System.out.println("hi " + Greeter.class.getName()); } }');
      assert.equal(r.status, "ok", r.compileOutput);
      assert.equal(r.stdout, "hi Greeter\n");
    });
    test("helper classes, records and a package declaration", async () => {
      const code = "package demo.app;\nrecord P(int x) {}\nclass Helper { static String f(P p) { return \"x=\" + p.x(); } }\npublic class Main { public static void main(String[] a) { System.out.println(Helper.f(new P(3))); } }\n";
      const r = await run(srv, "java", code);
      assert.equal(r.status, "ok", r.compileOutput);
      assert.equal(r.stdout, "x=3\n");
    });
    test("an injection-shaped class name never reaches a container", async () => {
      const r = await run(srv, "java", "public class a$(touch /work/pwned) { public static void main(String[] x) {} }");
      assert.equal(r.status, "compile_error");
      assert.equal(r.runMs, 0);
      assert.equal(r.compileMs, 0);
    });
    test("a statement-shaped class name is just an identifier: no file is created", async () => {
      const r = await run(srv, "java", 'public class a;touch pwned { }\n');
      assert.equal(r.status, "compile_error"); // javac rejects it; nothing was executed as a command
      const check = await run(srv, "bash", "test -e pwned && echo PWNED || echo clean");
      assert.equal(check.stdout, "clean\n");
    });
  });
});
