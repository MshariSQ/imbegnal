"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Link2, Loader2, LogIn, Share2 } from "lucide-react";
import { snippetHref } from "../../shared/links";
import { useLang } from "@/lib/lang-context";
import { createSnippet } from "@/lib/codelab/api";
import { isAbortError } from "@/lib/codelab/api-error";
import type { Problem } from "@/lib/codelab/errors";
import { toServerLang, type LabLangId } from "@/lib/codelab/langs";
import { loginHref } from "@/lib/codelab/nav";
import { trackLab } from "@/lib/codelab/analytics";
import { CopyButton, Sheet, btnGhost, btnPrimary, focusRing } from "./ui";

/** Creates an immutable public snippet and shows its permalink. Signed-in only. */
export default function ShareDialog({
  open,
  onClose,
  lang,
  code,
  stdin,
  signedIn,
  returnTo,
  problemFor,
}: {
  open: boolean;
  onClose: () => void;
  lang: LabLangId;
  code: string;
  stdin: string;
  signedIn: boolean;
  returnTo: string;
  problemFor: (err: unknown, lang: LabLangId) => Problem;
}) {
  const { tx } = useLang();
  const s = tx.codelab.share;
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);

  // Move focus to the new link so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (url) document.getElementById("share-link")?.focus();
  }, [url]);

  const serverLang = toServerLang(lang);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function create() {
    if (!serverLang) return;
    setBusy(true);
    setProblem(null);
    try {
      const res = await createSnippet({ lang: serverLang, code, stdin: stdin || undefined, title: title.trim() || undefined });
      const path = res.path.startsWith("/") ? res.path : snippetHref(res.id);
      setUrl(`${window.location.origin}${path}`);
      trackLab("codelab_share", lang);
    } catch (err) {
      if (!isAbortError(err)) setProblem(problemFor(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function nativeShare() {
    if (!url) return;
    try {
      await navigator.share({ title: title.trim() || s.nativeTitle, url });
    } catch {
      // dismissed by the user
    }
  }

  function close() {
    onClose();
    // A new share starts fresh; the created link stays valid forever.
    setUrl(null);
    setProblem(null);
  }

  return (
    <Sheet open={open} onClose={close} title={s.title} closeLabel={tx.codelab.close}>
      <div className="p-4 space-y-4" data-testid="share-dialog">
        {!signedIn ? (
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm font-bold text-fg">{s.signInTitle}</p>
            <p className="mt-1 text-sm text-fg-soft">{s.signInBody}</p>
            <Link href={loginHref(returnTo)} className={`${btnPrimary} mt-3 w-fit`}>
              <LogIn size={15} aria-hidden="true" />
              {tx.codelab.signIn}
            </Link>
          </div>
        ) : !serverLang ? (
          <p className="text-sm text-fg-soft">{s.webUnsupported}</p>
        ) : url ? (
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-fg-subtle" htmlFor="share-link">
              {s.linkLabel}
            </label>
            <input id="share-link" readOnly dir="ltr" value={url} onFocus={(e) => e.currentTarget.select()} className={`w-full min-h-10 rounded-lg border border-line bg-bg px-3 font-mono text-xs text-fg text-start ${focusRing}`} data-testid="share-url" />
            <div className="flex flex-wrap gap-2">
              <CopyButton text={url} label={s.copy} copiedLabel={s.copied} className="border border-line !min-h-10 !px-3 !text-sm" />
              {canNativeShare && (
                <button type="button" onClick={nativeShare} className={btnGhost}>
                  <Share2 size={15} aria-hidden="true" />
                  {s.native}
                </button>
              )}
            </div>
            <p className="text-xs text-fg-subtle">{s.note}</p>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="share-title" className="block text-xs font-bold uppercase tracking-wider text-fg-subtle mb-1.5">
                {s.titleLabel}
              </label>
              <input
                id="share-title"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={s.titlePlaceholder}
                className={`w-full min-h-10 rounded-lg border border-line bg-bg px-3 text-sm text-fg placeholder:text-fg-subtle ${focusRing}`}
              />
            </div>
            <p className="text-xs text-fg-subtle">{s.note}</p>
            {problem && (
              <p role="alert" className="text-sm text-red-400">
                <strong>{problem.title}</strong> {problem.body}
              </p>
            )}
            <button type="button" onClick={create} disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 size={15} aria-hidden="true" className="motion-safe:animate-spin" /> : <Link2 size={15} aria-hidden="true" />}
              {busy ? s.creating : s.create}
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
