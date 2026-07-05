"use client";

import { useState } from "react";
import { certifications } from "@/data/certifications";
import { Award, ChevronRight, Star, Search } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const FIELDS = ["All", ...Array.from(new Set(certifications.map((c) => c.field))).sort()];

const difficultyColors: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Advanced: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

export default function CertificationsPage() {
  const [field, setField] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = certifications.filter((c) => {
    const matchField = field === "All" || c.field === field;
    const matchQuery = !query || c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.provider.toLowerCase().includes(query.toLowerCase()) ||
      c.field.toLowerCase().includes(query.toLowerCase());
    return matchField && matchQuery;
  });

  return (
    <main className="max-w-7xl mx-auto px-6 pt-28 pb-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
          <Award size={16} /><span>Certifications</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">All Certifications</h1>
        <p className="text-gray-400 max-w-2xl">
          {certifications.length} industry-recognized certifications — from entry-level to expert. Click any card to visit the official certification page.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search certifications..."
            className="w-full bg-[#161B22] border border-[#30363d] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 placeholder-gray-600 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <button
              key={f}
              onClick={() => setField(f)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                field === f
                  ? "bg-emerald-500 border-emerald-500 text-black font-medium"
                  : "border-[#30363d] text-gray-400 hover:text-white hover:border-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-500">No certifications found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cert) => (
            <a
              key={cert.id}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#161B22] border border-[#21262d] hover:border-emerald-500/30 rounded-2xl p-6 card-hover flex flex-col transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{cert.providerLogo}</div>
                  <div>
                    <div className="text-xs text-gray-500">{cert.provider}</div>
                    <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-emerald-400 transition-colors">{cert.name}</h3>
                  </div>
                </div>
                {cert.popular && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                    <Star size={10} fill="currentColor" />Popular
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed flex-1">{cert.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[cert.difficulty]}`}>{cert.difficulty}</span>
                {cert.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-gray-400">{tag}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-gray-600">Price</div>
                    <div className="text-sm font-semibold text-white">{cert.price}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Prep Time</div>
                    <div className="text-sm text-gray-300">{cert.duration}</div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
