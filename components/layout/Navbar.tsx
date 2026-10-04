"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, LogOut, User, ChevronDown, LayoutDashboard, Languages } from "lucide-react";
import { useAuthUser, signOut } from "@/lib/auth";
import { useLang } from "@/lib/lang-context";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Avatar from "@/components/ui/Avatar";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "/";
  const user = useAuthUser();
  const { lang, tx, setLang } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close the mobile sheet on navigation (state reset keyed on the route)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setDropOpen(false);
  }

  const navLinks = [
    { label: tx.nav.learn, href: "/learn/" },
    { label: tx.nav.roadmaps, href: "/roadmaps/" },
    { label: tx.nav.certifications, href: "/certifications/" },
    { label: tx.nav.resources, href: "/courses/" },
    { label: tx.nav.pricing, href: "/pricing/" },
  ];
  const isActive = (href: string) => pathname.startsWith(href.replace(/\/$/, ""));
  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen ? "bg-bg/85 backdrop-blur-xl border-b border-line" : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="w-8 h-8 rounded-lg bg-brand/15 border border-brand/30 grid place-items-center group-hover:bg-brand/25 transition-colors">
            <Zap size={16} className="text-emerald-400" />
          </span>
          <span className="text-lg font-black tracking-wide text-fg">IMBEGNAL</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`px-3.5 py-2 text-sm rounded-lg transition-colors ${
                isActive(link.href) ? "text-fg bg-fg/5 font-medium" : "text-fg-muted hover:text-fg hover:bg-fg/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="h-9 px-3 text-xs font-bold rounded-lg border border-line hover:border-brand/50 text-fg-muted hover:text-emerald-400 transition-colors"
            title={lang === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
          <ThemeToggle />

          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                aria-expanded={dropOpen}
                className="flex items-center gap-2 h-9 ps-1.5 pe-2.5 rounded-lg border border-line hover:border-line-strong transition-colors"
              >
                <Avatar src={user.avatar} name={user.name || user.username} size={24} />
                <span className="text-sm text-fg-soft max-w-28 truncate">{user.name || user.username}</span>
                <ChevronDown size={14} className="text-fg-subtle" />
              </button>
              {dropOpen && (
                <div className="absolute end-0 mt-2 w-52 card p-1.5 animate-fade-in">
                  <Link href="/dashboard/" className="flex items-center gap-2 px-3 py-2.5 text-sm text-fg-soft hover:bg-fg/5 rounded-lg">
                    <LayoutDashboard size={15} /> {tx.nav.dashboard}
                  </Link>
                  <Link href={`/profile/?u=${user.username}`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-fg-soft hover:bg-fg/5 rounded-lg">
                    <User size={15} /> {tx.nav.profile}
                  </Link>
                  <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg">
                    <LogOut size={15} /> {tx.nav.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login/" className="h-9 px-3.5 grid place-items-center text-sm text-fg-soft hover:text-fg rounded-lg transition-colors">
                {tx.nav.login}
              </Link>
              <Link href="/dashboard/" className="h-9 px-4 grid place-items-center text-sm font-semibold bg-brand hover:bg-brand-strong text-brand-fg rounded-lg transition-colors">
                {tx.nav.startFree}
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="grid place-items-center w-9 h-9 rounded-lg border border-line text-fg-muted"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={tx.nav.menu}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="lg:hidden border-t border-line bg-bg px-4 pb-5 pt-3 animate-fade-in max-h-[calc(100dvh-4rem)] overflow-y-auto">
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 card">
              <Avatar src={user.avatar} name={user.name || user.username} size={36} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-fg truncate">{user.name || user.username}</div>
                <div className="text-xs text-fg-subtle truncate">@{user.username}</div>
              </div>
            </div>
          )}
          <div className="flex flex-col">
            {[{ label: tx.nav.dashboard, href: "/dashboard/" }, ...navLinks, { label: tx.nav.about, href: "/about/" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-3 text-[15px] rounded-lg ${isActive(link.href) ? "text-fg bg-fg/5 font-medium" : "text-fg-muted"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button onClick={toggleLang} className="mt-2 w-full flex items-center gap-2 px-3 py-3 text-[15px] text-fg-muted rounded-lg hover:bg-fg/5">
            <Languages size={16} /> {lang === "en" ? "العربية" : "English"}
          </button>
          <div className="flex gap-2 mt-3 pt-3 border-t border-line">
            {user ? (
              <button onClick={signOut} className="flex-1 py-2.5 text-sm text-red-400 border border-red-500/30 rounded-lg">
                {tx.nav.signOut}
              </button>
            ) : (
              <>
                <Link href="/login/" className="flex-1 py-2.5 text-sm text-center border border-line-strong rounded-lg text-fg-soft">
                  {tx.nav.login}
                </Link>
                <Link href="/dashboard/" className="flex-1 py-2.5 text-sm text-center bg-brand text-brand-fg font-semibold rounded-lg">
                  {tx.nav.startFree}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
