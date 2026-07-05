"use client";

import { roadmaps } from "@/data/roadmaps";
import { Clock, Users, ArrowRight, TrendingUp } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const levelColors: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Advanced: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "All Levels": "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

export default function RoadmapsPage() {
  const { tx } = useLang();
  const s = tx.roadmapsPage;

  const tech = roadmaps.filter((r) => r.category === "tech");
  const business = roadmaps.filter((r) => r.category === "business");

  const RoadmapGrid = ({ items }: { items: typeof roadmaps }) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((r) => (
        <a key={r.id} href={`${BASE}/roadmaps/${r.id}/`}
          className="group relative bg-[#161B22] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-6 transition-all hover:-translate-y-1 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="relative">
            <div className="text-3xl mb-4">{r.icon}</div>
            <h3 className="font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{r.title}</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{r.description}</p>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[r.level]}`}>{r.level}</span>
              <span className="text-xs text-gray-600 flex items-center gap-1"><Users size={11} />{r.learners}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
              <Clock size={11} /><span>{r.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 group-hover:gap-2 transition-all">
              <span>{s.viewRoadmap}</span><ArrowRight size={12} className="rtl-flip" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-6 pt-28 pb-24">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
          <TrendingUp size={16} /><span>{s.eyebrow}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">{s.title}</h1>
        <p className="text-gray-400 max-w-2xl">{s.subtitle}</p>
      </div>

      {tech.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>💻</span> {s.tech}
          </h2>
          <RoadmapGrid items={tech} />
        </section>
      )}

      {business.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>💼</span> {s.business}
          </h2>
          <RoadmapGrid items={business} />
        </section>
      )}
    </main>
  );
}
