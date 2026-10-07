/**
 * Tiny i18n helpers for the Challenges UI: "{name}" interpolation and CLDR
 * plural forms (Arabic has zero/one/two/few/many/other; English one/other).
 */

export interface PluralForms {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/** Replace `{key}` placeholders; unknown keys are left untouched so a typo is visible, not silent. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

const rules = new Map<string, Intl.PluralRules>();

/** Pick the right plural form for `n` in `lang` and interpolate `{n}`. */
export function plural(forms: PluralForms, n: number, lang: "en" | "ar", extra: Record<string, string | number> = {}): string {
  let pr = rules.get(lang);
  if (!pr) rules.set(lang, (pr = new Intl.PluralRules(lang)));
  const cat = pr.select(n) as keyof PluralForms;
  return fmt(forms[cat] ?? forms.other, { n, ...extra });
}
