// No-server version of More or less?, with Practice, Explore and Learn sections.
// Runs from a single HTML file or any static host (e.g. GitHub Pages). It asks the GBIF API directly from
// the browser and keeps progress and scores on this device only.
// Built into docs/index.html by: npm run build:static  (the shared species code is pasted in above this script)

const API = "https://api.gbif.org/v1";
const FILTER = "publishingCountry=GB&basisOfRecord=PRESERVED_SPECIMEN&basisOfRecord=FOSSIL_SPECIMEN&basisOfRecord=MATERIAL_SAMPLE";
const WEEK = 7 * 864e5;
const $ = (s) => document.querySelector(s);
const app = $("#app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const local = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2400); }

/* ---------- GBIF ---------- */
const getJSON = (url) => fetchJSON(url);
const matchName = (name, rank) => matchTaxon(getJSON, name, rank);
const recordsLink = (key) => `https://www.gbif.org/occurrence/search?taxon_key=${key}&publishing_country=GB&basis_of_record=PRESERVED_SPECIMEN&basis_of_record=FOSSIL_SPECIMEN&basis_of_record=MATERIAL_SAMPLE`;

// Look up one species. Results are kept on the device for a week.
// Returns the species with its count, null if it has no records, or undefined if GBIF couldn't be reached.
async function lookup(i, withPhoto = true) {
  const [name, sci, group, fact, rank] = SPECIES[i];
  const ck = `uks.sp5.${sci}`, cached = local.get(ck);
  if (cached && Date.now() - cached.t < WEEK && (!withPhoto || cached.photoChecked)) return cached.none ? null : { ...cached.v, i };
  try {
    const key = await matchName(sci, rank || "species");
    if (!key) { local.set(ck, { t: Date.now(), none: true, photoChecked: true }); return null; }
    const c = await getJSON(`${API}/occurrence/search?limit=0&taxonKey=${key}&${FILTER}`);
    if (!c.count) { local.set(ck, { t: Date.now(), none: true, photoChecked: true }); return null; }
    let photo = cached && cached.v && cached.v.key === key ? cached.v.photo : null, photoChecked = false;
    if (withPhoto) {
      try { photo = (await findPhoto(getJSON, key, group, sci)).photo; photoChecked = true; } catch {}
    }
    const v = { name, sci, group, fact, key, count: c.count, photo, link: recordsLink(key) };
    local.set(ck, { t: Date.now(), v, photoChecked });
    return { ...v, i };
  } catch { return undefined; }
}
async function pool(items, n, fn) {
  const out = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (next < items.length) { const k = next++; out[k] = await fn(items[k], k); } }));
  return out;
}

/* ---------- shared bits ---------- */
const puzzle = puzzleNumber();
$("#dots").innerHTML = Object.values(GROUPS).slice(0, 4).map((g) => `<i style="background:${g.hex}"></i>`).join("");
const groupOf = (s) => GROUPS[s.group] || GROUPS.plant;
const SHORT = { sea: "Sea life", herp: "Reptiles" };
const CHIPS = [["all", "Everything"], ...Object.entries(GROUPS).map(([k, g]) => [k, SHORT[k] || g.label])];

// try GBIF's resized copy first, then the original, then give up and show the group colour
// a busy image server may refuse when lots load at once, so wait and try once more before giving up
window.photoFailed = (img) => {
  if (img.dataset.orig && img.src !== img.dataset.orig) { img.src = img.dataset.orig; img.dataset.orig = ""; return; }
  if (!img.dataset.retried) { img.dataset.retried = "1"; const src = img.src; setTimeout(() => { img.src = ""; img.src = src; }, 1500 + Math.random() * 2000); return; }
  const c = img.closest(".card"); c.querySelector(".credit")?.remove(); c.querySelector(".tag")?.remove();
  img.parentNode.className = "pic none"; img.remove();
};
function card(s, opts = {}) {
  const g = groupOf(s);
  const p = s.photo, tag = p && (p.kind === "living" || p.kind === "wiki") ? "Living example" : p && p.kind === "world" ? "Specimen outside the UK" : "";
  const pic = p
    ? `<div class="pic">${tag ? `<span class="tag">${tag}</span>` : ""}<img src="${esc(thumbUrl(p.url))}" data-orig="${esc(p.url.replace(/^http:/, "https:"))}" alt="${p.kind === "living" || p.kind === "wiki" ? "Living" : "Museum specimen of"} ${esc(s.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="photoFailed(this)"></div>`
    : `<div class="pic none" style="background:${g.hex}"></div>`;
  const where = p ? (p.kind === "living" || p.kind === "wiki" ? "Not a museum specimen. Photo: " : p.kind === "world" ? `Specimen ${p.country ? `(${esc(p.country)}) ` : ""}from ` : "Photo: ") : "";
  const credit = p ? `<p class="credit">${where}${esc(p.credit)} · ${esc(p.licence)} · ${p.kind === "wiki" ? `<a href="${esc(p.source)}" target="_blank" rel="noopener">Wikimedia</a>` : `<a href="https://www.gbif.org/occurrence/${encodeURIComponent(p.occurrence)}" target="_blank" rel="noopener">record</a>`}${p.kind === "living" || p.kind === "wiki" ? "" : ` · <button class="tiny" type="button" data-report="${esc(s.sci)}">Not a specimen?</button>`}</p>` : "";
  const count = opts.hide
    ? `<p class="count hidden" aria-label="Unknown">?<small>specimens</small></p>`
    : `<p class="count">${fmt(s.count)}<small>specimen${s.count === 1 ? "" : "s"}</small></p>`;
  return `<article class="card" style="border-left-color:${g.hex}">${pic}<div class="body">
      <p class="group"><i style="background:${g.hex}"></i>${esc(g.label)}</p>
      <h2>${esc(s.name)}</h2><p class="sci">${esc(s.sci)}</p>${count}
      ${opts.fact ? `<p class="fact">${esc(s.fact)}</p>` : ""}${credit}</div></article>`;
}
// "Not a specimen?" hides that photo on this device and remembers it, so it can be fed back into the filter later
function wireReports(root) {
  root.querySelectorAll("[data-report]").forEach((b) => (b.onclick = () => {
    const sci = b.dataset.report, bad = local.get("uks.badphotos") || {}, c = local.get(`uks.sp5.${sci}`);
    bad[sci] = c && c.v && c.v.photo ? c.v.photo.url : true; local.set("uks.badphotos", bad);
    const art = b.closest(".card"); art.querySelector(".pic").className = "pic none"; art.querySelector(".pic").innerHTML = ""; b.closest(".credit").remove();
    toast("Thanks. That photo is hidden on this phone.");
  }));
}
const hideBad = (s) => { const bad = local.get("uks.badphotos") || {}; return s && s.photo && bad[s.sci] ? { ...s, photo: null } : s; };
function verdictText(a, b) {
  if (b.count === a.count) return `Exactly the same number as ${a.name}, so either answer counts.`;
  return b.count > a.count ? `More. ${b.name} has ${ratio(a.count, b.count)} ${a.name}.` : `Fewer. ${a.name} has ${ratio(a.count, b.count)} ${b.name}.`;
}
function errorBox(kind, retry) {
  app.innerHTML = `<p class="err">${kind === "unreachable"
    ? "The museum data (GBIF) couldn't be reached. Check your connection. If you opened this inside the Claude app, try opening it in Chrome."
    : "Not enough species could be looked up just now. Please try again later."}</p>
    <div class="row"><button class="btn alt" type="button" id="retry">Try again</button></div>`;
  $("#retry").onclick = retry;
}
function pairView({ label, pips, a, b, pending, nextLabel }) {
  const bottom = pending
    ? `<div class="verdict ${pending.right ? "good" : "bad"}"><b>${pending.right ? "Right" : "Not this time"}</b><p>${esc(verdictText(a, b))}</p></div>
       <button class="btn" type="button" id="next">${nextLabel}</button>`
    : `<div class="guess"><button class="btn" type="button" data-g="more">More</button><button class="btn" type="button" data-g="fewer">Fewer</button></div>`;
  app.innerHTML = `<section class="stack">
    <div class="top"><p class="label">${label}</p>${pips ? `<div class="pips" aria-hidden="true">${pips}</div>` : ""}</div>
    ${card(hideBad(a), { fact: true })}
    <p class="vs">Does this have more or fewer?</p>
    ${card(hideBad(b), { fact: !!pending, hide: !pending })}
    ${bottom}</section>`;
  wireReports(app);
}

/* ---------- daily game ---------- */
let day = null, prog = null, step = 0, pending = null, started = false;

async function buildDay(onProgress) {
  const cached = local.get(`uks.day5.${puzzle}`);
  if (cached && cached.chain && cached.chain.length === ROUNDS + 1) return cached;
  const order = candidateOrder(puzzle), found = new Map();
  let failed = 0, tried = 0;
  // a few at a time, so GBIF doesn't refuse the requests
  for (let start = 0; start < order.length; start += 12) {
    const got = await pool(order.slice(start, start + 12), 4, (i) => lookup(i));
    got.forEach((g) => { tried++; if (g === undefined) failed++; else if (g) found.set(g.i, g); });
    onProgress(found.size);
    if (found.size >= ROUNDS + 6 || !found.size) break;
  }
  const chain = buildChain(order, (i) => found.has(i));
  if (chain.length < ROUNDS + 1) throw new Error(failed === tried ? "unreachable" : "short");
  const d = { puzzle, at: new Date().toISOString(), chain: chain.map((i) => found.get(i)) };
  local.set(`uks.day5.${puzzle}`, d);
  return d;
}
async function play() {
  if (!day) {
    app.innerHTML = `<p class="muted" id="loading">Asking the museums for today's numbers…</p>`;
    try { day = await buildDay((n) => { const l = $("#loading"); if (l) l.textContent = `Asking the museums for today's numbers… (${Math.min(n, ROUNDS + 1)} of ${ROUNDS + 1})`; }); }
    catch (e) { return errorBox(e.message, play); }
    prog = local.get(`uks.prog.${puzzle}`) || { marks: [], guesses: [] };
    step = prog.marks.length;
  }
  if (route() !== "play") return;
  if (step >= ROUNDS) return results();
  if (step > 0 || pending || started) return game();
  start();
}
function start() {
  const h = myHistory();
  app.innerHTML = `
  <section class="hero">
    <p class="label">Daily · No. ${puzzle} · ${esc(puzzleDate(puzzle))}</p>
    <h1>More or <em>less?</em></h1>
    <div class="strip" aria-hidden="true">${Object.values(GROUPS).map((g) => `<span style="background:${g.hex}"></span>`).join("")}</div>
    <p>UK museums hold millions of preserved specimens, from pressed daisies to dinosaur bones. Some species fill whole drawers. Others are almost never collected.</p>
    <ul class="rules">
      <li>You see a species and how many UK specimens there are.</li>
      <li>Guess if the next one has <b>more</b> or <b>fewer</b>.</li>
      <li>Ten guesses. One go a day. New puzzle at midnight UK time.</li>
    </ul>
    <button class="btn" type="button" id="go">Start today's puzzle</button>
    ${h.played ? `<p class="small muted">Played ${h.played} · Best ${h.best}/10 · Streak ${h.streak}</p>` : ""}
    <p class="small muted">Want a warm-up first? Try <a href="#practice">Practice</a>, which doesn't count.</p>
  </section>`;
  $("#go").onclick = game;
}
function game() {
  started = true;
  const m = prog.marks;
  pairView({
    label: `No. ${puzzle} · Guess ${step + 1} of ${ROUNDS}`,
    pips: Array.from({ length: ROUNDS }, (_, k) => `<i class="${k < m.length ? (m[k] ? "y" : "n") : k === step ? "now" : ""}"></i>`).join(""),
    a: day.chain[step], b: day.chain[step + 1], pending, nextLabel: step + 1 >= ROUNDS ? "See your score" : "Next species",
  });
  app.querySelectorAll("[data-g]").forEach((btn) => (btn.onclick = () => guess(btn.dataset.g)));
  const nx = $("#next");
  if (nx) nx.onclick = () => { pending = null; step += 1; if (step >= ROUNDS) results(); else game(); window.scrollTo(0, 0); };
}
function guess(g) {
  if (prog.marks.length !== step) return;
  const right = isRight(day.chain[step].count, day.chain[step + 1].count, g);
  prog.guesses.push(g); prog.marks.push(right ? 1 : 0);
  local.set(`uks.prog.${puzzle}`, prog);
  if (prog.marks.length === ROUNDS) {
    const h = local.get("uks.history") || {};
    if (!(puzzle in h)) { h[puzzle] = prog.marks.reduce((x, y) => x + y, 0); local.set("uks.history", h); }
  }
  pending = { right }; game();
}
function myHistory() {
  const h = local.get("uks.history") || {}, days = Object.keys(h).map(Number);
  let streak = 0, d = days.includes(puzzle) ? puzzle : puzzle - 1;
  while (days.includes(d)) { streak++; d--; }
  return { played: days.length, best: days.length ? Math.max(...days.map((k) => h[k])) : 0,
    average: days.length ? Math.round(days.reduce((s, k) => s + h[k], 0) / days.length * 10) / 10 : 0, streak };
}
function results() {
  const marks = prog.marks, score = marks.reduce((a, b) => a + b, 0), h = myHistory();
  const msg = score >= 9 ? "Curator material." : score >= 7 ? "A sharp eye for the stores." : score >= 5 ? "Not bad at all." : "The drawers are full of surprises.";
  app.innerHTML = `<section class="stack" style="gap:16px;">
    <p class="label">No. ${puzzle} · ${esc(puzzleDate(puzzle))}</p>
    <p class="big">${score}<small> / ${ROUNDS}</small></p>
    <p style="font-family:var(--serif);font-size:22px;">${msg}</p>
    <p class="grid" aria-label="${score} right out of ${ROUNDS}">${gridText(marks)}</p>
    <p class="rank">Played ${h.played} · Average ${h.average} · Best ${h.best}/10 · Streak ${h.streak}</p>
    <div class="row"><button class="btn" type="button" id="share">Share result</button><a class="btn alt" href="#practice">Keep practising</a></div>
    <div class="chain"><h3 style="font-size:20px;margin-bottom:6px;">Today's specimens</h3><ol>
      ${day.chain.map((s, k) => `<li><i style="background:${groupOf(s).hex}"></i>
        <span><a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.name)}</a><small>${esc(s.sci)}</small></span>
        <span><span class="n">${fmt(s.count)}</span>${k > 0 ? `<span class="m" style="color:var(${marks[k - 1] ? "--good" : "--bad"})">${marks[k - 1] ? "Right" : "Wrong"}</span>` : ""}</span></li>`).join("")}
    </ol></div>
    <p class="small muted">Names link to the records on GBIF, where you can see where and when each specimen was collected.</p>
    <p class="small muted">Scores are kept on this phone only. Share your result to compare with friends.</p></section>`;
  $("#share").onclick = async () => {
    const text = `More or less? No. ${puzzle}\n${gridText(marks)} ${score}/${ROUNDS}${location.protocol.startsWith("http") ? "\n" + location.href.split("#")[0] : ""}`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (err) { if (err && err.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(text); toast("Copied to clipboard"); } catch { toast("Couldn't copy, sorry"); }
  };
}

/* ---------- practice: endless pairs, pick a category ---------- */
const practice = { group: "all", a: null, b: null, pending: null, run: 0, best: local.get("uks.practiceBest") || 0, used: [] };
function practicePool() { return SPECIES.map((_, i) => i).filter((i) => practice.group === "all" || SPECIES[i][2] === practice.group); }
async function drawSpecies(exclude) {
  const opts = practicePool().filter((i) => !exclude.includes(i) && !practice.used.includes(i));
  const list = opts.length ? opts : practicePool().filter((i) => !exclude.includes(i));
  for (let tries = 0; tries < 8 && list.length; tries++) {
    const i = list.splice(Math.floor(Math.random() * list.length), 1)[0];
    const s = await lookup(i);
    if (s === undefined) throw new Error("unreachable");
    if (s) { practice.used.push(i); if (practice.used.length > 30) practice.used.shift(); return s; }
  }
  throw new Error("short");
}
function practiceTop() {
  return `<div class="chips" role="group" aria-label="Category">${CHIPS.map(([k, l]) =>
    `<button class="chip" type="button" data-cat="${k}" aria-pressed="${practice.group === k}">${k !== "all" ? `<i style="background:${GROUPS[k].hex}"></i>` : ""}${esc(l)}</button>`).join("")}</div>`;
}
async function practiceView() {
  const token = (practice.token = (practice.token || 0) + 1); // a newer call (e.g. a category tap) wins
  if (!practice.a || !practice.b) {
    app.innerHTML = `<section class="stack"><h1 class="title">Practice</h1>${practiceTop()}<p class="muted">Finding two specimens…</p></section>`;
    wireChips();
    try {
      const a = practice.a || (await drawSpecies([]));
      if (token !== practice.token) return;
      const b = await drawSpecies([a.i]);
      if (token !== practice.token) return;
      practice.a = a; practice.b = b;
    } catch (e) { if (token === practice.token) errorBox(e.message, practiceView); return; }
    if (route() !== "practice") return;
  }
  pairView({ label: `Practice · Run of ${practice.run} · Best ${practice.best}`, a: practice.a, b: practice.b, pending: practice.pending, nextLabel: "Next pair" });
  app.querySelector(".stack").insertAdjacentHTML("afterbegin", `<h1 class="title">Practice</h1>${practiceTop()}<p class="small muted">Doesn't count towards your daily score. Pick a category to stick to one kind of specimen.</p>`);
  wireChips();
  app.querySelectorAll("[data-g]").forEach((btn) => (btn.onclick = () => {
    const right = isRight(practice.a.count, practice.b.count, btn.dataset.g);
    practice.run = right ? practice.run + 1 : 0;
    if (practice.run > practice.best) { practice.best = practice.run; local.set("uks.practiceBest", practice.best); }
    practice.pending = { right }; practiceView();
  }));
  const nx = $("#next");
  if (nx) nx.onclick = () => { practice.a = practice.b; practice.b = null; practice.pending = null; practiceView(); window.scrollTo(0, 0); };
}
function wireChips() {
  app.querySelectorAll("[data-cat]").forEach((b) => (b.onclick = () => {
    if (practice.group === b.dataset.cat) return;
    practice.group = b.dataset.cat; practice.a = practice.b = practice.pending = null; practice.used = []; practiceView();
  }));
}

/* ---------- explore: commonest to rarest ---------- */
const explore = { group: "all", list: null };
async function exploreView() {
  if (!explore.list) {
    app.innerHTML = `<section class="stack"><h1 class="title">Explore</h1><p class="muted" id="loading">Looking up every species…</p></section>`;
    let done = 0;
    const got = await pool(SPECIES.map((_, i) => i), 3, async (i) => {
      const s = await lookup(i, false);
      done++; const l = $("#loading"); if (l) l.textContent = `Looking up every species… ${done} of ${SPECIES.length}`;
      return s;
    });
    if (got.every((s) => s === undefined)) return errorBox("unreachable", exploreView);
    explore.list = got.map((s, i) => s || (s === null ? { ...Object.fromEntries(["name", "sci", "group", "fact"].map((k, n) => [k, SPECIES[i][n]])), count: 0 } : null)).filter(Boolean);
    if (route() !== "explore") return;
  }
  const rows = explore.list.filter((s) => explore.group === "all" || s.group === explore.group).sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((s) => s.count));
  const bar = (n) => (n <= 0 ? 0 : Math.max(2, (Math.log10(n + 1) / Math.log10(max + 1)) * 100));
  const total = rows.reduce((t, s) => t + s.count, 0);
  app.innerHTML = `<section class="stack">
    <h1 class="title">Explore</h1>
    <p>Every species in the game, from the most collected to the least, in UK collections.</p>
    <div class="chips" role="group" aria-label="Category">${CHIPS.map(([k, l]) =>
      `<button class="chip" type="button" data-ex="${k}" aria-pressed="${explore.group === k}">${k !== "all" ? `<i style="background:${GROUPS[k].hex}"></i>` : ""}${esc(l)}</button>`).join("")}</div>
    <p class="small muted">${rows.length} species · ${fmt(total)} specimens in total. The bars use a stretched scale so small numbers still show: each step of the same length means about ten times as many.</p>
    <ol class="bars">${rows.map((s, k) => `<li>
      <span class="rk">${k + 1}</span>
      <span class="nm">${s.link ? `<a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)}<small>${esc(s.sci)}</small>
        <span class="bar" aria-hidden="true"><i style="width:${bar(s.count).toFixed(1)}%;background:${groupOf(s).hex}"></i></span></span>
      <span class="ct">${s.count ? fmt(s.count) : "none"}</span></li>`).join("")}</ol>
    <p class="small muted">"None" means no UK specimen records were found online for that name. The specimens may exist but not be online yet.</p>
  </section>`;
  app.querySelectorAll("[data-ex]").forEach((b) => (b.onclick = () => { explore.group = b.dataset.ex; exploreView(); }));
}

/* ---------- learn ---------- */
function learnView() {
  app.innerHTML = `<section class="stack learn">
    <h1 class="title">Learn</h1>
    <p class="lede">What's behind the numbers in the game.</p>
    <h2>What is a specimen?</h2>
    <p>A specimen is a real plant, animal, fungus or fossil, or part of one, kept in a museum or university collection. It might be a bird skin, a skeleton, a pinned insect, a pressed plant on a sheet of paper, a jar of fish in alcohol, or a fossil in a drawer. Each one has a label saying what it is, where and when it was found, and who collected it.</p>
    <p>That label is what makes a specimen useful. Scientists use them to see how species have spread, shrunk or changed over the last few hundred years.</p>
    <h2>Where the numbers come from</h2>
    <p>The counts are records of specimens that UK museums and universities have put online through <a href="https://www.gbif.org/" target="_blank" rel="noopener">GBIF</a>, a free international database. The <a href="https://dissco-uk.org/" target="_blank" rel="noopener">DiSSCo UK</a> portal gathers the UK's records in one place.</p>
    <p>Only a fraction of UK specimens are online so far. DiSSCo UK estimates there are around 137 million specimens in UK natural science collections, and a national ten-year programme to put far more of them online is starting from 2026. So the numbers here will grow, and a low count can mean "not online yet" rather than "rare".</p>
    <h2>Why some species fill whole drawers</h2>
    <ul>
      <li><b>Small and easy to keep.</b> Insects, shells and pressed plants take up little space, so collectors kept thousands. An elephant or whale needs a warehouse.</li>
      <li><b>Victorian fashions.</b> Collecting birds' eggs, butterflies, shells and ferns was a popular hobby in the 1800s. Many of those collections ended up in museums.</li>
      <li><b>Common things get collected a lot.</b> Collectors often took many examples of the same species to show how individuals differ.</li>
      <li><b>Rare and protected species.</b> Some species were always hard to find. Others are now protected, so new specimens are rarely collected.</li>
      <li><b>Which museums are online.</b> Some collections have put far more online than others, which can make one group look bigger than it is.</li>
    </ul>
    <h2>Why extinct animals still turn up</h2>
    <p>Animals like the great auk, passenger pigeon and thylacine were collected before they died out. Those few specimens are now some of the most precious objects museums hold.</p>
    <h2>Seeing them for real</h2>
    <p>Most specimens are kept in stores rather than on display, but museums near Manchester show some of their collections, including <a href="https://www.museum.manchester.ac.uk/" target="_blank" rel="noopener">Manchester Museum</a> and <a href="https://www.liverpoolmuseums.org.uk/world-museum" target="_blank" rel="noopener">World Museum Liverpool</a>. The <a href="https://www.nhm.ac.uk/" target="_blank" rel="noopener">Natural History Museum</a> in London holds the UK's largest collection.</p>
    <h2>About the photos</h2>
    <p>Photos come from the museums' own records. Some museums photograph paperwork, like old registers and labels, as well as specimens. The game tries to skip those by checking each photo's description, but some will still slip through. If you spot one, tap "Not a specimen?" and it'll be hidden on your phone.</p>
    <p>Where no UK museum has an open photo, the game uses a specimen from a museum elsewhere, labelled "Specimen outside the UK". For mammals, birds, reptiles, amphibians, plants and fungi it shows a living example first, labelled "Living example", as preserved ones, eggs and pressed or dried specimens can be upsetting or hard to make out. Where it can, it uses the species' main photo from Wikipedia. Counts are always UK specimens only.</p>
    <p class="small"><a href="#check">Run a photo check</a> (for testing: lists what was found for every species) · <a href="#pick">Photo picker</a> (choose the photo each species uses).</p>
    <p class="small muted">Counts are approximate and change as museums add records. Group colours are from Sanzo Wada's <i>A Dictionary of Color Combinations</i>; screen colours are approximate.</p>
    <div class="row"><a class="btn" href="#play">Play today's puzzle</a></div>
  </section>`;
}

/* ---------- tabs ---------- */
/* ---------- photo check (for testing) ---------- */
async function checkView() {
  app.innerHTML = `<section class="stack"><h1 class="title">Photo check</h1>
    <p>This looks up photos for every species and shows what it found, so we can see which ones still need work. It takes a few minutes, as it goes gently so GBIF doesn't refuse the requests.</p>
    <p class="muted" id="loading">Starting…</p><div id="out"></div></section>`;
  let done = 0;
  const rows = await pool(SPECIES.map((_, i) => i), 2, async (i) => {
    const [name, sci, group, , rank] = SPECIES[i];
    let line;
    try {
      const key = await matchName(sci, rank || "species");
      if (!key) line = { name, sci, result: "no name match" };
      else { const r = await findPhoto(getJSON, key, group, sci); line = { name, sci, result: r.photo ? r.photo.kind : "none", log: r.log, url: r.photo && r.photo.url }; }
    } catch (e) { line = { name, sci, result: "error", detail: String(e && e.message || e) }; }
    done++; const l = $("#loading"); if (l) l.textContent = `Checked ${done} of ${SPECIES.length}…`;
    return line;
  });
  if (route() !== "check") return;
  const n = (k) => rows.filter((r) => r.result === k).length;
  const fmtLog = (log = []) => log.map((t) => t.error ? `${t.kind}: error (${t.error})` : `${t.kind}: ${t.seen} seen, ${t.paperwork} paperwork, ${t.licence} licence, ${t.other} other${t.found ? " → used" : ""}`).join(" | ");
  const text = [`Photo check ${new Date().toLocaleString("en-GB")}`,
    `UK specimen ${n("uk")} · elsewhere ${n("world")} · living ${n("living")} · none ${n("none")} · no match ${n("no name match")} · errors ${n("error")}`, "",
    ...rows.map((r) => `${r.name} (${r.sci}): ${r.result}${r.detail ? " (" + r.detail + ")" : ""}${r.log ? " — " + fmtLog(r.log) : ""}${r.url ? " — " + r.url : ""}`)].join("\n");
  $("#loading").textContent = "Done.";
  $("#out").innerHTML = `<p class="rank">UK specimen ${n("uk")} · Elsewhere ${n("world")} · Living ${n("living")} · None ${n("none")}${n("no name match") ? ` · No match ${n("no name match")}` : ""}${n("error") ? ` · Errors ${n("error")}` : ""}</p>
    <div class="row"><button class="btn" type="button" id="copy">Copy report</button></div>
    <p class="small muted">Paste the report into the chat with Claude.</p>
    <h2 style="font-size:24px;margin-top:8px;">Check the photos by eye</h2>
    <p class="small">Tap any photo that isn't a specimen (paperwork, a label, a blank tray). Then copy the list and paste it to Claude, and those photos will be skipped for everyone.</p>
    <div class="gallery">${rows.filter((r) => r.url).map((r) => `<button type="button" class="gitem" data-url="${esc(r.url)}" data-name="${esc(r.name)}" aria-pressed="false">
      <img src="${esc(thumbUrl(r.url, 300))}" data-orig="${esc(r.url.replace(/^http:/, "https:"))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.orig){this.src=this.dataset.orig;this.dataset.orig=''}else{this.replaceWith(Object.assign(document.createElement('span'),{className:'gfail',textContent:'Didn\\'t load'}))}">
      <span>${esc(r.name)}${r.result !== "uk" ? ` · ${esc(r.result)}` : ""}</span></button>`).join("")}</div>
    <div class="row"><button class="btn" type="button" id="copybad">Copy list of bad photos (<span id="nbad">0</span>)</button></div>
    <ol class="bars">${rows.map((r, k) => `<li><span class="rk">${k + 1}</span><span class="nm">${esc(r.name)}<small>${esc(fmtLog(r.log) || r.result)}</small></span><span class="ct">${esc(r.result)}</span></li>`).join("")}</ol>`;
  app.querySelectorAll(".gitem").forEach((b) => (b.onclick = () => {
    b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    $("#nbad").textContent = app.querySelectorAll('.gitem[aria-pressed="true"]').length;
  }));
  $("#copybad").onclick = async () => {
    const bad = [...app.querySelectorAll('.gitem[aria-pressed="true"]')].map((b) => `${b.dataset.name}: ${b.dataset.url}`);
    if (!bad.length) return toast("Tap the bad photos first");
    try { await navigator.clipboard.writeText("Bad photos:\n" + bad.join("\n")); toast("List copied"); } catch { toast("Couldn't copy. Try a screenshot instead."); }
  };
  $("#copy").onclick = async () => { try { await navigator.clipboard.writeText(text); toast("Report copied"); } catch { toast("Couldn't copy. Try a screenshot instead."); } };
  // clear cached photos so the game picks up the new ones
  SPECIES.forEach(([, sci]) => { try { localStorage.removeItem(`uks.sp5.${sci}`); } catch {} });
}

/* ---------- photo picker (for choosing the photo each species uses) ---------- */
const picker = { group: "mammal" };
async function pickView() {
  const picks = local.get("uks.picks") || {};
  const count = () => Object.keys(local.get("uks.picks") || {}).length;
  const list = SPECIES.map((sp, i) => ({ i, name: sp[0], sci: sp[1], group: sp[2], rank: sp[4] })).filter((sp) => sp.group === picker.group);
  app.innerHTML = `<section class="stack"><h1 class="title">Photo picker</h1>
    <p>Choose the photo each species should use. Tap the best one, or "No photo" if none are suitable. Your picks are saved on this phone, so you can do one category at a time.</p>
    <div class="chips" role="group" aria-label="Category">${CHIPS.filter(([k]) => k !== "all").map(([k, l]) =>
      `<button class="chip" type="button" data-pk="${k}" aria-pressed="${picker.group === k}"><i style="background:${GROUPS[k].hex}"></i>${esc(l)}</button>`).join("")}</div>
    <div class="row"><button class="btn" type="button" id="copypicks">Copy all picks (<span id="npicks">${count()}</span>)</button></div>
    <p class="small muted">When you're done, paste the copied list into the chat with Claude.</p>
    <div id="picklist">${list.map((sp) => `<div class="pickrow" id="pr-${sp.i}"><h3>${esc(sp.name)} <small>${esc(sp.sci)}</small>${PICKED[sp.sci] !== undefined ? ' <span class="done">already picked</span>' : ""}</h3><p class="small muted">Loading options…</p></div>`).join("")}</div></section>`;
  app.querySelectorAll("[data-pk]").forEach((b) => (b.onclick = () => { picker.group = b.dataset.pk; pickView(); }));
  $("#copypicks").onclick = async () => {
    const all = local.get("uks.picks") || {};
    if (!Object.keys(all).length) return toast("Pick some photos first");
    const text = "Picked photos:\n" + Object.entries(all).map(([sci, p]) => `${JSON.stringify(sci)}: ${JSON.stringify(p)},`).join("\n");
    try { await navigator.clipboard.writeText(text); toast(`Copied ${Object.keys(all).length} picks`); } catch { toast("Couldn't copy, sorry"); }
  };
  const group = picker.group;
  await pool(list, 2, async (sp) => {
    let opts = [], err = "";
    try {
      const key = await matchName(sp.sci, sp.rank || "species");
      if (key) opts = await photoOptions(getJSON, key, sp.group, sp.sci); else err = "No name match";
    } catch (e) { err = "Couldn't load options"; }
    if (route() !== "pick" || picker.group !== group) return;
    const row = $(`#pr-${sp.i}`); if (!row) return;
    const chosen = (local.get("uks.picks") || {})[sp.sci];
    const isOn = (p) => chosen && chosen.url === p.url;
    const label = { uk: "UK specimen", world: "Specimen elsewhere", living: "Living", wiki: "Wikipedia" };
    row.querySelector("p").outerHTML = `<div class="gallery">${opts.map((p, n) => `<button type="button" class="gitem pick" data-n="${n}" aria-pressed="${isOn(p)}">
        <img src="${esc(thumbUrl(p.url, 300))}" data-orig="${esc(p.url.replace(/^http:/, "https:"))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.orig){this.src=this.dataset.orig;this.dataset.orig=''}else{this.replaceWith(Object.assign(document.createElement('span'),{className:'gfail',textContent:'Didn\\'t load'}))}">
        <span>${label[p.kind]}${p.country && p.kind !== "uk" ? ` · ${esc(p.country)}` : ""}</span></button>`).join("")}
      <button type="button" class="gitem pick nophoto" data-n="none" aria-pressed="${chosen === null}"><span class="gfail">No photo</span><span>Use colour</span></button></div>
      ${err || !opts.length ? `<p class="small muted">${err || "No usable photos found."}</p>` : ""}`;
    row.querySelectorAll(".pick").forEach((b) => (b.onclick = () => {
      const all = local.get("uks.picks") || {};
      all[sp.sci] = b.dataset.n === "none" ? null : opts[Number(b.dataset.n)];
      local.set("uks.picks", all);
      row.querySelectorAll(".pick").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("#npicks").textContent = count();
    }));
  });
}

const TABS = [["play", "Play"], ["practice", "Practice"], ["explore", "Explore"], ["learn", "Learn"]];
const route = () => { const r = location.hash.replace("#", ""); return r === "check" || r === "pick" || TABS.some(([k]) => k === r) ? r : "play"; };
function render() {
  const r = route();
  $("#tabs").innerHTML = TABS.map(([k, l]) => `<a href="#${k}" role="tab" aria-selected="${k === r}">${l}</a>`).join("");
  window.scrollTo(0, 0);
  ({ play, practice: practiceView, explore: exploreView, learn: learnView, check: checkView, pick: pickView })[r]();
}
window.addEventListener("hashchange", render);
render();
