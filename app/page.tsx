"use client";

import { useState, useEffect } from "react";
import {
  Search, ArrowRight, Users, BookOpen, Award, TrendingUp,
  Star, Clock, ChevronRight, Sparkles, Globe, CheckCircle,
  PlayCircle,
} from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { certifications } from "@/data/certifications";
import { courses } from "@/data/courses";
import { getStats } from "@/lib/api";
import { useLang } from "@/lib/lang-context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function HeroSection() {
  const [query, setQuery] = useState("");
  const [learners, setLearners] = useState<string | null>(null);
  const { tx } = useLang();
  const h = tx.home;

  useEffect(() => {
    getStats()
      .then((d: { total_users: number }) => {
        const n = d.total_users;
        setLearners(n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
      })
      .catch(() => setLearners(null));
  }, []);

  const stats = [
    { value: String(roadmaps.length), label: h.stats.roadmaps },
    { value: `${certifications.length}`, label: h.stats.certifications },
    { value: `${courses.length}+`, label: h.stats.courses },
    { value: learners ?? "…", label: h.stats.learners },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `${BASE}/roadmaps/?q=${encodeURIComponent(query.trim().toLowerCase())}`;
  }

  const tags = [
    { label: "Cyber Security", slug: "cyber-security" },
    { label: "AI", slug: "artificial-intelligence" },
    { label: "Cloud", slug: "cloud-computing" },
    { label: "DevOps", slug: "devops" },
    { label: "Frontend", slug: "frontend" },
    { label: "Data Science", slug: "data-science" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#e6edf3 1px, transparent 1px), linear-gradient(90deg, #e6edf3 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center pt-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm mb-8">
          <Sparkles size={14} />
          <span>{h.badgePrefix} {roadmaps.length} {h.badgeSuffix}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          {h.title1}
          <br />
          <span className="gradient-text">{h.title2}</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {h.subtitle}
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative flex items-center bg-[#161B22] border border-[#30363d] hover:border-emerald-500/50 rounded-2xl transition-all focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/10">
            <Search size={20} className="absolute start-5 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent ps-13 pe-32 py-5 text-base outline-none placeholder-gray-600"
              placeholder={h.searchPlaceholder}
            />
            <button
              type="submit"
              className="absolute end-3 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl transition-all"
            >
              {h.search}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {tags.map((tag) => (
            <a key={tag.slug} href={`${BASE}/roadmaps/${tag.slug}/`}
              className="px-3 py-1 text-sm text-gray-500 hover:text-white border border-[#21262d] hover:border-gray-600 rounded-full transition-all">
              {tag.label}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#161B22]/80 border border-[#21262d] rounded-xl p-4">
              <div className="text-2xl font-black text-emerald-400">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesStrip() {
  const { tx } = useLang();
  const f = tx.home.features;
  const features = [
    { icon: <Globe size={18} />, text: f.roadmaps },
    { icon: <Award size={18} />, text: f.certifications },
    { icon: <BookOpen size={18} />, text: f.courses },
    { icon: <TrendingUp size={18} />, text: f.careers },
    { icon: <Users size={18} />, text: f.community },
    { icon: <CheckCircle size={18} />, text: f.free },
  ];
  return (
    <div className="border-y border-[#21262d] bg-[#0D1117]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {features.map((feat) => (
            <div key={feat.text} className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-emerald-500">{feat.icon}</span>
              <span>{feat.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapsSection() {
  const [filter, setFilter] = useState<"all" | "tech" | "business">("all");
  const { tx } = useLang();
  const s = tx.home.roadmapsSection;
  const filtered = roadmaps.filter((r) => filter === "all" || r.category === filter);

  const levelColors: Record<string, string> = {
    Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Advanced: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    "All Levels": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <section id="roadmaps" className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
            <TrendingUp size={16} /><span>{s.eyebrow}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">{s.title}</h2>
          <p className="text-gray-400 max-w-lg">{s.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {([["all", s.filterAll], ["tech", s.filterTech], ["business", s.filterBusiness]] as const).map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                filter === f ? "bg-emerald-500 border-emerald-500 text-black font-medium"
                  : "border-[#30363d] text-gray-400 hover:text-white hover:border-gray-500"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((roadmap) => (
          <a key={roadmap.id} href={`${BASE}/roadmaps/${roadmap.id}/`}
            className="group relative bg-[#161B22] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-6 card-hover overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${roadmap.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="text-3xl mb-4">{roadmap.icon}</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{roadmap.title}</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{roadmap.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[roadmap.level]}`}>{roadmap.level}</span>
                <span className="text-xs text-gray-600 flex items-center gap-1"><Users size={11} />{roadmap.learners}</span>
              </div>
              <div className="flex items-center gap-1 mt-4 text-xs text-gray-600">
                <Clock size={11} /><span>{roadmap.duration}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {roadmap.jobs.slice(0, 2).map((job) => (
                  <span key={job} className="text-xs px-2 py-0.5 bg-white/5 rounded-md text-gray-500">{job}</span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href={`${BASE}/roadmaps/`}
          className="inline-flex items-center gap-2 px-6 py-3 border border-[#30363d] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all">
          {s.viewAll} <ArrowRight size={16} className="rtl-flip" />
        </a>
      </div>
    </section>
  );
}

function CertificationsSection() {
  const { tx } = useLang();
  const s = tx.home.certSection;
  const difficultyColors: Record<string, string> = {
    Beginner: "text-emerald-400",
    Intermediate: "text-blue-400",
    Advanced: "text-orange-400",
  };
  const featured = certifications.filter((c) => c.popular);

  return (
    <section id="certifications" className="bg-[#0A0E16] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
              <Award size={16} /><span>{s.eyebrow}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3">{s.title}</h2>
            <p className="text-gray-400 max-w-lg">{s.subtitle}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((cert) => (
            <div key={cert.id} className="bg-[#161B22] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{cert.providerLogo}</div>
                  <div>
                    <div className="text-xs text-gray-500">{cert.provider}</div>
                    <h3 className="font-bold text-white text-sm mt-0.5">{cert.name}</h3>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                  <Star size={10} fill="currentColor" />{s.popular}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{cert.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {cert.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-gray-400">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                <div className="flex items-center gap-4">
                  <div><div className="text-xs text-gray-600">{s.price}</div><div className="text-sm font-semibold text-white">{cert.price}</div></div>
                  <div><div className="text-xs text-gray-600">{s.difficulty}</div><div className={`text-sm font-medium ${difficultyColors[cert.difficulty]}`}>{cert.difficulty}</div></div>
                  <div><div className="text-xs text-gray-600">{s.prepTime}</div><div className="text-sm text-gray-300">{cert.duration}</div></div>
                </div>
                <a href={cert.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all">
                  <ChevronRight size={18} className="rtl-flip" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href={`${BASE}/certifications/`}
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#30363d] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all">
            {s.viewAll} ({certifications.length}) <ArrowRight size={16} className="rtl-flip" />
          </a>
        </div>
      </div>
    </section>
  );
}

function CoursesSection() {
  const { tx } = useLang();
  const s = tx.home.coursesSection;
  const featured = courses.filter((c) => c.featured).slice(0, 6);
  const levelColors: Record<string, string> = {
    Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    Advanced: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <section id="courses" className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
            <PlayCircle size={16} /><span>{s.eyebrow}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">{s.title}</h2>
          <p className="text-gray-400 max-w-lg">{s.subtitle}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured.map((course) => (
          <a key={course.id} href={course.url} target="_blank" rel="noopener noreferrer"
            className="group bg-[#161B22] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-6 card-hover flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{course.providerLogo}</div>
                <div>
                  <div className="text-xs text-gray-500">{course.provider}</div>
                  <h3 className="font-bold text-white text-sm mt-0.5 group-hover:text-emerald-400 transition-colors">{course.title}</h3>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${
                course.price === "Free" || course.price === "Free Audit"
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-amber-400 bg-amber-500/10 border-amber-500/20"
              }`}>
                {course.price === "Free" || course.price === "Free Audit" ? s.free : course.price}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed flex-1">{course.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#21262d]">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[course.level]}`}>{course.level}</span>
                <span className="text-xs text-gray-600 flex items-center gap-1"><Clock size={11} />{course.duration}</span>
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-emerald-400 transition-colors rtl-flip" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href={`${BASE}/courses/`}
          className="inline-flex items-center gap-2 px-6 py-3 border border-[#30363d] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all">
          {s.viewAll} ({courses.length}) <ArrowRight size={16} className="rtl-flip" />
        </a>
      </div>
    </section>
  );
}

function CTASection() {
  const { tx } = useLang();
  const c = tx.home.cta;
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-12 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm mb-6">
            <Sparkles size={14} /><span>{c.badge}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            {c.title1}<br /><span className="gradient-text">{c.title2}</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">{c.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`${BASE}/roadmaps/`} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-sm">
              {c.primary}
            </a>
            <a href="https://github.com/MshariSQ/skillforge" target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 border border-[#30363d] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all">
              {c.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesStrip />
      <RoadmapsSection />
      <CertificationsSection />
      <CoursesSection />
      <CTASection />
    </main>
  );
}
