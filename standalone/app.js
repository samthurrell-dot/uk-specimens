// No-server version of More or less?. Runs from a single HTML file or any static host (e.g. GitHub Pages).
// It asks the GBIF API directly from the browser and keeps progress and scores on this device only.
// Built into docs/index.html by: npm run build:static  (the shared species code is pasted in above this script)

const API = "https://api.gbif.org/v1";
const FILTER = "publishingCountry=GB&basisOfRecord=PRESERVED_SPECIMEN&basisOfRecord=FOSSIL_SPECIMEN&basisOfRecord=MATERIAL_SAMPLE";
const $ = (s) => document.querySelector(s);
const app = $("#app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const local = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

async function getJSON(url) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 9000);
  try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error("GBIF " + r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
async function matchName(name, rank = "species") {
  const m = await getJSON(`${API}/species/match?name=${encodeURIComponent(name)}&rank=${rank.toUpperCase()}&strict=true`);
  if (!m || !m.usageKey || m.matchType === "NONE" || m.matchType === "HIGHERRANK") return null;
  if (m.rank && m.rank !== rank.toUpperCase()) return null;
  return m.acceptedUsageKey || m.usageKey;
}
const okLicence = (l = "") => /publicdomain\/zero|licenses\/by\/|licenses\/by-nc\/|^CC0|^CC_BY(_NC)?(_|$)/i.test(l);
const licenceLabel = (l = "") => /zero|CC0/i.test(l) ? "CC0" : /by-nc|BY_NC/i.test(l) ? "CC BY-NC" : "CC BY";
async function lookup(i) {
  const [name, sci, group, fact, rank] = SPECIES[i];
  try {
    const key = await matchName(sci, rank || "species");
    if (!key) return null;
    const c = await getJSON(`${API}/occurrence/search?limit=0&taxonKey=${key}&${FILTER}`);
    if (!c.count) return null;
    let photo = null;
    try {
      const r = await getJSON(`${API}/occurrence/search?limit=10&mediaType=StillImage&taxonKey=${key}&${FILTER}`);
      outer: for (const o of r.results || []) for (const m of o.media || []) {
        const url = m.identifier || "", lic = m.license || o.license || "";
        if (m.type !== "StillImage" || !/^https:\/\//.test(url) || !okLicence(lic)) continue;
        photo = { url, credit: String(m.rightsHolder || m.creator || o.institutionCode || o.datasetName || "the publishing museum").slice(0, 80), licence: licenceLabel(lic), occurrence: o.key };
        break outer;
      }
    } catch {}
    return { i, name, sci, group, fact, key, count: c.count, photo,
      link: `https://www.gbif.org/occurrence/search?taxon_key=${key}&publishing_country=GB&basis_of_record=PRESERVED_SPECIMEN&basis_of_record=FOSSIL_SPECIMEN&basis_of_record=MATERIAL_SAMPLE` };
  } catch { return undefined; } // undefined = couldn't reach GBIF, null = no records
}

// Today's chain is chosen from the date, so everyone gets the same species. Counts are saved on the device for the day.
async function buildDay(puzzle, onProgress) {
  const cached = local.get(`uks.day.${puzzle}`);
  if (cached && cached.chain && cached.chain.length === ROUNDS + 1) return cached;
  const order = candidateOrder(puzzle), found = new Map();
  let failed = 0, tried = 0;
  for (let start = 0; start < order.length; start += 12) {
    const got = await Promise.all(order.slice(start, start + 12).map(lookup));
    got.forEach((g) => { tried++; if (g === undefined) failed++; else if (g) found.set(g.i, g); });
    onProgress(found.size);
    if (found.size >= ROUNDS + 6) break;
    if (!found.size) break;
  }
  const chain = buildChain(order, (i) => found.has(i));
  if (chain.length < ROUNDS + 1) throw new Error(failed === tried ? "unreachable" : "short");
  const day = { puzzle, at: new Date().toISOString(), chain: chain.map((i) => found.get(i)) };
  local.set(`uks.day.${puzzle}`, day);
  return day;
}

let day = null, prog = null, step = 0, pending = null;
const puzzle = puzzleNumber();
$("#dots").innerHTML = Object.values(GROUPS).slice(0, 4).map((g) => `<i style="background:${g.hex}"></i>`).join("");
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2400); }

async function load() {
  app.innerHTML = `<p class="muted" id="loading">Asking the museums for today's numbers…</p>`;
  try { day = await buildDay(puzzle, (n) => { const l = $("#loading"); if (l) l.textContent = `Asking the museums for today's numbers… (${Math.min(n, ROUNDS + 1)} of ${ROUNDS + 1})`; }); }
  catch (e) {
    app.innerHTML = `<p class="err">${e.message === "unreachable"
      ? "The museum data (GBIF) couldn't be reached. Check your connection. If you opened this inside the Claude app, try opening it in Chrome."
      : "Not enough species could be looked up today. Please try again later."}</p>
      <div class="row"><button class="btn alt" type="button" id="retry">Try again</button></div>`;
    $("#retry").onclick = load; return;
  }
  prog = local.get(`uks.prog.${puzzle}`) || { marks: [], guesses: [] };
  step = prog.marks.length;
  if (step >= ROUNDS) return results();
  if (step > 0) return game();
  start();
}

function start() {
  const hist = myHistory();
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
    <button class="btn" type="button" id="go">Start</button>
    ${hist.played ? `<p class="small muted">Played ${hist.played} · Best ${hist.best}/10 · Streak ${hist.streak}</p>` : ""}
  </section>`;
  $("#go").onclick = game;
}

function card(s, opts = {}) {
  const g = GROUPS[s.group] || GROUPS.plant;
  const pic = s.photo
    ? `<div class="pic"><img src="${esc(s.photo.url)}" alt="Museum specimen of ${esc(s.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="const c=this.closest('.card');c.querySelector('.credit')?.remove();this.parentNode.className='pic none';this.remove();"></div>`
    : `<div class="pic none" style="background:${g.hex}"></div>`;
  const credit = s.photo ? `<p class="credit">Photo: ${esc(s.photo.credit)} · ${esc(s.photo.licence)} · <a href="https://www.gbif.org/occurrence/${encodeURIComponent(s.photo.occurrence)}" target="_blank" rel="noopener">record</a></p>` : "";
  const count = opts.hide
    ? `<p class="count hidden" aria-label="Unknown">?<small>specimens</small></p>`
    : `<p class="count">${fmt(s.count)}<small>specimen${s.count === 1 ? "" : "s"}</small></p>`;
  return `<article class="card" style="border-left-color:${g.hex}">${pic}<div class="body">
      <p class="group"><i style="background:${g.hex}"></i>${esc(g.label)}</p>
      <h2>${esc(s.name)}</h2><p class="sci">${esc(s.sci)}</p>${count}
      ${opts.fact ? `<p class="fact">${esc(s.fact)}</p>` : ""}${credit}</div></article>`;
}
function verdictText(a, b) {
  if (b.count === a.count) return `Exactly the same number as ${a.name}, so either answer counts.`;
  return b.count > a.count ? `More. ${b.name} has ${ratio(a.count, b.count)} ${a.name}.` : `Fewer. ${a.name} has ${ratio(a.count, b.count)} ${b.name}.`;
}
function game() {
  const a = day.chain[step], b = day.chain[step + 1], m = prog.marks;
  const pipsHtml = Array.from({ length: ROUNDS }, (_, k) => `<i class="${k < m.length ? (m[k] ? "y" : "n") : k === step ? "now" : ""}"></i>`).join("");
  const bottom = pending
    ? `<div class="verdict ${pending.right ? "good" : "bad"}"><b>${pending.right ? "Right" : "Not this time"}</b><p>${esc(verdictText(a, b))}</p></div>
       <button class="btn" type="button" id="next">${step + 1 >= ROUNDS ? "See your score" : "Next species"}</button>`
    : `<div class="guess"><button class="btn" type="button" data-g="more">More</button><button class="btn" type="button" data-g="fewer">Fewer</button></div>`;
  app.innerHTML = `<section style="display:flex;flex-direction:column;gap:14px;">
    <div class="top"><p class="label">No. ${puzzle} · Guess ${step + 1} of ${ROUNDS}</p><div class="pips" aria-hidden="true">${pipsHtml}</div></div>
    ${card(a, { fact: true })}
    <p class="vs">Does this have more or fewer?</p>
    ${card(b, { fact: !!pending, hide: !pending })}
    ${bottom}</section>`;
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
  app.innerHTML = `<section style="display:flex;flex-direction:column;gap:16px;">
    <p class="label">No. ${puzzle} · ${esc(puzzleDate(puzzle))}</p>
    <p class="big">${score}<small> / ${ROUNDS}</small></p>
    <p style="font-family:var(--serif);font-size:22px;">${msg}</p>
    <p class="grid" aria-label="${score} right out of ${ROUNDS}">${gridText(marks)}</p>
    <p class="rank">Played ${h.played} · Average ${h.average} · Best ${h.best}/10 · Streak ${h.streak}</p>
    <div class="row"><button class="btn" type="button" id="share">Share result</button></div>
    <div class="chain"><h3 style="font-size:20px;margin-bottom:6px;">Today's specimens</h3><ol>
      ${day.chain.map((s, k) => `<li><i style="background:${(GROUPS[s.group] || GROUPS.plant).hex}"></i>
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
$("#scoresBtn").onclick = () => { const h = myHistory(); toast(h.played ? `Played ${h.played} · Best ${h.best}/10 · Streak ${h.streak}` : "No finished rounds yet"); };
load();
