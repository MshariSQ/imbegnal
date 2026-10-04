import type { Metadata } from "next";
import PricingClient from "@/components/PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "IMBEGNAL courses are free forever. Pro adds more AI tutor capacity and power features for serious learners.",
  alternates: { canonical: "/pricing/" },
};

export default function PricingPage() {
  return <PricingClient />;
}
