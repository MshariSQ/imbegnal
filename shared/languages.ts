/**
 * The canonical list of languages Code Lab can run.
 *
 * ONE source of truth, imported by the runner service (recipes are keyed by
 * `LangId`), the Worker (validation), and the site (selector, editor mode,
 * starter templates). Add a language here first, then give it a recipe in
 * runner/src/languages.ts.
 *
 * Pure data + types only: no imports, safe in the browser, Workers and Node.
 */

export const LANG_IDS = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "kotlin",
  "swift",
  "bash",
] as const;

export type LangId = (typeof LANG_IDS)[number];

/** Languages that the browser itself can run without the server (offline fallback). */
export type BrowserRuntime = "js" | "python" | "web";

export interface LanguageSpec {
  id: LangId;
  /** Display name (not translated: these are product names). */
  label: string;
  /** File extension, no dot. */
  ext: string;
  /** Source file name the runner writes (Java's public class must be `Main`). */
  filename: string;
  /** Which CodeMirror language pack the editor loads (lazily). */
  editor: "python" | "javascript" | "typescript" | "java" | "c" | "cpp" | "csharp" | "go" | "rust" | "ruby" | "php" | "kotlin" | "swift" | "shell";
  /** Short version note shown in the UI; the runner reports the real version at /v1/languages. */
  runtimeNote: string;
  /** Can run in the browser when the server runner is unreachable. */
  browser?: BrowserRuntime;
  /** Hello World starter, always prints "Hello, World!" on stdout. */
  hello: string;
}

export const LANGUAGES: readonly LanguageSpec[] = [
  {
    id: "python",
    label: "Python",
    ext: "py",
    filename: "main.py",
    editor: "python",
    runtimeNote: "Python 3",
    browser: "python",
    hello: `print("Hello, World!")\n`,
  },
  {
    id: "javascript",
    label: "JavaScript (Node.js)",
    ext: "js",
    filename: "main.js",
    editor: "javascript",
    runtimeNote: "Node.js",
    browser: "js",
    hello: `console.log("Hello, World!");\n`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    ext: "ts",
    filename: "main.ts",
    editor: "typescript",
    runtimeNote: "TypeScript on Node.js",
    hello: `const greeting: string = "Hello, World!";\nconsole.log(greeting);\n`,
  },
  {
    id: "java",
    label: "Java",
    ext: "java",
    filename: "Main.java",
    editor: "java",
    runtimeNote: "OpenJDK",
    hello: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
  },
  {
    id: "c",
    label: "C",
    ext: "c",
    filename: "main.c",
    editor: "c",
    runtimeNote: "GCC, C17",
    hello: `#include <stdio.h>\n\nint main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}\n`,
  },
  {
    id: "cpp",
    label: "C++",
    ext: "cpp",
    filename: "main.cpp",
    editor: "cpp",
    runtimeNote: "G++, C++20",
    hello: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n`,
  },
  {
    id: "csharp",
    label: "C#",
    ext: "cs",
    filename: "Program.cs",
    editor: "csharp",
    runtimeNote: "Mono C# compiler",
    hello: `using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello, World!");\n    }\n}\n`,
  },
  {
    id: "go",
    label: "Go",
    ext: "go",
    filename: "main.go",
    editor: "go",
    runtimeNote: "Go",
    hello: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n`,
  },
  {
    id: "rust",
    label: "Rust",
    ext: "rs",
    filename: "main.rs",
    editor: "rust",
    runtimeNote: "rustc",
    hello: `fn main() {\n    println!("Hello, World!");\n}\n`,
  },
  {
    id: "ruby",
    label: "Ruby",
    ext: "rb",
    filename: "main.rb",
    editor: "ruby",
    runtimeNote: "Ruby",
    hello: `puts "Hello, World!"\n`,
  },
  {
    id: "php",
    label: "PHP",
    ext: "php",
    filename: "main.php",
    editor: "php",
    runtimeNote: "PHP CLI",
    hello: `<?php\n\necho "Hello, World!\\n";\n`,
  },
  {
    id: "kotlin",
    label: "Kotlin",
    ext: "kt",
    filename: "Main.kt",
    editor: "kotlin",
    runtimeNote: "Kotlin on the JVM",
    hello: `fun main() {\n    println("Hello, World!")\n}\n`,
  },
  {
    id: "swift",
    label: "Swift",
    ext: "swift",
    filename: "main.swift",
    editor: "swift",
    runtimeNote: "Swift",
    hello: `print("Hello, World!")\n`,
  },
  {
    id: "bash",
    label: "Bash",
    ext: "sh",
    filename: "main.sh",
    editor: "shell",
    runtimeNote: "GNU Bash",
    browser: undefined,
    hello: `echo "Hello, World!"\n`,
  },
];

const BY_ID = new Map<string, LanguageSpec>(LANGUAGES.map((l) => [l.id, l]));

export function getLanguage(id: string): LanguageSpec | undefined {
  return BY_ID.get(id);
}

export function isLangId(v: unknown): v is LangId {
  return typeof v === "string" && BY_ID.has(v);
}

/** Lenient parse for URLs and lesson data ("c++", "js", "node", "py", …). */
const ALIASES: Record<string, LangId> = {
  py: "python",
  python3: "python",
  js: "javascript",
  node: "javascript",
  nodejs: "javascript",
  ts: "typescript",
  "c++": "cpp",
  cxx: "cpp",
  "c#": "csharp",
  cs: "csharp",
  golang: "go",
  rs: "rust",
  rb: "ruby",
  kt: "kotlin",
  sh: "bash",
  shell: "bash",
};

export function parseLangId(v: unknown): LangId | null {
  if (typeof v !== "string") return null;
  const k = v.trim().toLowerCase();
  if (BY_ID.has(k)) return k as LangId;
  return ALIASES[k] ?? null;
}
