/**
 * CodeMirror light theme shared by the Code Lab editor and the lesson CodeRunner.
 *
 * - GitHub light colors atoms/booleans #e36209 (3.5:1 on white); darken them to pass WCAG AA (5:1).
 * - The default active-line tint (#cceeff44) lowered every token on that line below 4.5:1.
 *   The active line is marked with an inset bar instead, so text keeps its contrast.
 */
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { githubLightInit } from "@uiw/codemirror-theme-github";
import { tags as t } from "@lezer/highlight";

export const githubLightAA: Extension = [
  githubLightInit({
    settings: { lineHighlight: "transparent" },
    styles: [{ tag: [t.atom, t.bool, t.special(t.variableName)], color: "#bc4c00" }],
  }),
  EditorView.theme({
    ".cm-activeLine": { boxShadow: "inset 3px 0 0 #0969da" },
    ".cm-activeLineGutter": { backgroundColor: "#eaeef2", color: "#24292f" },
  }),
];
