"use client";

import { useState } from "react";
import {
  Search,
  ArrowRight,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Globe,
  CheckCircle,
} from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { certifications } from "@/data/certifications";

// ─────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────
function HeroSection() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#e6edf3 1px, transparent 1px), linear-gradient(90deg, #e6edf3 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center pt-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm mb-8">
          <Sparkles size={14} />
          <span>Free & Open Source · 25+ Roadmaps</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Learn Smarter.
          <br />
          <span className="gradient-text">Build Your Career.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop searching across 20 websites. Find every roadmap, certification, course,
          and career path you need — all in one place, completely free.
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative flex items-center bg-[#161B22] border border-[#30363d] hover:border-emerald-500/50 rounded-2xl transition-all focus-within:border-emerald-500/50 focus-within:shadow-lg focus-within:shadow-emerald-500/10">
            <Search size={20} className="absolute left-5 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent pl-13 pr-32 py-5 text-base outline-none placeholder-gray-600"
              placeholder="Search roadmaps, certifications, courses..."
            />
            <button className="absolute right-3 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-xl transition-all">
              Search
            </button>
          </div>
        </div>

        {/* Popular tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {["Cyber Security", "AI", "Cloud", "DevOps", "Frontend", "Data Science"].map(
            (tag) => (
              <button
                key={tag}
                className="px-3 py-1 text-sm text-gray-500 hover:text-white border border-[#21262d] hover:border-gray-600 rounded-full transition-all"
              >
                {tag}
              </button>
            )
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { value: "25+", label: "Roadmaps" },
            { value: "150+", label: "Certifications" },
            { value: "500+", label: "Courses" },
            { value: "50k+", label: "Learners" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#161B22]/80 border border-[#21262d] rounded-xl p-4"
            >
              <div className="text-2xl font-black text-emerald-400">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Features Strip
// ─────────────────────────────────────────────
function FeaturesStrip() {
  const features = [
    { icon: <Globe size={18} />, text: "Interactive Roadmaps" },
    { icon: <Award size={18} />, text: "Top Certifications" },
    { icon: <BookOpen size={18} />, text: "Curated Courses" },
    { icon: <TrendingUp size={18} />, text: "Career Paths" },
    { icon: <Users size={18} />, text: "Community" },
    { icon: <CheckCircle size={18} />, text: "100% Free" },
  ];

  return (
    <div className="border-y border-[#21262d] bg-[#0D1117]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-2 text-sm text-gray-500">
              <span className="text-emerald-500">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Roadmaps Section
// ─────────────────────────────────────────────
function RoadmapsSection() {
  const [filter, setFilter] = useState<"all" | "tech" | "business">("all");
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
            <TrendingUp size={16} />
            <span>Learning Paths</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            Explore Roadmaps
          </h2>
          <p className="text-gray-400 max-w-lg">
            Visual, step-by-step learning paths for every field — from complete beginner to job-ready professional.
          </p>
        </div>

        <div className="flex gap-2">
          {(["all", "tech", "business"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all capitalize ${
                filter === f
                  ? "bg-emerald-500 border-emerald-500 text-black font-medium"
                  : "border-[#30363d] text-gray-400 hover:text-white hover:border-gray-500"
              }`}
            >
              {f === "all" ? "All" : f === "tech" ? "Technology" : "Business"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((roadmap) => (
          <a
            key={roadmap.id}
            href={`/roadmaps/${roadmap.id}`}
            className="group relative bg-[#161B22] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-6 card-hover overflow-hidden"
          >
            {/* Gradient accent */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${roadmap.color} opacity-0 group-hover:opacity-100 transition-opacity`}
            />

            <div className="relative">
              <div className="text-3xl mb-4">{roadmap.icon}</div>

              <h3 className="font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {roadmap.title}
              </h3>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {roadmap.description}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[roadmap.level]}`}
                >
                  {roadmap.level}
                </span>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Users size={11} />
                  {roadmap.learners}
                </span>
              </div>

              <div className="flex items-center gap-1 mt-4 text-xs text-gray-600">
                <Clock size={11} />
                <span>{roadmap.duration}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {roadmap.jobs.slice(0, 2).map((job) => (
                  <span
                    key={job}
                    className="text-xs px-2 py-0.5 bg-white/5 rounded-md text-gray-500"
                  >
                    {job}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/roadmaps"
          className="inline-flex items-center gap-2 px-6 py-3 border border-[#30363d] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
        >
          View all roadmaps
          <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Certifications Section
// ─────────────────────────────────────────────
function CertificationsSection() {
  const difficultyColors: Record<string, string> = {
    Beginner: "text-emerald-400",
    Intermediate: "text-blue-400",
    Advanced: "text-orange-400",
  };

  return (
    <section id="certifications" className="bg-[#0A0E16] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
              <Award size={16} />
              <span>Certifications</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Top Certifications
            </h2>
            <p className="text-gray-400 max-w-lg">
              Industry-recognized credentials that boost your career. Each includes pricing, difficulty, and direct official links.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#161B22] border border-[#21262d] hover:border-[#30363d] rounded-2xl p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{cert.providerLogo}</div>
                  <div>
                    <div className="text-xs text-gray-500">{cert.provider}</div>
                    <h3 className="font-bold text-white text-sm mt-0.5">
                      {cert.name}
                    </h3>
                  </div>
                </div>
                {cert.popular && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    <Star size={10} fill="currentColor" />
                    Popular
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {cert.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {cert.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-gray-600">Price</div>
                    <div className="text-sm font-semibold text-white">{cert.price}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Difficulty</div>
                    <div className={`text-sm font-medium ${difficultyColors[cert.difficulty]}`}>
                      {cert.difficulty}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Prep Time</div>
                    <div className="text-sm text-gray-300">{cert.duration}</div>
                  </div>
                </div>
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                >
                  <ChevronRight size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/certifications"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#30363d] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
          >
            Browse all certifications
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CTA Banner
// ─────────────────────────────────────────────
function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-12 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm mb-6">
            <Sparkles size={14} />
            <span>100% Free · Open Source</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Start your learning journey
            <br />
            <span className="gradient-text">today</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Join 50,000+ learners who are building real skills and landing their dream jobs with SkillForge.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-sm">
              Explore Roadmaps →
            </button>
            <a
              href="https://github.com/MshariSQ/skillforge"
              className="px-8 py-4 border border-[#30363d] hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm transition-all"
            >
              ⭐ Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesStrip />
      <RoadmapsSection />
      <CertificationsSection />
      <CTASection />
    </main>
  );
}
