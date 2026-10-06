"use client";

import { Check } from "lucide-react";

export interface ChipOption<V extends string> {
  value: V;
  label: string;
  /** Decorative leading glyph (emoji / icon element). */
  lead?: React.ReactNode;
}

/**
 * A group of chips built on real radio inputs: native keyboard behaviour
 * (arrow keys, one tab stop), screen-reader semantics from the fieldset +
 * legend, and a check mark on the selected chip so state is not color-only.
 * On narrow screens the row scrolls horizontally instead of wrapping.
 */
export default function ChipRadioGroup<V extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  hideLegend = false,
}: {
  legend: string;
  name: string;
  value: V;
  options: ChipOption<V>[];
  onChange: (v: V) => void;
  hideLegend?: boolean;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className={hideLegend ? "sr-only" : "mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle"}>{legend}</legend>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1 md:flex-wrap md:overflow-visible">
        {options.map((o) => (
          <label key={o.value} className="relative shrink-0 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-sm font-medium text-fg-muted transition-colors hover:border-line-strong hover:text-fg peer-checked:border-brand peer-checked:bg-brand/15 peer-checked:font-semibold peer-checked:text-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand [&>.chip-check]:hidden peer-checked:[&>.chip-check]:inline"
            >
              <Check size={14} aria-hidden className="chip-check text-emerald-400" />
              {o.lead ? <span aria-hidden>{o.lead}</span> : null}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
