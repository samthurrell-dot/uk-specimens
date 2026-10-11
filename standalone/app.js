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
// The same species in the DiSSCo UK catalogue (its search page takes a GBIF taxon key)
const catLink = (s) => (s && s.key ? `https://dissco-uk.org/specimen/search?taxonKey=${encodeURIComponent(s.key)}` : (s && s.link) || "https://dissco-uk.org/specimen/search");

// One real record from the catalogue for a species: where and when it was collected, and which museum holds it.
const INST_NAMES = { NHMUK: "the Natural History Museum, London", BMNH: "the Natural History Museum, London", K: "the Royal Botanic Gardens, Kew",
  E: "the Royal Botanic Garden Edinburgh", MANCH: "Manchester Museum", NMW: "Amgueddfa Cymru – Museum Wales", OUMNH: "Oxford University Museum of Natural History",
  NMS: "National Museums Scotland", LIV: "World Museum Liverpool", BGS: "the British Geological Survey", CAMZM: "the Museum of Zoology, Cambridge" };
const placeOf = (o) => [o.locality, o.county || o.stateProvince, o.country === "United Kingdom of Great Britain and Northern Ireland" ? "UK" : o.country].filter(Boolean)
  .map((x) => String(x).replace(/\s+/g, " ").trim()).filter((x, k, a) => x && a.indexOf(x) === k).join(", ").slice(0, 90);
const museumCache = {};
async function museumOf(o) {
  let m = INST_NAMES[o.institutionCode] || museumCache[o.institutionKey] || "";
  if (!m && o.institutionKey) { try { m = museumCache[o.institutionKey] = (await getJSON(`${API}/grscicoll/institution/${o.institutionKey}`)).name || ""; } catch {} }
  return m || o.institutionCode || "a UK collection";
}

/* ---------- where am I? (for "nearest specimen") ---------- */
// Rounded to 2 decimal places (about 1 km) before it is used or stored. Only ever sent to GBIF (and postcodes.io for a postcode).
const round2 = (x) => Math.round(x * 100) / 100;
let here = local.get("uks.here");
function haversineKm(a, b) {
  const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const kmText = (k) => (k < 1 ? "less than 1 km" : k < 10 ? `about ${k.toFixed(1)} km` : `about ${fmt(Math.round(k))} km`);
// Shows "use my location / enter a postcode" in el and resolves with {lat, lng, label}
function askWhere(el) {
  if (here) return Promise.resolve(here);
  return new Promise((resolve) => {
    el.innerHTML = `<div class="where">
      <button class="btn" type="button" data-w="gps">Use my location</button>
      <form class="pc" data-w="pc"><input name="pc" placeholder="or a postcode, e.g. SK3 9" autocomplete="postal-code" maxlength="9" aria-label="Postcode"><button class="btn alt" type="submit">Go</button></form>
      <p class="small muted">Rounded to about 1 km and kept on this phone. If the location button does nothing, open this page in Chrome.</p></div>`;
    const done = (lat, lng, label) => { here = { lat: round2(lat), lng: round2(lng), label }; local.set("uks.here", here); resolve(here); };
    el.querySelector('[data-w="gps"]').onclick = () => {
      if (!navigator.geolocation) return toast("Location isn't available here. Try a postcode.");
      toast("Finding you…");
      navigator.geolocation.getCurrentPosition((p) => done(p.coords.latitude, p.coords.longitude, "your location"),
        () => toast("Couldn't get your location. Try a postcode."), { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
    };
    el.querySelector("form").onsubmit = async (e) => {
      e.preventDefault();
      const pc = String(new FormData(e.target).get("pc") || "").trim().replace(/\s+/g, " ").toUpperCase();
      if (pc.length < 2) return toast("Type a postcode");
      for (const url of [`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`, `https://api.postcodes.io/outcodes/${encodeURIComponent(pc.split(" ")[0])}`]) {
        try { const r = await fetchJSON(url, { tries: 1 }); if (r && r.result && r.result.latitude) return done(r.result.latitude, r.result.longitude, pc); } catch {}
      }
      toast("Couldn't find that postcode");
    };
  });
}
function forgetWhere() { here = null; try { localStorage.removeItem("uks.here"); } catch {} }

// The closest collected specimen of a species, searching outwards from the player.
async function nearestOf(sp, at) {
  const ck = `uks.near.${sp.key}.${at.lat},${at.lng}`, cached = local.get(ck);
  if (cached) return cached.none ? null : cached;
  for (const km of [5, 15, 40, 100, 250, 700]) {
    const r = await getJSON(`${API}/occurrence/search?limit=300&taxonKey=${sp.key}&${FILTER}&hasCoordinate=true&hasGeospatialIssue=false&geoDistance=${at.lat},${at.lng},${km}km`);
    const pts = (r.results || []).filter((o) => typeof o.decimalLatitude === "number");
    if (pts.length) {
      pts.forEach((o) => (o.d = haversineKm(at, { lat: o.decimalLatitude, lng: o.decimalLongitude })));
      const o = pts.sort((a, b) => a.d - b.d)[0];
      const rec = { d: o.d, year: o.year || null, place: placeOf(o), museum: await museumOf(o), key: o.key, within: r.count, km };
      local.set(ck, rec); return rec;
    }
  }
  local.set(ck, { none: true }); return null;
}
// UK institutions with collections (GRSciColl), with map locations. Kept on the phone for a week.
async function institutions() {
  const c = local.get("uks.inst");
  if (c && Date.now() - c.t < WEEK) return c.list;
  const list = [];
  for (let offset = 0; offset < 3000; offset += 500) {
    const r = await getJSON(`${API}/grscicoll/institution?country=GB&active=true&limit=500&offset=${offset}`);
    for (const i of r.results || []) {
      const lat = i.latitude ?? (i.address || {}).latitude, lng = i.longitude ?? (i.address || {}).longitude;
      if (typeof lat === "number" && typeof lng === "number")
        list.push({ key: i.key, name: i.name, city: (i.address || {}).city || (i.mailingAddress || {}).city || "", lat, lng });
    }
    if (r.endOfRecords || !(r.results || []).length) break;
  }
  local.set("uks.inst", { t: Date.now(), list });
  return list;
}
const instLink = (key) => `https://www.gbif.org/grscicoll/institution/${encodeURIComponent(key)}`;
// The collections holding a species, nearest first: [{name, city, d, n, key}]
async function holdersOf(sp, at) {
  const r = await getJSON(`${API}/occurrence/search?limit=0&taxonKey=${sp.key}&${FILTER}&facet=institutionKey&facetLimit=200`);
  const counts = new Map((((r.facets || [])[0] || {}).counts || []).map((f) => [f.name, f.count]));
  const all = await institutions();
  return all.filter((i) => counts.has(i.key)).map((i) => ({ ...i, n: counts.get(i.key), d: haversineKm(at, i) })).sort((a, b) => a.d - b.d);
}
async function holderBox(el, sp) {
  el.innerHTML = `<span class="muted small">Checking which collections hold one…</span>`;
  try {
    const h = await holdersOf(sp, here), from = here.label === "your location" ? "you" : esc(here.label);
    el.innerHTML = h.length
      ? `<span>The closest collection holding a ${esc(sp.name.toLowerCase())} specimen is <a href="${instLink(h[0].key)}" target="_blank" rel="noopener">${esc(h[0].name)}</a>${h[0].city ? ` in ${esc(h[0].city)}` : ""}, <b class="dist">${kmText(h[0].d)}</b> from ${from}. It holds ${fmt(h[0].n)} of them.${h[1] ? ` Next nearest: ${esc(h[1].name)} (${kmText(h[1].d)}).` : ""}</span>
         <span class="small muted">Most specimens are kept in stores rather than on show, so check with the museum before you visit.</span>`
      : `<span>None of the collections holding a ${esc(sp.name.toLowerCase())} specimen have a map location listed.</span>`;
  } catch { el.innerHTML = `<span class="muted small">Couldn't check just now. Try again in a moment.</span>`; }
}

async function nearestBox(el, sp) {
  el.innerHTML = `<span class="muted small">Searching outwards from you…</span>`;
  try {
    const n = await nearestOf(sp, here);
    el.innerHTML = n
      ? `<span>The nearest ${esc(sp.name.toLowerCase())} specimen was collected <b class="dist">${kmText(n.d)}</b> from ${here.label === "your location" ? "you" : esc(here.label)}${n.place ? `, in ${esc(n.place)}` : ""}${n.year ? `, in ${esc(n.year)}` : ""}. It's held by ${esc(n.museum)}. <a href="https://www.gbif.org/occurrence/${encodeURIComponent(n.key)}" target="_blank" rel="noopener">See the record</a></span>`
      : `<span>No ${esc(sp.name.toLowerCase())} specimen in UK collections has a map location within 700 km of you.</span>`;
  } catch { el.innerHTML = `<span class="muted small">Couldn't search just now. Try again in a moment.</span>`; }
}

async function exampleRecord(sp) {
  if (!sp || !sp.key) return null;
  const ck = `uks.ex.${puzzle}.${sp.key}`, cached = local.get(ck);
  if (cached !== null && cached !== undefined) return cached || null;
  try {
    const offset = Math.floor(mkRng(puzzle * 31 + sp.key)() * Math.max(0, Math.min(sp.count || 0, 300) - 20));
    const r = await getJSON(`${API}/occurrence/search?limit=20&offset=${offset}&taxonKey=${sp.key}&${FILTER}`);
    const o = (r.results || []).find((x) => x.year && (x.locality || x.county || x.stateProvince || x.country)) || null;
    let rec = null;
    if (o) {
      rec = { year: o.year, place: placeOf(o), museum: await museumOf(o), key: o.key };
    }
    local.set(ck, rec || 0);
    return rec;
  } catch { return null; }
}
async function fillExample(el, sp) {
  const r = await exampleRecord(sp);
  if (!el.isConnected) return;
  el.innerHTML = r
    ? `<b>From the catalogue</b><span>One of the ${fmt(sp.count)} ${esc(sp.name.toLowerCase())} specimens was collected ${r.place ? `in ${esc(r.place)} ` : ""}in ${esc(r.year)}, and is held by ${esc(r.museum)}. <a href="https://www.gbif.org/occurrence/${encodeURIComponent(r.key)}" target="_blank" rel="noopener">See the record</a></span>
       <a href="${esc(catLink(sp))}" target="_blank" rel="noopener">Browse all ${fmt(sp.count)} in the DiSSCo UK catalogue</a>`
    : `<a href="${esc(catLink(sp))}" target="_blank" rel="noopener">Browse all ${fmt(sp.count)} in the DiSSCo UK catalogue</a>`;
  el.insertAdjacentHTML("beforeend", `<div class="near"><div class="row"><button class="btn alt small-btn" type="button" data-n="found">📍 Found nearest to me</button><button class="btn alt small-btn" type="button" data-n="held">🏛 Held nearest to me</button></div><div class="nearout"></div></div>`);
  const box = el.querySelector(".near"), out = box.querySelector(".nearout");
  box.querySelectorAll("[data-n]").forEach((b) => (b.onclick = async () => {
    await askWhere(out);
    const div = document.createElement("div"); div.className = "nearitem"; out.innerHTML = ""; out.append(div);
    (b.dataset.n === "found" ? nearestBox : holderBox)(div, sp);
  }));
}

const recordsLink = (key) => `https://www.gbif.org/occurrence/search?taxon_key=${key}&publishing_country=GB&basis_of_record=PRESERVED_SPECIMEN&basis_of_record=FOSSIL_SPECIMEN&basis_of_record=MATERIAL_SAMPLE`;

// Look up one species. Results are kept on the device for a week.
// Returns the species with its count, null if it has no records, or undefined if GBIF couldn't be reached.
async function lookup(i, withPhoto = true) {
  const [name, sci, group, fact, rank] = SPECIES[i];
  const ck = `uks.sp6.${sci}`, cached = local.get(ck);
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
  const p = s.photo, tag = p && p.kind === "wiki" ? "From Wikipedia" : p && p.kind === "living" ? "Living example" : p && p.kind === "world" ? "Specimen outside the UK" : "";
  const pic = p
    ? `<div class="pic">${tag ? `<span class="tag">${tag}</span>` : ""}<img src="${esc(thumbUrl(p.url))}" data-orig="${esc(p.url.replace(/^http:/, "https:"))}" alt="${p.kind === "living" || p.kind === "wiki" ? "Living" : "Museum specimen of"} ${esc(s.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="photoFailed(this)"></div>`
    : `<div class="pic none" style="background:${g.hex}"></div>`;
  const where = p ? (p.kind === "wiki" ? "Not a UK specimen. Photo: " : p.kind === "living" ? "Not a museum specimen. Photo: " : p.kind === "world" ? `Specimen ${p.country ? `(${esc(p.country)}) ` : ""}from ` : "Photo: ") : "";
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
    const sci = b.dataset.report, bad = local.get("uks.badphotos") || {}, c = local.get(`uks.sp6.${sci}`);
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
       <div class="fromcat" id="fromcat"><span class="muted small">Opening the catalogue…</span></div>
       <button class="btn" type="button" id="next">${nextLabel}</button>`
    : `<div class="guess"><button class="btn" type="button" data-g="more">More</button><button class="btn" type="button" data-g="fewer">Fewer</button></div>`;
  app.innerHTML = `<section class="stack">
    <div class="top"><p class="label">${label}</p>${pips ? `<div class="pips" aria-hidden="true">${pips}</div>` : ""}</div>
    ${card(hideBad(a), { fact: true })}
    <p class="vs">Does this have more or fewer?</p>
    ${card(hideBad(b), { fact: !!pending, hide: !pending })}
    ${bottom}</section>`;
  wireReports(app);
  const fc = $("#fromcat"); if (fc) fillExample(fc, b);
  if (pending && !pending.partied) { pending.partied = true; if (pending.right) discoBurst(); else if (discoOn()) music.sting(false); }
}

/* ---------- daily game ---------- */
let day = null, prog = null, step = 0, pending = null, started = false;

async function buildDay(onProgress) {
  const cached = local.get(`uks.day7.${puzzle}`);
  if (cached && cached.chain && cached.chain.length === ROUNDS + 1) return cached;
  const order = candidateOrder(puzzle), found = new Map();
  let failed = 0, tried = 0;
  // a few at a time, so GBIF doesn't refuse the requests
  for (let start = 0; start < order.length; start += 12) {
    const got = await pool(order.slice(start, start + 12), 4, (i) => lookup(i));
    got.forEach((g) => { tried++; if (g === undefined) failed++; else if (g) found.set(g.i, g); });
    onProgress(found.size);
    if (found.size >= POOL || !found.size) break;
  }
  const chain = buildChain(order, (i) => (found.get(i) || {}).count);
  if (chain.length < ROUNDS + 1) throw new Error(failed === tried ? "unreachable" : "short");
  const d = { puzzle, at: new Date().toISOString(), chain: chain.map((i) => found.get(i)) };
  local.set(`uks.day7.${puzzle}`, d);
  return d;
}
async function play() {
  if (!day) {
    app.innerHTML = `<p class="muted" id="loading">Asking the museums for today's numbers…</p>`;
    try { day = await buildDay((n) => { const l = $("#loading"); if (l) l.textContent = `Asking the museums for today's numbers… (${Math.min(n, ROUNDS + 1)} of ${ROUNDS + 1})`; }); }
    catch (e) { return errorBox(e.message, play); }
    prog = local.get(`uks.prog2.${puzzle}`) || { marks: [], guesses: [] };
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
    <p class="small">Every number is a real count from the <a href="https://dissco-uk.org/specimen/search" target="_blank" rel="noopener">DiSSCo UK catalogue</a>, the national list of specimens held in UK museums, universities and herbaria. After each guess you'll see one real record from it.</p>
    <ul class="rules">
      <li>You see a species and how many UK specimens there are.</li>
      <li>Guess if the next one has <b>more</b> or <b>fewer</b>.</li>
      <li>The pairs get closer as you go, so it gets harder.</li>
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
  local.set(`uks.prog2.${puzzle}`, prog);
  if (prog.marks.length === ROUNDS) {
    const h = local.get("uks.history") || {};
    h[puzzle] = prog.marks.reduce((x, y) => x + y, 0); local.set("uks.history", h);
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
  const msg = discoOn()
    ? (score >= 9 ? "King of the museum dance floor." : score >= 7 ? "Strutting through the stores." : score >= 5 ? "A steady shuffle." : "Back to the cloakroom, but the night is young.")
    : score >= 9 ? "Curator material." : score >= 7 ? "A sharp eye for the stores." : score >= 5 ? "Not bad at all." : "The drawers are full of surprises.";
  app.innerHTML = `<section class="stack" style="gap:16px;">
    <p class="label">No. ${puzzle} · ${esc(puzzleDate(puzzle))}</p>
    <p class="big">${score}<small> / ${ROUNDS}</small></p>
    <p style="font-family:var(--serif);font-size:22px;">${msg}</p>
    <p class="grid" aria-label="${score} right out of ${ROUNDS}">${gridText(marks)}</p>
    <p class="rank">Played ${h.played} · Average ${h.average} · Best ${h.best}/10 · Streak ${h.streak}</p>
    <div class="row"><button class="btn" type="button" id="share">Share result</button><a class="btn alt" href="#practice">Keep practising</a></div>
    <div class="chain"><h3 style="font-size:20px;margin-bottom:6px;">Today's specimens</h3><ol>
      ${day.chain.map((s, k) => `<li><i style="background:${groupOf(s).hex}"></i>
        <span><a href="${esc(catLink(s))}" target="_blank" rel="noopener">${esc(s.name)}</a><small>${esc(s.sci)}</small></span>
        <span><span class="n">${fmt(s.count)}</span>${k > 0 ? `<span class="m" style="color:var(${marks[k - 1] ? "--good" : "--bad"})">${marks[k - 1] ? "Right" : "Wrong"}</span>` : ""}</span></li>`).join("")}
    </ol></div>
    <p class="small muted">Names link to the DiSSCo UK catalogue, where you can see where and when each specimen was collected.</p>
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
    <div class="nearme" id="nearme"></div>
    <h2 style="font-size:24px;">Commonest to rarest</h2>
    <p>Every species in the game, from the most collected to the least, in UK collections.</p>
    <div class="chips" role="group" aria-label="Category">${CHIPS.map(([k, l]) =>
      `<button class="chip" type="button" data-ex="${k}" aria-pressed="${explore.group === k}">${k !== "all" ? `<i style="background:${GROUPS[k].hex}"></i>` : ""}${esc(l)}</button>`).join("")}</div>
    <p class="small muted">${rows.length} species · ${fmt(total)} specimens in total. The bars use a stretched scale so small numbers still show: each step of the same length means about ten times as many.</p>
    <ol class="bars">${rows.map((s, k) => `<li>
      <span class="rk">${k + 1}</span>
      <span class="nm">${s.key ? `<a href="${esc(catLink(s))}" target="_blank" rel="noopener">${esc(s.name)}</a>` : esc(s.name)}<small>${esc(s.sci)}</small>
        <span class="bar" aria-hidden="true"><i style="width:${bar(s.count).toFixed(1)}%;background:${groupOf(s).hex}"></i></span></span>
      <span class="ct">${s.count ? fmt(s.count) : "none"}</span></li>`).join("")}</ol>
    <p class="small muted">"None" means no UK specimen records were found online for that name. The specimens may exist but not be online yet.</p>
  </section>`;
  app.querySelectorAll("[data-ex]").forEach((b) => (b.onclick = () => { explore.group = b.dataset.ex; exploreView(); }));
  nearPanel($("#nearme"));
}

/* ---------- near you (in Explore) ---------- */
// Category filters for "Found near you": each maps to GBIF groups, looked up by name once and cached.
const NEAR_GROUPS = {
  bird: ["Aves"], mammal: ["Mammalia"], insect: ["Insecta"], plant: ["Plantae"], fungus: ["Fungi"],
  sea: ["Actinopterygii", "Elasmobranchii", "Mollusca", "Echinodermata", "Cnidaria", "Malacostraca"], herp: ["Reptilia", "Amphibia"],
};
async function groupKeys(g) {
  const ck = `uks.gk.${g}`, c = local.get(ck); if (c) return c;
  const keys = [];
  for (const name of NEAR_GROUPS[g] || []) {
    try { const m = await getJSON(`${API}/species/match?name=${encodeURIComponent(name)}&strict=true`); if (m.usageKey && String(m.canonicalName).toLowerCase() === name.toLowerCase()) keys.push(m.usageKey); } catch {}
  }
  if (keys.length) local.set(ck, keys);
  return keys;
}
// English common name for a GBIF taxon (from the game's own list first), cached on the phone
const gameNames = Object.fromEntries(SPECIES.map(([name, sci]) => [sci.toLowerCase(), name]));
async function commonName(key, sci) {
  if (sci && gameNames[sci.toLowerCase()]) return gameNames[sci.toLowerCase()];
  if (!key) return "";
  const ck = `uks.vn.${key}`, c = local.get(ck); if (c !== null && c !== undefined) return c;
  let name = "";
  try {
    const r = await getJSON(`${API}/species/${key}/vernacularNames?limit=100`);
    const eng = (r.results || []).filter((v) => v.language === "eng" && v.vernacularName);
    const pick = eng.find((v) => /united kingdom|britain|england|uk/i.test(v.country || v.area || v.source || "")) || eng[0];
    name = pick ? pick.vernacularName.replace(/^\w/, (c) => c.toUpperCase()) : "";
  } catch {}
  local.set(ck, name);
  return name;
}
const photoOf = (o) => { const m = (o.media || []).find((x) => x.type === "StillImage" && x.identifier); return m ? m.identifier : null; };

const found = { group: "all", taxon: null, radius: 10, photos: false, show: 20 };
const nearCache = {};
async function nearPanel(el) {
  if (!el) return;
  const head = `<h2 style="font-size:24px;">Near you</h2>`;
  if (!here) {
    el.innerHTML = `${head}<p>What has been found near you, and where can you see specimens close to home?</p><div id="nearask"></div>`;
    await askWhere($("#nearask"));
    return nearPanel(el);
  }
  const where = here.label === "your location" ? "you" : esc(here.label);
  el.innerHTML = `${head}
    <h3 style="font-size:20px;">Found near ${where}</h3>
    <div class="chips" role="group" aria-label="Category">${CHIPS.map(([k, l]) =>
      `<button class="chip" type="button" data-fg="${k}" aria-pressed="${!found.taxon && found.group === k}">${k !== "all" ? `<i style="background:${GROUPS[k].hex}"></i>` : ""}${esc(l)}</button>`).join("")}</div>
    <form class="pc" id="fsearch" role="search"><input name="q" placeholder="Search a species, e.g. robin" autocomplete="off" aria-label="Search a species" value="${found.taxon ? esc(found.taxon.label) : ""}"><button class="btn alt" type="submit">Search</button></form>
    <div id="fsugg" class="sugg"></div>
    <div class="frow">
      <label class="small">Within <select id="frad">${[5, 10, 25, 50].map((k) => `<option value="${k}"${found.radius === k ? " selected" : ""}>${k} km</option>`).join("")}</select></label>
      <label class="small"><input type="checkbox" id="fphotos"${found.photos ? " checked" : ""}> Only with photos</label>
      ${found.taxon ? `<button class="tiny" type="button" id="fclear">Clear species</button>` : ""}
    </div>
    <div id="fresults"><p class="muted">Looking around ${where}…</p></div>
    <div id="fcolls"></div>
    <p class="small muted">Map locations on old specimens are often approximate, sometimes just the middle of a town or county. <button class="tiny" type="button" id="forget">Change or forget my location</button></p>`;
  el.querySelectorAll("[data-fg]").forEach((b) => (b.onclick = () => { found.group = b.dataset.fg; found.taxon = null; found.show = 20; nearPanel(el); }));
  $("#frad").onchange = (e) => { found.radius = Number(e.target.value); found.show = 20; nearPanel(el); };
  $("#fphotos").onchange = (e) => { found.photos = e.target.checked; found.show = 20; nearPanel(el); };
  if ($("#fclear")) $("#fclear").onclick = () => { found.taxon = null; found.show = 20; nearPanel(el); };
  $("#forget").onclick = () => { forgetWhere(); nearPanel(el); };
  $("#fsearch").onsubmit = async (e) => {
    e.preventDefault();
    const q = String(new FormData(e.target).get("q") || "").trim(); const box = $("#fsugg");
    if (q.length < 2) return toast("Type at least 2 letters");
    box.innerHTML = `<p class="small muted">Searching names…</p>`;
    try {
      const mine = SPECIES.filter(([n, sci]) => (n + " " + sci).toLowerCase().includes(q.toLowerCase())).slice(0, 4).map(([n, sci]) => ({ sci, label: n }));
      const r = await getJSON(`${API}/species/search?q=${encodeURIComponent(q)}&datasetKey=${BACKBONE}&status=ACCEPTED&limit=8`);
      const hits = (r.results || []).filter((t) => t.key && t.canonicalName).map((t) => ({
        key: t.nubKey || t.key, sci: t.canonicalName, rank: (t.rank || "").toLowerCase(),
        label: ((t.vernacularNames || []).find((v) => v.language === "eng") || {}).vernacularName || "" }));
      for (const l of mine) { const m = hits.find((h) => h.sci.toLowerCase() === l.sci.toLowerCase()); if (m) m.label = l.label; }
      const opts = hits.slice(0, 8);
      box.innerHTML = opts.length ? opts.map((o, n) => `<button class="chip" type="button" data-s="${n}">${esc(o.label ? `${o.label} · ` : "")}<i class="sci">${esc(o.sci)}</i>${o.rank && o.rank !== "species" ? ` <small>(${esc(o.rank)})</small>` : ""}</button>`).join("") : `<p class="small muted">No names found for "${esc(q)}".</p>`;
      box.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => { const o = opts[Number(b.dataset.s)]; found.taxon = { key: o.key, label: o.label || o.sci }; found.show = 20; nearPanel(el); }));
    } catch { box.innerHTML = `<p class="small muted">Couldn't search names just now.</p>`; }
  };
  foundResults(where);
}

async function foundResults(where) {
  const out = $("#fresults"); if (!out) return;
  const f = { ...found };
  let filter = FILTER, taxa = [];
  if (f.taxon) taxa = [f.taxon.key];
  else if (f.group === "fossil") filter = "publishingCountry=GB&basisOfRecord=FOSSIL_SPECIMEN";
  else if (f.group !== "all") { taxa = await groupKeys(f.group); if (!taxa.length) { out.innerHTML = `<p class="err">Couldn't set up that category just now.</p>`; return; } }
  const k = JSON.stringify([here.lat, here.lng, f.group, f.taxon && f.taxon.key, f.radius, f.photos]);
  if (!nearCache[k]) {
    try {
      const q = `${filter}${taxa.map((t) => `&taxonKey=${t}`).join("")}${f.photos ? "&mediaType=StillImage" : ""}&hasCoordinate=true&hasGeospatialIssue=false&geoDistance=${here.lat},${here.lng},${f.radius}km`;
      const r = await getJSON(`${API}/occurrence/search?limit=300&${q}&facet=speciesKey&facetLimit=8`);
      const pts = (r.results || []).filter((o) => typeof o.decimalLatitude === "number");
      pts.forEach((o) => (o.d = haversineKm(here, { lat: o.decimalLatitude, lng: o.decimalLongitude })));
      pts.sort((a, b) => a.d - b.d);
      const top = ((((r.facets || [])[0]) || {}).counts || []).map((c) => ({ key: c.name, n: c.count }));
      nearCache[k] = { total: r.count || 0, pts, top };
    } catch { out.innerHTML = `<p class="err">Couldn't search near ${where} just now.</p>`; return; }
  }
  const d = nearCache[k], shown = d.pts.slice(0, f.show);
  // names and museums for what's on screen
  await pool([...shown, ...d.top.map((t) => ({ speciesKey: t.key, _top: t }))], 3, async (o) => {
    if (o._top) {
      if (!o._top.sci) { const p = d.pts.find((x) => String(x.speciesKey) === String(o.speciesKey)); o._top.sci = p ? p.species : ""; if (!o._top.sci) { try { o._top.sci = (await getJSON(`${API}/species/${o.speciesKey}`)).canonicalName || ""; } catch {} } }
      o._top.name = o._top.name || (await commonName(o.speciesKey, o._top.sci)); return;
    }
    if (o._name === undefined) o._name = await commonName(o.speciesKey || o.taxonKey, o.species || o.scientificName);
    if (!o._museum) o._museum = await museumOf(o);
  });
  if (!$("#fresults") || JSON.stringify([here.lat, here.lng, found.group, found.taxon && found.taxon.key, found.radius, found.photos]) !== k) return;
  const what = f.taxon ? esc(f.taxon.label) : f.group === "all" ? "" : esc(CHIPS.find(([g]) => g === f.group)[1].toLowerCase()) + " ";
  out.innerHTML = `<p class="rank"><b>${fmt(d.total)}</b> ${f.taxon ? `${what} specimens` : `${what}specimens`} in UK collections were found within ${f.radius} km of ${where}${f.photos ? " (with photos)" : ""}.</p>
    ${!f.taxon && d.top.length ? `<h4>Most found nearby</h4><ol class="bars">${d.top.map((t, n) => `<li><span class="rk">${n + 1}</span><span class="nm"><a href="https://dissco-uk.org/specimen/search?taxonKey=${encodeURIComponent(t.key)}" target="_blank" rel="noopener">${esc(t.name || t.sci || "Unnamed")}</a>${t.name && t.sci ? `<small>${esc(t.sci)}</small>` : ""}</span><span class="ct">${fmt(t.n)}</span></li>`).join("")}</ol>` : ""}
    ${shown.length ? `<h4>Found closest to ${where}</h4><ul class="flist">${shown.map((o) => {
      const sci = o.species || o.scientificName || "", ph = photoOf(o);
      return `<li><a class="fitem" href="https://www.gbif.org/occurrence/${encodeURIComponent(o.key)}" target="_blank" rel="noopener">
        <span class="fthumb">${ph ? `<img src="${esc(thumbUrl(ph, 200))}" data-orig="${esc(ph.replace(/^http:/, "https:"))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.orig){this.src=this.dataset.orig;this.dataset.orig=''}else{this.remove()}">` : ""}</span>
        <span class="fbody"><b>${esc(o._name || sci || "Unnamed specimen")}</b>${o._name && sci ? `<i class="sci">${esc(sci)}</i>` : ""}<small>${esc([placeOf(o), o.year, o._museum].filter(Boolean).join(" · "))}</small></span>
        <span class="ct">${o.d < 1 ? "<1" : o.d.toFixed(1)} km</span></a></li>`; }).join("")}</ul>
      ${d.pts.length > f.show ? `<button class="btn alt" type="button" id="fmore">Show more</button>` : ""}`
    : `<p class="muted">Nothing with a map location was found. Try a wider distance${f.photos ? " or turn off 'only with photos'" : ""}.</p>`}`;
  if ($("#fmore")) $("#fmore").onclick = () => { found.show += 20; foundResults(where); };
  collectionsNear(where);
}

async function collectionsNear(where) {
  const box = $("#fcolls"); if (!box || box.dataset.done) return;
  box.dataset.done = "1";
  const ck = `${here.lat},${here.lng}`;
  if (!nearCache["colls" + ck]) {
    try {
      let colls = (await institutions()).map((i) => ({ ...i, d: haversineKm(here, i) })).sort((a, b) => a.d - b.d).slice(0, 12);
      await pool(colls, 3, async (c) => { try { c.n = (await getJSON(`${API}/occurrence/search?limit=0&institutionKey=${c.key}&${FILTER}`)).count; } catch { c.n = 0; } });
      nearCache["colls" + ck] = colls.filter((c) => c.n > 0).slice(0, 6);
    } catch { nearCache["colls" + ck] = []; }
  }
  const colls = nearCache["colls" + ck];
  if (!colls.length || !$("#fcolls")) return;
  $("#fcolls").innerHTML = `<h3 style="font-size:20px;">Where to see specimens near ${where}</h3><p class="small muted">Collections holding UK specimens. Most are kept in stores, so check before visiting.</p>
    <ol class="bars">${colls.map((c, n) => `<li><span class="rk">${n + 1}</span><span class="nm"><a href="${instLink(c.key)}" target="_blank" rel="noopener">${esc(c.name)}</a><small>${esc(c.city)}${c.city ? " · " : ""}${fmt(c.n)} specimens online</small></span><span class="ct">${c.d < 1 ? "<1" : c.d < 10 ? c.d.toFixed(1) : fmt(Math.round(c.d))} km</span></li>`).join("")}</ol>`;
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
    <p>Where no UK museum has an open photo, the game uses a specimen from a museum elsewhere, labelled "Specimen outside the UK". For mammals, birds, reptiles, amphibians, plants and fungi it shows a living example first, as preserved ones, eggs and pressed or dried specimens can be upsetting or hard to make out. Where it can, it uses the species' main picture from Wikipedia, labelled "From Wikipedia" (usually a photo of a living example, sometimes a painting or a museum display). Counts are always UK specimens only.</p>
    <p class="small"><a href="#check">Run a photo check</a> (for testing: lists what was found for every species) · <a href="#pick">Photo picker</a> (choose the photo each species uses) · <a href="#sim">Simulation</a> (check how hard the next 30 puzzles are).</p>
    <p class="small muted">Counts are approximate and change as museums add records. Group colours are from Sanzo Wada's <i>A Dictionary of Color Combinations</i>; screen colours are approximate.</p>
    <div class="row"><a class="btn" href="#play">Play today's puzzle</a></div>
  </section>`;
}

/* ---------- DiSSCo mode ---------- */
const discoOn = () => document.documentElement.classList.contains("disco");
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function setDisco(on, quiet) {
  const root = document.documentElement;
  if (on && !quiet && !calm()) { root.classList.add("disco-fading"); setTimeout(() => root.classList.remove("disco-fading"), 750); }
  root.classList.toggle("disco", on);
  local.set("uks.disco", on);
  const b = $("#discoBtn"); b.setAttribute("aria-pressed", String(on)); b.querySelector("span").textContent = on ? "Lights up" : "DiSSCo mode";
  if (on && !$("#discofx")) {
    const fx = document.createElement("div"); fx.id = "discofx"; fx.setAttribute("aria-hidden", "true");
    const cols = ["#f37f94", "#00b49b", "#fff200", "#6450a1", "#f99d1b", "#87c540"];
    fx.innerHTML = `<i class="wash w1"></i><i class="wash w2"></i><i class="wash w3"></i>
      <i class="beam bm1"></i><i class="beam bm2"></i><i class="beam bm3"></i>
      <div class="specks">${Array.from({ length: 70 }, (_, k) => `<i style="left:${(k * 37) % 100}%;top:${(k * 53) % 100}%;animation-delay:${((k * 7) % 8) * -0.25}s"></i>`).join("")}</div>
      <div class="floor">${Array.from({ length: 48 }, (_, k) => `<i style="--c:${cols[(k * 5 + Math.floor(k / 12)) % cols.length]};--d:calc(var(--beat) * ${-((k * 7) % 16) / 4})"></i>`).join("")}</div>`;
    document.body.prepend(fx);
    const ball = document.createElement("div"); ball.id = "mirrorball"; ball.setAttribute("aria-hidden", "true");
    ball.innerHTML = `<i class="string"></i><i class="ball"></i>`; document.body.prepend(ball);
    if (!quiet) toast("Lights down. Tap ♪ for music.");
  }
  if (!on) { $("#discofx")?.remove(); $("#mirrorball")?.remove(); music.stop(); }
}
function discoBurst() {
  if (!discoOn() || calm()) return;
  const cols = ["#f37f94", "#fff200", "#00b49b", "#b984af", "#f99d1b", "#87c540", "#ffffff"];
  for (let k = 0; k < 60; k++) {
    const c = document.createElement("i"); c.className = "confetti" + (k % 4 === 0 ? " star" : "");
    c.style.cssText = `left:${50 + (Math.random() - 0.5) * 20}vw;background:${cols[k % cols.length]};--dx:${(Math.random() - 0.5) * 110}vw;--dy:${-25 - Math.random() * 65}vh;--r:${(Math.random() - 0.5) * 900}deg;animation-delay:${Math.random() * 0.12}s`;
    document.body.append(c); setTimeout(() => c.remove(), 1900);
  }
  music.sting(true);
}

// A small disco loop made on the phone with the Web Audio API: kick on every beat, open hi-hat on the off-beat,
// clap on 2 and 4, and an octave-bouncing bass line. Nothing is downloaded. Off until the player taps Music.
const music = (() => {
  let ctx = null, timer = null, next = 0, step = 0, master = null;
  const BPM = 118, SIX = 60 / BPM / 4, ROOTS = [45, 50, 43, 48]; // A, D, G, C (MIDI)
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  let noiseBuf = null;
  const noise = () => { if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const s = ctx.createBufferSource(); s.buffer = noiseBuf; return s; };
  function env(node, t, peak, len) { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + len); node.connect(g); g.connect(master); return g; }
  function kick(t) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); env(o, t, 0.9, 0.22); o.start(t); o.stop(t + 0.25); }
  function hat(t, open) { const n = noise(), f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; n.connect(f); env(f, t, open ? 0.18 : 0.08, open ? 0.12 : 0.04); n.start(t); n.stop(t + 0.15); }
  function clap(t) { const n = noise(), f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1500; n.connect(f); env(f, t, 0.35, 0.16); n.start(t); n.stop(t + 0.2); }
  function bass(t, m) { const o = ctx.createOscillator(), f = ctx.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = hz(m); f.type = "lowpass"; f.frequency.value = 700; o.connect(f); env(f, t, 0.28, SIX * 1.7); o.start(t); o.stop(t + SIX * 2); }
  function tick() {
    while (next < ctx.currentTime + 0.12) {
      const s16 = step % 16, root = ROOTS[Math.floor(step / 16) % 4];
      if (s16 % 4 === 0) kick(next);
      if (s16 % 4 === 2) hat(next, true); else if (s16 % 2 === 1) hat(next, false);
      if (s16 === 4 || s16 === 12) clap(next);
      if (s16 % 2 === 0) bass(next, root + (s16 % 4 === 2 ? 12 : 0));
      next += SIX; step++;
    }
  }
  return {
    get on() { return !!timer; },
    start() {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume(); master = master || ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
      next = ctx.currentTime + 0.05; step = 0; timer = setInterval(tick, 25);
    },
    stop() { clearInterval(timer); timer = null; const m = $("#musicBtn"); if (m) m.setAttribute("aria-pressed", "false"); },
    sting(good) { // a little rising (or falling) flourish over the beat
      if (!timer) return; const t = ctx.currentTime + 0.02;
      (good ? [69, 73, 76, 81] : [64, 63, 62]).forEach((m, k) => { const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = hz(m); env(o, t + k * 0.07, 0.2, 0.18); o.start(t + k * 0.07); o.stop(t + k * 0.07 + 0.2); });
    },
  };
})();
$("#musicBtn").onclick = () => {
  if (music.on) music.stop(); else { try { music.start(); $("#musicBtn").setAttribute("aria-pressed", "true"); } catch { toast("Music isn't available on this browser"); } }
};
$("#discoBtn").onclick = () => setDisco(!discoOn());
if (local.get("uks.disco")) setDisco(true, true);

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
      else { const r = await findPhoto(getJSON, key, group, sci); line = { name, sci, result: r.photo ? r.photo.kind : "none", log: r.log, url: r.photo && r.photo.url, photo: r.photo }; }
    } catch (e) { line = { name, sci, result: "error", detail: String(e && e.message || e) }; }
    done++; const l = $("#loading"); if (l) l.textContent = `Checked ${done} of ${SPECIES.length}…`;
    return line;
  });
  if (route() !== "check") return;
  const n = (k) => rows.filter((r) => r.result === k).length;
  const fmtLog = (log = []) => log.map((t) => t.error ? `${t.kind}: error (${t.error})` : t.kind === "wiki" || t.kind === "picked" ? `${t.kind}: ${t.found ? "used" : "none"}` : `${t.kind}: ${t.seen} seen, ${t.paperwork} paperwork, ${t.licence} licence, ${t.other} other${t.found ? " → used" : ""}`).join(" | ");
  const text = [`Photo check ${new Date().toLocaleString("en-GB")}`,
    `Wikipedia ${n("wiki")} · UK specimen ${n("uk")} · elsewhere ${n("world")} · living ${n("living")} · none ${n("none")} · no match ${n("no name match")} · errors ${n("error")}`, "",
    ...rows.map((r) => `${r.name} (${r.sci}): ${r.result}${r.detail ? " (" + r.detail + ")" : ""}${r.log ? " — " + fmtLog(r.log) : ""}${r.url ? " — " + r.url : ""}`)].join("\n");
  $("#loading").textContent = "Done.";
  $("#out").innerHTML = `<p class="rank">Wikipedia ${n("wiki")} · UK specimen ${n("uk")} · Elsewhere ${n("world")} · Living ${n("living")} · None ${n("none")}${n("no name match") ? ` · No match ${n("no name match")}` : ""}${n("error") ? ` · Errors ${n("error")}` : ""}</p>
    <div class="row"><button class="btn" type="button" id="copy">Copy report</button></div>
    <p class="small muted">Paste the report into the chat with Claude.</p>
    <div class="row"><button class="btn alt" type="button" id="lockin">Copy photos to lock in</button></div>
    <p class="small muted">Copies every chosen photo with its credit and licence, so Claude can fix them in the game for everyone.</p>
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
  $("#lockin").onclick = async () => {
    const keep = Object.fromEntries(rows.filter((r) => r.photo).map((r) => [r.sci, r.photo]));
    try { await navigator.clipboard.writeText("Lock in photos:\n" + JSON.stringify(keep)); toast(`Copied ${Object.keys(keep).length} photos`); } catch { toast("Couldn't copy, sorry"); }
  };
  $("#copy").onclick = async () => { try { await navigator.clipboard.writeText(text); toast("Report copied"); } catch { toast("Couldn't copy. Try a screenshot instead."); } };
  // clear cached photos so the game picks up the new ones
  SPECIES.forEach(([, sci]) => { try { localStorage.removeItem(`uks.sp6.${sci}`); } catch {} });
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

/* ---------- simulation (for testing difficulty with the real counts) ---------- */
async function simView() {
  app.innerHTML = `<section class="stack"><h1 class="title">Simulation</h1>
    <p>This builds the next 30 daily puzzles from today's real counts, and estimates how two kinds of player would score. It's for checking the game stays fun.</p>
    <p class="muted" id="loading">Looking up every species…</p><div id="out"></div></section>`;
  let done = 0;
  const got = await pool(SPECIES.map((_, i) => i), 3, async (i) => {
    const r = await lookup(i, false); done++; const l = $("#loading"); if (l) l.textContent = `Looking up every species… ${done} of ${SPECIES.length}`; return r;
  });
  if (got.every((g) => g === undefined)) return errorBox("unreachable", simView);
  const counts = {}; got.forEach((g, i) => { if (g) counts[SPECIES[i][1]] = g.count; });
  const days = simulate(counts, puzzle, 30), sum = simSummary(days), x = (r) => (r >= 10 ? Math.round(r) : r.toFixed(r < 2 ? 2 : 1)) + "x";
  const lines = [`Simulation ${new Date().toLocaleString("en-GB")} · puzzles ${puzzle} to ${puzzle + 29} · ${Object.keys(counts).length} species with counts`,
    `Average gap by guess: ${sum.byStep.map(x).join(", ")}`,
    `Expected score: keen ${sum.keen.toFixed(1)}/10, casual ${sum.casual.toFixed(1)}/10`,
    `Days ending on an easy pair (>1.6x): ${sum.easyEnd}/${sum.days} · failed days: ${sum.failed}`,
    `"More" answers per day: ${sum.ups.toFixed(1)} · same-group pairs per day: ${sum.sameGroup.toFixed(1)}`,
    `Different species used: ${sum.species}/${SPECIES.length} · most used: ${sum.most.join(", ")}`, "",
    ...days.map((d) => d.failed ? `No. ${d.puzzle}: couldn't build` : `No. ${d.puzzle} (keen ${d.keen.toFixed(1)}, casual ${d.casual.toFixed(1)}): ${d.names.map((n, k) => `${n} ${d.counts[k]}`).join(" > ")}`),
    "", "Counts: " + JSON.stringify(counts)];
  $("#loading").textContent = "Done.";
  $("#out").innerHTML = `<p class="rank">Keen player ~${sum.keen.toFixed(1)}/10 · Casual player ~${sum.casual.toFixed(1)}/10</p>
    <div class="row"><button class="btn" type="button" id="copysim">Copy report</button></div>
    <p class="small muted">Paste the report into the chat with Claude.</p>
    <ol class="bars">${sum.byStep.map((g, k) => `<li><span class="rk">${k + 1}</span><span class="nm">Guess ${k + 1}<span class="bar" aria-hidden="true"><i style="width:${Math.min(100, Math.log(g) / Math.log(6) * 100).toFixed(0)}%;background:var(--accent)"></i></span></span><span class="ct">${x(g)} apart</span></li>`).join("")}</ol>`;
  $("#copysim").onclick = async () => { try { await navigator.clipboard.writeText(lines.join("\n")); toast("Report copied"); } catch { toast("Couldn't copy, sorry"); } };
}

const TABS = [["play", "Play"], ["practice", "Practice"], ["explore", "Explore"], ["learn", "Learn"]];
const route = () => { const r = location.hash.replace("#", ""); return r === "check" || r === "pick" || r === "sim" || TABS.some(([k]) => k === r) ? r : "play"; };
function render() {
  const r = route();
  $("#tabs").innerHTML = TABS.map(([k, l]) => `<a href="#${k}" role="tab" aria-selected="${k === r}">${l}</a>`).join("");
  window.scrollTo(0, 0);
  ({ play, practice: practiceView, explore: exploreView, learn: learnView, check: checkView, pick: pickView, sim: simView })[r]();
}
window.addEventListener("hashchange", render);
render();
