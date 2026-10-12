import type { Metadata } from "next";
import { Suspense } from "react";
import { LabSkeleton } from "@/components/codelab/CodeLab";
import SnippetView from "@/components/codelab/SnippetView";

// A permalink is a private-by-link snapshot, not a page to index.
const title = "Shared snippet";
const description =
  "A read-only snippet shared from IMBEGNAL Code Lab. Run it, or open it in Code Lab to make your own copy.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false },
  alternates: { canonical: "/code-lab/s/" },
  openGraph: { title: `${title} · IMBEGNAL`, description, url: "/code-lab/s/" },
};

export default function SnippetPage() {
  return (
    <Suspense fallback={<LabSkeleton />}>
      <SnippetView />
    </Suspense>
  );
}
