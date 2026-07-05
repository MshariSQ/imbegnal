"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { getUserProfile } from "@/lib/api";
import {
  MapPin, Link as LinkIcon, Calendar, Award, BookOpen, Zap,
  TrendingUp, CheckCircle, LogOut, User,
} from "lucide-react";
import { roadmaps } from "@/data/roadmaps";
import { certifications } from "@/data/certifications";
import { courses } from "@/data/courses";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface ProgressRow { roadmap_id: string; completed: number }
interface Profile {
  github_id: string;
  username: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  created_at: string;
  stats: {
    roadmaps_started: number;
    nodes_completed: number;
    certs_bookmarked: number;
    courses_bookmarked: number;
  };
  progress: ProgressRow[];
}

const NODE_TOTALS: Record<string, number> = {
  "cyber-security": 8,
  "artificial-intelligence": 8,
  "data-science": 8,
  "cloud-computing": 8,
  "devops": 8,
  "frontend": 8,
  "backend": 8,
  "ui-ux": 8,
};

export default function ProfilePage() {
  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMe, setIsMe] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("u");
    if (!u) {
      const me = getCurrentUser();
      if (me) {
        window.location.replace(`${BASE}/profile/?u=${me.username}`);
      } else {
        setError("No user specified.");
        setLoading(false);
      }
      return;
    }
    setUsername(u);
    const me = getCurrentUser();
    if (me?.username === u) setIsMe(true);
  }, []);

  useEffect(() => {
    if (!username) return;
    getUserProfile(username)
      .then((data) => { setProfile(data as Profile); setLoading(false); })
      .catch(() => { setError("User not found."); setLoading(false); });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
          <Zap size={20} className="text-emerald-400" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">👤</div>
          <h1 className="text-xl font-bold text-white mb-2">User not found</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <a href={`${BASE}/`} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium rounded-lg transition-all">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const joinedYear = new Date(profile.created_at).getFullYear();
  const { stats, progress } = profile;

  const statCards = [
    { icon: <TrendingUp size={16} />, label: "Roadmaps Started", value: stats.roadmaps_started },
    { icon: <CheckCircle size={16} />, label: "Nodes Completed", value: stats.nodes_completed },
    { icon: <Award size={16} />, label: "Certs Bookmarked", value: stats.certs_bookmarked },
    { icon: <BookOpen size={16} />, label: "Courses Saved", value: stats.courses_bookmarked },
  ];

  const inProgress = progress
    .map((p) => {
      const roadmap = roadmaps.find((r) => r.id === p.roadmap_id);
      const total = NODE_TOTALS[p.roadmap_id] ?? 8;
      const pct = Math.round((p.completed / total) * 100);
      return roadmap ? { ...roadmap, completed: p.completed, total, pct } : null;
    })
    .filter(Boolean) as Array<{ id: string; title: string; icon: string; completed: number; total: number; pct: number }>;

  const savedCerts = certifications.filter((c) =>
    // We don't know which ones without making another API call, so just show based on count
    stats.certs_bookmarked > 0
  ).slice(0, stats.certs_bookmarked || 0);

  return (
    <div className="min-h-screen bg-[#0D1117] pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Profile card */}
        <div className="bg-[#161B22] border border-[#21262d] rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img src={profile.avatar_url} alt={profile.username}
              className="w-20 h-20 rounded-full border-2 border-[#30363d]" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white">{profile.name ?? profile.username}</h1>
              <p className="text-gray-500 text-sm">@{profile.username}</p>
              {profile.bio && <p className="text-gray-400 text-sm mt-2 leading-relaxed">{profile.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={13} /> Joined {joinedYear}
                </span>
                <a href={`https://github.com/${profile.username}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 transition-colors">
                  <LinkIcon size={13} /> GitHub Profile
                </a>
              </div>
            </div>
            {isMe && (
              <div className="flex gap-2">
                <a href={`https://github.com/${profile.username}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 border border-[#30363d] hover:border-gray-500 rounded-lg transition-all">
                  <User size={13} /> GitHub
                </a>
                <button onClick={signOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-all">
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((s) => (
            <div key={s.label} className="bg-[#161B22] border border-[#21262d] rounded-xl p-4 flex flex-col items-center gap-1 text-center">
              <div className="text-emerald-400">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Roadmap progress */}
        <div className="bg-[#161B22] border border-[#21262d] rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" /> Roadmap Progress
          </h2>
          {inProgress.length === 0 ? (
            <div className="text-center py-10">
              <MapPin size={28} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No roadmaps started yet.</p>
              <a href={`${BASE}/roadmaps/`}
                className="inline-block mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm hover:bg-emerald-500/20 transition-all">
                Explore Roadmaps →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgress.map((r) => (
                <a key={r.id} href={`${BASE}/roadmaps/${r.id}/`}
                  className="block group bg-[#0D1117] border border-[#21262d] hover:border-emerald-500/30 rounded-xl p-4 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.icon}</span>
                      <span className="font-medium text-white text-sm group-hover:text-emerald-400 transition-colors">{r.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">{r.completed}/{r.total} nodes</span>
                  </div>
                  <div className="w-full bg-[#21262d] rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${r.pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{r.pct}% complete</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div className="bg-[#161B22] border border-[#21262d] rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Award size={18} className="text-emerald-400" /> Bookmarked Resources
          </h2>
          {stats.certs_bookmarked === 0 && stats.courses_bookmarked === 0 ? (
            <div className="text-center py-10">
              <Award size={28} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No bookmarks yet.</p>
              <div className="flex gap-2 justify-center mt-4">
                <a href={`${BASE}/certifications/`}
                  className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm hover:bg-emerald-500/20 transition-all">
                  Browse Certifications
                </a>
                <a href={`${BASE}/courses/`}
                  className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm hover:bg-blue-500/20 transition-all">
                  Browse Courses
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.certs_bookmarked > 0 && (
                <p className="text-sm text-gray-400">
                  <span className="text-emerald-400 font-semibold">{stats.certs_bookmarked}</span> certification{stats.certs_bookmarked !== 1 ? "s" : ""} bookmarked.{" "}
                  <a href={`${BASE}/certifications/`} className="text-emerald-400 hover:underline">View all →</a>
                </p>
              )}
              {stats.courses_bookmarked > 0 && (
                <p className="text-sm text-gray-400">
                  <span className="text-emerald-400 font-semibold">{stats.courses_bookmarked}</span> course{stats.courses_bookmarked !== 1 ? "s" : ""} bookmarked.{" "}
                  <a href={`${BASE}/courses/`} className="text-emerald-400 hover:underline">View all →</a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
