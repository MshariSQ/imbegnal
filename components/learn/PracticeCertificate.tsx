"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Loader2, LogIn, Printer, ScrollText } from "lucide-react";
import { useAuthUser, getToken } from "@/lib/auth";
import { useLang } from "@/lib/lang-context";
import { API_URL } from "@/lib/site";
import { certificateCodeFromInfo, printableCertificateHref } from "@/lib/certificates/printable";
import ProgressBar from "@/components/ui/ProgressBar";
import { fmt } from "./PracticeLink";

type Status = { kind: "idle" } | { kind: "busy" } | { kind: "opening" } | { kind: "done" } | { kind: "error"; message: string };

/**
 * Certificate card. Progress is local; the PDF comes from the authenticated
 * `GET /api/certificates/<track>` (the Worker re-checks completion), fetched as
 * a Blob so the Bearer token never goes into a URL.
 *
 * "Printable certificate" asks the same endpoint for `?format=json` (CertificateInfo, same Bearer token) and opens
 * `/certificate/?code=...&print=1`: the browser-rendered certificate, which can print an Arabic name.
 */
export default function PracticeCertificate({ trackId, done, total }: { trackId: string; done: number; total: number }) {
  const { tx } = useLang();
  const T = tx.curriculum;
  const user = useAuthUser(); // null for guests and during prerender
  const router = useRouter();
  const printHintId = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const busyRef = useRef(false);
  const complete = total > 0 && done === total;

  const errorFor = (status: number) =>
    status === 401 ? T.certificateErrorAuth
    : status === 400 || status === 403 || status === 409 || status === 422 ? T.certificateErrorNotReady
    : T.certificateErrorUnavailable;

  async function download() {
    const token = getToken();
    if (!token || busyRef.current) return;
    busyRef.current = true;
    setStatus({ kind: "busy" });
    try {
      const res = await fetch(`${API_URL}/api/certificates/${encodeURIComponent(trackId)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setStatus({ kind: "error", message: errorFor(res.status) });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imbegnal-${trackId}-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setStatus({ kind: "done" });
    } catch {
      setStatus({ kind: "error", message: T.certificateErrorNetwork });
    } finally {
      busyRef.current = false;
    }
  }

  async function openPrintable() {
    const token = getToken();
    if (!token || busyRef.current) return;
    busyRef.current = true;
    setStatus({ kind: "opening" });
    try {
      const res = await fetch(`${API_URL}/api/certificates/${encodeURIComponent(trackId)}?format=json`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        setStatus({ kind: "error", message: errorFor(res.status) });
        return;
      }
      const code = certificateCodeFromInfo(await res.json().catch(() => null));
      if (!code) {
        setStatus({ kind: "error", message: T.certificateErrorUnavailable });
        return;
      }
      router.push(printableCertificateHref(code));
    } catch {
      setStatus({ kind: "error", message: T.certificateErrorNetwork });
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div className="card p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-center gap-2.5">
        <ScrollText size={18} className="text-emerald-400" aria-hidden />
        <h3 className="text-base font-extrabold text-fg">{T.certificateTitle}</h3>
      </div>
      <div className="mt-4">
        <ProgressBar value={total ? done / total : 0} label={T.certificateTitle} />
        <p dir="auto" className="text-xs text-fg-subtle mt-2 tabular-nums">{fmt(T.certificateProgress, { done, total })}</p>
      </div>
      <p className="text-sm text-fg-soft mt-4 leading-relaxed">
        {!complete ? T.certificateLocked : user ? T.certificateReady : T.certificateSignIn}
      </p>
      <div className="mt-auto pt-5">
        {complete && user && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={download}
              disabled={status.kind === "busy" || status.kind === "opening"}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-brand hover:bg-brand-strong disabled:opacity-70 text-brand-fg text-sm font-bold transition-colors"
            >
              {status.kind === "busy" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Download size={16} aria-hidden />}
              {status.kind === "busy" ? T.certificatePreparing : T.certificateDownload}
            </button>
            <button
              type="button"
              onClick={openPrintable}
              disabled={status.kind === "busy" || status.kind === "opening"}
              aria-describedby={printHintId}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl border border-line-strong text-fg-soft hover:text-fg hover:bg-fg/5 disabled:opacity-70 text-sm font-bold transition-colors"
            >
              {status.kind === "opening" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Printer size={16} aria-hidden />}
              {status.kind === "opening" ? T.certificateOpening : T.certificatePrintable}
            </button>
          </div>
        )}
        {complete && user && <p id={printHintId} className="text-xs text-fg-subtle mt-2 leading-relaxed">{T.certificatePrintableHint}</p>}
        {complete && !user && (
          <Link href="/login/" className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl border border-line-strong text-fg-soft hover:text-fg hover:bg-fg/5 text-sm font-bold transition-colors">
            <LogIn size={16} aria-hidden /> {T.certificateSignInCta}
          </Link>
        )}
        <div role="status" aria-live="polite" className="text-sm mt-3 empty:hidden">
          {status.kind === "error" && <p className="text-red-400">{status.message}</p>}
          {status.kind === "done" && <p className="text-emerald-400">{T.certificateDone}</p>}
        </div>
      </div>
    </div>
  );
}
