/** Widens string literals so the Arabic dictionary can be type-checked against the English one. */
export type Widen<T> = T extends string ? string : T extends readonly (infer U)[] ? readonly Widen<U>[] : { [K in keyof T]: Widen<T[K]> };
