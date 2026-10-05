"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps } from "react";

function EditorSkeleton() {
  return <div aria-hidden className="h-[260px] rounded-xl border border-line bg-surface animate-pulse" />;
}

/**
 * CodeMirror + the code runners are ~250 KB of JS. They are fetched only when
 * an editor is about to scroll into view, so lesson text loads and becomes
 * interactive without paying for exercises further down the page.
 */
const CodeRunner = dynamic(() => import("./CodeRunner"), { ssr: false, loading: EditorSkeleton });

export default function CodeRunnerLazy(props: ComponentProps<typeof CodeRunner>) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" } // start loading a screen ahead of the reader
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return near ? (
    <CodeRunner {...props} />
  ) : (
    <div ref={ref}>
      <EditorSkeleton />
    </div>
  );
}
