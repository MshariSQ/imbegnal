"use client";

import { Zap, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Footer() {
  const { tx } = useLang();
  const fl = tx.footer.links;

  const footerLinks = {
    [tx.footer.sections.Platform]: [
      { label: fl.roadmaps, href: `${BASE}/roadmaps/` },
      { label: fl.certifications, href: `${BASE}/certifications/` },
      { label: fl.courses, href: `${BASE}/courses/` },
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
      { label: fl.github, href: "https://github.com/MshariSQ/skillforge", external: true },
      { label: fl.openSource, href: "https://github.com/MshariSQ/skillforge/blob/main/LICENSE", external: true },
      { label: fl.contribute, href: "https://github.com/MshariSQ/skillforge/blob/main/CONTRIBUTING.md", external: true },
      { label: fl.reportBug, href: "https://github.com/MshariSQ/skillforge/issues", external: true },
    ],
    [tx.footer.sections.Legal]: [
      { label: fl.privacy, href: `${BASE}/privacy/` },
      { label: fl.terms, href: `${BASE}/terms/` },
      { label: fl.cookies, href: `${BASE}/privacy/#cookies` },
    ],
  };

  return (
    <footer className="border-t border-[#21262d] bg-[#0D1117] mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href={`${BASE}/`} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <span className="text-lg font-black tracking-wide text-white">
                IMBEGNAL
              </span>
            </a>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{tx.footer.tagline}</p>
            <a
              href="https://github.com/MshariSQ/skillforge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-[#21262d] hover:border-gray-600 rounded-lg transition-all"
            >
              <ExternalLink size={14} /> {tx.footer.viewOnGitHub}
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <a href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} IMBEGNAL. {tx.footer.copyrightPrefix}{" "}
            <a href="https://github.com/MshariSQ/skillforge/blob/main/LICENSE"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-gray-400 underline underline-offset-2">
              {tx.footer.mitLicense}
            </a>.
          </p>
          <p className="text-sm text-gray-600">{tx.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
