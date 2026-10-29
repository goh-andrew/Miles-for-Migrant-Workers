// Inline the built script, stylesheet and fonts into dist/index.html so the deck
// also runs when opened straight from the folder (file://), where Chrome refuses
// to fetch module scripts and cross-origin fonts. Photos stay as relative files.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const htmlPath = join(dist, "index.html");
let html = readFileSync(htmlPath, "utf8");

const cssTag = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/);
const jsTag = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/);
if (!cssTag || !jsTag) throw new Error("inline.mjs: built stylesheet or script tag not found");

const css = readFileSync(join(dist, cssTag[1]), "utf8").replace(/url\(\.?\/?([^)"']+\.woff2)\)/g, (_, file) => {
  const font = readFileSync(join(dist, "assets", file.replace(/^assets\//, ""))).toString("base64");
  return `url(data:font/woff2;base64,${font})`;
});
const js = readFileSync(join(dist, jsTag[1]), "utf8").replace(/<\/script/gi, "<\\/script");

html = html
  .replace(cssTag[0], () => `<style>${css}</style>`)
  .replace(jsTag[0], "")
  // The script must run after #root exists, so it goes at the end of <body>.
  .replace("</body>", () => `<script type="module">${js}</script>\n</body>`);

writeFileSync(htmlPath, html);
console.log(`inlined ${jsTag[1]} and ${cssTag[1]} into dist/index.html (${Math.round(html.length / 1024)} KB)`);
