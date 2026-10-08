import { test } from "node:test";
import assert from "node:assert/strict";
import { domProps } from "../../lib/markdown";

test("domProps drops react-markdown's hast node and keeps every DOM prop", () => {
  const props = { node: { type: "element" }, className: "x", href: "/a", children: "t" };
  const out = domProps(props);
  assert.equal("node" in out, false);
  assert.deepEqual(out, { className: "x", href: "/a", children: "t" });
});
