import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create a free IMBEGNAL account to sync your learning progress, notes and streak.",
  alternates: { canonical: "/login/" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
