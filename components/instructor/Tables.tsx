"use client";

import { useId, type ReactNode } from "react";
import type { ExerciseAnalytics, InstructorAnalytics } from "../../shared/api";
import type { L10nText } from "../../shared/challenges";
import { useLang } from "@/lib/lang-context";
import { plural } from "@/lib/ctf/format";
import { trackTitle } from "@/lib/ctf/labels";
import { activeChallenges, humanizeKey, parseExerciseRef, sortExercisesByPassRate, topFailures } from "@/lib/instructor/analytics";

/** Number/duration formatters for the active language (built once by the dashboard). */
export interface Fmt {
  count: (n: number) => string;
  percent: (ratio: number | null | undefined) => string;
  ms: (n: number) => string;
  minutes: (n: number | undefined) => string;
}

const TH = "px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wider text-fg-subtle whitespace-nowrap";
const NUM = "px-3 py-3 text-end tabular-nums whitespace-nowrap";
const ROWHEAD = "px-3 py-3 text-start align-top font-normal";

/**
 * A titled block with a real table inside a keyboard-focusable, horizontally scrollable region, so a
 * wide table scrolls by itself on a phone and never widens the page.
 */
function TableSection({ title, note, caption, empty, hasRows, children }: { title: string; note?: ReactNode; caption: string; empty: string; hasRows: boolean; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-xl font-extrabold text-fg">
        {title}
      </h2>
      {note && <p className="mt-1 max-w-3xl text-sm text-fg-muted">{note}</p>}
      {hasRows ? (
        <div role="region" aria-labelledby={id} tabIndex={0} className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">{caption}</caption>
            {children}
          </table>
        </div>
      ) : (
        <p className="card mt-4 p-6 text-sm text-fg-muted" data-empty>
          {empty}
        </p>
      )}
    </section>
  );
}

/** Thin decorative bar next to a percentage (the number stays the information). */
function MiniBar({ ratio }: { ratio: number }) {
  return (
    <span aria-hidden className="mt-1 block h-1.5 w-20 overflow-hidden rounded-full bg-fg/10">
      <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%` }} />
    </span>
  );
}

export function TracksTable({ tracks, trackTitles, fmt }: { tracks: InstructorAnalytics["tracks"]; trackTitles: Record<string, string>; fmt: Fmt }) {
  const { tx } = useLang();
  const t = tx.instructor.tracks;
  return (
    <TableSection title={t.title} note={t.note} caption={t.caption} empty={t.empty} hasRows={tracks.length > 0}>
      <thead className="border-b border-line bg-surface-2">
        <tr>
          <th scope="col" className={TH}>{t.cols.course}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.learners}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.completed}</th>
          <th scope="col" className={TH}>{t.cols.rate}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.median}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {tracks.map((r) => (
          <tr key={r.track} data-row={r.track}>
            <th scope="row" className={`${ROWHEAD} font-semibold text-fg`}>{trackTitle(tx, r.track, trackTitles[r.track])}</th>
            <td className={NUM}>{fmt.count(r.learners)}</td>
            <td className={NUM}>{fmt.count(r.completed)}</td>
            <td className="px-3 py-3 tabular-nums whitespace-nowrap">
              {fmt.percent(r.completionRate)}
              <MiniBar ratio={r.completionRate} />
            </td>
            <td className={NUM}>{fmt.minutes(r.medianMinutesToComplete)}</td>
          </tr>
        ))}
      </tbody>
    </TableSection>
  );
}

function ExerciseName({ ex, trackTitles, challengeTitles }: { ex: ExerciseAnalytics; trackTitles: Record<string, string>; challengeTitles: Record<string, L10nText> }) {
  const { tx, lang } = useLang();
  const ref = parseExerciseRef(ex.exercise);
  let title: string | null = null;
  let badge: string | null = null;
  if (ref.kind === "lesson") title = trackTitle(tx, ref.track, trackTitles[ref.track]);
  if (ref.kind === "challenge") {
    title = challengeTitles[ref.id]?.[lang] || ref.id;
    badge = tx.instructor.exercises.challengeBadge;
  }
  return (
    <>
      {title && (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-fg">{title}</span>
          {badge && <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-bold text-fg-muted">{badge}</span>}
        </span>
      )}
      <code dir="ltr" className="block break-all text-start text-xs text-fg-subtle">
        {ex.exercise}
      </code>
    </>
  );
}

export function ExercisesTable({
  exercises,
  trackTitles,
  challengeTitles,
  fmt,
}: {
  exercises: ExerciseAnalytics[];
  trackTitles: Record<string, string>;
  challengeTitles: Record<string, L10nText>;
  fmt: Fmt;
}) {
  const { tx, lang } = useLang();
  const t = tx.instructor.exercises;
  const rows = sortExercisesByPassRate(exercises);
  const statusLabel = (k: string) => tx.instructor.status[k] ?? humanizeKey(k);
  return (
    <TableSection title={t.title} note={t.note} caption={t.caption} empty={t.empty} hasRows={rows.length > 0}>
      <thead className="border-b border-line bg-surface-2">
        <tr>
          <th scope="col" className={TH}>{t.cols.exercise}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.attempts}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.learners}</th>
          <th scope="col" className={TH}>{t.cols.passRate}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.median}</th>
          <th scope="col" className={TH}>{t.cols.failures}</th>
          <th scope="col" className={TH}>{t.cols.errors}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((ex) => {
          const failures = topFailures(ex.failures);
          return (
            <tr key={ex.exercise} data-row={ex.exercise} className="align-top">
              <th scope="row" className={`${ROWHEAD} min-w-[12rem]`}>
                <ExerciseName ex={ex} trackTitles={trackTitles} challengeTitles={challengeTitles} />
              </th>
              <td className={NUM}>{fmt.count(ex.attempts)}</td>
              <td className={NUM}>{fmt.count(ex.learners)}</td>
              <td className="px-3 py-3 tabular-nums whitespace-nowrap" data-cell="pass-rate">
                {fmt.percent(ex.passRate)}
                <MiniBar ratio={ex.passRate} />
              </td>
              <td className={NUM}>{fmt.ms(ex.medianRunMs)}</td>
              <td className="px-3 py-3 min-w-[10rem]">
                {failures.length === 0 ? (
                  <span className="text-fg-subtle">{t.noFailures}</span>
                ) : (
                  <ul className="space-y-0.5">
                    {failures.map((f) => (
                      <li key={f.key} className="text-fg-soft">
                        {statusLabel(f.key)} <span className="tabular-nums text-fg-subtle">({fmt.count(f.count)})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="px-3 py-3 min-w-[14rem] max-w-[22rem]">
                {ex.commonErrors.length === 0 ? (
                  <span className="text-fg-subtle">{t.errorsNone}</span>
                ) : (
                  <details>
                    <summary className="inline-flex min-h-8 cursor-pointer items-center font-semibold text-emerald-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                      {plural(t.errorsSummary, ex.commonErrors.length, lang, { n: fmt.count(ex.commonErrors.length) })}
                    </summary>
                    <ol className="mt-2 space-y-2">
                      {ex.commonErrors.map((e, i) => (
                        <li key={i}>
                          {/* Anonymised first error lines: rendered as plain text, always left-to-right like code. */}
                          <code dir="ltr" className="block whitespace-pre-wrap break-words rounded-md bg-fg/5 px-2 py-1 text-start text-xs text-fg-soft">
                            {e.text}
                          </code>
                          <span className="mt-0.5 block text-xs tabular-nums text-fg-subtle">×{fmt.count(e.count)}</span>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableSection>
  );
}

export function ChallengesTable({ challenges, challengeTitles, fmt }: { challenges: InstructorAnalytics["challenges"]; challengeTitles: Record<string, L10nText>; fmt: Fmt }) {
  const { tx, lang } = useLang();
  const t = tx.instructor.challenges;
  const { rows, idle } = activeChallenges(challenges);
  return (
    <TableSection title={t.title} caption={t.caption} empty={t.empty} hasRows={rows.length > 0}>
      <thead className="border-b border-line bg-surface-2">
        <tr>
          <th scope="col" className={TH}>{t.cols.challenge}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.solves}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.attempts}</th>
          <th scope="col" className={`${TH} text-end`}>{t.cols.median}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((c) => {
          const title = challengeTitles[c.id]?.[lang] || c.id;
          return (
            <tr key={c.id} data-row={c.id}>
              <th scope="row" className={`${ROWHEAD} min-w-[10rem]`}>
                <span className="block font-semibold text-fg">{title}</span>
                {title !== c.id && (
                  <code dir="ltr" className="block text-start text-xs text-fg-subtle">
                    {c.id}
                  </code>
                )}
              </th>
              <td className={NUM}>{fmt.count(c.solves)}</td>
              <td className={NUM}>{fmt.count(c.attempts)}</td>
              <td className={NUM}>{fmt.minutes(c.medianMinutesToSolve)}</td>
            </tr>
          );
        })}
      </tbody>
      {idle > 0 && (
        <tfoot>
          <tr>
            <td colSpan={4} className="border-t border-line px-3 py-3 text-xs text-fg-subtle">
              {plural(t.idle, idle, lang, { n: fmt.count(idle) })}
            </td>
          </tr>
        </tfoot>
      )}
    </TableSection>
  );
}
