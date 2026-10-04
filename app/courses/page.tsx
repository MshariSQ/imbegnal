"use client";

import { useState } from "react";
import { courses } from "@/data/courses";
import { PlayCircle, ChevronRight, Search, Clock } from "lucide-react";

const FIELDS = ["All", ...Array.from(new Set(courses.map((c) => c.field))).sort()];
const PRICES = ["All", "Free", "Paid"];

const levelColors: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Advanced: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

export default function CoursesPage() {
  const [field, setField] = useState("All");
  const [price, setPrice] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = courses.filter((c) => {
    const matchField = field === "All" || c.field === field;
    const isFree = c.price === "Free" || c.price === "Free Audit" || c.price === "Free + Paid" || c.price === "Free Credits";
    const matchPrice = price === "All" || (price === "Free" ? isFree : !isFree);
    const matchQuery = !query ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.provider.toLowerCase().includes(query.toLowerCase()) ||
      c.field.toLowerCase().includes(query.toLowerCase());
    return matchField && matchPrice && matchQuery;
  });

  return (
    <main className="max-w-7xl mx-auto px-6 pt-28 pb-24">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
          <PlayCircle size={16} /><span>Courses</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">All Courses</h1>
        <p className="text-fg-muted max-w-2xl">
          {courses.length} hand-picked courses from Google, Harvard, IBM, and the best educators online. Many are completely free.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-surface border border-line-strong rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 placeholder:text-fg-faint transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRICES.map((p) => (
            <button key={p} onClick={() => setPrice(p)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${price === p ? "bg-emerald-500 border-emerald-500 text-brand-fg font-medium" : "border-line-strong text-fg-muted hover:text-fg hover:border-fg-faint"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {FIELDS.map((f) => (
          <button key={f} onClick={() => setField(f)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${field === f ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "border-line text-fg-subtle hover:text-fg hover:border-fg-faint"}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-fg-subtle">No courses found for this filter.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => {
            const isFree = course.price === "Free" || course.price === "Free Audit" || course.price === "Free + Paid" || course.price === "Free Credits";
            return (
              <a
                key={course.id}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-surface border border-line hover:border-emerald-500/30 rounded-2xl p-6 card-hover flex flex-col transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{course.providerLogo}</div>
                    <div>
                      <div className="text-xs text-fg-subtle">{course.provider}</div>
                      <h3 className="font-bold text-fg text-sm mt-0.5 group-hover:text-emerald-400 transition-colors leading-snug">{course.title}</h3>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ml-2 ${isFree ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>
                    {course.price}
                  </span>
                </div>

                <p className="text-sm text-fg-subtle mb-4 leading-relaxed flex-1">{course.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-fg/5 border border-fg/5 rounded-md text-fg-muted">{tag}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[course.level]}`}>{course.level}</span>
                    <span className="text-xs text-fg-faint flex items-center gap-1"><Clock size={11} />{course.duration}</span>
                  </div>
                  <ChevronRight size={16} className="text-fg-faint group-hover:text-emerald-400 transition-colors" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
