"use client";

import { FileText } from "lucide-react";
import { useLang } from "@/lib/lang-context";

export default function TermsPage() {
  const { tx } = useLang();
  const t = tx.termsPage;

  return (
    <main className="max-w-3xl mx-auto px-6 pt-28 pb-24">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
          <FileText size={16} /><span>{t.eyebrow}</span>
        </div>
        <h1 className="text-4xl font-black mb-3">{t.title}</h1>
        <p className="text-fg-subtle text-sm">{t.lastUpdated}</p>
      </div>

      <div className="space-y-8">
        {t.sections.map((s) => (
          <div key={s.title} className="bg-surface border border-line rounded-2xl p-6">
            <h2 className="font-bold text-fg mb-3">{s.title}</h2>
            <p className="text-fg-muted text-sm leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-surface border border-line rounded-2xl p-6 text-center">
        <p className="text-fg-subtle text-sm">
          {t.contactNote}{" "}
          <a href="https://github.com/MshariSQ/imbegnal/issues" target="_blank" rel="noopener noreferrer"
            className="text-emerald-400 hover:underline">{t.contactLink}</a>.
        </p>
      </div>
    </main>
  );
}
