/**
 * react-markdown hands every custom renderer its hast `node`. Spreading that onto a DOM
 * element rendered `node="[object Object]"` on every tag; renderers spread domProps(props).
 */
export function domProps<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const { node, ...rest } = props;
  void node;
  return rest;
}
