"use client";

import { useEffect, useState } from "react";
import { getUserProfile } from "@/lib/api";
import { Calendar, ExternalLink, User } from "lucide-react";

interface UserProfile {
  github_id: string;
  username: string;
  name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getUserProfile(params.username)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <User size={48} className="text-gray-700 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">User not found</h1>
          <p className="text-gray-500">@{params.username} hasn&apos;t joined SkillForge yet.</p>
          <a href="/skillforge/" className="inline-block mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-xl text-sm transition-all">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#0D1117] pt-24 pb-16">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 border-b border-[#21262d]" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Avatar */}
        <div className="flex items-end justify-between -mt-16 mb-6">
          <div className="relative">
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-28 h-28 rounded-full border-4 border-[#0D1117] shadow-xl"
            />
          </div>
          <a
            href={`https://github.com/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-[#30363d] hover:border-gray-500 rounded-lg text-sm text-gray-300 hover:text-white transition-all"
          >
            <ExternalLink size={14} /> View on GitHub
          </a>
        </div>

        {/* Info */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">{profile.name}</h1>
          <p className="text-gray-500">@{profile.username}</p>
          {profile.bio && <p className="text-gray-400 mt-3 max-w-xl">{profile.bio}</p>}
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
            <Calendar size={14} />
            <span>Joined {joinDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Roadmaps", value: "—" },
            { label: "Completed", value: "—" },
            { label: "Streak", value: "—" },
          ].map((s) => (
            <div key={s.label} className="bg-[#161B22] border border-[#21262d] rounded-xl p-5 text-center">
              <div className="text-2xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div className="bg-[#161B22] border border-[#21262d] rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-sm">
            Progress tracking, bookmarks, and learning history coming soon.
          </p>
        </div>
      </div>
    </main>
  );
}
