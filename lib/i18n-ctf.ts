/**
 * ctf strings (English + Arabic). `ctfAr` is type-checked against
 * `ctfEn`, so a missing Arabic key is a compile error. Merged into
 * `translations` in i18n.ts. Keep keys flat-ish and add, never rename, so
 * parallel work does not collide.
 */
import type { Widen } from "./i18n-types";

export const ctfEn = {
  ctf: {
    title: "Challenges",
  },
};

export type CtfTx = Widen<typeof ctfEn>;

export const ctfAr: CtfTx = {
  ctf: {
    title: "التحديات",
  },
};
