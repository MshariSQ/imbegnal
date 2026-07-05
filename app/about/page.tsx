"use client";

import { Zap, TrendingUp, Users, Award, Globe, BookOpen, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function AboutPage() {
  const { tx } = useLang();
  const a = tx.about;

  const pillars = [
    { icon: <TrendingUp size={20} />, title: a.pillars.roadmaps.title, desc: a.pillars.roadmaps.desc },
    { icon: <Award size={20} />, title: a.pillars.certifications.title, desc: a.pillars.certifications.desc },
    { icon: <BookOpen size={20} />, title: a.pillars.courses.title, desc: a.pillars.courses.desc },
    { icon: <Globe size={20} />, title: a.pillars.free.title, desc: a.pillars.free.desc },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 pt-28 pb-24">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <Zap size={28} className="text-emerald-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-6">
          <span className="gradient-text">{a.title}</span>
        </h1>
        <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">{a.subtitle}</p>
      </div>

      {/* Problem */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-6">{a.problemTitle}</h2>
        <div className="bg-[#161B22] border border-[#21262d] rounded-2xl p-8">
          <p className="text-gray-400 leading-relaxed mb-4">{a.problemText1}</p>
          <p className="text-gray-400 leading-relaxed mb-4">{a.problemText2}</p>
          <p className="text-gray-400 leading-relaxed">{a.problemText3}</p>
        </div>
      </section>

      {/* Pillars */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8">{a.offerTitle}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {pillars.map((p) => (
            <div key={p.title} className="bg-[#161B22] border border-[#21262d] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                {p.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open source */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-6">{a.openSourceTitle}</h2>
        <div className="bg-[#161B22] border border-[#21262d] rounded-2xl p-8">
          <p className="text-gray-400 leading-relaxed mb-6">{a.openSourceText}</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/MshariSQ/skillforge" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-white text-sm font-medium rounded-xl transition-all border border-[#30363d]">
              <ExternalLink size={16} /> {a.viewGithub}
            </a>
            <a href="https://github.com/MshariSQ/skillforge/issues" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 text-sm font-medium rounded-xl transition-all">
              {a.reportIssue}
            </a>
          </div>
        </div>
      </section>

      {/* Community */}
      <section>
        <div className="text-center bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-10">
          <Users size={32} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">{a.communityTitle}</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">{a.communityText}</p>
          <a href={`${BASE}/roadmaps/`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-sm">
            {a.exploreRoadmaps}
          </a>
        </div>
      </section>
    </main>
  );
}
