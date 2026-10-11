"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/lang-context";
import { useAuthUser } from "@/lib/auth";
import { startSync, syncLabProgress } from "@/lib/sync";
import { Toaster } from "@/components/ui/Toast";

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

  // Signed-in users get their study progress synced across devices, and the lab
  // passes and lab XP the Worker recorded (it is the XP authority for lab exercises)
  useEffect(() => {
    if (!userId) return;
    startSync();
    syncLabProgress(userId);
  }, [userId]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
