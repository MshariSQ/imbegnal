"use client";

import { Zap, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Footer() {
  const { tx } = useLang();
  const fl = tx.footer.links;

  const footerLinks = {
    [tx.footer.sections.Platform]: [
      { label: tx.nav.learn, href: `${BASE}/learn/` },
      { label: tx.nav.dashboard, href: `${BASE}/dashboard/` },
      { label: fl.roadmaps, href: `${BASE}/roadmaps/` },
      { label: fl.certifications, href: `${BASE}/certifications/` },
      { label: tx.nav.resources, href: `${BASE}/courses/` },
      { label: tx.nav.pricing, href: `${BASE}/pricing/` },
      { label: fl.about, href: `${BASE}/about/` },
    ],
    [tx.footer.sections.Fields]: [
      { label: fl.cyberSecurity, href: `${BASE}/roadmaps/cyber-security/` },
      { label: fl.ai, href: `${BASE}/roadmaps/artificial-intelligence/` },
      { label: fl.dataScience, href: `${BASE}/roadmaps/data-science/` },
      { label: fl.cloudComputing, href: `${BASE}/roadmaps/cloud-computing/` },
      { label: fl.devops, href: `${BASE}/roadmaps/devops/` },
      { label: fl.frontend, href: `${BASE}/roadmaps/frontend/` },
    ],
    [tx.footer.sections.Resources]: [
      { label: fl.github, href: "https://github.com/MshariSQ/imbegnal", external: true },
      { label: fl.openSource, href: "https://github.com/MshariSQ/imbegnal/blob/main/LICENSE", external: true },
      { label: fl.contribute, href: "https://github.com/MshariSQ/imbegnal/blob/main/CONTRIBUTING.md", external: true },
      { label: fl.reportBug, href: "https://github.com/MshariSQ/imbegnal/issues", external: true },
    ],
    [tx.footer.sections.Legal]: [
      { label: fl.privacy, href: `${BASE}/privacy/` },
      { label: fl.terms, href: `${BASE}/terms/` },
      { label: fl.cookies, href: `${BASE}/privacy/#cookies` },
    ],
  };

  return (
    <footer className="border-t border-line bg-surface/40 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href={`${BASE}/`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <span className="text-lg font-black tracking-wide text-fg">
                IMBEGNAL
              </span>
            </a>
            <p className="text-fg-subtle text-sm leading-relaxed mb-4">{tx.footer.tagline}</p>
            <a
              href="https://github.com/MshariSQ/imbegnal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-fg-muted hover:text-fg border border-line hover:border-fg-faint rounded-lg transition-all"
            >
              <ExternalLink size={14} /> {tx.footer.viewOnGitHub}
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h2 className="text-sm font-semibold text-fg mb-3">{section}</h2>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-fg-subtle hover:text-fg-soft transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <a href={link.href} className="text-sm text-fg-subtle hover:text-fg-soft transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-fg-faint">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> IMBEGNAL. {tx.footer.copyrightPrefix}{" "}
            <a href="https://github.com/MshariSQ/imbegnal/blob/main/LICENSE"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-fg-muted underline underline-offset-2">
              {tx.footer.mitLicense}
            </a>.
          </p>
          <p className="text-sm text-fg-faint">{tx.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
