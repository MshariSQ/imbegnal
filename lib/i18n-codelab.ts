/**
 * codelab strings (English + Arabic). `codelabAr` is type-checked against
 * `codelabEn`, so a missing Arabic key is a compile error. Merged into
 * `translations` in i18n.ts. Keep keys flat-ish and add, never rename, so
 * parallel work does not collide.
 */
import type { Widen } from "./i18n-types";

export const codelabEn = {
  codelab: {
    title: "Code Lab",
  },
};

export type CodelabTx = Widen<typeof codelabEn>;

export const codelabAr: CodelabTx = {
  codelab: {
    title: "مختبر الكود",
  },
};
