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
.gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;}
.gitem{display:flex;flex-direction:column;gap:4px;padding:4px;border:1px solid var(--line);background:var(--raised);color:var(--ink);text-align:left;cursor:pointer;font-size:11px;line-height:1.25;}
.gitem img,.gitem .gfail{width:100%;aspect-ratio:1;object-fit:cover;background:var(--sunk);display:flex;align-items:center;justify-content:center;color:var(--ink-muted);}
.gitem[aria-pressed="true"]{outline:3px solid var(--bad);outline-offset:-3px;}
.gitem[aria-pressed="true"] span::before{content:"✕ ";color:var(--bad);font-weight:700;}
.pickrow{display:flex;flex-direction:column;gap:6px;padding:10px 0;border-bottom:1px solid var(--line);}
.pickrow h3{font-size:18px;} .pickrow h3 small{font-family:var(--sans);font-size:13px;font-weight:400;font-style:italic;color:var(--ink-muted);}
.pickrow .done{font-family:var(--sans);font-size:12px;font-weight:700;color:var(--good);}
.gitem.pick[aria-pressed="true"]{outline:3px solid var(--good);}
.gitem.pick[aria-pressed="true"] span::before{content:"✓ ";color:var(--good);}
.fromcat{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border:1px solid var(--line);border-left:4px solid var(--accent);background:var(--raised);font-size:15px;}
.fromcat b{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-muted);}
.discobtn{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border:1px solid var(--line-strong);border-radius:2px;background:var(--raised);color:var(--ink);font-weight:700;font-size:14px;cursor:pointer;}
.discobtn b{font-size:16px;}

/* ===== DiSSCo mode: the one place the flat Wada style is allowed to go wild ===== */
html.disco{--paper:#0c0718;--raised:rgba(30,18,52,.88);--sunk:#1a1030;--line:#4b2f7a;--line-strong:#b984af;--ink:#fffdf6;--ink-soft:#f5ecc2;--ink-muted:#ca92a8;--accent:#f37f94;--on-accent:#111314;--good:#87c540;--bad:#f58e84;--mark:#fff200;color-scheme:dark;}
html.disco body{background:radial-gradient(circle at 20% 30%,rgba(243,127,148,.35),transparent 40%),radial-gradient(circle at 80% 20%,rgba(0,180,155,.30),transparent 40%),radial-gradient(circle at 50% 80%,rgba(255,242,0,.22),transparent 45%),#0c0718;background-size:200% 200%;animation:discoBg 8s ease-in-out infinite alternate;}
@keyframes discoBg{0%{background-position:0% 0%}50%{background-position:100% 50%}100%{background-position:30% 100%}}
html.disco h1,html.disco .title,html.disco .big{animation:discoHue 3s linear infinite;text-shadow:0 0 12px rgba(255,255,255,.35),0 0 30px rgba(243,127,148,.6);}
html.disco .hero h1 em{background:#fff200;}
@keyframes discoHue{from{filter:hue-rotate(0deg)}to{filter:hue-rotate(360deg)}}
html.disco .btn{box-shadow:0 0 18px rgba(243,127,148,.7);animation:discoPulse .5s ease-in-out infinite alternate;}
html.disco .btn.alt{color:var(--ink);}
@keyframes discoPulse{from{box-shadow:0 0 8px rgba(243,127,148,.5)}to{box-shadow:0 0 22px rgba(0,180,155,.9)}}
html.disco .card{animation:discoBounce .5s ease-in-out infinite alternate;box-shadow:0 0 24px rgba(185,132,175,.35);}
html.disco .card:nth-of-type(2){animation-delay:.25s;}
@keyframes discoBounce{from{transform:translateY(0)}to{transform:translateY(-3px)}}
html.disco .strip span{animation:discoHue 2s linear infinite;}
html.disco .discobtn{background:#fff200;color:#111314;border-color:#fff200;}
#mirrorball{position:absolute;top:0;left:max(50%, 220px);width:0;height:0;z-index:5;pointer-events:none;}
#mirrorball .string{position:absolute;left:-1px;top:0;width:2px;height:10px;background:#d9d3bb;}
#mirrorball .ball{position:absolute;left:-17px;top:8px;width:34px;height:34px;border-radius:50%;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.9) 0 5px,rgba(120,120,140,.9) 5px 7px),repeating-linear-gradient(90deg,rgba(255,255,255,.4) 0 5px,rgba(40,40,60,.6) 5px 7px);
  background-blend-mode:multiply;box-shadow:0 0 30px rgba(255,255,255,.7);animation:discoSpin 4s linear infinite;}
@keyframes discoSpin{from{background-position:0 0,0 0}to{background-position:0 0,56px 0}}
#mirrorball .beam{position:absolute;left:0;top:26px;width:3px;height:120vh;transform-origin:top center;opacity:.35;filter:blur(2px);animation:discoSweep 6s ease-in-out infinite alternate;}
#mirrorball .b0{background:linear-gradient(#f37f94,transparent);--a:20deg;--b:60deg}
#mirrorball .b1{background:linear-gradient(#00b49b,transparent);--a:35deg;--b:75deg;animation-delay:-1s}
#mirrorball .b2{background:linear-gradient(#fff200,transparent);--a:10deg;--b:50deg;animation-delay:-2s}
#mirrorball .b3{background:linear-gradient(#6450a1,transparent);--a:45deg;--b:85deg;animation-delay:-3s}
#mirrorball .b4{background:linear-gradient(#f99d1b,transparent);--a:5deg;--b:40deg;animation-delay:-4s}
#mirrorball .b5{background:linear-gradient(#87c540,transparent);--a:60deg;--b:25deg;animation-delay:-5s}
@keyframes discoSweep{from{transform:rotate(var(--a))}to{transform:rotate(var(--b))}}
#dancefloor{position:fixed;left:0;right:0;bottom:0;height:16px;display:grid;grid-template-columns:repeat(24,1fr);grid-template-rows:1fr 1fr;z-index:4;pointer-events:none;opacity:.85;}
#dancefloor i{animation:discoTile 3s steps(1) infinite;}
@keyframes discoTile{0%{background:#f37f94}25%{background:#00b49b}50%{background:#fff200}75%{background:#6450a1}}
html.disco .wrap{padding-bottom:64px;position:relative;z-index:1;}
.confetti{position:fixed;top:55vh;width:9px;height:9px;z-index:20;pointer-events:none;animation:discoConfetti 1.6s cubic-bezier(.2,.6,.4,1) forwards;}
@keyframes discoConfetti{to{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
@media (prefers-reduced-motion: reduce){html.disco *,html.disco body,#mirrorball *,#dancefloor i{animation:none!important;}}
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
    <button class="discobtn" id="discoBtn" type="button" aria-pressed="false"><b aria-hidden="true">🪩</b><span>DiSSCo mode</span></button>
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
