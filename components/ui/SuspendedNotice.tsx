"use client";

import { CircleSlash } from "lucide-react";
import { useLang } from "@/lib/lang-context";

/**
 * "Account suspended" card for screens whose Worker route answered 403 account_suspended
 * (lib/suspension.ts builds `message`, with the end date when there is one). Same look and title as
 * Code Lab's suspended notice (components/codelab/ProblemNotice.tsx). No role of its own: callers
 * render it inside their existing live region.
 */
export default function SuspendedNotice({ message, testId }: { message: string; testId?: string }) {
  const { tx } = useLang();
  return (
    <div data-testid={testId} className="rounded-xl border border-amber-500/40 bg-amber-500/[0.07] p-3.5 text-start">
      <div className="flex gap-2.5">
        <CircleSlash size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-fg">{tx.codelab.problems.suspendedTitle}</p>
          <p className="mt-1 text-sm text-fg-soft leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
