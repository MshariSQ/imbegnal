"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveToken, parseToken } from "@/lib/auth";
import { Zap } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    // The worker delivers the token in the URL fragment (#token=...) so it never
    // hits server logs or the Referer header. Query param kept as a fallback
    // for the transition window until the worker redeploy.
    const hashToken = new URLSearchParams(window.location.hash.slice(1)).get("token");
    const token = hashToken ?? params.get("token");
    const error = params.get("error");

    if (error || !token) {
      router.replace("/?error=auth_failed");
      return;
    }

    const user = parseToken(token);
    if (!user) {
      router.replace("/?error=invalid_token");
      return;
    }

    saveToken(token);
    // Wipe the token from the address bar / history before navigating on.
    window.history.replaceState(null, "", window.location.pathname);
    router.replace("/");
  }, [params, router]);

  return null;
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Zap size={24} className="text-emerald-400" />
        </div>
        <p className="text-gray-400">Signing you in…</p>
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
