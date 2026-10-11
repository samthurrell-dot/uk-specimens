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
.fromcat b.dist{text-transform:none;letter-spacing:0;font-size:inherit;color:var(--ink);}
.fromcat b{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-muted);}
.where{display:flex;flex-direction:column;gap:8px;}
.where .pc{display:flex;gap:8px;}
.where input{flex:1;min-width:0;height:48px;border:1px solid var(--line-strong);border-radius:2px;background:var(--raised);color:var(--ink);font-size:17px;padding:0 12px;}
.near{margin-top:4px;display:flex;flex-direction:column;gap:6px;}
.small-btn{min-height:44px;font-size:15px;padding:0 12px;}
.near .row > .btn{flex:1 1 140px;}
.nearitem{display:flex;flex-direction:column;gap:6px;margin-top:4px;}
.dist{font-family:var(--mono);}
.nearme{display:flex;flex-direction:column;gap:10px;padding-bottom:6px;border-bottom:1px solid var(--line);}
.discobtn{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border:1px solid var(--line-strong);border-radius:2px;background:var(--raised);color:var(--ink);font-weight:700;font-size:14px;cursor:pointer;}
.discobtn b{font-size:16px;}

/* ===== DiSSCo mode: the one place the flat Wada style is allowed to go wild ===== */
/* one beat for everything: 118 bpm */
html.disco{--beat:.508s;--paper:#0b0716;--raised:rgba(24,14,44,.82);--sunk:#160d2b;--line:#3d2766;--line-strong:#b984af;--ink:#fffdf6;--ink-soft:#f5ecc2;--ink-muted:#d4a6c2;--accent:#f37f94;--on-accent:#111314;--good:#9ee35b;--bad:#ff8f84;--mark:#fff200;color-scheme:dark;}
html.disco body{background:#0b0716;transition:background .6s;}
html.disco .wrap{position:relative;z-index:2;padding-top:62px;padding-bottom:120px;}
html.disco-fading::after{content:"";position:fixed;inset:0;background:#000;z-index:50;pointer-events:none;animation:discoFade .7s ease-out forwards;}
@keyframes discoFade{0%{opacity:1}100%{opacity:0}}
/* light washes behind everything */
#discofx{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
#discofx .wash{position:absolute;width:90vmax;height:90vmax;border-radius:50%;filter:blur(60px);opacity:.38;mix-blend-mode:screen;animation:discoWash calc(var(--beat)*16) ease-in-out infinite alternate;}
#discofx .w1{background:#f37f94;left:-30vmax;top:-20vmax}
#discofx .w2{background:#00b49b;right:-35vmax;top:10vmax;animation-delay:calc(var(--beat)*-5)}
#discofx .w3{background:#6450a1;left:-10vmax;bottom:-45vmax;animation-delay:calc(var(--beat)*-9)}
@keyframes discoWash{0%{transform:translate(0,0) scale(1)}50%{transform:translate(12vmax,8vmax) scale(1.15)}100%{transform:translate(-8vmax,14vmax) scale(.9)}}
/* mirror-ball reflections sweeping the room */
#discofx .specks{position:absolute;left:50%;top:-20vh;width:220vmax;height:220vmax;margin-left:-110vmax;animation:discoTurn calc(var(--beat)*48) linear infinite;}
#discofx .specks i{position:absolute;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(255,255,255,.8);opacity:.75;animation:discoTwinkle calc(var(--beat)*2) ease-in-out infinite;}
@keyframes discoTurn{to{transform:rotate(360deg)}}
@keyframes discoTwinkle{0%,100%{opacity:.2;transform:scale(.6)}50%{opacity:.9;transform:scale(1.2)}}
/* spotlight beams */
#discofx .beam{position:absolute;top:-10vh;width:22vw;height:140vh;transform-origin:50% 0;opacity:.16;filter:blur(6px);background:linear-gradient(to bottom,var(--c),transparent 80%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%);animation:discoSweep calc(var(--beat)*8) ease-in-out infinite alternate;}
#discofx .bm1{left:5vw;--c:#f37f94;--a:-25deg;--b:20deg}
#discofx .bm2{left:40vw;--c:#fff200;--a:18deg;--b:-22deg;animation-delay:calc(var(--beat)*-3)}
#discofx .bm3{right:5vw;--c:#00b49b;--a:22deg;--b:-18deg;animation-delay:calc(var(--beat)*-6)}
@keyframes discoSweep{from{transform:rotate(var(--a))}to{transform:rotate(var(--b))}}
/* the dance floor, in perspective */
#discofx .floor{position:absolute;left:-20%;right:-20%;bottom:-6px;height:150px;transform:perspective(320px) rotateX(58deg);transform-origin:50% 100%;display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:repeat(4,1fr);gap:3px;opacity:.9;-webkit-mask-image:linear-gradient(to top,#000 40%,transparent);mask-image:linear-gradient(to top,#000 40%,transparent);}
#discofx .floor i{background:var(--c);opacity:.12;animation:discoTile calc(var(--beat)*4) steps(1) infinite;animation-delay:var(--d);box-shadow:0 0 18px var(--c);}
@keyframes discoTile{0%{opacity:.9}25%{opacity:.1}50%{opacity:.5}75%{opacity:.1}}
/* the ball itself, hanging in the header */
#mirrorball{position:absolute;top:0;left:50%;width:0;height:0;z-index:6;pointer-events:none;}
#mirrorball .string{position:absolute;left:-1px;top:0;width:2px;height:12px;background:linear-gradient(#aaa,#eee);}
#mirrorball .ball{position:absolute;left:-21px;top:10px;width:42px;height:42px;border-radius:50%;overflow:hidden;
  background:radial-gradient(circle at 35% 30%,#fff 0 8%,rgba(255,255,255,.2) 22%,transparent 45%),radial-gradient(circle at 50% 50%,#c9c3d6,#6c6680 75%,#3a3448);
  box-shadow:0 0 18px rgba(255,255,255,.55),0 0 40px rgba(243,127,148,.35);animation:discoGlint calc(var(--beat)*2) ease-in-out infinite;}
#mirrorball .ball::before{content:"";position:absolute;inset:0;border-radius:50%;
  background:repeating-linear-gradient(90deg,transparent 0 4px,rgba(20,15,35,.55) 4px 5px),repeating-linear-gradient(0deg,transparent 0 4px,rgba(20,15,35,.55) 4px 5px);
  animation:discoFacets calc(var(--beat)*8) linear infinite;}
@keyframes discoFacets{to{background-position:40px 0,0 0}}
@keyframes discoGlint{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35)}}
/* type, buttons and cards */
html.disco h1,html.disco .title,html.disco .big,html.disco .verdict b,html.disco .fb-title{background:linear-gradient(100deg,#fff200,#f37f94 30%,#b984af 55%,#00b49b 80%,#fff200);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:discoChrome calc(var(--beat)*8) linear infinite;}
html.disco .verdict.bad b{background:linear-gradient(100deg,#ff8f84,#f37f94,#ff8f84);-webkit-background-clip:text;background-clip:text;}
html.disco .hero h1 em{background:none;color:inherit;padding:0;}
@keyframes discoChrome{to{background-position:250% 0}}
html.disco .btn{background:transparent;color:#fffdf6;border:2px solid #f37f94;text-shadow:0 0 8px rgba(243,127,148,.9);box-shadow:0 0 14px rgba(243,127,148,.55),inset 0 0 10px rgba(243,127,148,.35);animation:discoNeon calc(var(--beat)*2) ease-in-out infinite;}
html.disco .btn.alt{border-color:#00b49b;text-shadow:0 0 8px rgba(0,180,155,.9);box-shadow:0 0 14px rgba(0,180,155,.5),inset 0 0 10px rgba(0,180,155,.3);}
html.disco .guess .btn:last-child{border-color:#00b49b;text-shadow:0 0 8px rgba(0,180,155,.9);box-shadow:0 0 14px rgba(0,180,155,.5),inset 0 0 10px rgba(0,180,155,.3);}
@keyframes discoNeon{0%,100%{filter:brightness(1)}50%{filter:brightness(1.25)}}
html.disco .card,html.disco .verdict,html.disco .fromcat,html.disco .rank,html.disco .note{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-color:rgba(185,132,175,.45);}
html.disco .card{box-shadow:0 0 0 1px rgba(255,255,255,.04),0 10px 40px rgba(0,0,0,.45);animation:discoBreathe calc(var(--beat)*2) ease-in-out infinite;}
html.disco .card + .vs + .card{animation-delay:calc(var(--beat)*-1);}
@keyframes discoBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
html.disco .label,html.disco .group{color:#ffd6e3;}
html.disco .pips i.now{background:#fff200;box-shadow:0 0 8px #fff200;}
html.disco .navtabs a[aria-selected="true"]{border-bottom-color:#fff200;text-shadow:0 0 10px rgba(255,242,0,.7);}
html.disco .strip span{animation:discoTile calc(var(--beat)*4) steps(1) infinite;--c:currentColor;}
html.disco .strip span:nth-child(odd){animation-delay:calc(var(--beat)*-2);}
html.disco .discobtn,html.disco .musicbtn{background:#fff200;color:#111314;border-color:#fff200;box-shadow:0 0 14px rgba(255,242,0,.6);}
.musicbtn{display:none;align-items:center;justify-content:center;min-height:40px;min-width:44px;padding:0 10px;font-size:18px!important;border:1px solid var(--line-strong);border-radius:2px;background:var(--raised);color:var(--ink);font-weight:700;font-size:14px;cursor:pointer;}
html.disco .musicbtn{display:inline-flex;}
html.disco .musicbtn[aria-pressed="true"]{background:#f37f94;border-color:#f37f94;}
.appbar .btns{display:flex;gap:6px;align-items:center;}
/* moments */
html.disco .verdict.good{animation:discoPop .4s cubic-bezier(.2,1.6,.4,1);}
html.disco .verdict.bad{animation:discoScratch .45s linear;}
@keyframes discoPop{0%{transform:scale(.85)}100%{transform:scale(1)}}
@keyframes discoScratch{0%,100%{transform:none}20%{transform:translateX(-6px) skewX(-6deg)}40%{transform:translateX(5px) skewX(5deg)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.confetti{position:fixed;top:58vh;width:8px;height:12px;border-radius:1px;z-index:40;pointer-events:none;animation:discoConfetti 1.7s cubic-bezier(.15,.7,.35,1) forwards;}
.confetti.star{width:10px;height:10px;clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}
@keyframes discoConfetti{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
@media (prefers-reduced-motion: reduce){html.disco *,html.disco *::before,#discofx *,#mirrorball *{animation:none!important;}#discofx .specks{display:none;}}
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
    <span class="btns"><button class="musicbtn" id="musicBtn" type="button" aria-pressed="false" aria-label="Disco music" title="Disco music">♪</button>
    <button class="discobtn" id="discoBtn" type="button" aria-pressed="false"><b aria-hidden="true">🪩</b><span>DiSSCo mode</span></button></span>
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
