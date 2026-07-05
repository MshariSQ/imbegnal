"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, Zap, LogOut, User, ChevronDown } from "lucide-react";
import { getCurrentUser, signOut, type AuthUser } from "@/lib/auth";
import { getLoginUrl } from "@/lib/api";
import { useLang } from "@/lib/lang-context";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const { lang, tx, setLang } = useLang();

  useEffect(() => {
    setUser(getCurrentUser());
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const navLinks = [
    { label: tx.nav.home, href: "/" },
    { label: tx.nav.roadmaps, href: "/roadmaps" },
    { label: tx.nav.certifications, href: "/certifications" },
    { label: tx.nav.courses, href: "/courses" },
    { label: tx.nav.about, href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0D1117]/95 backdrop-blur-md border-b border-[#21262d]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={`${basePath}/`} className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
            <Zap size={16} className="text-emerald-400" />
          </div>
          <span className="text-lg font-black tracking-wide text-white">
            IMBEGNAL
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={`${basePath}${link.href}`}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Search size={18} />
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#30363d] hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 transition-all tracking-wider"
            title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            {lang === "en" ? "عربي" : "ENG"}
          </button>

          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#30363d] hover:border-gray-500 transition-all"
              >
                <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" />
                <span className="text-sm text-gray-300">{user.username}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {dropOpen && (
                <div className="absolute end-0 mt-2 w-48 bg-[#161B22] border border-[#30363d] rounded-xl shadow-xl overflow-hidden">
                  <a
                    href={`${basePath}/profile/?u=${user.username}`}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-all"
                  >
                    <User size={15} /> {tx.nav.profile}
                  </a>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut size={15} /> {tx.nav.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a
                href={getLoginUrl()}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-[#30363d] hover:border-gray-500 rounded-lg transition-all"
              >
                {tx.nav.signIn}
              </a>
              <a
                href={`${basePath}/roadmaps/`}
                className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-all"
              >
                {tx.nav.getStarted}
              </a>
            </>
          )}
        </div>

        {/* Mobile: lang toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#30363d] text-gray-400 hover:text-emerald-400 transition-all"
          >
            {lang === "en" ? "عربي" : "ENG"}
          </button>
          <button
            className="p-2 text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D1117] border-b border-[#21262d] px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={`${basePath}${link.href}`}
              className="px-4 py-3 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 mt-2 pt-2 border-t border-[#21262d]">
            {user ? (
              <button onClick={signOut} className="flex-1 py-2 text-sm text-red-400 border border-red-500/20 rounded-lg">
                {tx.nav.signOut}
              </button>
            ) : (
              <>
                <a href={getLoginUrl()} className="flex-1 py-2 text-sm text-center border border-[#30363d] rounded-lg text-gray-300">
                  {tx.nav.signIn}
                </a>
                <a href={`${basePath}/roadmaps/`} className="flex-1 py-2 text-sm text-center bg-emerald-500 text-black font-medium rounded-lg">
                  {tx.nav.getStarted}
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
