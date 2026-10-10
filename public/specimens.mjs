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

const BACKBONE = "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c"; // GBIF's main checklist of names

// Turn a scientific name into a GBIF taxon key. Tries a strict match first; if that finds nothing, a looser
// match is accepted only when GBIF's name is exactly ours, so a typo can't count a whole genus or family instead.
export async function matchTaxon(getJSON, name, rank = "species") {
  const R = rank.toUpperCase(), base = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&rank=${R}`;
  const ok = (m) => m && m.usageKey && m.matchType !== "NONE" && m.matchType !== "HIGHERRANK" && (!m.rank || m.rank === R);
  let m = await getJSON(base + "&strict=true");
  if (ok(m)) return m.acceptedUsageKey || m.usageKey;
  m = await getJSON(base);
  if (ok(m) && String(m.canonicalName || "").toLowerCase() === name.toLowerCase()) return m.acceptedUsageKey || m.usageKey;
  // last try: list every name in GBIF's main checklist spelled exactly like ours and take the accepted one
  const list = await getJSON(`https://api.gbif.org/v1/species?name=${encodeURIComponent(name)}&datasetKey=${BACKBONE}&limit=20`);
  const hit = (list.results || []).find((u) => u.rank === R && String(u.canonicalName || "").toLowerCase() === name.toLowerCase() && u.taxonomicStatus === "ACCEPTED")
    || (list.results || []).find((u) => u.rank === R && String(u.canonicalName || "").toLowerCase() === name.toLowerCase());
  return hit ? hit.acceptedKey || hit.key : null;
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

// Photos checked by eye and found not to be specimens (from the gallery on the photo check page).
// Add the image addresses here and they'll be skipped for everyone.
// Image servers that don't load on phones (seen 10 Oct 2026: every RBGE herbarium image failed).
export const BLOCKED_HOSTS = /\/\/iiif\.rbge\.org\.uk\//;

export const BAD_PHOTOS = new Set([
  // checked 4 Oct 2026: paperwork, or upsetting photos of dead animals
  "https://data.nhm.ac.uk/media/3d5c767b-2b93-41dc-88bf-86fbac5bd50d",
  "https://data.nhm.ac.uk/media/28aadd55-63c6-4759-82bd-ab50d7f351b4",
  "https://data.nhm.ac.uk/media/1b05128f-4f02-4b22-a19f-a8dcd7f4dfe4",
  "https://data.nhm.ac.uk/media/8c18eb5f-a109-4084-bf27-4ece705c9965",
  "https://data.nhm.ac.uk/media/8d7c2bdc-821c-4092-b4ea-5b81245f7d08",
  "https://data.nhm.ac.uk/media/2eb1ac48-735f-4eed-9fd6-3912e3dd995c",
  "https://caos.boldsystems.org/api/objects/caos-cloud.linode-us-east.13_191.8f600dd7-68cb-4ca7-b283-304c38846fed.jpg?subunit=1024.jpg",
  "https://data.nhm.ac.uk/media/6dc830de-c3e4-42b6-9822-9ed609dee4e5",
  "https://data.nhm.ac.uk/media/8cbdaf12-1f98-4a6d-bf68-760fc9a49a4c",
  "https://data.nhm.ac.uk/media/310f2ca4-c465-4fe6-8a76-50ebe75387dd",
  "https://data.nhm.ac.uk/media/6e963590-adc5-48b6-bcdb-0ab23aa7c177",
  "https://bellatlas-images.s3.msi.umn.edu/SMM/Z2/Z2019_3_26_s_lg.jpg",
  "https://data.nhm.ac.uk/media/eb62b8fa-f5fd-42d3-91bb-d2146ac4e411",
  "https://biorepo.neonscience.org/media/NEON_MAMC-VSS/00000/B00000164938-1_1748039100_lg.jpg",
  "https://medialib.naturalis.nl/file/id/RMNH.MAM.63914_preplog/format/large",
  "https://assets-swiss.specifycloud.org/fileget?coll=mhng&type=O&filename=sp65750557384930612362.att.JPG",
  "http://photos.gbif.fr/Bourges/PrepaZool/2020-10-1_face.JPG",
  "https://data.nhm.ac.uk/media/aa4b064b-d2ce-4479-91f6-f0afd4ee50cc",
  "https://data.nhm.ac.uk/media/01ff8cbc-d1fb-461a-9acb-2693ff9bb49f",
  "https://data.nhm.ac.uk/media/c92f297f-beae-4cf0-9821-01391acc940b",
  "https://data.nhm.ac.uk/media/2cc33323-a554-48e5-80d6-7b4666d484d1",
  "https://data.nhm.ac.uk/media/857f299f-1f90-498d-b3dc-7e2078c8722b",
  "https://data.nhm.ac.uk/media/08f26672-ea32-4206-95a4-774528ee2964",
  "https://data.nhm.ac.uk/media/1b69f73f-d463-4d3f-89fc-1e2aad52ea13",
  "https://data.nhm.ac.uk/media/a4a6b5dc-b5e7-46e0-b224-4d98923fe4e2",
  "https://arter.dk/media/aef0f865-5eeb-48be-a276-e5fd9cdb61b1.jpg",
  "https://data.nhm.ac.uk/media/c3d37040-e0cb-4e8d-b265-5146a61d8f76",
  "https://data.nhm.ac.uk/media/31ef8427-cba6-4d4d-8a80-68c943343d85",
  "https://data.nhm.ac.uk/media/461ccd79-3958-44aa-bd61-7aac1ea4afd6",
  "https://data.nhm.ac.uk/media/9da6f288-df47-4029-99d1-dbbbbdebf3cb",
  "https://data.nhm.ac.uk/media/03d91680-2f6a-422d-8d33-d67a3a570e07",
  "https://data.nhm.ac.uk/media/6819f3c1-5c1f-4086-8249-4e994bda4265",
  "https://data.nhm.ac.uk/media/971366f2-1a9a-4d9d-bdf7-36997d00afcb",
  // checked 10 Oct 2026
  "https://data.nhm.ac.uk/media/12bae07a-3ddf-411b-9f0f-a03f053316af",
  "https://data.nhm.ac.uk/media/213d3a96-18e3-41a3-8ac8-d3e65b18cdb5",
  "https://data.nhm.ac.uk/media/ad651e51-68b5-4671-934d-88ae84e09ab5",
  "https://data.nhm.ac.uk/media/d097fc14-fbf0-4bf7-89ff-eedc2cd26589",
  "https://data.nhm.ac.uk/media/3ee7dd54-9c36-4dce-9315-9727f3e79479",
  "https://data.nhm.ac.uk/media/793c936a-ce42-4153-87eb-8ff2e5b1a808",
  "https://data.nhm.ac.uk/media/1d1e3218-f0f9-4227-8a5f-350039c996aa",
  "https://data.nhm.ac.uk/media/51743de0-ea9e-4112-8455-833f5d7c62db",
  "https://data.nhm.ac.uk/media/d47ddb9f-0603-4c33-ac82-74004308e5dd",
  "https://data.nhm.ac.uk/media/3bd8e89a-cf76-439a-858f-ed82f7b26b95",
  "https://data.nhm.ac.uk/media/56bcb098-9a3d-410d-a0e8-4c6fd7be7299",
  "https://data.nhm.ac.uk/media/e40e7540-fcbe-40a8-a2c7-878deca4d06d",
  "https://data.nhm.ac.uk/media/181b1cc9-c77d-4541-a182-78e8df8675b3",
  "https://data.nhm.ac.uk/media/0c3c41d8-3198-4a67-9c03-25f65108e325",
  "https://data.nhm.ac.uk/media/4b3940b3-46f3-43e9-b6e8-ae7c1f1cfa52",
  "https://data.nhm.ac.uk/media/29b823bb-54df-48d4-b040-67f23af97a5c",
  "https://data.nhm.ac.uk/media/47c986d1-e961-4495-9e43-f8c3fd8942d6",
  "https://data.nhm.ac.uk/media/121347fd-f8aa-4e4f-91ef-e8e85f4f282b",
  "https://data.nhm.ac.uk/media/0d20d868-976d-4e97-a063-6ddc964b3d98",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/604866869/original.jpg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/605042513/original.jpg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/605095028/original.jpg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/606445390/original.jpg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/604437711/original.jpg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/633028127/original.jpg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/605611868/original.jpg",
  "https://collections.nmnh.si.edu/media/?i=7004834&h=2000",
  "https://data.nhm.ac.uk/media/938de13e-c968-4e2a-9989-668106b5d56f",
  "https://data.nhm.ac.uk/media/c5e402cb-4154-453b-9cf9-b08c6469d944",
  "https://zenodo.org/record/2714333/files/CAM040867_d.JPG",
  "https://iiif.rbge.org.uk/herb/iiif/E01152744/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01152440/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01152574/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01358530/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01152557/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01152840/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01152483/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01021721/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01582484/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E01358602/full/1600,/0/default.jpg",
  "https://iiif.rbge.org.uk/herb/iiif/E00826911/full/1600,/0/default.jpg",
  "https://d2jcv3kl45hlgi.cloudfront.net/6a94f2fa94ff45fce06189e4c678c02a.jpg",
  "https://d2jcv3kl45hlgi.cloudfront.net/62caa53d6724d2277748ec67dcf74a13.jpg",
  "https://d2jcv3kl45hlgi.cloudfront.net/4d2cb7fd804c0aaa4aae3a3587bc9d3e.jpg",
  "https://d2jcv3kl45hlgi.cloudfront.net/3edb1cb3242cb1268f0c2d6ff6d9bb21.jpg",
  "https://data.nhm.ac.uk/media/037179c4-c41f-4066-bcbd-80efbf9a02c6",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/661931788/original.jpg",
  "https://data.nhm.ac.uk/media/07dcfb60-baf8-4b15-a736-cd7f572759c9",
  "https://data.nhm.ac.uk/media/38841039-bd6a-4276-9d3f-762185d18edc",
  // checked 10 Oct 2026 (third review)
  "https://d2jcv3kl45hlgi.cloudfront.net/a1731278a9799006576f6daa03857332.jpg",
  "https://d2jcv3kl45hlgi.cloudfront.net/10d9ec4c1a6d305198060cc0f9d293d6.jpg",
  "https://data.nhm.ac.uk/media/8ec1f339-e65d-4c51-bc76-9b14aa4de9a7",
  "https://data.nhm.ac.uk/media/7061f121-6652-4cf4-b5b4-e3a11d15cf25",
  "https://data.nhm.ac.uk/media/2b8634ed-6316-4e3e-9e02-af0ea454d371",
]);

// Photos chosen by hand in the photo picker (#pick). The game uses these first and doesn't search at all.
// null means "no good photo: show the group colour".
export const PICKED = {
  // locked in 10 Oct 2026 from the photo check, after three rounds of review by eye
  "Passer domesticus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/House_sparrow_male_in_Prospect_Park_%2853532%29.jpg/960px-House_sparrow_male_in_Prospect_Park_%2853532%29.jpg", "credit": "Rhododendrites", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:House_sparrow_male_in_Prospect_Park_(53532).jpg", "kind": "wiki"},
  "Erithacus rubecula": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Erithacus_rubecula_with_cocked_head.jpg/960px-Erithacus_rubecula_with_cocked_head.jpg", "credit": "Francis C. Franklin", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Erithacus_rubecula_with_cocked_head.jpg", "kind": "wiki"},
  "Turdus merula": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Common_Blackbird.jpg/960px-Common_Blackbird.jpg", "credit": "Andreas Trepte", "licence": "CC BY-SA 2.5", "source": "https://commons.wikimedia.org/wiki/File:Common_Blackbird.jpg", "kind": "wiki"},
  "Tyto alba": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Barn_Owl%2C_Lancashire.jpg/960px-Barn_Owl%2C_Lancashire.jpg", "credit": "Steven Ward", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Barn_Owl,_Lancashire.jpg", "kind": "wiki"},
  "Falco peregrinus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Falco_peregrinus_m_Humber_Bay_Park_Toronto.jpg/960px-Falco_peregrinus_m_Humber_Bay_Park_Toronto.jpg", "credit": "Mykola Swarnyk", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Falco_peregrinus_m_Humber_Bay_Park_Toronto.jpg", "kind": "wiki"},
  "Alcedo atthis": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Alcedo_atthis_-England-8_%28cropped%29.jpg/960px-Alcedo_atthis_-England-8_%28cropped%29.jpg", "credit": "Tony Wood", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Alcedo_atthis_-England-8_(cropped).jpg", "kind": "wiki"},
  "Cygnus olor": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/CygneVaires.jpg/960px-CygneVaires.jpg", "credit": "Sanchezn", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:CygneVaires.jpg", "kind": "wiki"},
  "Fratercula arctica": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Puffin_%28Fratercula_arctica%29.jpg/960px-Puffin_%28Fratercula_arctica%29.jpg", "credit": "Charles J. Sharp", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Puffin_(Fratercula_arctica).jpg", "kind": "wiki"},
  "Aquila chrysaetos": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/015_Wild_Golden_Eagle_in_flight_at_Pfyn-Finges_%28Switzerland%29_Photo_by_Giles_Laurent.jpg/960px-015_Wild_Golden_Eagle_in_flight_at_Pfyn-Finges_%28Switzerland%29_Photo_by_Giles_Laurent.jpg", "credit": "Giles Laurent", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:015_Wild_Golden_Eagle_in_flight_at_Pfyn-Finges_(Switzerland)_Photo_by_Giles_Laurent.jpg", "kind": "wiki"},
  "Pinguinus impennis": {"url": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Great_Auk_%28Pinguinis_impennis%29_specimen%2C_Kelvingrove%2C_Glasgow_-_geograph.org.uk_-_1108249.jpg", "credit": "Mike Pennington", "licence": "CC BY-SA 2.0", "source": "https://commons.wikimedia.org/wiki/File:Great_Auk_(Pinguinis_impennis)_specimen,_Kelvingrove,_Glasgow_-_geograph.org.uk_-_1108249.jpg", "kind": "wiki"},
  "Raphus cucullatus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Oxford_Dodo_display.jpg/960px-Oxford_Dodo_display.jpg", "credit": "BazzaDaRambler", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Oxford_Dodo_display.jpg", "kind": "wiki"},
  "Ectopistes migratorius": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Bird_lore_%281913%29_%2814562557107%29.jpg/960px-Bird_lore_%281913%29_%2814562557107%29.jpg", "credit": "J. G. Hubbard, Internet Archive Book Images", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Bird_lore_(1913)_(14562557107).jpg", "kind": "wiki"},
  "Troglodytes troglodytes": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Eurasian_wren_Franconville_02.jpg/960px-Eurasian_wren_Franconville_02.jpg", "credit": "Alexis Lours", "licence": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Eurasian_wren_Franconville_02.jpg", "kind": "wiki"},
  "Cuculus canorus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Cuckoo_%2851169010335%29.jpg/960px-Cuckoo_%2851169010335%29.jpg", "credit": "Andy Morffew from Itchen Abbas, Hampshire, UK", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Cuckoo_(51169010335).jpg", "kind": "wiki"},
  "Ardea cinerea": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Il_pescatore_solitario.jpg/960px-Il_pescatore_solitario.jpg", "credit": "Giacomo Cimino (foto.giacomocimino.workers.dev · @giacomociminoph)", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Il_pescatore_solitario.jpg", "kind": "wiki"},
  "Corvus corax": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Corvus_corax_clarionensis%2C_Point_Reyes_National_Seashore.jpg/960px-Corvus_corax_clarionensis%2C_Point_Reyes_National_Seashore.jpg", "credit": "Frank Schulenburg", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Corvus_corax_clarionensis,_Point_Reyes_National_Seashore.jpg", "kind": "wiki"},
  "Aptenodytes forsteri": {"url": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg", "credit": "Ian Duffy from UK", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Aptenodytes_forsteri_-Snow_Hill_Island,_Antarctica_-adults_and_juvenile-8.jpg", "kind": "wiki"},
  "Sturnus vulgaris": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Common_starling_%28Sturnus_vulgaris%29_breeding_male_Marken.jpg/960px-Common_starling_%28Sturnus_vulgaris%29_breeding_male_Marken.jpg", "credit": "Charles J. Sharp", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Common_starling_(Sturnus_vulgaris)_breeding_male_Marken.jpg", "kind": "wiki"},
  "Pica pica": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Eurasian_magpie_2024_03_03_02.jpg/960px-Eurasian_magpie_2024_03_03_02.jpg", "credit": "Alexis Lours", "licence": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Eurasian_magpie_2024_03_03_02.jpg", "kind": "wiki"},
  "Erinaceus europaeus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Erinaceus_europaeus_LC0119.jpg/960px-Erinaceus_europaeus_LC0119.jpg", "credit": "Jörg Hempel", "licence": "CC BY-SA 2.0 de", "source": "https://commons.wikimedia.org/wiki/File:Erinaceus_europaeus_LC0119.jpg", "kind": "wiki"},
  "Vulpes vulpes": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg/960px-Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_%28cropped%29.jpg", "credit": "ClaudiaTen", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Portrait_of_a_red_fox_in_Rautas_fj%C3%A4llurskog_(cropped).jpg", "kind": "wiki"},
  "Meles meles": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/European_badger_%28Meles_meles_taxus%29_Drenthe.jpg/960px-European_badger_%28Meles_meles_taxus%29_Drenthe.jpg", "credit": "Charles J. Sharp", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:European_badger_(Meles_meles_taxus)_Drenthe.jpg", "kind": "wiki"},
  "Lutra lutra": {"url": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Fischotter%2C_Lutra_Lutra.JPG", "credit": "Bernard Landgraf", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Fischotter,_Lutra_Lutra.JPG", "kind": "wiki"},
  "Sciurus vulgaris": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Squirrel_posing.jpg/960px-Squirrel_posing.jpg", "credit": "Peter Trimming", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Squirrel_posing.jpg", "kind": "wiki"},
  "Sciurus carolinensis": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/EasternGraySquirrel_GAm.jpg/960px-EasternGraySquirrel_GAm.jpg", "credit": "JeffreyGammon", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:EasternGraySquirrel_GAm.jpg", "kind": "wiki"},
  "Talpa europaea": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Talpa_europaea_I.jpg/960px-Talpa_europaea_I.jpg", "credit": "bristolian", "licence": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Talpa_europaea_I.jpg", "kind": "wiki"},
  "Mus musculus": {"url": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Mouse_white_background.jpg", "credit": "Wikimedia Commons contributor", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Mouse_white_background.jpg", "kind": "wiki"},
  "Rattus norvegicus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Brown_Rat_%28Rattus_norvegicus%29.jpg/960px-Brown_Rat_%28Rattus_norvegicus%29.jpg", "credit": "Dunpharlain", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Brown_Rat_(Rattus_norvegicus).jpg", "kind": "wiki"},
  "Pipistrellus pipistrellus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Pipistrellus_female-1.jpg/960px-Pipistrellus_female-1.jpg", "credit": "Drahkrub", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Pipistrellus_female-1.jpg", "kind": "wiki"},
  "Panthera leo": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg/960px-020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg", "credit": "Giles Laurent", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:020_The_lion_king_Snyggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg", "kind": "wiki"},
  "Panthera tigris": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg/960px-Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg", "credit": "Charles J. Sharp", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Bengal_tiger_(Panthera_tigris_tigris)_female_3_crop.jpg", "kind": "wiki"},
  "Loxodonta africana": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg/960px-178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg", "credit": "Giles Laurent", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg", "kind": "wiki"},
  "Mammuthus primigenius": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Siegsdorfer_Mammut.jpg/960px-Siegsdorfer_Mammut.jpg", "credit": "Lou.gruber", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Siegsdorfer_Mammut.jpg", "kind": "wiki"},
  "Ailuropoda melanoleuca": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/960px-Grosser_Panda.JPG", "credit": "J. Patrick Fischer", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Grosser_Panda.JPG", "kind": "wiki"},
  "Ornithorhynchus anatinus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale.jpg/960px-Duck-billed_platypus_%28Ornithorhynchus_anatinus%29_Scottsdale.jpg", "credit": "Charles J. Sharp", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Duck-billed_platypus_(Ornithorhynchus_anatinus)_Scottsdale.jpg", "kind": "wiki"},
  "Thylacinus cynocephalus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Thylacinus_cropped.png/960px-Thylacinus_cropped.png", "credit": "E.J. Keller", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Thylacinus_cropped.png", "kind": "wiki"},
  "Balaenoptera musculus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg/960px-Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg", "credit": "NOAA Photo Library", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg", "kind": "wiki"},
  "Castor fiber": {"url": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Beaver_pho34.jpg", "credit": "Per Harald Olsen", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Beaver_pho34.jpg", "kind": "wiki"},
  "Cervus elaphus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Cervus_elaphus_Luc_Viatour_6.jpg/960px-Cervus_elaphus_Luc_Viatour_6.jpg", "credit": "Lviatour", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Cervus_elaphus_Luc_Viatour_6.jpg", "kind": "wiki"},
  "Gorilla gorilla": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Male_gorilla_in_SF_zoo.jpg/960px-Male_gorilla_in_SF_zoo.jpg", "credit": "Brocken Inaglory", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Male_gorilla_in_SF_zoo.jpg", "kind": "wiki"},
  "Apis mellifera": {"url": "https://data.nhm.ac.uk/media/c0110e78-6782-444d-a819-f612cc678865", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 4413172708, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Bombus terrestris": {"url": "https://data.nhm.ac.uk/media/50c8e551-6329-4b61-b83a-dda0d7884658", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 3031122091, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Vanessa atalanta": {"url": "https://data.nhm.ac.uk/media/06d51844-24c4-4987-adfd-35d37b9b6d5f", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 3387288728, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Aglais io": {"url": "https://data.nhm.ac.uk/media/190ef7b8-ee12-4587-99bb-2f7e88007c27", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1291201013, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Coccinella septempunctata": {"url": "https://data.nhm.ac.uk/media/6ed101bd-a871-477b-8640-1c9e3f9def86", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 3994000417, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Lucanus cervus": {"url": "https://data.nhm.ac.uk/media/38153af8-bb29-46b1-b3f9-1173f716689a", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 4930339342, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Musca domestica": {"url": "https://data.nhm.ac.uk/media/53ff984b-c9e4-4394-bbb8-f37cc4c61287", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1057178920, "country": "Türkiye", "kind": "uk"},
  "Anax imperator": {"url": "https://data.nhm.ac.uk/media/b1d907d1-361c-4c5c-827b-912c862886c2", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 3988247693, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Danaus plexippus": {"url": "https://zenodo.org/record/2714333/files/CAM040867_v.JPG", "credit": "Heliconiine Butterfly Collection Records from University of Cambridge", "licence": "CC BY", "occurrence": 2425058769, "country": "Ecuador", "kind": "uk"},
  "Ornithoptera alexandrae": {"url": "https://data.nhm.ac.uk/media/b12c9c90-ba7c-4ad5-8be0-982fd4316c73", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 2446313495, "country": "Papua New Guinea", "kind": "uk"},
  "Acherontia atropos": {"url": "https://data.nhm.ac.uk/media/84e978c7-83ca-490f-bc5f-348c4584f803", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1847651078, "kind": "uk"},
  "Forficula auricularia": {"url": "https://lh3.googleusercontent.com/d/1PhI2KdRaIfbc2RxwGNpGav0ssxYXK3mF", "credit": "Lilian Cooper", "licence": "CC BY", "occurrence": 5058448374, "country": "Netherlands", "kind": "world"},
  "Vespa crabro": {"url": "https://data.nhm.ac.uk/media/05f62af4-ddcc-4103-a753-0fc60f71eebe", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 2859756311, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Anopheles gambiae": {"url": "https://data.nhm.ac.uk/media/74982f44-946f-4f89-a989-a8324b01083a", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1826400199, "country": "Gambia", "kind": "uk"},
  "Bellis perennis": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Bellis_perennis_sl1.jpg/960px-Bellis_perennis_sl1.jpg", "credit": "Stefan.lefnaer", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Bellis_perennis_sl1.jpg", "kind": "wiki"},
  "Quercus robur": {"url": "https://upload.wikimedia.org/wikipedia/commons/a/af/Quercus_robur.jpg", "credit": "Wikimedia Commons", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Quercus_robur.jpg", "kind": "wiki"},
  "Fraxinus excelsior": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Fraxinus_excelsior.jpg/960px-Fraxinus_excelsior.jpg", "credit": "Wikimedia Commons contributor", "licence": "CC BY 2.5", "source": "https://commons.wikimedia.org/wiki/File:Fraxinus_excelsior.jpg", "kind": "wiki"},
  "Digitalis purpurea": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Digitalis_purpurea_LC0101.jpg/960px-Digitalis_purpurea_LC0101.jpg", "credit": "Jörg Hempel", "licence": "CC BY-SA 3.0 de", "source": "https://commons.wikimedia.org/wiki/File:Digitalis_purpurea_LC0101.jpg", "kind": "wiki"},
  "Papaver rhoeas": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Papaver_rhoeas_Lincolnshire_2026.jpg/960px-Papaver_rhoeas_Lincolnshire_2026.jpg", "credit": "Kieran Roy Powell", "licence": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Papaver_rhoeas_Lincolnshire_2026.jpg", "kind": "wiki"},
  "Papaver somniferum": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Papaver_somniferum_flowers.jpg/960px-Papaver_somniferum_flowers.jpg", "credit": "tanja niggendijker from apeldoorn, the netherlands", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Papaver_somniferum_flowers.jpg", "kind": "wiki"},
  "Hedera helix": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Hedera_helix_Dover.jpg/960px-Hedera_helix_Dover.jpg", "credit": "kallerna", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Hedera_helix_Dover.jpg", "kind": "wiki"},
  "Urtica dioica": {"url": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Fen_nettle_%28Urtica_dioica_ssp._galeopsifolia%29_-_geograph.org.uk_-_5423125.jpg", "credit": "Evelyn Simak", "licence": "CC BY-SA 2.0", "source": "https://commons.wikimedia.org/wiki/File:Fen_nettle_(Urtica_dioica_ssp._galeopsifolia)_-_geograph.org.uk_-_5423125.jpg", "kind": "wiki"},
  "Calluna vulgaris": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/CallunaVulgaris.jpg/960px-CallunaVulgaris.jpg", "credit": "Aqwis (Aqwis)", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:CallunaVulgaris.jpg", "kind": "wiki"},
  "Hyacinthoides non-scripta": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Hyacinthoides_non-scripta_%28Common_Bluebell%29.jpg/960px-Hyacinthoides_non-scripta_%28Common_Bluebell%29.jpg", "credit": "MichaelMaggs", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Hyacinthoides_non-scripta_(Common_Bluebell).jpg", "kind": "wiki"},
  "Primula vulgaris": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Prole%C4%87no_cve%C4%87e_3.JPG/960px-Prole%C4%87no_cve%C4%87e_3.JPG", "credit": "Wikimedia Commons contributor", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Prole%C4%87no_cve%C4%87e_3.JPG", "kind": "wiki"},
  "Taxus baccata": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Taxus_baccata_MHNT.jpg/960px-Taxus_baccata_MHNT.jpg", "credit": "Didier Descouens", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Taxus_baccata_MHNT.jpg", "kind": "wiki"},
  "Taxus brevifolia": {"url": "https://upload.wikimedia.org/wikipedia/commons/8/84/Taxus_brevifolia_Blue_Mts_WA.jpg", "credit": "Jason Hollinger", "licence": "CC BY 2.0", "source": "https://commons.wikimedia.org/wiki/File:Taxus_brevifolia_Blue_Mts_WA.jpg", "kind": "wiki"},
  "Catharanthus roseus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a6/Vinca_%28Catharanthus_roseus%29_cultivada_em_Bag%C3%A9%2C_RS%2C_Brasil_-_55231652268.jpg/960px-Vinca_%28Catharanthus_roseus%29_cultivada_em_Bag%C3%A9%2C_RS%2C_Brasil_-_55231652268.jpg", "credit": "O Tupinólogo", "licence": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Vinca_(Catharanthus_roseus)_cultivada_em_Bag%C3%A9,_RS,_Brasil_-_55231652268.jpg", "kind": "wiki"},
  "Cinchona officinalis": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Curtis%27s_botanical_magazine_%288272601122%29.jpg/960px-Curtis%27s_botanical_magazine_%288272601122%29.jpg", "credit": "Bentham-Moxon Trust.; Curtis, William; Curtis's botanical magazine dedications, ", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Curtis%27s_botanical_magazine_(8272601122).jpg", "kind": "wiki"},
  "Salix alba": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Salix_alba_leaves.jpg/960px-Salix_alba_leaves.jpg", "credit": "MPF", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Salix_alba_leaves.jpg", "kind": "wiki"},
  "Drosera rotundifolia": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Drosera_rotundifolia_Ohio.jpg/960px-Drosera_rotundifolia_Ohio.jpg", "credit": "Alan Rockefeller", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Drosera_rotundifolia_Ohio.jpg", "kind": "wiki"},
  "Cypripedium calceolus": {"url": "https://upload.wikimedia.org/wikipedia/commons/7/74/Cypripedium_calceolus_wiki_mg-k01.jpg", "credit": "Mg-K ((GFDL))", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Cypripedium_calceolus_wiki_mg-k01.jpg", "kind": "wiki"},
  "Welwitschia mirabilis": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Welwitschia_mirabilis%282%29.jpg/960px-Welwitschia_mirabilis%282%29.jpg", "credit": "Thomas Schoch", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Welwitschia_mirabilis(2).jpg", "kind": "wiki"},
  "Sequoiadendron giganteum": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/Grizzly_Giant_Mariposa_Grove.jpg/960px-Grizzly_Giant_Mariposa_Grove.jpg", "credit": "Mike Murphy (talk · contribs)", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Grizzly_Giant_Mariposa_Grove.jpg", "kind": "wiki"},
  "Juniperus communis": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Jeneverbes.jpg/960px-Jeneverbes.jpg", "credit": "Rasbak at Dutch Wikipedia", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Jeneverbes.jpg", "kind": "wiki"},
  "Lavandula angustifolia": {"url": "https://upload.wikimedia.org/wikipedia/commons/4/40/Lavandula_angustifolia_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-087.jpg", "credit": "Franz Eugen Köhler, Köhler's Medizinal-Pflanzen", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Lavandula_angustifolia_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-087.jpg", "kind": "wiki"},
  "Ranunculus acris": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Illustration_Ranunculus_acris0.jpg/960px-Illustration_Ranunculus_acris0.jpg", "credit": "Wikimedia Commons", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Illustration_Ranunculus_acris0.jpg", "kind": "wiki"},
  "Amanita muscaria": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Amanita_muscaria_Aberystwyth_2023.jpg/960px-Amanita_muscaria_Aberystwyth_2023.jpg", "credit": "Kieran Roy Powell", "licence": "CC BY 4.0", "source": "https://commons.wikimedia.org/wiki/File:Amanita_muscaria_Aberystwyth_2023.jpg", "kind": "wiki"},
  "Amanita phalloides": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/99/Amanita_phalloides_1.JPG/960px-Amanita_phalloides_1.JPG", "credit": "Archenzo", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Amanita_phalloides_1.JPG", "kind": "wiki"},
  "Boletus edulis": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Boletus_edulis_IT.jpg/960px-Boletus_edulis_IT.jpg", "credit": "ReddishClover", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Boletus_edulis_IT.jpg", "kind": "wiki"},
  "Clathrus archeri": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Clathrus_archeri.jpg/960px-Clathrus_archeri.jpg", "credit": "de:Benutzer:Oilys", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Clathrus_archeri.jpg", "kind": "wiki"},
  "Gadus morhua": {"url": "https://data.nhm.ac.uk/media/577cf231-8123-41c0-a669-1780763a228f", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1056778009, "country": "Russian Federation", "kind": "uk"},
  "Salmo salar": {"url": "https://data.nhm.ac.uk/media/70ef3fb0-40d6-402e-afa4-177e064e08af", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1056297977, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Hippocampus guttulatus": {"url": "https://data.nhm.ac.uk/media/161eb5a8-d66f-4dfb-8dc7-f8b2bb97f4ab", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 3387288857, "kind": "uk"},
  "Carcharodon carcharias": {"url": "https://data.nhm.ac.uk/media/4300e96c-7c2c-408e-9459-fe6ccbbd5dc0", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1056391832, "country": "Australia", "kind": "uk"},
  "Mytilus edulis": {"url": "https://static.wixstatic.com/media/1a6385_16d2901b44884383bf034a221dc56611~mv2.jpg/v1/fill/w_796,h_597,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/IMG_1887(5).jpg", "credit": "NatMIP Mollusc Collection", "licence": "CC BY", "occurrence": 6158887353, "country": "Spain", "kind": "world"},
  "Octopus vulgaris": {"url": "https://data.nhm.ac.uk/media/8aa49389-1c0e-4566-9189-c900241be22a", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1055357544, "kind": "uk"},
  "Asterias rubens": {"url": "https://caos.boldsystems.org/api/objects/caos-cloud.linode-us-east.19_182.d1edde5b-7d28-4dda-869d-daf7ef6f240e.jpg?subunit=1024.jpg", "credit": "Deutsches Zentrum fuer Marine Biodiversitaetsforschung", "licence": "CC BY-NC-SA", "occurrence": 4445695653, "country": "Germany", "kind": "world"},
  "Patella vulgata": {"url": "https://data.nhm.ac.uk/media/b1330ddc-2cea-4fe7-879c-599d6c4034c3", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1056801262, "country": "New Zealand", "kind": "uk"},
  "Latimeria chalumnae": {"url": "http://pictures.snsb.info/SAPMpiscescoll/web/SAPM-PI-014/SAPM-PI-01457_20140526_143825.jpg", "credit": "SNSB-SPM", "licence": "CC BY-SA", "occurrence": 1851315199, "kind": "world"},
  "Vipera berus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Common_European_viper_%28Vipera_berus%29_female_Pieniny.jpg/960px-Common_European_viper_%28Vipera_berus%29_female_Pieniny.jpg", "credit": "Charles J. Sharp", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Common_European_viper_(Vipera_berus)_female_Pieniny.jpg", "kind": "wiki"},
  "Anguis fragilis": {"url": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Anguidae.jpg", "credit": "Wikimedia Commons", "licence": "CC BY-SA 3.0", "source": "https://commons.wikimedia.org/wiki/File:Anguidae.jpg", "kind": "wiki"},
  "Bufo bufo": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Common_Toad_Cornwall.jpeg/960px-Common_Toad_Cornwall.jpeg", "credit": "Tythatguy1312", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Common_Toad_Cornwall.jpeg", "kind": "wiki"},
  "Rana temporaria": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/European_Common_Frog_Rana_temporaria.jpg/960px-European_Common_Frog_Rana_temporaria.jpg", "credit": "Richard Bartz, Munich aka Makro Freak Image:MFB.jpg", "licence": "CC BY-SA 2.5", "source": "https://commons.wikimedia.org/wiki/File:European_Common_Frog_Rana_temporaria.jpg", "kind": "wiki"},
  "Triturus cristatus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Kammmolchmaennchen.jpg/960px-Kammmolchmaennchen.jpg", "credit": "Rainer Theuer.", "licence": "Public domain", "source": "https://commons.wikimedia.org/wiki/File:Kammmolchmaennchen.jpg", "kind": "wiki"},
  "Chelonia mydas": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg/960px-Green_sea_turtle_%28Chelonia_mydas%29_Moorea.jpg", "credit": "Charles J. Sharp", "licence": "CC BY-SA 4.0", "source": "https://commons.wikimedia.org/wiki/File:Green_sea_turtle_(Chelonia_mydas)_Moorea.jpg", "kind": "wiki"},
  "Crocodylus niloticus": {"url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/NileCrocodile.jpg/960px-NileCrocodile.jpg", "credit": "Dewet", "licence": "CC BY-SA 2.0", "source": "https://commons.wikimedia.org/wiki/File:NileCrocodile.jpg", "kind": "wiki"},
  "Iguanodon": {"url": "https://data.nhm.ac.uk/media/237246b8-89dc-4e30-ae5a-c75864385d94", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1057207486, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Megalosaurus": {"url": "https://data.nhm.ac.uk/media/1f29416f-0645-4b39-be35-bb954d0a301e", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1055300887, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Ichthyosaurus": {"url": "https://data.nhm.ac.uk/media/46a88f49-25aa-4a43-96c4-8b485b9e775e", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1055297121, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Plesiosaurus": {"url": "https://data.nhm.ac.uk/media/c8c9d646-3e99-4d0a-8ec0-d6a7e161ae3d", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1272136157, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Tyrannosaurus rex": {"url": "https://data.nhm.ac.uk/media/325ffe0b-8eed-4610-bf55-ab47605bf212", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1055932028, "country": "United States of America", "kind": "uk"},
  "Dactylioceras": {"url": "https://resources.bgs.ac.uk/gb3d/thumbnails/BGS/P832070.jpg", "credit": "BGS", "licence": "CC BY-NC", "occurrence": 5898476700, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Calymene blumenbachii": {"url": "https://data.nhm.ac.uk/media/f418e1c8-e12f-4f5d-95dc-61032847b187", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1265664618, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Gryphaea arcuata": {"url": "https://data.nhm.ac.uk/media/dbe88dd5-c1eb-48fd-a963-d9bb5e63b3f9", "credit": "The Trustees of the Natural History Museum, London", "licence": "CC BY", "occurrence": 1055303585, "country": "United Kingdom of Great Britain and Northern Ireland", "kind": "uk"},
  "Archaeopteryx": {"url": "https://iiif.mcz.harvard.edu/iiif/3/3788031/full/max/0/default.jpg", "credit": "© President and Fellows of Harvard College", "licence": "CC BY-NC-SA", "occurrence": 2461326374, "country": "Germany", "kind": "world"},
};

const usable = (o, m) => {
  if (m.type !== "StillImage") return { why: "skip" };
  const url = m.identifier || "", lic = licenceOf(m.license || o.license || "");
  if (!/^https?:\/\//.test(url) || (m.format && !/^image\//i.test(m.format))) return { why: "other" };
  if (!lic) return { why: "licence" };
  if (BAD_PHOTOS.has(url)) return { why: "paperwork" };
  if (BLOCKED_HOSTS.test(url)) return { why: "other" };
  if (PAPERWORK.test([m.title, m.description, m.caption, url.split("/").pop()].filter(Boolean).join(" ").replace(/[_.-]+/g, " "))) return { why: "paperwork" };
  const who = m.rightsHolder || m.creator || o.institutionCode || o.datasetName || o.publisher || "the publisher";
  return { photo: { url, credit: String(who).slice(0, 80), licence: lic, occurrence: o.key, country: o.country || "" } };
};

// Look through a page of GBIF results and collect up to `max` usable photos, counting why others were skipped.
export function examine(results = [], max = 1) {
  const tally = { seen: 0, paperwork: 0, licence: 0, other: 0 }, photos = [], seenOcc = new Set();
  for (const o of results) {
    for (const m of o.media || []) {
      if (m.type !== "StillImage") continue;
      tally.seen++;
      if (photos.length >= max) continue;
      const u = usable(o, m);
      if (u.photo) { if (!seenOcc.has(o.key)) { photos.push(u.photo); seenOcc.add(o.key); } } else tally[u.why]++;
    }
  }
  return { photo: photos[0] || null, photos, ...tally };
}

// Where to look. Usually: UK museum specimens, then specimens anywhere, then photos of living examples.
// Mammals, birds, reptiles and amphibians look for living examples first, as preserved ones (and eggs) can be upsetting
// or dull to look at. For those, the species' main Wikipedia photo is tried before anything else.
const SPECIMEN_TYPES = "basisOfRecord=PRESERVED_SPECIMEN&basisOfRecord=FOSSIL_SPECIMEN&basisOfRecord=MATERIAL_SAMPLE";
const TIER = {
  uk: { kind: "uk", label: "UK specimen", query: `publishingCountry=GB&${SPECIMEN_TYPES}`, limit: 50 },
  world: { kind: "world", label: "Specimen elsewhere", query: SPECIMEN_TYPES, limit: 50 },
  living: { kind: "living", label: "Living example", query: "basisOfRecord=HUMAN_OBSERVATION", limit: 20 },
};
export const LIVING_FIRST = ["mammal", "herp", "bird", "plant", "fungus"];
export const tiersFor = (group) =>
  group === "fossil" ? [TIER.uk, TIER.world] : LIVING_FIRST.includes(group) ? [TIER.living, TIER.uk, TIER.world] : [TIER.uk, TIER.world, TIER.living];
export const PHOTO_TIERS = [TIER.uk, TIER.world, TIER.living];

async function searchTier(getJSON, t, key, max) {
  const url = `https://api.gbif.org/v1/occurrence/search?limit=${t.limit}&mediaType=StillImage&taxonKey=${key}&${t.query}`;
  const r = await getJSON(url);
  let e = examine(r.results, max);
  // UK pages that were all paperwork: look one page further before giving up on UK photos
  if (!e.photo && t.kind === "uk" && (r.results || []).length === t.limit && e.paperwork >= e.seen - e.other) {
    const e2 = examine((await getJSON(url + `&offset=${t.limit}`)).results, max);
    e = { photo: e2.photo, photos: e2.photos, seen: e.seen + e2.seen, paperwork: e.paperwork + e2.paperwork, licence: e.licence + e2.licence, other: e.other + e2.other };
  }
  return e;
}

// The main photo on the species' English Wikipedia page, if it's on Wikimedia Commons with an open licence.
// These are chosen by editors to show the animal or plant clearly, so they're better than random sighting photos.
const strip = (h) => String(h || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
export async function wikiPhoto(getJSON, sci) {
  const q = await getJSON(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=name&titles=${encodeURIComponent(sci)}`);
  const page = Object.values((q && q.query && q.query.pages) || {})[0];
  if (!page || "missing" in page || !page.pageimage || /\.(svg|gif|tif)$/i.test(page.pageimage)) return null;
  const f = await getJSON(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&titles=${encodeURIComponent("File:" + page.pageimage)}`);
  const ii = ((Object.values((f && f.query && f.query.pages) || {})[0] || {}).imageinfo || [])[0];
  if (!ii) return null; // not on Commons, e.g. a non-free image held by Wikipedia itself
  const md = ii.extmetadata || {}, lic = strip(md.LicenseShortName && md.LicenseShortName.value);
  if (!/^(cc|public domain|pd)/i.test(lic) || /\bnd\b|-nd/i.test(lic)) return null;
  const url = ii.thumburl || ii.url;
  if (BAD_PHOTOS.has(url) || BAD_PHOTOS.has(ii.url)) return null;
  return { url, credit: strip(md.Artist && md.Artist.value).slice(0, 80) || "Wikimedia Commons", licence: lic, source: ii.descriptionurl || "", occurrence: null, country: "" };
}

// getJSON is passed in so the page and the server can share this. Returns { photo, log } where log says what each tier found.
export async function findPhoto(getJSON, key, group, sci) {
  if (sci && Object.prototype.hasOwnProperty.call(PICKED, sci)) return { photo: PICKED[sci], log: [{ kind: "picked", found: !!PICKED[sci] }] };
  const log = [];
  if (sci && LIVING_FIRST.includes(group)) {
    try { const w = await wikiPhoto(getJSON, sci); log.push({ kind: "wiki", found: !!w }); if (w) return { photo: { ...w, kind: "wiki" }, log }; }
    catch (err) { log.push({ kind: "wiki", error: String(err && err.message || err) }); }
  }
  for (const t of tiersFor(group)) {
    try {
      const e = await searchTier(getJSON, t, key, 1);
      log.push({ kind: t.kind, seen: e.seen, paperwork: e.paperwork, licence: e.licence, other: e.other, found: !!e.photo });
      if (e.photo) return { photo: { ...e.photo, kind: t.kind }, log };
    } catch (err) { log.push({ kind: t.kind, error: String(err && err.message || err) }); }
  }
  return { photo: null, log };
}

// For the photo picker: a mix of UK specimens, specimens elsewhere and living examples (not for fossils),
// 2 of each where possible and up to 6 in all, so there's always a choice of kinds.
export async function photoOptions(getJSON, key, group, sci) {
  const wiki = sci && group !== "fossil" ? await wikiPhoto(getJSON, sci).catch(() => null) : null;
  const rest = await photoOptionsGbif(getJSON, key, group);
  return wiki ? [{ ...wiki, kind: "wiki" }, ...rest.slice(0, 5)] : rest;
}
async function photoOptionsGbif(getJSON, key, group) {
  const tiers = group === "fossil" ? [TIER.uk, TIER.world] : [TIER.uk, TIER.world, TIER.living];
  const found = await Promise.all(tiers.map((t) => searchTier(getJSON, t, key, 6).then((e) => e.photos.map((p) => ({ ...p, kind: t.kind }))).catch(() => [])));
  const each = Math.ceil(6 / tiers.length), out = [];
  found.forEach((list) => out.push(...list.slice(0, each)));
  for (const list of found) for (const p of list.slice(each)) if (out.length < 6) out.push(p); // top up from tiers with spare
  return out.slice(0, 6);
}

// GBIF's free image resizing service. If it fails, the page falls back to the original image.
// Wikimedia images are already sized; IIIF image servers (e.g. RBGE) can be asked for a smaller size directly.
export const thumbUrl = (url, w = 600) =>
  /\.wikimedia\.org\//.test(url) ? url
  : /\/iiif\/.+\/full\/[^/]+\/0\/default\.jpg$/.test(url) ? url.replace(/\/full\/[^/]+\/0\//, `/full/${w},/0/`)
  : `https://api.gbif.org/v1/image/unsafe/fit-in/${w}x/${encodeURIComponent(url)}`;
