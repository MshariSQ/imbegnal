"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, ChevronLeft, Clock, Trophy } from "lucide-react";
import type { ChallengeMeta, L10nText } from "@/shared/challenges";
import { challengeHref, challengesHref, codeLabHref, courseHref, lessonHref } from "@/shared/links";
import TextBlock from "@/components/lesson/TextBlock";
import { getToken, useAuthUser } from "@/lib/auth";
import { useLang } from "@/lib/lang-context";
import { openChallenge } from "@/lib/ctf/api";
import { loginHref } from "@/lib/ctf/errors";
import { fmt } from "@/lib/ctf/format";
import { topicLabel, trackTitle } from "@/lib/ctf/labels";
import { clampCount } from "@/lib/ctf/points";
import { formatDuration, formatNumber } from "@/lib/ctf/time";
import type { ChallengeListItem, TrackInfo } from "@/lib/ctf/types";
import { useChallengeStats } from "@/lib/ctf/use-ctf";
import { DifficultyBadge, FirstBlood, KindBadge } from "./Badges";
import FileViewer from "./FileViewer";
import HintsPanel from "./HintsPanel";
import SubmitPanel from "./SubmitPanel";

export interface LessonLink {
  track: string;
  lesson: string;
  title: L10nText;
}

/** Challenge ids already announced to the Worker this session (open is idempotent server-side; this just saves requests). */
const opened = new Set<string>();

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="mb-1 text-xl font-extrabold text-fg">
        {title}
      </h2>
      {intro && <p className="mb-4 text-sm text-fg-muted">{intro}</p>}
      {!intro && <div className="mb-3" />}
      {children}
    </section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2">
      <dt className="shrink-0 text-sm text-fg-muted">{label}</dt>
      <dd className="ms-auto min-w-0 max-w-full text-end text-sm font-semibold text-fg">{children}</dd>
    </div>
  );
}

export default function ChallengeDetail({
  challenge,
  track,
  lessons,
  related,
}: {
  challenge: ChallengeMeta;
  track?: TrackInfo;
  lessons: LessonLink[];
  related: ChallengeListItem[];
}) {
  const { tx, lang } = useLang();
  const t = tx.ctf;
  const user = useAuthUser();
  const pathname = usePathname();
  const stats = useChallengeStats();
  const stat = stats.index.get(challenge.id);
  const solved = stats.solved.has(challenge.id);
  const mine = stat?.mine;
  const hints = useMemo(() => challenge.hints ?? [], [challenge.hints]);
  const hintsUsed = clampCount(mine?.hintsUsed, hints.length);
  const title = trackTitle(tx, challenge.track, track?.title);

  // On the first view by a signed-in learner, stamp the open time (time-to-solve). Failures are silent by design.
  const sub = user?.sub;
  useEffect(() => {
    if (!sub || opened.has(`${sub}:${challenge.id}`)) return;
    const token = getToken();
    if (!token) return;
    opened.add(`${sub}:${challenge.id}`);
    openChallenge(challenge.id, token).catch(() => {
      opened.delete(`${sub}:${challenge.id}`);
    });
  }, [sub, challenge.id]);

  // Next suggestion: the first challenge nearby the learner has not solved yet (never the current one).
  const next = related.find((r) => !stats.solved.has(r.id)) ?? undefined;

  const lessonRows = lessons.map((l) => ({ ...l, key: `${l.track}/${l.lesson}` }));

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <nav aria-label={t.allChallenges} className="mb-5">
        <Link href={challengesHref()} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg">
          <ChevronLeft size={16} aria-hidden className="rtl-flip" />
          {t.allChallenges}
        </Link>
      </nav>

      <header className="mb-8 max-w-4xl">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Link href={challengesHref(challenge.track)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-xs font-semibold text-fg-muted hover:border-line-strong hover:text-fg">
            <span aria-hidden>{track?.icon ?? "🏁"}</span>
            {title}
          </Link>
          <DifficultyBadge difficulty={challenge.difficulty} />
          <KindBadge kind={challenge.kind} />
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-fg-subtle">{topicLabel(tx, challenge.topic)}</span>
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-fg sm:text-4xl">{challenge.title[lang]}</h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted sm:text-lg">{challenge.summary[lang]}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-muted">
          <span className="inline-flex items-center gap-1.5 font-bold text-fg">
            <Trophy size={15} aria-hidden className="text-amber-400" />
            <span dir="ltr">{fmt(t.card.points, { n: formatNumber(challenge.points) })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} aria-hidden />
            <span className="sr-only">{t.card.est}: </span>
            {formatDuration(challenge.estMinutes, t.units)}
          </span>
          {solved && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400" data-testid="ctf-solved-badge">
              <CheckCircle2 size={16} aria-hidden />
              {t.card.solved}
              {mine?.solved && mine.points > 0 && <span dir="ltr">{fmt(t.card.earned, { n: formatNumber(mine.points) })}</span>}
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="ctf-statement" className="min-w-0 lg:col-start-1">
          <h2 id="ctf-statement" className="mb-3 text-xl font-extrabold text-fg">
            {t.detail.statement}
          </h2>
          <div className="card p-5 sm:p-6">
            <TextBlock body={challenge.description} />
            {challenge.flagFormat && (
              <p className="mt-2 text-sm text-fg-muted">
                <span className="font-semibold text-fg-soft">{t.detail.flagFormat}: </span>
                <code dir="ltr" className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-fg">
                  {challenge.flagFormat}
                </code>
              </p>
            )}
            {challenge.sampleInput !== undefined && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-bold text-fg-soft">{t.detail.sampleInput}</h3>
                <pre dir="ltr" tabIndex={0} className="max-h-60 overflow-auto rounded-lg border border-line bg-bg p-3 text-start font-mono text-[13px] text-fg-soft">
                  {challenge.sampleInput}
                </pre>
              </div>
            )}
            {challenge.kind !== "flag" && challenge.allowedLangs && challenge.allowedLangs.length > 0 && (
              <p className="mt-4 text-xs text-fg-subtle">
                {t.detail.allowedLangs}: <span dir="ltr">{challenge.allowedLangs.join(", ")}</span>
              </p>
            )}
          </div>
        </section>

        <aside className="mt-6 space-y-5 lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mt-10 lg:self-start lg:sticky lg:top-24" aria-label={t.submit.asideLabel}>
          <SubmitPanel challenge={challenge} solved={solved} next={next} />

          <section aria-labelledby="ctf-progress" className="card p-5">
            <h2 id="ctf-progress" className="mb-2 text-base font-bold text-fg">
              {t.progress.title}
            </h2>
            {user ? (
              <dl className="divide-y divide-line">
                <Stat label={t.progress.status}>{solved ? t.progress.solved : t.progress.unsolved}</Stat>
                <Stat label={t.progress.attempts}>{formatNumber(mine?.attempts ?? 0)}</Stat>
                <Stat label={t.progress.hintsUsed}>
                  {formatNumber(hintsUsed)}
                  {hints.length > 0 && <span className="text-fg-subtle"> / {hints.length}</span>}
                </Stat>
                {mine?.solved && <Stat label={t.progress.pointsEarned}>{formatNumber(mine.points)}</Stat>}
                {mine?.solved && mine.minutesToSolve !== undefined && <Stat label={t.progress.timeToSolve}>{formatDuration(mine.minutesToSolve, t.units)}</Stat>}
              </dl>
            ) : (
              <p className="text-sm text-fg-muted">
                {t.progress.signIn}{" "}
                <Link href={loginHref(pathname || challengeHref(challenge.id))} className="font-semibold text-emerald-400 hover:underline">
                  {t.me.signIn}
                </Link>
              </p>
            )}
          </section>

          <section aria-labelledby="ctf-solve-stats" className="card p-5">
            <h2 id="ctf-solve-stats" className="mb-2 text-base font-bold text-fg">
              {t.solveStats.title}
            </h2>
            {stats.status === "error" ? (
              <p className="text-sm text-fg-muted">{t.stats.unavailable}</p>
            ) : (
              <dl className="divide-y divide-line" aria-busy={stats.status === "loading" && !stat}>
                <Stat label={t.solveStats.solves}>{stat ? formatNumber(stat.solves) : "—"}</Stat>
                <Stat label={t.solveStats.firstBlood}>{stat?.firstBlood ? <FirstBlood firstBlood={stat.firstBlood} className="justify-end text-start" wrap /> : stat ? t.solveStats.nobody : "—"}</Stat>
                <Stat label={t.solveStats.median}>
                  {stat?.medianSolveMinutes !== undefined ? formatDuration(stat.medianSolveMinutes, t.units) : stat ? <span className="font-normal text-fg-subtle">{t.solveStats.medianNone}</span> : "—"}
                </Stat>
              </dl>
            )}
          </section>

          <Link
            href={codeLabHref({ kind: "blank", lang: challenge.lang })}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-fg-soft hover:border-line-strong hover:text-fg"
          >
            {t.practice}
          </Link>
        </aside>

        {challenge.files && challenge.files.length > 0 && (
          <div className="min-w-0 lg:col-start-1">
            <Section id="ctf-files" title={t.detail.files} intro={t.detail.filesIntro}>
              <div className="space-y-4">
                {challenge.files.map((f) => (
                  <FileViewer key={f.name} file={f} />
                ))}
              </div>
            </Section>
          </div>
        )}

        {hints.length > 0 && (
          <div className="min-w-0 lg:col-start-1">
            <Section id="ctf-hints" title={t.hints.title}>
              <HintsPanel
                challengeId={challenge.id}
                hints={hints}
                points={challenge.points}
                hintsUsed={hintsUsed}
                revealed={mine?.revealedHints}
                solved={solved}
                statsStatus={stats.status}
              />
            </Section>
          </div>
        )}

        {lessonRows.length > 0 && (
          <div className="min-w-0 lg:col-start-1">
            <Section id="ctf-lessons" title={t.detail.lessons} intro={t.detail.lessonsIntro}>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {lessonRows.map((l) => (
                  <li key={l.key}>
                    <Link href={lessonHref(l.track, l.lesson)} className="card card-hover flex min-h-14 items-center gap-3 px-4 py-3">
                      <BookOpen size={18} aria-hidden className="shrink-0 text-emerald-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-fg">{l.title[lang]}</span>
                        <span className="block truncate text-xs text-fg-subtle">{trackTitle(tx, l.track)}</span>
                      </span>
                      <ArrowRight size={16} aria-hidden className="rtl-flip shrink-0 text-fg-subtle" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        {track && (
          <div className="min-w-0 lg:col-start-1">
            <Section id="ctf-course" title={t.detail.courseHeading}>
              <Link href={courseHref(challenge.track)} className="card card-hover flex min-h-14 items-center gap-3 px-4 py-3">
                <span aria-hidden className="text-2xl">
                  {track.icon}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold text-fg">{fmt(t.detail.course, { track: title })}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
                  {t.detail.viewCourse}
                  <ArrowRight size={14} aria-hidden className="rtl-flip" />
                </span>
              </Link>
            </Section>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <Section id="ctf-related" title={t.detail.related}>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((r) => (
              <li key={r.id}>
                <Link href={challengeHref(r.id)} className="card card-hover flex h-full flex-col gap-2 p-4">
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0 text-sm font-bold text-fg">{r.title[lang]}</span>
                    {stats.solved.has(r.id) && (
                      <>
                        <CheckCircle2 size={16} aria-hidden className="shrink-0 text-emerald-400" />
                        <span className="sr-only">{t.card.solved}</span>
                      </>
                    )}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={r.difficulty} />
                    <span className="text-xs font-bold text-fg-muted" dir="ltr">
                      {fmt(t.card.points, { n: formatNumber(r.points) })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}
