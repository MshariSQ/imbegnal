"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "./ui";

const SKELETON_WIDTHS = [62, 40, 78, 30, 54, 70, 36];

export function EditorSkeleton() {
  return (
    <div className="h-full min-h-[14rem] p-4 space-y-2.5" aria-hidden="true">
      {SKELETON_WIDTHS.map((w, i) => (
        <Skeleton key={i} className="h-3.5" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/** CodeMirror is loaded on demand: the page shell stays small and the skeleton holds the space. */
const EditorSlot = dynamic(() => import("./CodeEditor"), { ssr: false, loading: () => <EditorSkeleton /> });
export default EditorSlot;
