"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveToken, parseToken } from "@/lib/auth";
import { Zap } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
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
    router.replace("/");
  }, [params, router]);

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
