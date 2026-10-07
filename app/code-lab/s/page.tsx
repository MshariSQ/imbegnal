import type { Metadata } from "next";
import { Suspense } from "react";
import { LabSkeleton } from "@/components/codelab/CodeLab";
import SnippetView from "@/components/codelab/SnippetView";

// A permalink is a private-by-link snapshot, not a page to index.
export const metadata: Metadata = {
  title: "Shared snippet",
  description: "A read-only snippet shared from IMBEGNAL Code Lab. Run it, or open it in Code Lab to make your own copy.",
  robots: { index: false },
  alternates: { canonical: "/code-lab/s/" },
};

export default function SnippetPage() {
  return (
    <Suspense fallback={<LabSkeleton />}>
      <SnippetView />
    </Suspense>
  );
}
