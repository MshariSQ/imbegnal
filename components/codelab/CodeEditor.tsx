"use client";

/**
 * The CodeMirror 6 editor used by the lab and the permalink page. Loaded with
 * next/dynamic (see EditorSlot), and its language pack with a second dynamic
 * import, so the page shell never carries editor code it does not show yet.
 *
 * Keyboard: Tab indents (inserts spaces); Esc then Tab leaves the editor so
 * keyboard users are never trapped; Ctrl/Cmd+Enter runs.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror, { Decoration, EditorState, EditorView, Prec, keymap } from "@uiw/react-codemirror";
import type { Extension } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
import { githubDark } from "@uiw/codemirror-theme-github";
import { githubLightAA } from "@/lib/editor-theme";
import { useTheme } from "@/lib/theme";
import { loadEditorLanguage } from "@/lib/codelab/editor-langs";
import type { EditorMode } from "@/lib/codelab/langs";


const errorLineTheme = EditorView.baseTheme({
  ".cm-imb-error-line": { backgroundColor: "rgba(239, 68, 68, 0.16)", boxShadow: "inset 3px 0 0 #ef4444" },
});

function errorLineExtension(line: number): Extension {
  return EditorView.decorations.of((view) =>
    line >= 1 && line <= view.state.doc.lines
      ? Decoration.set([Decoration.line({ class: "cm-imb-error-line" }).range(view.state.doc.line(line).from)])
      : Decoration.none
  );
}

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  mode: EditorMode;
  ariaLabel: string;
  fontSize: number;
  wrap: boolean;
  readOnly?: boolean;
  /** 1-based line to mark as failing. */
  errorLine?: number;
  onRun?: () => void;
  loadFailedText: string;
}

export default function CodeEditor({
  value,
  onChange,
  mode,
  ariaLabel,
  fontSize,
  wrap,
  readOnly = false,
  errorLine,
  onRun,
  loadFailedText,
}: CodeEditorProps) {
  const [theme] = useTheme();
  const [pack, setPack] = useState<{ mode: EditorMode; ext: Extension } | "failed" | null>(null);
  // The keymap is built once; the ref always points at the latest onRun.
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);
  const triggerRun = useCallback(() => {
    onRunRef.current?.();
    return true;
  }, []);

  useEffect(() => {
    let live = true;
    loadEditorLanguage(mode).then(
      (ext) => live && setPack({ mode, ext }),
      () => live && setPack("failed")
    );
    return () => {
      live = false;
    };
  }, [mode]);

  const langExt = pack && pack !== "failed" && pack.mode === mode ? pack.ext : null;

  const extensions = useMemo(() => {
    const ext: Extension[] = [
      EditorState.tabSize.of(4),
      indentUnit.of("    "),
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      EditorView.theme({
        "&": { fontSize: `${fontSize}px` },
        ".cm-content, .cm-gutters": { fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace)' },
        ".cm-scroller": { lineHeight: "1.6" },
      }),
      errorLineTheme,
      // Highest precedence: the default keymap binds Mod-Enter to "insert blank line".
      // eslint-disable-next-line react-hooks/refs -- triggerRun reads the ref only when the key is pressed
      Prec.highest(keymap.of([{ key: "Mod-Enter", preventDefault: true, run: triggerRun }, indentWithTab])),
    ];
    if (langExt) ext.push(langExt);
    if (wrap) ext.push(EditorView.lineWrapping);
    if (errorLine) ext.push(errorLineExtension(errorLine));
    return ext;
  }, [langExt, wrap, fontSize, ariaLabel, errorLine, triggerRun]);

  return (
    <div dir="ltr" className="h-full min-h-0 flex flex-col text-start">
      <div className="flex-1 min-h-0">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          theme={theme === "dark" ? githubDark : githubLightAA}
          height="100%"
          style={{ height: "100%" }}
          readOnly={readOnly}
          basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: !readOnly, autocompletion: false, tabSize: 4 }}
        />
      </div>
      {pack === "failed" && (
        <p role="status" className="px-3 py-1.5 text-xs text-amber-400 border-t border-line bg-surface">
          {loadFailedText}
        </p>
      )}
    </div>
  );
}
