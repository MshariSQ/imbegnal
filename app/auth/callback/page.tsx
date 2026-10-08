"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveToken, parseToken } from "@/lib/auth";
import { type CheckFailure, type NonceStorage, check, clear } from "@/lib/auth-nonce";
import { getApiLevel } from "@/lib/capabilities";
import { track } from "@/lib/track";
import { Zap } from "lucide-react";

/** Error code for /login/?error=..., where the login page shows the matching bilingual message. */
const LOGIN_ERROR: Record<CheckFailure, string> = {
  missing_token: "auth_failed",
  nonce_mismatch: "login_untrusted",
  nonce_missing: "login_untrusted",
  nonce_expired: "login_expired",
};

/** This tab's sessionStorage, or an empty stand-in when it is blocked (then no stored nonce matches). */
function tabStorage(): NonceStorage {
  try {
    const s = window.sessionStorage;
    s.getItem("probe");
    return s;
  } catch {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  }
}

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  // One attempt per page load: the login nonce is single-use, and Strict Mode re-runs effects.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // The worker delivers the token in the URL fragment (#token=...&nonce=...) so it never
    // hits server logs or the Referer header.
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    // Wipe the token from the address bar / history at once, whatever the outcome.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    const storage = tabStorage();

    if (params.get("error")) {
      clear(storage);
      router.replace("/login/?error=auth_failed");
      return;
    }

    // Login-CSRF guard: only a sign-in this tab started may set the session (lib/auth-nonce.ts).
    void check(fragment, Date.now(), { storage, apiLevel: getApiLevel }).then((result) => {
      if (!result.ok) {
        router.replace(`/login/?error=${LOGIN_ERROR[result.reason]}`);
        return;
      }
      if (!parseToken(result.token)) {
        router.replace("/login/?error=invalid_token");
        return;
      }
      saveToken(result.token);
      track("auth");
      router.replace("/dashboard/");
    });
  }, [params, router]);

  return null;
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Zap size={24} className="text-emerald-400" />
        </div>
        <p className="text-fg-muted">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
      <Spinner />
    </Suspense>
  );
}
