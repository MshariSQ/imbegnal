"use client";

import {
  Award, BarChart3, Binary, Brain, Bug, Cloud, Code2, Container, Cpu, Database, Eye, Flame, FlaskConical,
  GitBranch, Globe, GraduationCap, HardDrive, Layers, Lock, Network, Palette, PenTool, Puzzle, Rocket,
  Search, Server, Shield, Target, Terminal, Trophy, type LucideIcon,
} from "lucide-react";
import type { BadgeIcon } from "@/data/curricula";
import type { BadgeState } from "@/lib/catalog";
import { useLang } from "@/lib/lang-context";

const ICONS: Record<BadgeIcon, LucideIcon> = {
  award: Award, shield: Shield, flame: Flame, flask: FlaskConical, trophy: Trophy, rocket: Rocket, target: Target,
  graduation: GraduationCap, brain: Brain, terminal: Terminal, network: Network, database: Database, cpu: Cpu,
  code: Code2, palette: Palette, cloud: Cloud, server: Server, bug: Bug, lock: Lock, search: Search, layers: Layers,
  "git-branch": GitBranch, container: Container, chart: BarChart3, "pen-tool": PenTool, binary: Binary, eye: Eye,
  puzzle: Puzzle, globe: Globe, "hard-drive": HardDrive,
};

/** Badges of a course, locked or earned from local progress. */
export default function PracticeBadges({ badges }: { badges: BadgeState[] }) {
  const { tx, lang } = useLang();
  const T = tx.curriculum;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {badges.map(({ badge, earned, have, need }) => {
        const Icon = ICONS[badge.icon] ?? Award;
        return (
          <li key={badge.id} className={`card p-4 flex items-start gap-3.5 ${earned ? "border-emerald-500/40" : ""}`}>
            <span
              className={`grid place-items-center size-11 rounded-xl shrink-0 border ${earned ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-fg/5 border-line text-fg-subtle"}`}
              aria-hidden
            >
              {earned ? <Icon size={20} /> : <Lock size={18} />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h3 className="text-sm font-bold text-fg">{badge.title[lang]}</h3>
                <span className={`text-[11px] font-semibold ${earned ? "text-emerald-400" : "text-fg-subtle"}`}>{earned ? T.badgeEarned : T.badgeLocked}</span>
              </div>
              <p className="text-xs text-fg-muted mt-1 leading-relaxed">{badge.criteria[lang]}</p>
              {!earned && (
                <p dir="ltr" className="text-[11px] text-fg-subtle mt-1.5 text-start tabular-nums">
                  {have} / {need}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
