"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/lang-context";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const { tx } = useLang();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={tx.nav.toggleTheme}
      title={tx.nav.toggleTheme}
      className={`grid place-items-center w-9 h-9 rounded-lg border border-line text-fg-muted hover:text-fg hover:border-line-strong transition-colors ${className}`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
