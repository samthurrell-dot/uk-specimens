// Shared by the page and the server: the species list, daily puzzle selection and marking.
// Counts come live from GBIF (see netlify/lib/gbif.mjs); nothing here is a count.

// Each group gets a colour from Sanzo Wada's dictionary (book spellings; hex values are approximate, converted from print).
export const GROUPS = {
  bird:   { label: "Birds",                 colour: "Antwarp Blue",   hex: "#007190" },
  mammal: { label: "Mammals",               colour: "Burnt Sienna",   hex: "#ae5224" },
  insect: { label: "Insects",               colour: "Olive Ocher",    hex: "#d6b43e" },
  plant:  { label: "Plants",                colour: "Cossack Green",  hex: "#437742" },
  fungus: { label: "Fungi",                 colour: "Sepia",          hex: "#644b1e" },
  sea:    { label: "Fish and sea life",     colour: "Cerulian Blue",  hex: "#0093a5" },
  herp:   { label: "Reptiles and amphibians", colour: "Olive Green",  hex: "#6b7140" },
  fossil: { label: "Fossils",               colour: "Warm Gray",      hex: "#a1a39a" },
};

// [common name, scientific name, group, one-line fact, rank to match at (default species)]
export const SPECIES = [
  // birds
  ["House sparrow", "Passer domesticus", "bird", "Once everywhere in British towns, its numbers fell sharply from the 1970s."],
  ["Robin", "Erithacus rubecula", "bird", "Voted Britain's national bird in a 2015 public poll."],
  ["Blackbird", "Turdus merula", "bird", "Males are black with an orange bill; females are brown."],
  ["Barn owl", "Tyto alba", "bird", "Hunts mostly by sound, flying low over rough grassland."],
  ["Peregrine falcon", "Falco peregrinus", "bird", "Can pass 300 km/h when diving on prey."],
  ["Kingfisher", "Alcedo atthis", "bird", "Its blue comes from the structure of its feathers, not from pigment."],
  ["Mute swan", "Cygnus olor", "bird", "One of the heaviest flying birds in the world."],
  ["Puffin", "Fratercula arctica", "bird", "Its bright bill plates are shed after the breeding season."],
  ["Golden eagle", "Aquila chrysaetos", "bird", "In Britain it now breeds almost only in Scotland."],
  ["Great auk", "Pinguinus impennis", "bird", "A flightless seabird hunted to extinction by the 1840s."],
  ["Dodo", "Raphus cucullatus", "bird", "Extinct by the late 1600s. Very few real specimens survive."],
  ["Passenger pigeon", "Ectopistes migratorius", "bird", "Once numbered in the billions. The last one died in 1914."],
  ["Wren", "Troglodytes troglodytes", "bird", "Tiny, but one of Britain's most common birds."],
  ["Cuckoo", "Cuculus canorus", "bird", "Lays its eggs in other birds' nests."],
  ["Grey heron", "Ardea cinerea", "bird", "Stands still in shallow water for long spells, waiting for fish."],
  ["Raven", "Corvus corax", "bird", "Britain's largest member of the crow family."],
  ["Emperor penguin", "Aptenodytes forsteri", "bird", "Males keep the egg warm on their feet through the Antarctic winter."],
  ["Starling", "Sturnus vulgaris", "bird", "Known for huge swirling winter flocks called murmurations."],
  ["Magpie", "Pica pica", "bird", "One of the few animals shown to recognise itself in a mirror."],
  // mammals
  ["Hedgehog", "Erinaceus europaeus", "mammal", "Has several thousand spines, made of the same stuff as hair."],
  ["Red fox", "Vulpes vulpes", "mammal", "Now common in many British towns and cities."],
  ["Badger", "Meles meles", "mammal", "Lives in family groups in underground setts."],
  ["Otter", "Lutra lutra", "mammal", "Has returned to rivers across England after near-loss in the 1970s."],
  ["Red squirrel", "Sciurus vulgaris", "mammal", "Now mostly found in Scotland, northern England and a few islands."],
  ["Grey squirrel", "Sciurus carolinensis", "mammal", "Brought to Britain from North America in the 1800s."],
  ["Mole", "Talpa europaea", "mammal", "Spends nearly all its life underground."],
  ["House mouse", "Mus musculus", "mammal", "Has lived alongside people for thousands of years."],
  ["Brown rat", "Rattus norvegicus", "mammal", "Despite the Latin name (Norway), it probably came from Asia."],
  ["Common pipistrelle", "Pipistrellus pipistrellus", "mammal", "A bat that weighs about the same as a 20p coin."],
  ["Lion", "Panthera leo", "mammal", "The only big cat that lives in groups."],
  ["Tiger", "Panthera tigris", "mammal", "The largest living cat."],
  ["African bush elephant", "Loxodonta africana", "mammal", "The largest living land animal."],
  ["Woolly mammoth", "Mammuthus primigenius", "mammal", "Roamed Britain during the last Ice Age."],
  ["Giant panda", "Ailuropoda melanoleuca", "mammal", "Eats almost nothing but bamboo."],
  ["Platypus", "Ornithorhynchus anatinus", "mammal", "Some British scientists first thought the specimen was a hoax."],
  ["Thylacine", "Thylacinus cynocephalus", "mammal", "The Tasmanian tiger. The last known one died in 1936."],
  ["Blue whale", "Balaenoptera musculus", "mammal", "The largest animal known to have lived."],
  ["Eurasian beaver", "Castor fiber", "mammal", "Hunted out of Britain centuries ago, now being brought back."],
  ["Red deer", "Cervus elaphus", "mammal", "Britain's largest native land mammal."],
  ["Western gorilla", "Gorilla gorilla", "mammal", "Lives in the forests of central Africa."],
  // insects
  ["Honey bee", "Apis mellifera", "insect", "A single hive can hold tens of thousands of bees."],
  ["Buff-tailed bumblebee", "Bombus terrestris", "insect", "One of Britain's most common bumblebees."],
  ["Red admiral", "Vanessa atalanta", "insect", "Many arrive from mainland Europe each spring."],
  ["Peacock butterfly", "Aglais io", "insect", "The eyespots on its wings help scare off birds."],
  ["Seven-spot ladybird", "Coccinella septempunctata", "insect", "Britain's most familiar ladybird."],
  ["Stag beetle", "Lucanus cervus", "insect", "Its larvae can spend several years feeding on dead wood."],
  ["Housefly", "Musca domestica", "insect", "Lives alongside people almost everywhere in the world."],
  ["Emperor dragonfly", "Anax imperator", "insect", "One of Britain's largest dragonflies."],
  ["Monarch butterfly", "Danaus plexippus", "insect", "Some travel thousands of miles across North America."],
  ["Queen Alexandra's birdwing", "Ornithoptera alexandrae", "insect", "The largest butterfly in the world."],
  ["Death's-head hawkmoth", "Acherontia atropos", "insect", "Has a skull-like mark on its back and can squeak."],
  ["Common earwig", "Forficula auricularia", "insect", "Its name comes from an old myth about crawling into ears."],
  ["Hornet", "Vespa crabro", "insect", "Britain's largest social wasp."],
  ["Malaria mosquito", "Anopheles gambiae", "insect", "One of the main carriers of malaria in Africa."],
  // plants
  ["Daisy", "Bellis perennis", "plant", "The name comes from 'day's eye', as it opens in daylight."],
  ["English oak", "Quercus robur", "plant", "A single tree can support hundreds of other species."],
  ["Ash", "Fraxinus excelsior", "plant", "Badly hit by ash dieback, a fungal disease, since 2012."],
  ["Foxglove", "Digitalis purpurea", "plant", "William Withering studied it as a heart treatment in 1785."],
  ["Common poppy", "Papaver rhoeas", "plant", "A symbol of remembrance since the First World War."],
  ["Opium poppy", "Papaver somniferum", "plant", "The source of morphine, still a major painkiller."],
  ["Ivy", "Hedera helix", "plant", "Flowers in autumn, feeding insects late in the year."],
  ["Stinging nettle", "Urtica dioica", "plant", "Food for the caterpillars of several British butterflies."],
  ["Heather", "Calluna vulgaris", "plant", "Turns moorland purple in late summer."],
  ["Bluebell", "Hyacinthoides non-scripta", "plant", "Britain has around half of the world's bluebells."],
  ["Primrose", "Primula vulgaris", "plant", "One of the first wildflowers to bloom in spring."],
  ["Yew", "Taxus baccata", "plant", "Some churchyard yews are thought to be over 1,000 years old."],
  ["Pacific yew", "Taxus brevifolia", "plant", "Its bark gave the first supplies of the cancer drug paclitaxel."],
  ["Madagascar periwinkle", "Catharanthus roseus", "plant", "The source of the cancer drugs vincristine and vinblastine."],
  ["Quinine bark", "Cinchona officinalis", "plant", "Cinchona bark gave quinine, long used against malaria."],
  ["White willow", "Salix alba", "plant", "Chemicals from willow bark helped lead to aspirin."],
  ["Round-leaved sundew", "Drosera rotundifolia", "plant", "Catches insects on sticky hairs."],
  ["Lady's-slipper orchid", "Cypripedium calceolus", "plant", "Down to a single wild plant in Britain by the 1930s."],
  ["Welwitschia", "Welwitschia mirabilis", "plant", "Grows only two leaves in its whole life, which can last centuries."],
  ["Giant sequoia", "Sequoiadendron giganteum", "plant", "The world's largest tree by volume."],
  ["Juniper", "Juniperus communis", "plant", "Its berry-like cones give gin its flavour."],
  ["Lavender", "Lavandula angustifolia", "plant", "Grown for its scented oil."],
  ["Meadow buttercup", "Ranunculus acris", "plant", "Grazing animals avoid it because it is poisonous."],
  // fungi
  ["Fly agaric", "Amanita muscaria", "fungus", "The red and white toadstool of fairy tales."],
  ["Death cap", "Amanita phalloides", "fungus", "Behind most fatal mushroom poisonings."],
  ["Penny bun", "Boletus edulis", "fungus", "Also sold as porcini or cep."],
  ["Devil's fingers", "Clathrus archeri", "fungus", "First found in Britain in 1914."],
  // fish and sea life
  ["Atlantic cod", "Gadus morhua", "sea", "Fished so heavily that some stocks collapsed."],
  ["Atlantic salmon", "Salmo salar", "sea", "Returns from the sea to breed in the river where it hatched."],
  ["Long-snouted seahorse", "Hippocampus guttulatus", "sea", "Lives in British waters. The male carries the young."],
  ["Great white shark", "Carcharodon carcharias", "sea", "Never confirmed in British waters."],
  ["Blue mussel", "Mytilus edulis", "sea", "Grows in dense beds on rocky shores."],
  ["Common octopus", "Octopus vulgaris", "sea", "Has three hearts and blue blood."],
  ["Common starfish", "Asterias rubens", "sea", "Can regrow a lost arm."],
  ["Common limpet", "Patella vulgata", "sea", "Returns to the same spot on its rock after feeding."],
  ["Coelacanth", "Latimeria chalumnae", "sea", "Thought long extinct until one was caught in 1938."],
  // reptiles and amphibians
  ["Adder", "Vipera berus", "herp", "Britain's only venomous snake."],
  ["Slow worm", "Anguis fragilis", "herp", "A legless lizard, not a snake."],
  ["Common toad", "Bufo bufo", "herp", "Many return to the same pond to breed each year."],
  ["Common frog", "Rana temporaria", "herp", "Lays spawn in clumps; toads lay theirs in strings."],
  ["Great crested newt", "Triturus cristatus", "herp", "Protected by law in the UK."],
  ["Green sea turtle", "Chelonia mydas", "herp", "Named after the green colour of its fat, not its shell."],
  ["Nile crocodile", "Crocodylus niloticus", "herp", "One of the largest living reptiles."],
  // fossils (matched at genus level unless a species is given)
  ["Iguanodon", "Iguanodon", "fossil", "Named in 1825 by Gideon Mantell from teeth found in Sussex.", "genus"],
  ["Megalosaurus", "Megalosaurus", "fossil", "The first dinosaur to be scientifically named, in 1824.", "genus"],
  ["Ichthyosaurus", "Ichthyosaurus", "fossil", "Early finds came from Mary Anning's Dorset coast.", "genus"],
  ["Plesiosaurus", "Plesiosaurus", "fossil", "Mary Anning found the first near-complete skeleton in 1823.", "genus"],
  ["Tyrannosaurus rex", "Tyrannosaurus rex", "fossil", "Lived in North America at the very end of the age of dinosaurs."],
  ["Dactylioceras (ammonite)", "Dactylioceras", "fossil", "Ammonites like this are common around Whitby.", "genus"],
  ["Dudley bug (trilobite)", "Calymene blumenbachii", "fossil", "A trilobite that appears on Dudley's coat of arms."],
  ["Devil's toenail", "Gryphaea arcuata", "fossil", "A curled fossil oyster, common in the Jurassic rocks of England."],
  ["Archaeopteryx", "Archaeopteryx", "fossil", "A feathered dinosaur. The British Museum bought one in 1862.", "genus"],
];

export const ROUNDS = 10;                        // ten guesses, so a chain of eleven species
export const LAUNCH_UTC = Date.UTC(2026, 9, 4);  // No. 1 = 4 October 2026 (UK date)

// dates: puzzles change at midnight UK time
export function ukDayUTC(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric" })
    .formatToParts(d).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day);
}
export const puzzleNumber = (d = new Date()) => Math.floor((ukDayUTC(d) - LAUNCH_UTC) / 864e5) + 1;
export const puzzleDate = (n) => new Date(LAUNCH_UTC + (n - 1) * 864e5)
  .toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "long", year: "numeric" });

export function mkRng(seed) { let s = Math.abs(Math.floor(seed)) % 2147483647 || 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

// The order the server tries species in for a puzzle. It takes the first eleven that have records,
// avoiding two from the same group in a row where it can.
export function candidateOrder(puzzle) {
  const rng = mkRng(puzzle * 104729 + 31), pool = SPECIES.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool;
}
export function buildChain(order, hasRecords) {
  const ok = order.filter(hasRecords), out = [];
  while (out.length < ROUNDS + 1 && ok.length) {
    const last = out.length ? SPECIES[out[out.length - 1]][2] : null;
    let k = ok.findIndex((i) => SPECIES[i][2] !== last);
    if (k < 0) k = 0;
    out.push(ok.splice(k, 1)[0]);
  }
  return out;
}

// guess is "more" or "fewer": does the next species have more or fewer records than the one before?
// A tie counts as right either way.
export function isRight(prev, next, guess) {
  if (next === prev) return guess === "more" || guess === "fewer";
  return next > prev ? guess === "more" : guess === "fewer";
}

export const fmt = (n) => Number(n).toLocaleString("en-GB");
export const gridText = (marks) => marks.map((m) => (m ? "🟩" : "⬛")).join("");
// "about 3 times as many as", "about 40% more than", "a few more than"
export const ratio = (a, b) => {
  const big = Math.max(a, b), small = Math.max(1, Math.min(a, b)), r = big / small;
  if (r < 1.1) return "a few more than";
  if (r < 2) return `about ${Math.round((r - 1) * 100)}% more than`;
  return `about ${fmt(Math.round(r))} times as many as`;
};

// ---- talking to GBIF (shared by the page and the server) ----
// GBIF refuses or slows down when asked too much too quickly, so retry a couple of times with a pause.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function fetchJSON(url, { timeout = 12000, tries = 3 } = {}) {
  let last;
  for (let n = 0; n < tries; n++) {
    if (n > 0) await sleep(last.wait || 800 * n * n);
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), timeout);
    let res;
    try { res = await fetch(url, { signal: ctl.signal, headers: { accept: "application/json" } }); }
    catch (e) { last = new Error(e && e.name === "AbortError" ? "timed out" : "network error"); clearTimeout(t); continue; }
    try {
      if (res.ok) return await res.json();
    } catch { last = new Error("bad reply"); continue; }
    finally { clearTimeout(t); }
    last = new Error(`GBIF ${res.status}`);
    if (res.status !== 429 && res.status < 500) throw last; // a real "no", not worth retrying
    const after = Number(res.headers.get("retry-after"));
    last.wait = after > 0 ? Math.min(5000, after * 1000) : 0;
  }
  throw last;
}

// Turn a scientific name into a GBIF taxon key. Tries a strict match first; if that finds nothing, a looser
// match is accepted only when GBIF's name is exactly ours, so a typo can't count a whole genus or family instead.
export async function matchTaxon(getJSON, name, rank = "species") {
  const R = rank.toUpperCase(), base = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&rank=${R}`;
  const ok = (m) => m && m.usageKey && m.matchType !== "NONE" && m.matchType !== "HIGHERRANK" && (!m.rank || m.rank === R);
  let m = await getJSON(base + "&strict=true");
  if (!ok(m)) {
    m = await getJSON(base);
    if (!ok(m) || String(m.canonicalName || "").toLowerCase() !== name.toLowerCase()) return null;
  }
  return m.acceptedUsageKey || m.usageKey;
}

// ---- choosing a photo ----
// Many museum images are of paperwork (accession registers, index cards, labels) rather than the specimen.
// GBIF doesn't say which is which, so this skips any image whose title, description or file name suggests a document.
// It's a word filter, so some paperwork will still get through and a few good photos may be skipped.
export const PAPERWORK = /regist|ledger|accession|catalog|index ?card|card ?index|\bcards?\b|\blabels?\b|notebook|letter|\bpage\b|journal|archive|document|manuscript|\bscan of\b|slip|correspondence|\bbook\b|\bfolio\b|handwrit/i;

// Accepted: CC0, CC BY, CC BY-SA, CC BY-NC, CC BY-NC-SA. Not accepted: "no derivatives" licences (the photos are
// resized) and anything without an open licence.
export function licenceOf(l = "") {
  const s = String(l).toLowerCase().replace(/_/g, "-");
  if (/publicdomain\/zero|cc0|publicdomain\/mark|public domain/.test(s)) return "CC0";
  if (/-nd|nd\//.test(s)) return null;
  const m = s.match(/licenses\/(by(?:-nc)?(?:-sa)?)\/|cc-(by(?:-nc)?(?:-sa)?)(?:-|$)/);
  return m ? "CC " + (m[1] || m[2]).toUpperCase() : null;
}

// Look through a page of GBIF results and pick the first usable photo, counting why others were skipped.
export function examine(results = []) {
  const tally = { seen: 0, paperwork: 0, licence: 0, other: 0 };
  let photo = null;
  for (const o of results) {
    for (const m of o.media || []) {
      if (m.type !== "StillImage") continue;
      tally.seen++;
      if (photo) continue;
      const url = m.identifier || "", lic = licenceOf(m.license || o.license || "");
      if (!/^https?:\/\//.test(url) || (m.format && !/^image\//i.test(m.format))) { tally.other++; continue; }
      if (!lic) { tally.licence++; continue; }
      if (PAPERWORK.test([m.title, m.description, m.caption, url.split("/").pop()].filter(Boolean).join(" ").replace(/[_.-]+/g, " "))) { tally.paperwork++; continue; }
      const who = m.rightsHolder || m.creator || o.institutionCode || o.datasetName || o.publisher || "the publisher";
      photo = { url, credit: String(who).slice(0, 80), licence: lic, occurrence: o.key, country: o.country || "" };
    }
  }
  return { photo, ...tally };
}

// Where to look, in order: UK museum specimens, then museum specimens anywhere, then photos of living examples.
const SPECIMEN_TYPES = "basisOfRecord=PRESERVED_SPECIMEN&basisOfRecord=FOSSIL_SPECIMEN&basisOfRecord=MATERIAL_SAMPLE";
export const PHOTO_TIERS = [
  { kind: "uk", label: "UK specimen", query: `publishingCountry=GB&${SPECIMEN_TYPES}` },
  { kind: "world", label: "Specimen elsewhere", query: SPECIMEN_TYPES },
  { kind: "living", label: "Living example", query: "basisOfRecord=HUMAN_OBSERVATION", skip: ["fossil"] },
];
// getJSON is passed in so the page and the server can share this. Returns { photo, log } where log says what each tier found.
export async function findPhoto(getJSON, key, group) {
  const log = [];
  for (const t of PHOTO_TIERS) {
    if (t.skip && t.skip.includes(group)) continue;
    try {
      const limit = t.kind === "living" ? 20 : 50, url = `https://api.gbif.org/v1/occurrence/search?limit=${limit}&mediaType=StillImage&taxonKey=${key}&${t.query}`;
      const r = await getJSON(url);
      let e = examine(r.results);
      // UK pages that were all paperwork: look one page further before giving up on UK photos
      if (!e.photo && t.kind === "uk" && (r.results || []).length === limit && e.paperwork >= e.seen - e.other) {
        const e2 = examine((await getJSON(url + `&offset=${limit}`)).results);
        e = { photo: e2.photo, seen: e.seen + e2.seen, paperwork: e.paperwork + e2.paperwork, licence: e.licence + e2.licence, other: e.other + e2.other };
      }
      log.push({ kind: t.kind, ...e, photo: undefined, found: !!e.photo });
      if (e.photo) return { photo: { ...e.photo, kind: t.kind }, log };
    } catch (err) { log.push({ kind: t.kind, error: String(err && err.message || err) }); }
  }
  return { photo: null, log };
}
// GBIF's free image resizing service. If it fails, the page falls back to the original image.
export const thumbUrl = (url, w = 600) => `https://api.gbif.org/v1/image/unsafe/fit-in/${w}x/${encodeURIComponent(url)}`;
