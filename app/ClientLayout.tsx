"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/lang-context";
import { useAuthUser } from "@/lib/auth";
import { startSync } from "@/lib/sync";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const user = useAuthUser();
  const userId = user?.sub;

  // Mirror the language onto <html> (the pre-paint script handles first load)
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    html.classList.toggle("font-arabic", lang === "ar");
  }, [lang]);

  // Signed-in users get their study progress synced across devices
  useEffect(() => {
    if (userId) startSync();
  }, [userId]);

  return <>{children}</>;
}
