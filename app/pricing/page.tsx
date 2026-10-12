import type { Metadata } from "next";
import PricingClient from "@/components/PricingClient";

const title = "Pricing";
const description =
  "IMBEGNAL courses are free forever. Pro adds more AI tutor capacity and power features for serious learners.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pricing/" },
  openGraph: { title: `${title} · IMBEGNAL`, description, url: "/pricing/" },
};

export default function PricingPage() {
  return <PricingClient />;
}
