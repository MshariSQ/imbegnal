"use client";

import { CheckCircle2, EyeOff, XCircle } from "lucide-react";
import type { GradeResult } from "../../shared/api";
import type { RunStatus } from "../../shared/protocol";
import type { LabTest } from "../../data/lessons/types";
import { useLang } from "@/lib/lang-context";
import { fill } from "@/lib/codelab/format";

function Diff({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-fg-subtle mb-1">{label}</p>
      <pre
        tabIndex={0}
        role="region"
        aria-label={label}
        dir="ltr"
        className="m-0 max-h-40 overflow-auto rounded-md border border-line bg-surface-2 p-2 font-mono text-xs whitespace-pre text-fg text-start"
      >
        {text === "" ? " " : text}
      </pre>
    </div>
  );
}

/**
 * Visible tests of a lesson exercise. Before any graded run it lists what the
 * solution is checked against; afterwards each row shows pass/fail and, for a
 * failure, expected vs actual output.
 */
export default function TestsPanel({
  tests,
  grade,
  gradeSource,
}: {
  tests: LabTest[];
  grade: GradeResult | null;
  gradeSource: "server" | "browser" | null;
}) {
  const { tx, lang } = useLang();
  const e = tx.codelab.exercise;
  const rows = grade ? grade.tests : tests.map((t) => ({ name: t.name[lang], passed: undefined as boolean | undefined, expected: t.expected, hidden: false, actual: undefined as string | undefined, message: undefined as string | undefined }));
  const passedCount = grade ? grade.tests.filter((t) => t.passed).length : 0;

  return (
    <div className="p-3 sm:p-4 space-y-3" data-testid="tests-panel">
      <div>
        {grade ? (
          <p className={`text-sm font-bold ${grade.passed ? "text-emerald-400" : "text-amber-400"}`} data-testid="grade-score">
            {fill(e.score, { passed: passedCount, total: grade.tests.length })}
            <span className="ms-2 text-xs font-medium text-fg-subtle">{gradeSource === "browser" ? e.localGrade : e.serverGrade}</span>
          </p>
        ) : (
          <p className="text-sm text-fg-muted">{e.testsVisible}</p>
        )}
      </div>
      <ul className="space-y-2">
        {rows.map((r, i) => {
          const failed = r.passed === false;
          const hidden = "hidden" in r && r.hidden;
          return (
            <li key={i} className="rounded-lg border border-line bg-surface p-3" data-testid="test-row" data-passed={r.passed === undefined ? "pending" : String(r.passed)}>
              <div className="flex items-start gap-2">
                {r.passed === true ? (
                  <CheckCircle2 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-400" />
                ) : failed ? (
                  <XCircle size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-red-400" />
                ) : hidden ? (
                  <EyeOff size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-fg-subtle" />
                ) : (
                  <span aria-hidden="true" className="mt-1.5 size-3.5 shrink-0 rounded-full border border-line-strong" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-fg break-words">
                    {hidden ? e.hiddenTest : r.name}
                    {r.passed !== undefined && (
                      <span className={`ms-2 text-xs font-semibold ${r.passed ? "text-emerald-400" : "text-red-400"}`}>{r.passed ? e.testPassed : e.testFailed}</span>
                    )}
                  </p>
                  {failed && r.message && (
                    <p className="mt-1 text-xs text-fg-muted">{tx.codelab.runStatus[r.message as RunStatus] ?? r.message}</p>
                  )}
                  {failed && !hidden && r.expected !== undefined && (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <Diff label={e.expected} text={r.expected} />
                      <Diff label={e.actual} text={r.actual ?? ""} />
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
