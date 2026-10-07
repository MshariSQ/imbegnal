import type { BarRow } from "@/lib/instructor/analytics";

/**
 * Horizontal bar list in pure CSS. The numbers are real text (count and share), the bar is decoration
 * (aria-hidden), so nothing depends on seeing the bar. The fill starts at the inline start, so it flips in RTL.
 */
export default function BarList({
  rows,
  ariaLabel,
  labelOf,
  count,
  percent,
  barClassOf,
}: {
  rows: BarRow[];
  ariaLabel: string;
  labelOf: (key: string) => string;
  count: (n: number) => string;
  percent: (share: number) => string;
  barClassOf?: (key: string) => string;
}) {
  return (
    <ul aria-label={ariaLabel} className="space-y-3.5">
      {rows.map((r) => (
        <li key={r.key} data-key={r.key}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 break-words font-semibold text-fg">{labelOf(r.key)}</span>
            <span className="shrink-0 tabular-nums text-fg-muted">
              <span className="font-bold text-fg">{count(r.count)}</span> · {percent(r.share)}
            </span>
          </div>
          <div aria-hidden className="mt-1.5 h-2 overflow-hidden rounded-full bg-fg/10">
            <div className={`h-full rounded-full ${barClassOf?.(r.key) ?? "bg-brand"}`} style={{ width: `${Math.max(1, Math.round(r.share * 100))}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
