// Builds and stores each day's chain of species with their counts, so every player gets the same numbers all day
// and GBIF is only asked once per puzzle.
import { getStore } from "@netlify/blobs";
import { SPECIES, ROUNDS, POOL, candidateOrder, buildChain } from "../../public/specimens.mjs";
import { matchName, countFor, photoFor, gbifLink } from "./gbif.mjs";

// Tests swap in an in-memory store by setting globalThis.__TEST_STORE__.
export const openStore = () => globalThis.__TEST_STORE__ || getStore({ name: "uk-specimens", consistency: "strong" });

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const cleanName = (n) => String(n || "").replace(/[<>"'&`\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
export const validId = (id) => typeof id === "string" && /^[A-Za-z0-9-]{16,64}$/.test(id);

async function taxonKey(store, i) {
  const [, sci, , , rank = "species"] = SPECIES[i];
  const k = `taxon/${sci}`;
  const cached = await store.get(k, { type: "json" });
  if (cached) return cached.key;
  const key = await matchName(sci, rank);
  await store.setJSON(k, { key, at: new Date().toISOString() });
  return key;
}

// Look up one species: taxon key, count and a photo. Returns null if it can't be used today.
async function lookup(store, i) {
  try {
    const key = await taxonKey(store, i);
    if (!key) return null;
    const count = await countFor(key);
    if (!count) return null;
    const [name, sci, group, fact] = SPECIES[i];
    const photo = await photoFor(key, group, sci).catch(() => null);
    // names are saved with the puzzle, so editing the species list later never changes a past day
    return { i, name, sci, group, fact, key, count, photo, link: gbifLink(key) };
  } catch (e) {
    console.error("lookup failed", SPECIES[i][1], e.message);
    return null;
  }
}

export async function getPuzzle(store, puzzle) {
  const pk = `puzzle/${puzzle}`;
  const saved = await store.get(pk, { type: "json" });
  if (saved) return saved;

  const order = candidateOrder(puzzle), found = new Map();
  // look up in batches until there are enough species with records
  for (let start = 0; start < order.length; start += 16) {
    const got = await Promise.all(order.slice(start, start + 16).map((i) => lookup(store, i)));
    got.filter(Boolean).forEach((g) => found.set(g.i, g));
    if (found.size >= POOL) break;
    if (found.size === 0) break; // nothing worked in the first batch: GBIF is probably down, so stop rather than time out
  }
  const chain = buildChain(order, (i) => (found.get(i) || {}).count);
  if (chain.length < ROUNDS + 1) throw new Error("Not enough species could be looked up");

  const record = { puzzle, at: new Date().toISOString(), chain: chain.map((i) => found.get(i)) };
  await store.setJSON(pk, record, { onlyIfNew: true });
  return (await store.get(pk, { type: "json" })) || record; // if two requests raced, everyone uses the first one saved
}

// What the page may see: names, facts and photos for all, but counts only up to `shown`.
export function publicView(record, shown) {
  return record.chain.map((c, n) => ({
    name: c.name, sci: c.sci, group: c.group, fact: c.fact, photo: c.photo, link: c.link, count: n < shown ? c.count : null,
  }));
}
