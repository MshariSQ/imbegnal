import type { Metadata } from "next";
import { Suspense } from "react";
import CodeLab, { LabSkeleton } from "@/components/codelab/CodeLab";

export const metadata: Metadata = {
  title: "Code Lab",
  description:
    "Write, run and share code in 14 languages right in your browser: Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Kotlin, Swift and Bash. Instant output, stdin, run history and shareable links, in English and Arabic.",
  alternates: { canonical: "/code-lab/" },
  openGraph: {
    title: "Code Lab · IMBEGNAL",
    description: "An online code editor and runner for 14 languages with history and shareable snippets. Free to try, bilingual.",
    url: "/code-lab/",
  },
};

export default function CodeLabPage() {
  return (
    <Suspense fallback={<LabSkeleton />}>
      <CodeLab />
    </Suspense>
  );
}
