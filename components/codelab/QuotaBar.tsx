"use client";

import Link from "next/link";
import { Gauge } from "lucide-react";
import type { QuotaInfo } from "../../shared/api";
import { useLang } from "@/lib/lang-context";
import { useNow } from "@/lib/codelab/clock";
import { fill, formatResetTime, intlLocale } from "@/lib/codelab/format";
import { focusRing } from "./ui";

/** "37 of 50 runs left today · resets at 03:00", plus a Pro nudge when the allowance runs low. */
export default function QuotaBar({ quota }: { quota: QuotaInfo }) {
  const { tx, lang } = useLang();
  const q = tx.codelab.quota;
  const now = useNow();
  const low = quota.remaining <= Math.max(3, Math.floor(quota.limit * 0.1));
  const time = now ? formatResetTime(quota.resetAt, now, intlLocale(lang)) : "";
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-fg-muted" data-testid="quota">
      <Gauge size={13} aria-hidden="true" className={low ? "text-amber-400" : "text-fg-subtle"} />
      <span className={low ? "font-semibold text-amber-400" : ""}>{fill(q.left, { remaining: quota.remaining, limit: quota.limit })}</span>
      {time && <span aria-hidden="true">·</span>}
      {time && <span>{fill(q.resets, { time })}</span>}
      <span className="rounded-full border border-line px-2 py-px text-[11px] font-semibold text-fg-soft">
        {fill(q.plan, { plan: quota.plan === "pro" ? q.pro : q.free })}
      </span>
      {low && quota.plan !== "pro" && (
        <Link href="/pricing/" className={`font-semibold text-emerald-400 hover:underline ${focusRing}`}>
          {q.pro_cta}
        </Link>
      )}
    </p>
  );
}
