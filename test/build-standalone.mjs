// Builds docs/index.html: one self-contained file for the no-server version.
// Takes the styles from public/index.html and the shared species code from public/specimens.mjs.
import { readFile, writeFile, mkdir } from "node:fs/promises";

const page = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const shared = (await readFile(new URL("../public/specimens.mjs", import.meta.url), "utf8")).replace(/^export /gm, "");
const app = await readFile(new URL("../standalone/app.js", import.meta.url), "utf8");

const extra = `<style>
.stack{display:flex;flex-direction:column;gap:14px;}
.title{font-size:clamp(34px,10vw,48px);line-height:1;}
.navtabs{display:flex;gap:2px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none;}
.navtabs a{flex:1;text-align:center;min-height:44px;display:flex;align-items:center;justify-content:center;padding:0 8px;font-weight:700;font-size:15px;color:var(--ink-soft);text-decoration:none;border-bottom:3px solid transparent;white-space:nowrap;}
.navtabs a[aria-selected="true"]{color:var(--ink);border-bottom-color:var(--ink);}
a.btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;}
.chips{display:flex;flex-wrap:wrap;gap:6px;}
.chip{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border:1px solid var(--line-strong);border-radius:2px;background:var(--raised);color:var(--ink);font-size:14px;font-weight:700;cursor:pointer;}
.chip i{width:10px;height:10px;display:block;}
.chip[aria-pressed="true"]{background:var(--accent);color:var(--on-accent);border-color:var(--accent);}
.tiny{background:none;border:0;padding:0;font:inherit;font-size:12px;color:var(--ink-muted);text-decoration:underline;cursor:pointer;min-height:24px;}
.bars{list-style:none;margin:0;padding:0;}
.bars li{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:10px;align-items:start;padding:9px 0;border-bottom:1px solid var(--line);}
.bars .rk{font-family:var(--mono);font-size:13px;color:var(--ink-muted);padding-top:2px;}
.bars .nm{display:flex;flex-direction:column;gap:3px;min-width:0;}
.bars .nm small{color:var(--ink-muted);font-size:13px;font-style:italic;}
.bars .bar{display:block;height:8px;background:var(--sunk);}
.bars .bar i{display:block;height:100%;}
.bars .ct{font-family:var(--mono);font-size:15px;text-align:right;padding-top:1px;}
.learn h2{font-size:24px;margin-top:6px;}
.learn ul{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px;}
.pic{position:relative;}
.pic .tag{position:absolute;left:8px;top:8px;background:var(--paper);color:var(--ink);font-size:12px;font-weight:700;padding:2px 8px;border:1px solid var(--line-strong);}
.learn .lede{font-family:var(--serif);font-size:20px;color:var(--ink-soft);}
</style>`;
const base = page.slice(0, page.indexOf("<body>"));
const head = base.replace("</head>", extra + "\n</head>");
const footer = `
  <footer class="foot">
    <p>Counts are records of preserved specimens, fossils and samples published to <a href="https://www.gbif.org/">GBIF</a> by UK organisations, looked up live. This is close to, but not exactly, what the <a href="https://dissco-uk.org/">DiSSCo UK portal</a> shows, so treat the numbers as approximate.</p>
    <p>If nothing loads inside the Claude app, open this page in Chrome instead.</p>
    <p>Group colours are from Sanzo Wada's <i>A Dictionary of Color Combinations</i>; screen colours are approximate.</p>
  </footer>`;
const html = `${head}<body>
<div class="wrap">
  <header class="appbar">
    <span class="brand"><span class="dots" id="dots" aria-hidden="true"></span>UK Specimens</span>
  </header>
  <nav class="navtabs" id="tabs" role="tablist" aria-label="Sections"></nav>
  <main id="app" aria-live="polite"><p class="muted">Loading…</p></main>
${footer}
</div>
<div class="toast" id="toast" hidden role="status"></div>
<script>
// ---- shared species code (from public/specimens.mjs) ----
${shared}
// ---- no-server game ----
${app}
</script>
</body>
</html>
`;
await mkdir(new URL("../docs/", import.meta.url), { recursive: true });
await writeFile(new URL("../docs/index.html", import.meta.url), html);
console.log("Wrote docs/index.html", (html.length / 1024).toFixed(1) + " KB");
