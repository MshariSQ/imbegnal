"use client";

import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { fmt } from "@/lib/ctf/format";
import { difficultyLabel, trackTitle } from "@/lib/ctf/labels";
import {
  DIFFICULTIES,
  KIND_FILTERS,
  SORT_KEYS,
  STATUS_FILTERS,
  type CtfFilters,
  type DifficultyFilter,
  type KindFilter,
  type SortKey,
  type StatusFilter,
} from "@/lib/ctf/filters";
import type { TrackInfo } from "@/lib/ctf/types";
import ChipRadioGroup from "./ChipRadioGroup";

const selectCls =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-fg outline-none transition-colors focus:border-brand/60 focus-visible:outline-2 focus-visible:outline-brand";

/**
 * Filter + sort controls for the challenge list. Every control is a real form
 * control with a visible or screen-reader label. The values are owned by the
 * parent (URL state); `search` is a local draft so typing never fights the URL.
 */
export default function ChallengeFilters({
  filters,
  tracks,
  search,
  onSearch,
  onChange,
  onClear,
  hasActive,
  activeCount,
}: {
  filters: CtfFilters;
  tracks: TrackInfo[];
  search: string;
  onSearch: (q: string) => void;
  onChange: (patch: Partial<CtfFilters>) => void;
  onClear: () => void;
  hasActive: boolean;
  activeCount: number;
}) {
  const { tx } = useLang();
  const t = tx.ctf;
  const [open, setOpen] = useState(false);

  return (
    <form role="search" aria-label={t.filters.heading} onSubmit={(e) => e.preventDefault()} className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="ctf-search" className="sr-only">
            {t.filters.search}
          </label>
          <Search size={17} aria-hidden className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            id="ctf-search"
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t.filters.searchPlaceholder}
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-line bg-surface ps-11 pe-4 text-fg outline-none transition-colors placeholder:text-fg-faint focus:border-brand/60 focus-visible:outline-2 focus-visible:outline-brand"
          />
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="ctf-more-filters"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-fg md:hidden"
        >
          <SlidersHorizontal size={16} aria-hidden />
          {open ? t.filters.hide : t.filters.show}
          {activeCount > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-xs text-brand-fg">{activeCount}</span>}
          <ChevronDown size={16} aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {tracks.length > 0 && (
        <ChipRadioGroup<string>
          legend={t.filters.track}
          name="ctf-track"
          value={filters.track}
          onChange={(track) => onChange({ track })}
          options={[
            { value: "all", label: t.filters.allTracks },
            ...tracks.map((tr) => ({ value: tr.id, label: trackTitle(tx, tr.id, tr.title), lead: tr.icon })),
          ]}
        />
      )}

      <div id="ctf-more-filters" className={`${open ? "grid" : "hidden"} gap-4 md:grid md:grid-cols-2 xl:grid-cols-[auto_auto_1fr_1fr] xl:items-end`}>
        <ChipRadioGroup<string>
          legend={t.filters.difficulty}
          name="ctf-difficulty"
          value={String(filters.difficulty)}
          onChange={(v) => onChange({ difficulty: Number(v) as DifficultyFilter })}
          options={[
            { value: "0", label: t.filters.anyDifficulty },
            ...DIFFICULTIES.map((d) => ({ value: String(d), label: difficultyLabel(tx, d) })),
          ]}
        />
        <ChipRadioGroup<StatusFilter>
          legend={t.filters.status}
          name="ctf-status"
          value={filters.status}
          onChange={(status) => onChange({ status })}
          options={STATUS_FILTERS.map((s) => ({ value: s, label: t.filters[s] }))}
        />
        <div>
          <label htmlFor="ctf-kind" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            {t.filters.kind}
          </label>
          <select id="ctf-kind" value={filters.kind} onChange={(e) => onChange({ kind: e.target.value as KindFilter })} className={selectCls}>
            <option value="all">{t.filters.anyKind}</option>
            {KIND_FILTERS.map((k) => (
              <option key={k} value={k}>
                {t.kind[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ctf-sort" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            {t.filters.sort}
          </label>
          <select id="ctf-sort" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value as SortKey })} className={selectCls}>
            {SORT_KEYS.map((s) => (
              <option key={s} value={s}>
                {t.sort[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActive && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-emerald-400 hover:underline"
        >
          <X size={14} aria-hidden />
          {t.filters.clear}
          <span className="sr-only">{fmt(t.filters.active, { n: activeCount })}</span>
        </button>
      )}
    </form>
  );
}
