import type { Metadata } from "next";
import { pageOpenGraph } from "@/lib/site";

const title = "Sign in";
const description =
  "Sign in or create a free IMBEGNAL account to sync your learning progress, notes and streak.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/login/" },
  openGraph: pageOpenGraph({ title: `${title} · IMBEGNAL`, description, url: "/login/" }),
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
