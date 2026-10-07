"use client";

/**
 * Printable certificate (`/certificate/?code=...&print=1`): a designed A4 landscape page the browser lays out and
 * prints, so an Arabic name is shaped correctly (the Worker's Helvetica-only PDF cannot draw it).
 *
 * Only rendered after a successful verification, i.e. never in the prerendered HTML. The page origin for the
 * printed verification URL still comes from an external-store snapshot, not from `window` during render.
 *
 * Layout: the sheet is drawn in "sheet units" (`--u`, 1/297 of its width), so the on-screen preview scales with
 * its container (container query units, no horizontal scroll at 360 px) and prints at exactly 1 unit = 1 mm.
 * The certificate forces the light palette (white paper) whatever the site theme; see `.cert-sheet` in globals.css.
 */
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Printer, Zap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLang } from "@/lib/lang-context";
import { translations, type Lang, type Tx } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { certificateHref, formatIssueDate, type VerifiedCertificate } from "@/lib/certificates/verify";
import { certificateCourseTitle, certificateVerifyUrl, langDir, recipientNameSize } from "@/lib/certificates/printable";

const MAIN = "mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6 print:m-0 print:max-w-none print:p-0";
const BTN = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** A4 landscape with no printer margin: the sheet draws its own white border. Only present while this view is. */
const PAGE_CSS = "@page { size: A4 landscape; margin: 0; }";

const noSubscribe = () => () => {};
/** The page origin after hydration; "" while prerendering (never rendered then, but keeps the hook pure). */
const useOrigin = () =>
  useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => ""
  );

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ar", label: "العربية" },
];

export default function PrintableCertificate({
  cert,
  recipient,
  courseTitles,
  focusOnMount,
  onBack,
}: {
  cert: VerifiedCertificate;
  recipient: string;
  courseTitles: Record<string, string>;
  /** Move focus to the heading (the view was opened from a link on this page, not loaded directly). */
  focusOnMount: boolean;
  /** Called when the reader follows "Back to verification" (the result then takes focus). */
  onBack?: () => void;
}) {
  const { tx, lang } = useLang();
  const t = tx.certVerify.printable;
  const [chosen, setChosen] = useState<Lang | null>(null);
  const certLang = chosen ?? lang;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const langLabelId = useId();
  const hintId = useId();

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <main className={MAIN}>
      <div className="print:hidden">
        <PageHeader eyebrow={tx.certVerify.eyebrow} title={<span ref={headingRef} tabIndex={-1} className="outline-none">{t.title}</span>} subtitle={t.subtitle} />
      </div>

      <div className="card mb-6 flex flex-col gap-4 p-4 sm:p-5 print:hidden" data-testid="cert-print-toolbar">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={certificateHref(cert.code)} onClick={onBack} className={`${BTN} border border-line-strong text-fg-soft hover:bg-fg/5 hover:text-fg`}>
            <ArrowLeft size={16} className="rtl-flip" aria-hidden />
            {t.back}
          </Link>
          <div role="group" aria-labelledby={langLabelId} className="flex items-center gap-2">
            <span id={langLabelId} className="text-sm font-semibold text-fg-muted">
              {t.language}
            </span>
            <div className="inline-flex rounded-xl border border-line bg-bg p-1">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  lang={l.id}
                  aria-pressed={certLang === l.id}
                  onClick={() => setChosen(l.id)}
                  className={`min-h-9 rounded-lg px-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                    certLang === l.id ? "bg-brand text-brand-fg" : "text-fg-muted hover:bg-fg/5 hover:text-fg"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => window.print()} aria-describedby={hintId} className={`${BTN} bg-brand text-brand-fg hover:bg-brand-strong sm:ms-auto`}>
            <Printer size={16} aria-hidden />
            {t.print}
          </button>
        </div>
        <p id={hintId} className="text-xs leading-relaxed text-fg-subtle">
          {t.hint}
        </p>
      </div>

      <style>{PAGE_CSS}</style>
      <section aria-label={t.preview} className="cert-stage">
        <CertificateSheet cert={cert} recipient={recipient} lang={certLang} courseTitles={courseTitles} />
      </section>
    </main>
  );
}

/** The certificate itself, entirely in the certificate's language (independent of the UI language). */
function CertificateSheet({ cert, recipient, lang, courseTitles }: { cert: VerifiedCertificate; recipient: string; lang: Lang; courseTitles: Record<string, string> }) {
  const tx = translations[lang] as unknown as Tx;
  const s = tx.certVerify.sheet;
  const other: Lang = lang === "ar" ? "en" : "ar";
  const course = certificateCourseTitle(tx, cert.track, courseTitles);
  const issued = cert.issuedAt ? formatIssueDate(cert.issuedAt, lang) : "";
  const verifyUrl = certificateVerifyUrl(useOrigin(), cert.code, SITE_URL);
  const sealId = useId();
  const nameSize = recipientNameSize(recipient);

  return (
    <article lang={lang} dir={langDir(lang)} className="cert-sheet" data-testid="cert-sheet" aria-labelledby={`${sealId}-title`}>
      <div className="cert-frame" aria-hidden />
      <div className="cert-body">
        <header className="cert-top">
          <div className="cert-brand">
            <span className="cert-mark">
              <Zap aria-hidden />
            </span>
            <span>
              <span className="cert-wordmark" lang="en" dir="ltr">
                IMBEGNAL
              </span>
              <span className="cert-issuer">{s.issuer}</span>
            </span>
          </div>
          <p className="cert-alt-title" lang={other} dir={langDir(other)}>
            {translations[other].certVerify.sheet.title}
          </p>
        </header>

        <div className="cert-center">
          <h2 id={`${sealId}-title`} className="cert-title">
            {s.title}
          </h2>
          <div className="cert-divider" aria-hidden>
            <span />
            <i />
            <span />
          </div>
          <p className="cert-lead">{s.awarded}</p>
          <p dir="auto" className="cert-name" data-field="recipient" style={{ fontSize: `calc(var(--u) * ${nameSize})` }}>
            {recipient}
          </p>
          <div className="cert-name-rule" aria-hidden />
          {course && (
            <>
              <p className="cert-lead">{s.completed}</p>
              <p className="cert-course" data-field="course">
                <bdi>{course}</bdi>
              </p>
            </>
          )}
        </div>

        <footer className="cert-bottom">
          <dl className="cert-meta">
            {issued && (
              <div>
                <dt>{s.issued}</dt>
                <dd data-field="issued">{issued}</dd>
              </div>
            )}
            <div>
              <dt>{s.code}</dt>
              <dd>
                <span dir="ltr" className="cert-code" data-field="code">
                  {cert.code}
                </span>
              </dd>
            </div>
          </dl>

          <Seal label={s.seal} id={sealId} />

          <dl className="cert-meta cert-meta-end">
            <div>
              <dt>{s.verify}</dt>
              <dd>
                <span dir="ltr" className="cert-url" data-field="verify-url">
                  {verifyUrl}
                </span>
              </dd>
            </div>
          </dl>
        </footer>
      </div>
    </article>
  );
}

/** Round seal: the brand name around a ring, a check mark and the localized "Verified" in the middle. */
function Seal({ label, id }: { label: string; id: string }) {
  const ring = `${id}-ring`;
  return (
    <div className="cert-seal">
      <svg viewBox="0 0 100 100" aria-hidden focusable="false">
        <defs>
          <path id={ring} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="48" className="cert-seal-outer" />
        <circle cx="50" cy="50" r="44" className="cert-seal-dash" />
        <circle cx="50" cy="50" r="29" className="cert-seal-inner" />
        <text className="cert-seal-text" direction="ltr">
          <textPath href={`#${ring}`} startOffset="0" textLength="222" lengthAdjust="spacing">
            IMBEGNAL • IMBEGNAL • IMBEGNAL •
          </textPath>
        </text>
      </svg>
      <span className="cert-seal-center">
        <BadgeCheck aria-hidden />
        <span>{label}</span>
      </span>
    </div>
  );
}
