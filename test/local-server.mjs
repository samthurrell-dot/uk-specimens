// Local test server: serves public/ and the functions, with in-memory Blobs and fake GBIF numbers.
// Run: npm run dev  then open http://localhost:8888  (the numbers are made up; the real site uses live GBIF data)
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { memoryStore, fakeGbif } from "./fakes.mjs";
import today from "../netlify/functions/today.mjs";
import play from "../netlify/functions/play.mjs";
import leaderboard from "../netlify/functions/leaderboard.mjs";

globalThis.__TEST_STORE__ = memoryStore();
fakeGbif();
const routes = { "/api/today": today, "/api/play": play, "/api/leaderboard": leaderboard };
const types = { ".html": "text/html; charset=utf-8", ".mjs": "text/javascript", ".js": "text/javascript", ".svg": "image/svg+xml" };
const root = new URL("../public/", import.meta.url).pathname;
const port = Number(process.env.PORT || 8888);

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const fn = routes[url.pathname];
  if (fn) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = await fn(new Request(url, { method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined }));
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); return;
  }
  const path = normalize(join(root, url.pathname === "/" ? "index.html" : url.pathname));
  if (!path.startsWith(root)) { res.writeHead(403); res.end(); return; }
  try { const body = await readFile(path); res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" }); res.end(body); }
  catch { res.writeHead(404); res.end("Not found"); }
}).listen(port, () => console.log(`Local test server on http://localhost:${port} (fake GBIF numbers)`));
