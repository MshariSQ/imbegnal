"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { saveToken } from "@/lib/auth";
import { track } from "@/lib/track";
import { ApiError, getGoogleLoginUrl, getLoginUrl, loginWithEmail, registerWithEmail } from "@/lib/api";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AuthForm() {
  const { tx } = useLang();
  const a = tx.auth;
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(params.get("mode") === "register" ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") ? a.errorAuthFailed : null);
  const nextParam = params.get("next");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { token } = mode === "login" ? await loginWithEmail(email, password) : await registerWithEmail(name, email, password);
      saveToken(token);
      track("auth");
      router.replace(safeNext(nextParam));
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      const status = err instanceof ApiError ? err.status : 0;
      setError(
        code === "invalid_credentials" ? a.errorCredentials
          : code === "email_taken" ? a.errorExists
          : code === "weak_password" ? a.passwordHint
          : status === 429 ? a.errorRateLimited
          : a.errorGeneric
      );
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full h-11 px-3.5 rounded-xl bg-surface border border-line-strong focus:border-brand/60 outline-none text-fg placeholder:text-fg-faint transition-colors";

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-2xl font-black tracking-tight text-fg">{mode === "login" ? a.loginTitle : a.registerTitle}</h1>
      <p className="text-sm text-fg-muted mt-1.5 mb-6">{mode === "login" ? a.loginSubtitle : a.registerSubtitle}</p>

      <div className="grid gap-2.5">
        <a href={getLoginUrl()} className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-line-strong text-sm font-semibold text-fg hover:bg-fg/5 transition-colors">
          <GithubMark /> {a.continueGithub}
        </a>
        {GOOGLE_ENABLED && (
          <a href={getGoogleLoginUrl()} className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-line-strong text-sm font-semibold text-fg hover:bg-fg/5 transition-colors">
            <GoogleMark /> {a.continueGoogle}
          </a>
        )}
      </div>

      <div className="flex items-center gap-3 my-6 text-xs text-fg-subtle">
        <span className="h-px flex-1 bg-line" /> {tx.common.or} <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="grid gap-4" noValidate={false}>
        {mode === "register" && (
          <label className="grid gap-1.5 text-sm font-medium text-fg-soft">
            {a.name}
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
          </label>
        )}
        <label className="grid gap-1.5 text-sm font-medium text-fg-soft">
          {a.email}
          <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-fg-soft">
          {a.password}
          <input
            className={input}
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            dir="ltr"
          />
          {mode === "register" && (
            <span className="text-xs font-normal text-fg-subtle">
              {a.passwordHint}. {a.noResetNote}
            </span>
          )}
        </label>

        {error && <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={busy} className="h-11 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {mode === "login" ? a.signIn : a.createAccount}
        </button>
      </form>

      <p className="text-sm text-fg-muted text-center mt-6">
        {mode === "login" ? a.noAccount : a.haveAccount}{" "}
        <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }} className="font-semibold text-emerald-400 hover:underline">
          {mode === "login" ? a.switchToRegister : a.switchToLogin}
        </button>
      </p>
    </div>
  );
}

/** Only same-origin paths: blocks "//evil.com", "/\\evil.com" and tab/newline tricks. */
function safeNext(raw: string | null): string {
  const fallback = "/dashboard/";
  if (!raw) return fallback;
  try {
    const u = new URL(raw, window.location.origin);
    return u.origin === window.location.origin ? u.pathname + u.search + u.hash : fallback;
  } catch {
    return fallback;
  }
}

export default function LoginPage() {
  const { tx } = useLang();
  return (
    <main className="relative min-h-[100dvh] pt-24 pb-16 px-4 overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-70" />
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20 bg-brand" />
      <div className="relative max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <section className="hidden lg:block">
          <span className="w-12 h-12 rounded-2xl bg-brand/15 border border-brand/30 grid place-items-center mb-6">
            <Zap size={22} className="text-emerald-400" />
          </span>
          <h2 className="text-4xl font-black tracking-tight text-fg leading-tight mb-4">{tx.learn.title}</h2>
          <p className="text-fg-muted leading-relaxed mb-8 max-w-md">{tx.learn.subtitle}</p>
          <ul className="space-y-3">
            {tx.auth.perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-fg-soft">
                <CheckCircle2 size={18} className="text-emerald-400" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-fg-subtle max-w-md">
            {tx.auth.guestNote} <Link href="/learn/" className="text-emerald-400 hover:underline">{tx.dashboard.browseCourses} →</Link>
          </p>
        </section>
        <div className="w-full max-w-md mx-auto">
          <Suspense fallback={<div className="card h-[32rem]" />}>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
