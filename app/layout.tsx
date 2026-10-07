import type { Metadata, Viewport } from "next";
import { Geist, Tajawal } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LangProvider } from "@/lib/lang-context";
import { PRE_PAINT_SCRIPT } from "@/lib/theme";
import { SITE_URL, buildCsp } from "@/lib/site";
import ClientLayout from "./ClientLayout";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IMBEGNAL — Learn tech skills by doing",
    template: "%s · IMBEGNAL",
  },
  description:
    "Free bilingual (English/Arabic) study platform: structured courses, interactive lessons, in-browser coding exercises, quizzes, notes and an AI tutor — plus roadmaps and certification guides.",
  keywords: ["learn to code", "courses", "roadmap", "certifications", "cyber security", "AI", "Arabic", "تعلم البرمجة", "دورات"],
  applicationName: "IMBEGNAL",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "IMBEGNAL",
    url: SITE_URL,
    title: "IMBEGNAL — Learn tech skills by doing",
    description: "Interactive bilingual courses, quizzes and an AI tutor. Free to start.",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c10" },
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Best-effort CSP via meta tag (see buildCsp). Production only: in dev it would
// block the local worker on localhost:8787.
const CSP = buildCsp();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geist.variable} ${tajawal.variable} h-full antialiased`}
    >
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={CSP} />
        )}
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
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
