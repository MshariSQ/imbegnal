/**
 * Lazy CodeMirror language packs for Code Lab. Each pack is its own dynamic
 * import, so opening the lab ships only the pack of the language on screen
 * (plus nothing at all until the editor mounts).
 */
import type { Extension } from "@codemirror/state";
import type { EditorMode } from "./langs";

type Loader = () => Promise<Extension>;

const legacy = async (load: () => Promise<{ parser: unknown }>): Promise<Extension> => {
  const [{ StreamLanguage }, { parser }] = await Promise.all([import("@codemirror/language"), load()]);
  return StreamLanguage.define(parser as Parameters<typeof StreamLanguage.define>[0]);
};

const LOADERS: Record<EditorMode, Loader> = {
  python: async () => (await import("@codemirror/lang-python")).python(),
  javascript: async () => (await import("@codemirror/lang-javascript")).javascript(),
  typescript: async () => (await import("@codemirror/lang-javascript")).javascript({ typescript: true }),
  java: async () => (await import("@codemirror/lang-java")).java(),
  c: async () => (await import("@codemirror/lang-cpp")).cpp(),
  cpp: async () => (await import("@codemirror/lang-cpp")).cpp(),
  go: async () => (await import("@codemirror/lang-go")).go(),
  rust: async () => (await import("@codemirror/lang-rust")).rust(),
  php: async () => (await import("@codemirror/lang-php")).php(),
  html: async () => (await import("@codemirror/lang-html")).html(),
  ruby: () => legacy(async () => ({ parser: (await import("@codemirror/legacy-modes/mode/ruby")).ruby })),
  swift: () => legacy(async () => ({ parser: (await import("@codemirror/legacy-modes/mode/swift")).swift })),
  shell: () => legacy(async () => ({ parser: (await import("@codemirror/legacy-modes/mode/shell")).shell })),
  csharp: () => legacy(async () => ({ parser: (await import("@codemirror/legacy-modes/mode/clike")).csharp })),
  kotlin: () => legacy(async () => ({ parser: (await import("@codemirror/legacy-modes/mode/clike")).kotlin })),
};

const cache = new Map<EditorMode, Promise<Extension>>();

/** Loads (once) the language extension for an editor mode. */
export function loadEditorLanguage(mode: EditorMode): Promise<Extension> {
  let p = cache.get(mode);
  if (!p) {
    p = LOADERS[mode]();
    // A failed chunk load must be retryable.
    p.catch(() => cache.delete(mode));
    cache.set(mode, p);
  }
  return p;
}
