// The raster icons are the IMBEGNAL mark (app/icon.svg: a #10b981 bolt on #0a0c10), not the
// create-next-app default (a black circle with a white triangle) that /favicon.ico served before.
// Regenerate with: node scripts/gen-favicons.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

const ROOT = join(__dirname, "../..");
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Minimal decoder for 8-bit, non-interlaced RGB/RGBA PNGs: RGBA pixels. */
function decodePng(png: Buffer): { width: number; height: number; rgba: Uint8Array } {
  assert.ok(png.subarray(0, 8).equals(PNG_SIG), "a PNG");
  let pos = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat: Buffer[] = [];
  while (pos < png.length) {
    const len = png.readUInt32BE(pos);
    const type = png.toString("ascii", pos + 4, pos + 8);
    const data = png.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8, "8-bit");
      colorType = data[9];
      assert.ok(colorType === 6 || colorType === 2, "RGB or RGBA");
      assert.equal(data[12], 0, "not interlaced");
    } else if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = new Uint8Array(width * height * 4);
  const prev = new Uint8Array(stride);
  const cur = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x];
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      const p = a + b - c;
      const pr = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
      cur[x] = (v + [0, a, b, (a + b) >> 1, pr][f]) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      out.set([cur[x * bpp], cur[x * bpp + 1], cur[x * bpp + 2], bpp === 4 ? cur[x * bpp + 3] : 255], (y * width + x) * 4);
    }
    prev.set(cur);
  }
  return { width, height, rgba: out };
}

/** Share of opaque pixels close to `rgb`. */
function share(img: { rgba: Uint8Array }, rgb: [number, number, number]): number {
  let n = 0;
  let opaque = 0;
  for (let i = 0; i < img.rgba.length; i += 4) {
    if (img.rgba[i + 3] < 200) continue;
    opaque++;
    if (Math.abs(img.rgba[i] - rgb[0]) + Math.abs(img.rgba[i + 1] - rgb[1]) + Math.abs(img.rgba[i + 2] - rgb[2]) < 60) n++;
  }
  return opaque ? n / opaque : 0;
}

const GREEN: [number, number, number] = [0x10, 0xb9, 0x81];
const DARK: [number, number, number] = [0x0a, 0x0c, 0x10];

test("app/favicon.ico: 16, 32, 48 and 256 px frames of the IMBEGNAL mark", () => {
  const ico = readFileSync(join(ROOT, "app/favicon.ico"));
  assert.equal(ico.readUInt16LE(2), 1, "an icon file");
  const count = ico.readUInt16LE(4);
  const sizes: number[] = [];
  for (let i = 0; i < count; i++) {
    const e = 6 + i * 16;
    const size = ico[e] || 256;
    const png = ico.subarray(ico.readUInt32LE(e + 12), ico.readUInt32LE(e + 12) + ico.readUInt32LE(e + 8));
    const img = decodePng(png);
    assert.deepEqual([img.width, img.height], [size, size], `frame ${size}`);
    // The bolt and its background, at every size: not black and white.
    assert.ok(share(img, GREEN) > 0.05, `${size} px: the green bolt (${share(img, GREEN).toFixed(2)})`);
    assert.ok(share(img, DARK) > 0.6, `${size} px: the dark tile (${share(img, DARK).toFixed(2)})`);
    sizes.push(size);
  }
  assert.deepEqual(sizes.sort((a, b) => a - b), [16, 32, 48, 256]);
});

test("app/apple-icon.png: 180 px, full-bleed (iOS rounds the corners)", () => {
  const img = decodePng(readFileSync(join(ROOT, "app/apple-icon.png")));
  assert.deepEqual([img.width, img.height], [180, 180]);
  assert.equal(img.rgba[3], 255, "opaque corner");
  assert.ok(share(img, GREEN) > 0.05 && share(img, DARK) > 0.6, "the green bolt on the dark tile");
});

test("public/ ships no create-next-app sample assets", () => {
  for (const f of ["file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg"]) assert.equal(existsSync(join(ROOT, "public", f)), false, f);
});
