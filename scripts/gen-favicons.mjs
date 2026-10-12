// Renders the brand mark (app/icon.svg) into the raster icons Next.js serves from app/:
//   app/favicon.ico     16, 32, 48 and 256 px PNG frames (browsers and crawlers that fetch /favicon.ico)
//   app/apple-icon.png  180 px, full-bleed background (iOS rounds the corners itself)
// Run after changing app/icon.svg:  node scripts/gen-favicons.mjs
// Needs Playwright's Chromium (npx playwright install chromium, or PLAYWRIGHT_BROWSERS_PATH / CHROMIUM_PATH).
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(ROOT, "app/icon.svg"), "utf8");

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !existsSync(base)) return undefined;
  const dir = readdirSync(base).filter((d) => d.startsWith("chromium-")).sort().pop();
  const exe = dir && join(base, dir, "chrome-linux", "chrome");
  return exe && existsSync(exe) ? exe : undefined;
}

async function launch() {
  try {
    return await chromium.launch();
  } catch (e) {
    const executablePath = findChromium();
    if (!executablePath) throw e;
    return chromium.launch({ executablePath });
  }
}

/** PNG of `markup` (an SVG document) at size x size, transparent where the SVG is. */
async function render(page, markup, size) {
  const src = `data:image/svg+xml;base64,${Buffer.from(markup).toString("base64")}`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent"><img src="${src}" width="${size}" height="${size}" style="display:block"></body></html>`);
  await page.waitForFunction(() => document.images[0]?.complete);
  return page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

/** ICO container with PNG frames (supported by every current browser and by Windows since Vista). */
function ico(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);
  const dir = Buffer.alloc(16 * frames.length);
  let offset = 6 + dir.length;
  frames.forEach(({ size, png }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e); // 0 means 256
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2); // no palette
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4); // colour planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(png.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...frames.map((f) => f.png)]);
}

const browser = await launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const frames = [];
  for (const size of [16, 32, 48, 256]) frames.push({ size, png: await render(page, svg, size) });
  writeFileSync(join(ROOT, "app/favicon.ico"), ico(frames));
  // iOS masks the icon itself and fills transparency with black: square corners, full background.
  writeFileSync(join(ROOT, "app/apple-icon.png"), await render(page, svg.replace(/ rx="[^"]*"/, ""), 180));
  console.log("wrote app/favicon.ico (16, 32, 48, 256) and app/apple-icon.png (180)");
} finally {
  await browser.close();
}
