"use client";

/**
 * /certificate/?code=IMB-XXXX-XXXX-XXXX: public certificate verification. The PDF certificates print this URL.
 *
 * Static export: the code only exists in the browser, so it is read with useSearchParams under a Suspense
 * boundary (app/certificate/page.tsx). The server render and the first client render are the neutral loading
 * shell; everything that depends on the code, the network or the clock appears after mount.
 */
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2, RefreshCw, SearchX, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLang } from "@/lib/lang-context";
import { trackTitle } from "@/lib/ctf/labels";
import { certificateHref, formatIssueDate, parseCertificateInput, verifyCertificate, type VerifiedCertificate, type VerifyOutcome } from "@/lib/certificates/verify";

const MAIN = "mx-auto max-w-2xl px-4 pb-20 pt-28 sm:px-6";
const BTN = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const BTN_PRIMARY = `${BTN} bg-brand text-brand-fg hover:bg-brand-strong`;
const BTN_GHOST = `${BTN} border border-line-strong text-fg-soft hover:bg-fg/5 hover:text-fg`;

function Shell({ children }: { children?: React.ReactNode }) {
  const { tx } = useLang();
  const t = tx.certVerify;
  return (
    <main className={MAIN}>
      <PageHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      {children}
    </main>
  );
}

/** Prerendered shell (Suspense fallback): the heading stays in the static HTML, the body is a neutral placeholder. */
export function CertificateFallback() {
  return (
    <Shell>
      <div aria-hidden className="h-40 animate-pulse rounded-2xl border border-line bg-surface" />
    </Shell>
  );
}

export default function CertificateVerify({ courseTitles }: { courseTitles: Record<string, string> }) {
  const raw = useSearchParams().get("code") ?? "";
  // A new code in the URL starts a fresh check (and clears the form's draft and error).
  return <Verifier key={raw} raw={raw} courseTitles={courseTitles} />;
}

interface Settled {
  code: string;
  attempt: number;
  outcome: VerifyOutcome;
}

function Verifier({ raw, courseTitles }: { raw: string; courseTitles: Record<string, string> }) {
  const { tx } = useLang();
  const t = tx.certVerify;
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const headingId = `${inputId}-heading`;

  const hasInput = raw.trim() !== "";
  const code = hasInput ? parseCertificateInput(raw) : null;
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  const [formError, setFormError] = useState(false);

  useEffect(() => {
    if (!code) return;
    const ctl = new AbortController();
    verifyCertificate(code, ctl.signal)
      .then((outcome) => setSettled({ code, attempt, outcome }))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setSettled({ code, attempt, outcome: { kind: "unavailable" } });
      });
    return () => ctl.abort();
  }, [code, attempt]);

  // An answer for another code, or from before a retry, counts as "still checking".
  const outcome: VerifyOutcome | null = !hasInput ? null : !code ? { kind: "invalid" } : settled && settled.code === code && settled.attempt === attempt ? settled.outcome : null;
  const checking = hasInput && outcome === null;
  const showForm = !hasInput || outcome?.kind === "invalid";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("code");
    const next = parseCertificateInput(typeof value === "string" ? value : "");
    if (!next) {
      setFormError(true);
      return;
    }
    setFormError(false);
    if (next === code) setAttempt((a) => a + 1);
    else router.replace(`${pathname}?${new URLSearchParams({ code: next }).toString()}`, { scroll: false });
  }

  return (
    <Shell>
      {showForm && (
        <form onSubmit={onSubmit} noValidate className="card mb-6 p-5 sm:p-6">
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-bold text-fg">
            {t.form.label}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id={inputId}
              name="code"
              type="text"
              dir="ltr"
              defaultValue={raw}
              placeholder={t.form.placeholder}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={formError || undefined}
              aria-describedby={formError ? `${hintId} ${errorId}` : hintId}
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 font-mono text-sm tracking-wide text-fg outline-none placeholder:text-fg-faint focus:border-brand/60 focus-visible:outline-2 focus-visible:outline-brand"
            />
            <button type="submit" className={BTN_PRIMARY}>
              {t.form.submit}
            </button>
          </div>
          <p id={hintId} className="mt-2 text-xs text-fg-subtle">
            {t.form.hint}
          </p>
          {formError && (
            <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-red-400">
              {t.form.invalid}
            </p>
          )}
        </form>
      )}

      <div aria-live="polite" aria-busy={checking} data-testid="cert-result">
        {checking && (
          <div className="card flex items-center gap-3 p-6 text-sm font-medium text-fg-muted" data-testid="cert-loading">
            <Loader2 size={18} className="animate-spin" aria-hidden />
            {t.loading}
          </div>
        )}

        {outcome?.kind === "valid" && <ValidCard cert={outcome.certificate} headingId={headingId} courseTitles={courseTitles} />}

        {outcome?.kind === "invalid" && (
          <section aria-labelledby={headingId} className="card p-6 sm:p-8" data-testid="cert-invalid">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-400/15 text-amber-400">
                <SearchX size={24} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 id={headingId} className="text-xl font-extrabold text-fg">
                  {t.notFound.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{t.notFound.body}</p>
              </div>
            </div>
          </section>
        )}

        {outcome?.kind === "unavailable" && (
          <section aria-labelledby={headingId} className="card p-6 sm:p-8" data-testid="cert-unavailable">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-400/15 text-amber-400">
                <AlertTriangle size={24} aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 id={headingId} className="text-xl font-extrabold text-fg">
                  {t.unavailable.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">{t.unavailable.body}</p>
                <button type="button" onClick={() => setAttempt((a) => a + 1)} className={`${BTN_GHOST} mt-5`}>
                  <RefreshCw size={14} aria-hidden />
                  {t.unavailable.retry}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {outcome?.kind === "valid" && (
        <p className="mt-6">
          <Link href={certificateHref()} className="text-sm font-semibold text-emerald-400 hover:underline">
            {t.another}
          </Link>
        </p>
      )}
    </Shell>
  );
}

function ValidCard({ cert, headingId, courseTitles }: { cert: VerifiedCertificate; headingId: string; courseTitles: Record<string, string> }) {
  const { tx, lang } = useLang();
  const t = tx.certVerify.valid;
  const course = cert.track ? trackTitle(tx, cert.track, courseTitles[cert.track]) : undefined;
  const issued = cert.issuedAt ? formatIssueDate(cert.issuedAt, lang) : "";
  const rows: { label: string; value: string; ltr?: boolean }[] = [
    ...(cert.recipient ? [{ label: t.recipient, value: cert.recipient }] : []),
    ...(course ? [{ label: t.course, value: course }] : []),
    ...(issued ? [{ label: t.issued, value: issued }] : []),
    { label: t.code, value: cert.code, ltr: true },
  ];
  return (
    <section aria-labelledby={headingId} className="card border-emerald-500/40 p-6 sm:p-8" data-testid="cert-valid">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
          <ShieldCheck size={26} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-2xl font-extrabold text-fg">
            {t.title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">{t.body}</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0">
            <dt className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">{r.label}</dt>
            <dd className="mt-1 break-words text-base font-bold text-fg text-start" dir={r.ltr ? "ltr" : "auto"} data-field={r.ltr ? "code" : undefined}>
              {r.ltr ? <span className="font-mono tracking-wide">{r.value}</span> : r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
