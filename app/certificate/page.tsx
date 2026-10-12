import type { Metadata } from "next";
import { Suspense } from "react";
import { roadmaps } from "@/data/roadmaps";
import CertificateVerify, { CertificateFallback } from "@/components/certificates/CertificateVerify";

// A verification result is private-by-link (the code is the credential), not a page to index.
const title = "Verify a certificate";
const description =
  "Check that an IMBEGNAL certificate of completion is genuine: enter the code printed on the certificate.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false },
  alternates: { canonical: "/certificate/" },
  openGraph: { title: `${title} · IMBEGNAL`, description, url: "/certificate/" },
};

export default function CertificatePage() {
  // Course titles come from the canonical roadmaps at build time; only id -> title is shipped to the client.
  const courseTitles = Object.fromEntries(roadmaps.map((r) => [r.id, r.title]));
  return (
    <Suspense fallback={<CertificateFallback />}>
      <CertificateVerify courseTitles={courseTitles} />
    </Suspense>
  );
}
