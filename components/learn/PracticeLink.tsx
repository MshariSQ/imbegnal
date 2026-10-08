"use client";

import Link from "next/link";
import { SquareTerminal } from "lucide-react";
import type { LangId } from "@/shared/languages";
import { getLanguage } from "@/shared/languages";
import { useLang } from "@/lib/lang-context";

/** Display name of a practice language (product names are not translated). */
export function langLabel(lang: LangId | "web"): string {
  return lang === "web" ? "HTML/CSS" : (getLanguage(lang)?.label ?? lang);
}

/** Small, unobtrusive "Open in Code Lab" link used next to demos and exercises. */
export function OpenInCodeLab({ href, label }: { href: string; label?: string }) {
  const { tx } = useLang();
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 min-h-10 px-3 rounded-lg text-xs font-semibold text-fg-muted hover:text-fg border border-line hover:border-line-strong hover:bg-fg/5 transition-colors"
    >
      <SquareTerminal size={14} aria-hidden /> {label ?? tx.curriculum.openInCodeLab}
    </Link>
  );
}

/** Primary call-to-action variant ("Try in Code Lab"). */
export function TryInCodeLab({ href, label, className = "" }: { href: string; label?: string; className?: string }) {
  const { tx } = useLang();
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-brand hover:bg-brand-strong text-brand-fg text-sm font-bold transition-colors ${className}`}
    >
      <SquareTerminal size={16} aria-hidden /> {label ?? tx.curriculum.tryInCodeLab}
    </Link>
  );
}

/** Fills `{key}` placeholders of a dictionary string. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}
