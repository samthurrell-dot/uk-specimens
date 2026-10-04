// Builds docs/index.html: one self-contained file for the no-server version.
// Takes the styles from public/index.html and the shared species code from public/specimens.mjs.
import { readFile, writeFile, mkdir } from "node:fs/promises";

const page = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const shared = (await readFile(new URL("../public/specimens.mjs", import.meta.url), "utf8")).replace(/^export /gm, "");
const app = await readFile(new URL("../standalone/app.js", import.meta.url), "utf8");

const head = page.slice(0, page.indexOf("<body>"));
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
    <button class="link" id="scoresBtn" type="button">My scores</button>
  </header>
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
