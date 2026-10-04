import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your study space: continue lessons, track your streak and XP, and review notes.",
  robots: { index: false, follow: true },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
