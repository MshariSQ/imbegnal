import type { Metadata } from "next";
import { Geist, Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LangProvider } from "@/lib/lang-context";
import ClientLayout from "./ClientLayout";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SkillForge — Learn Smarter, Build Your Career",
  description:
    "Free and open-source platform for learning roadmaps, certifications, courses, and career guidance. Everything you need in one place.",
  keywords: ["roadmap", "certifications", "courses", "career", "learning", "tech"],
};

// Best-effort CSP via meta tag (GitHub Pages cannot set response headers).
// 'unsafe-inline'/'unsafe-eval' are required by Next hydration, the exercise
// test harness (new Function) and Pyodide (wasm). Production only — in dev it
// would block the local worker on localhost:8787.
const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src * data:; " +
  "connect-src 'self' https://cdn.jsdelivr.net https://*.workers.dev; " +
  "object-src 'none'; base-uri 'self'";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${geist.variable} ${tajawal.variable} h-full antialiased`}>
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={CSP} />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#0D1117] text-[#e6edf3]">
        <LangProvider>
          <ClientLayout>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </ClientLayout>
        </LangProvider>
      </body>
    </html>
  );
}
