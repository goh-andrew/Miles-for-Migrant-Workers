// Serves the built deck and a small relay so a phone on the same network can drive it,
// with no internet needed. Run `npm run build` once, then `npm run present`.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORT = Number(process.env.PORT) || 4173;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

const decks = new Set();
const remotes = new Set();
let lastState = null;
const send = (res, data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

const lanAddresses = () =>
  Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === "IPv4" && !i.internal)
    .map((i) => i.address);

const body = (req) =>
  new Promise((resolve) => {
    let s = "";
    req.on("data", (c) => {
      s += c;
      if (s.length > 20000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(s));
      } catch {
        resolve(null);
      }
    });
  });

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/relay/info") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ port: PORT, hosts: lanAddresses() }));
  }
  if (url.pathname === "/relay/stream") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    const set = url.searchParams.get("role") === "deck" ? decks : remotes;
    set.add(res);
    if (set === remotes && lastState) send(res, lastState);
    const beat = setInterval(() => res.write(": keep-alive\n\n"), 20000);
    req.on("close", () => {
      clearInterval(beat);
      set.delete(res);
    });
    return;
  }
  if (req.method === "POST" && (url.pathname === "/relay/state" || url.pathname === "/relay/cmd")) {
    const msg = await body(req);
    if (msg) {
      if (url.pathname === "/relay/state") {
        lastState = msg;
        remotes.forEach((r) => send(r, msg));
      } else decks.forEach((d) => send(d, msg));
    }
    res.writeHead(204);
    return res.end();
  }

  let file = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  if (!file || file.endsWith("/") || file.endsWith("\\")) file += "index.html";
  if (file.includes("..")) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const data = await readFile(join(root, file));
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Deck:   http://localhost:${PORT}`);
  for (const ip of lanAddresses()) console.log(`Remote: http://${ip}:${PORT}/?remote=1   (open this on the phone; press R on the deck for the same link)`);
});
