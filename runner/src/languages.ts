/**
 * Language recipes: how each language in shared/languages.ts is compiled and run.
 *
 * Everything here is PURE: a recipe turns (source code, effective limits) into argv
 * arrays. No shell is ever involved, user data never appears in an argv element
 * except the Java class name (strictly validated), and every source file has a FIXED
 * name taken from shared/languages.ts. All paths are relative to the container's
 * working directory (/work, a tmpfs), so diagnostics read `main.c:3:5: error ...`.
 */
import { LANG_IDS, getLanguage, type LangId } from "../../shared/languages";

/** Limits as the recipe sees them after `resolveLimits` (limits.ts). */
export interface EffectiveLimits {
  compileTimeoutMs: number;
  runTimeoutMs: number;
  /** Memory cap for the run step (MiB). */
  memoryMb: number;
  /** Memory cap while compiling (MiB, >= memoryMb). */
  compileMemoryMb: number;
  cpus: number;
  pids: number;
  tmpfsMb: number;
}

/** Per-language defaults and the floor a caller may lower the run memory to. */
export interface LangDefaults {
  compileTimeoutMs: number;
  runTimeoutMs: number;
  memoryMb: number;
  compileMemoryMb: number;
  /** Smallest run memory that still starts the runtime. */
  minMemoryMb: number;
  cpus: number;
  pids: number;
  tmpfsMb: number;
}

export interface Command {
  argv: string[];
  /** Extra environment for this step (on top of the container's fixed environment). */
  env?: Record<string, string>;
}

export interface Plan {
  /** File written into /work (fixed name; for Java a validated `<Class>.java`). */
  filename: string;
  /** Best-effort setup before compiling (a failure is ignored): seeds caches that make the compile fast. */
  prepare?: Command;
  /** null for languages that run straight from source. */
  compile: Command | null;
  /** Keep the compile step's output when it succeeds (warnings) or discard it (pure syntax checks). */
  keepCompileOutput: boolean;
  run: Command;
}

export interface PlanRejection {
  /** Shown to the learner as compile diagnostics; never contains user text. */
  reject: string;
}

export interface Recipe {
  id: LangId;
  /** Human name for runner messages ("Java"). */
  name: string;
  defaults: LangDefaults;
  /** argv of a command that prints the toolchain version. */
  versionArgv: string[];
  parseVersion(raw: string): string | undefined;
  plan(code: string, limits: EffectiveLimits): Plan | PlanRejection;
}

export function isRejection(p: Plan | PlanRejection): p is PlanRejection {
  return "reject" in p;
}

// ---------------------------------------------------------------------------
// Java class detection
// ---------------------------------------------------------------------------

export const JAVA_IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const JAVA_NAME_MAX = 64;
const JAVA_PACKAGE_MAX_SEGMENTS = 8;

export interface JavaTarget {
  /** Source file stem (the public class, or Main). */
  fileClass: string;
  /** Class passed to `java` (package-qualified). */
  mainClass: string;
}

export function validJavaIdent(name: string): boolean {
  return name.length <= JAVA_NAME_MAX && JAVA_IDENT_RE.test(name);
}

/**
 * Blank out comments, string/char literals and text blocks (keeping newlines and length) so
 * declaration scanning cannot be fooled by `"class Foo"` inside a string.
 */
export function stripJavaNoise(src: string): string {
  const out: string[] = [];
  const n = src.length;
  let i = 0;
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) out.push(src[k] === "\n" ? "\n" : " ");
  };
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "/") {
      let j = i;
      while (j < n && src[j] !== "\n") j++;
      blank(i, j);
      i = j;
    } else if (c === "/" && d === "*") {
      const end = src.indexOf("*/", i + 2);
      const j = end === -1 ? n : end + 2;
      blank(i, j);
      i = j;
    } else if (c === '"' && src.startsWith('"""', i)) {
      const end = src.indexOf('"""', i + 3);
      const j = end === -1 ? n : end + 3;
      blank(i, j);
      i = j;
    } else if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      j = Math.min(n, j + 1);
      blank(i, j);
      i = j;
    } else {
      out.push(c);
      i++;
    }
  }
  return out.join("");
}

const TYPE_DECL_RE =
  /(?:^|[\s;}])((?:(?:public|protected|private|static|final|abstract|sealed|non-sealed|strictfp)\s+)*)(?:class|interface|enum|record|@\s*interface)\s+([^\s{<(;,=]+)/g;
const MAIN_RE = /\bvoid\s+main\s*\(/;

/**
 * Work out which file name and main class a Java program needs. Names are taken from the
 * source, so they are validated against ^[A-Za-z_][A-Za-z0-9_]*$ and anything else is
 * rejected (`public class a$(touch x)`, path separators, unicode, ...). Falls back to Main.
 */
export function detectJavaTarget(code: string): JavaTarget | { error: string } {
  const src = stripJavaNoise(code);

  let pkg = "";
  const pm = /^\s*package\s+([^;]*?)\s*;/.exec(src);
  if (pm) {
    const segs = pm[1].split(".").map((s) => s.trim());
    if (segs.length > JAVA_PACKAGE_MAX_SEGMENTS || !segs.every(validJavaIdent)) {
      return { error: "Package names may only contain ASCII letters, digits and underscores." };
    }
    pkg = segs.join(".");
  }

  // Brace depth at each position, so only top-level declarations count.
  const depthAt = new Int32Array(src.length + 1);
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    depthAt[i] = depth;
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && depth > 0) depth--;
  }

  const decls: { name: string; pub: boolean; pos: number }[] = [];
  TYPE_DECL_RE.lastIndex = 0;
  for (let m = TYPE_DECL_RE.exec(src); m; m = TYPE_DECL_RE.exec(src)) {
    const pos = m.index + m[0].length - m[2].length;
    if (depthAt[pos] !== 0) continue;
    decls.push({ name: m[2], pub: /\bpublic\b/.test(m[1]), pos });
  }
  for (const d of decls) {
    if (!validJavaIdent(d.name)) {
      return { error: "Class names may only contain ASCII letters, digits and underscores." };
    }
  }

  const publicDecl = decls.find((d) => d.pub);
  const mainPos = MAIN_RE.exec(src)?.index ?? -1;
  let runDecl = mainPos >= 0 ? [...decls].reverse().find((d) => d.pos < mainPos) : undefined;
  runDecl ??= publicDecl ?? decls[0];

  const fileClass = publicDecl?.name ?? "Main";
  const cls = runDecl?.name ?? fileClass;
  return { fileClass, mainClass: pkg ? `${pkg}.${cls}` : cls };
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

const D = {
  compileTimeoutMs: 10_000,
  runTimeoutMs: 5_000,
  memoryMb: 256,
  compileMemoryMb: 256,
  minMemoryMb: 32,
  cpus: 1,
  pids: 64,
  tmpfsMb: 64,
} satisfies LangDefaults;

function file(id: LangId): string {
  const spec = getLanguage(id);
  if (!spec) throw new Error(`unknown language ${id}`);
  return spec.filename;
}

/** First line, trimmed; used when nothing smarter is known. */
function firstLine(raw: string): string | undefined {
  const line = raw.split(/\r?\n/).find((l) => l.trim() !== "");
  return line?.trim().slice(0, 80);
}

function match1(raw: string, re: RegExp, prefix: string): string | undefined {
  const m = re.exec(raw);
  return m ? `${prefix} ${m[1]}` : undefined;
}

const jvmCommon = (heapMb: number): string[] => [
  `-Xmx${heapMb}m`,
  "-XX:+UseSerialGC",
  "-XX:TieredStopAtLevel=1",
  "-XX:ReservedCodeCacheSize=48m",
  "-XX:MaxMetaspaceSize=128m",
  "-XX:-UsePerfData",
  "-Xshare:auto",
];

const jvmRunFlags = (memoryMb: number): string[] => [
  ...jvmCommon(Math.max(24, Math.floor(memoryMb * 0.5))),
  "-Xss1m",
  "-Dfile.encoding=UTF-8",
  "-Dstdout.encoding=UTF-8",
  "-Dstderr.encoding=UTF-8",
  "-Djava.io.tmpdir=/work/tmp",
];

const nodeHeap = (memoryMb: number): string => `--max-old-space-size=${Math.max(24, Math.floor(memoryMb * 0.6))}`;

const RECIPES: Record<LangId, Recipe> = {
  python: {
    id: "python",
    name: "Python",
    defaults: { ...D },
    versionArgv: ["python3", "--version"],
    parseVersion: (r) => match1(r, /Python (\d+\.\d+\.\d+)/, "Python"),
    plan: () => ({
      filename: file("python"),
      // A syntax-only pass so SyntaxError is reported as a compile error, like the compiled languages.
      compile: { argv: ["python3", "-m", "py_compile", file("python")] },
      keepCompileOutput: false,
      run: { argv: ["python3", "-u", file("python")] },
    }),
  },

  javascript: {
    id: "javascript",
    name: "JavaScript",
    defaults: { ...D },
    versionArgv: ["node", "--version"],
    parseVersion: (r) => match1(r, /v(\d+\.\d+\.\d+)/, "Node.js"),
    plan: (_c, l) => ({
      filename: file("javascript"),
      compile: null,
      keepCompileOutput: false,
      run: { argv: ["node", nodeHeap(l.memoryMb), file("javascript")] },
    }),
  },

  typescript: {
    id: "typescript",
    name: "TypeScript",
    defaults: { ...D, compileTimeoutMs: 15_000, compileMemoryMb: 512 },
    versionArgv: ["node", "/opt/ts/node_modules/typescript/lib/tsc.js", "--version"],
    parseVersion: (r) => match1(r, /Version (\d+\.\d+\.\d+)/, "TypeScript"),
    plan: (_c, l) => ({
      filename: file("typescript"),
      compile: {
        argv: [
          "node",
          "--max-old-space-size=400",
          "/opt/ts/node_modules/typescript/lib/tsc.js",
          "--pretty",
          "false",
          "--target",
          "ES2022",
          "--module",
          "nodenext",
          "--lib",
          "es2023",
          "--strict",
          "--skipLibCheck",
          "--types",
          "node",
          "--typeRoots",
          "/opt/ts/node_modules/@types",
          "--outDir",
          "out",
          file("typescript"),
        ],
      },
      keepCompileOutput: true,
      run: { argv: ["node", nodeHeap(l.memoryMb), "out/main.js"] },
    }),
  },

  java: {
    id: "java",
    name: "Java",
    defaults: { ...D, compileTimeoutMs: 15_000, memoryMb: 512, compileMemoryMb: 768, minMemoryMb: 128, pids: 160 },
    versionArgv: ["java", "-version"],
    parseVersion: (r) => match1(r, /version "([^"]+)"/, "OpenJDK"),
    plan: (code, l) => {
      const t = detectJavaTarget(code);
      if ("error" in t) return { reject: t.error };
      const filename = `${t.fileClass}.java`;
      return {
        filename,
        compile: {
          argv: ["javac", "-encoding", "UTF-8", "-d", "out", ...jvmCommon(Math.floor(l.compileMemoryMb * 0.5)).map((f) => `-J${f}`), filename],
        },
        keepCompileOutput: true,
        run: { argv: ["java", ...jvmRunFlags(l.memoryMb), "-cp", "out", t.mainClass] },
      };
    },
  },

  c: {
    id: "c",
    name: "C",
    defaults: { ...D },
    versionArgv: ["gcc", "--version"],
    parseVersion: (r) => match1(firstLine(r) ?? "", /(\d+\.\d+\.\d+)\s*$/, "GCC"),
    plan: () => ({
      filename: file("c"),
      compile: { argv: ["gcc", "-O2", "-std=c17", "-Wall", "-pipe", "-o", "main", file("c"), "-lm"] },
      keepCompileOutput: true,
      // Line-buffered stdout so output printed before a crash or kill is not lost in a pipe buffer.
      run: { argv: ["stdbuf", "-oL", "./main"] },
    }),
  },

  cpp: {
    id: "cpp",
    name: "C++",
    defaults: { ...D, compileTimeoutMs: 15_000, compileMemoryMb: 512 },
    versionArgv: ["g++", "--version"],
    parseVersion: (r) => match1(firstLine(r) ?? "", /(\d+\.\d+\.\d+)\s*$/, "G++"),
    plan: () => ({
      filename: file("cpp"),
      compile: { argv: ["g++", "-O2", "-std=c++20", "-Wall", "-pipe", "-o", "main", file("cpp"), "-lm"] },
      keepCompileOutput: true,
      run: { argv: ["stdbuf", "-oL", "./main"] },
    }),
  },

  csharp: {
    id: "csharp",
    name: "C#",
    defaults: { ...D, compileMemoryMb: 384, pids: 128 },
    versionArgv: ["mcs", "--version"],
    parseVersion: (r) => match1(r, /version (\d+(?:\.\d+)+)/, "Mono C# compiler"),
    plan: (_c, l) => ({
      filename: file("csharp"),
      compile: { argv: ["mcs", "-optimize+", "-out:main.exe", file("csharp")] },
      keepCompileOutput: true,
      run: {
        argv: ["mono", "main.exe"],
        env: { MONO_DISABLE_SHARED_AREA: "1", MONO_GC_PARAMS: `max-heap-size=${Math.floor(l.memoryMb * 0.7)}m` },
      },
    }),
  },

  go: {
    id: "go",
    name: "Go",
    defaults: { ...D, compileTimeoutMs: 20_000, compileMemoryMb: 768, cpus: 2, pids: 192, tmpfsMb: 256 },
    versionArgv: ["go", "version"],
    parseVersion: (r) => match1(r, /go version go(\d+\.\d+(?:\.\d+)?)/, "Go"),
    plan: (_c, l) => ({
      filename: file("go"),
      // The image ships a build cache with the standard library already compiled (see Dockerfile).
      prepare: { argv: ["cp", "-r", "/opt/gocache", "/work/tmp/gocache"] },
      compile: {
        argv: ["go", "build", "-o", "main", file("go")],
        env: {
          GOCACHE: "/work/tmp/gocache",
          GOPATH: "/work/tmp/gopath",
          GOENV: "off",
          CGO_ENABLED: "0",
          GOFLAGS: "-mod=mod",
          GOPROXY: "off",
          GOSUMDB: "off",
          GOTOOLCHAIN: "local",
        },
      },
      keepCompileOutput: true,
      run: {
        argv: ["./main"],
        env: { GOMAXPROCS: String(l.cpus), GOMEMLIMIT: `${Math.floor(l.memoryMb * 0.8)}MiB` },
      },
    }),
  },

  rust: {
    id: "rust",
    name: "Rust",
    defaults: { ...D, compileTimeoutMs: 20_000, compileMemoryMb: 768, cpus: 2, pids: 128, tmpfsMb: 128 },
    versionArgv: ["rustc", "--version"],
    parseVersion: (r) => match1(r, /rustc (\d+\.\d+\.\d+)/, "Rust"),
    plan: () => ({
      filename: file("rust"),
      compile: { argv: ["rustc", "--edition", "2021", "-O", "-o", "main", file("rust")] },
      keepCompileOutput: true,
      run: { argv: ["./main"], env: { RUST_BACKTRACE: "0" } },
    }),
  },

  ruby: {
    id: "ruby",
    name: "Ruby",
    defaults: { ...D },
    versionArgv: ["ruby", "--version"],
    parseVersion: (r) => match1(r, /ruby (\d+\.\d+\.\d+)/, "Ruby"),
    plan: () => ({
      filename: file("ruby"),
      compile: { argv: ["ruby", "-c", file("ruby")] },
      keepCompileOutput: false,
      // sync.rb (in the image) makes stdout/stderr unbuffered without changing $0 / __FILE__.
      run: { argv: ["ruby", "-r/opt/runner/ruby-sync.rb", file("ruby")] },
    }),
  },

  php: {
    id: "php",
    name: "PHP",
    defaults: { ...D },
    versionArgv: ["php", "--version"],
    parseVersion: (r) => match1(r, /PHP (\d+\.\d+\.\d+)/, "PHP"),
    plan: (_c, l) => ({
      filename: file("php"),
      compile: { argv: ["php", "-l", file("php")] },
      keepCompileOutput: false,
      run: {
        argv: [
          "php",
          "-d",
          "display_errors=stderr",
          "-d",
          "html_errors=0",
          "-d",
          "log_errors=0",
          "-d",
          "error_reporting=-1",
          "-d",
          `memory_limit=${Math.floor(l.memoryMb * 0.8)}M`,
          file("php"),
        ],
      },
    }),
  },

  kotlin: {
    id: "kotlin",
    name: "Kotlin",
    defaults: {
      ...D,
      compileTimeoutMs: 20_000,
      memoryMb: 512,
      compileMemoryMb: 1024,
      minMemoryMb: 128,
      cpus: 2,
      pids: 160,
      tmpfsMb: 128,
    },
    versionArgv: ["kotlinc", "-version"],
    parseVersion: (r) => match1(r, /kotlinc-jvm (\d+\.\d+\.\d+)/, "Kotlin"),
    plan: (_c, l) => ({
      filename: file("kotlin"),
      compile: {
        argv: ["kotlinc", file("kotlin"), "-include-runtime", "-d", "main.jar"],
        env: { JAVA_OPTS: jvmCommon(Math.floor(l.compileMemoryMb * 0.6)).join(" ") },
      },
      keepCompileOutput: true,
      run: { argv: ["java", ...jvmRunFlags(l.memoryMb), "-jar", "main.jar"] },
    }),
  },

  swift: {
    id: "swift",
    name: "Swift",
    defaults: { ...D, compileTimeoutMs: 20_000, compileMemoryMb: 1024, cpus: 2, pids: 128, tmpfsMb: 128 },
    versionArgv: ["swiftc", "--version"],
    parseVersion: (r) => match1(r, /Swift version (\d+(?:\.\d+)+)/, "Swift"),
    plan: () => ({
      filename: file("swift"),
      compile: {
        argv: ["swiftc", "-O", "-module-cache-path", "/work/tmp/swift-modules", "-o", "main", file("swift")],
        env: { CLANG_MODULE_CACHE_PATH: "/work/tmp/clang-modules" },
      },
      keepCompileOutput: true,
      run: { argv: ["./main"] },
    }),
  },

  bash: {
    id: "bash",
    name: "Bash",
    defaults: { ...D },
    versionArgv: ["bash", "--version"],
    parseVersion: (r) => match1(r, /version (\d+\.\d+\.\d+)/, "Bash"),
    plan: () => ({
      filename: file("bash"),
      compile: { argv: ["bash", "-n", file("bash")] },
      keepCompileOutput: false,
      run: { argv: ["bash", file("bash")] },
    }),
  },
};

export function getRecipe(id: LangId): Recipe {
  return RECIPES[id];
}

export function allRecipes(): Recipe[] {
  return LANG_IDS.map((id) => RECIPES[id]);
}

/** Version string shown in /v1/languages; falls back to the first output line. */
export function formatVersion(id: LangId, raw: string): string | undefined {
  return RECIPES[id].parseVersion(raw) ?? firstLine(raw);
}
