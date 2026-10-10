// Plays full rounds against the real function code, with in-memory Blobs and fake GBIF numbers.
// Run: npm test
import assert from "node:assert/strict";
import { memoryStore, fakeGbif } from "./fakes.mjs";
import { ROUNDS, SPECIES, puzzleNumber, isRight, candidateOrder, buildChain } from "../public/specimens.mjs";
import today from "../netlify/functions/today.mjs";
import play from "../netlify/functions/play.mjs";
import leaderboard from "../netlify/functions/leaderboard.mjs";

const base = "http://localhost";
const get = async (fn, path) => { const r = await fn(new Request(base + path)); return { status: r.status, body: await r.json() }; };
const post = async (fn, path, body) => { const r = await fn(new Request(base + path, { method: "POST", body: JSON.stringify(body) })); return { status: r.status, body: await r.json() }; };
let passed = 0; const ok = (msg) => { passed++; console.log("  ✓", msg); };

// --- species list sanity
const names = new Set();
for (const s of SPECIES) {
  assert.equal(typeof s[0], "string"); assert.ok(s[1] && s[2] && s[3], `incomplete entry ${s[0]}`);
  assert.ok(!names.has(s[1]), `duplicate ${s[1]}`); names.add(s[1]);
  assert.ok(s[3].length <= 90, `fact too long for a phone: ${s[0]}`);
}
ok(`${SPECIES.length} species, no duplicates, all have facts`);
assert.equal(isRight(10, 20, "more"), true); assert.equal(isRight(10, 20, "fewer"), false);
assert.equal(isRight(20, 10, "fewer"), true); assert.equal(isRight(5, 5, "more"), true); assert.equal(isRight(5, 5, "fewer"), true);
ok("marking rules, including ties");
const fakeCount = (i) => Math.round(Math.exp(((i * 2654435761) % 1000) / 1000 * 12));
let gapsFirst = 0, gapsLast = 0, ups = 0, repeats = 0;
for (let p = 1; p <= 60; p++) {
  const chain = buildChain(candidateOrder(p).slice(0, 36), fakeCount);
  assert.equal(chain.length, ROUNDS + 1);
  assert.equal(new Set(chain).size, chain.length, "a species repeated");
  assert.deepEqual(buildChain(candidateOrder(p).slice(0, 36), fakeCount), chain, "not repeatable");
  const r = (k) => Math.max(fakeCount(chain[k]), fakeCount(chain[k + 1])) / Math.min(fakeCount(chain[k]), fakeCount(chain[k + 1]));
  gapsFirst += r(0) / 60; gapsLast += r(ROUNDS - 1) / 60;
  for (let k = 0; k < ROUNDS; k++) { if (fakeCount(chain[k + 1]) > fakeCount(chain[k])) ups++; if (SPECIES[chain[k]][2] === SPECIES[chain[k + 1]][2]) repeats++; }
}
console.log(`    first pair ~${gapsFirst.toFixed(1)}x apart, last pair ~${gapsLast.toFixed(2)}x apart, ${Math.round(ups / 6)}% "more", ${(repeats / 6).toFixed(0)}% same-group pairs`);
assert.ok(gapsFirst > 2.5 && gapsLast < 1.6, "pairs don't get closer");
assert.ok(ups / 600 > 0.35 && ups / 600 < 0.65, "answers are lopsided");
ok("daily chain: 11 species, repeatable, pairs narrow from wide to close, mixed answers");

// --- GBIF down: friendly error, nothing saved
{
  globalThis.__TEST_STORE__ = memoryStore();
  const restore = fakeGbif({ down: true });
  const r = await get(today, "/api/today");
  assert.equal(r.status, 503); assert.match(r.body.error, /couldn't be reached/);
  assert.equal(globalThis.__TEST_STORE__._map.has(`puzzle/${puzzleNumber()}`), false);
  restore(); ok("GBIF unreachable gives a friendly message and saves no puzzle");
}

// --- normal day
const store = memoryStore(); globalThis.__TEST_STORE__ = store;
const firstPicks = candidateOrder(puzzleNumber()).slice(0, 3).map((i) => SPECIES[i][1]);
const restore = fakeGbif({ noRecords: [firstPicks[0]], noMatch: [firstPicks[1]] });
const A = "player-aaaa-aaaa-aaaa-0001", B = "player-bbbb-bbbb-bbbb-0002";

let t = await get(today, `/api/today?me=${A}`);
assert.equal(t.status, 200); assert.equal(t.body.species.length, ROUNDS + 1);
assert.ok(t.body.species[0].count > 0); assert.ok(t.body.species.slice(1).every((s) => s.count === null));
assert.ok(!t.body.species.some((s) => s.sci === firstPicks[0] || s.sci === firstPicks[1]));
ok("today: 11 species, only the first count is shown, zero-record and unmatched species skipped");

const calls = globalThis.__gbifCalls;
await get(today, `/api/today?me=${B}`);
assert.equal(globalThis.__gbifCalls, calls); ok("second player reuses the saved puzzle (no new GBIF calls)");

// hidden counts, worked out from the saved puzzle for checking
const saved = await store.get(`puzzle/${puzzleNumber()}`, { type: "json" });
const counts = saved.chain.map((c) => c.count);

// play a full round as A, always guessing "more"
let right = 0;
for (let step = 0; step < ROUNDS; step++) {
  const r = await post(play, "/api/play", { playerId: A, name: "Sam", puzzle: t.body.puzzle, step, guess: "more" });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.right, isRight(counts[step], counts[step + 1], "more"));
  assert.equal(r.body.count, counts[step + 1]);
  assert.equal(r.body.species.filter((s) => s.count !== null).length, step + 2, "reveals exactly one more count");
  right += r.body.right ? 1 : 0;
  if (step < ROUNDS - 1) assert.equal(r.body.entry, undefined);
  else { assert.equal(r.body.entry.score, right); assert.equal(r.body.rank, 1); assert.equal(r.body.of, 1); }
}
ok(`full round as Sam: ${right}/10, marked on the server, one count revealed per guess`);

let again = await post(play, "/api/play", { playerId: A, name: "Sam", puzzle: t.body.puzzle, step: 3, guess: "fewer" });
assert.equal(again.status, 409); ok("replaying an earlier guess is refused");
again = await post(play, "/api/play", { playerId: B, name: "Jo", puzzle: t.body.puzzle, step: 2, guess: "more" });
assert.equal(again.status, 409); ok("skipping ahead is refused");

t = await get(today, `/api/today?me=${A}`);
assert.equal(t.body.entry.score, right); assert.ok(t.body.species.every((s) => s.count !== null));
ok("reloading after finishing shows the result and all counts");

// B plays perfectly
for (let step = 0; step < ROUNDS; step++) {
  const g = counts[step + 1] >= counts[step] ? "more" : "fewer";
  const r = await post(play, "/api/play", { playerId: B, name: "Jo <b>", puzzle: t.body.puzzle, step, guess: g });
  assert.equal(r.body.right, true);
  if (step === ROUNDS - 1) { assert.equal(r.body.entry.score, 10); assert.equal(r.body.rank, 1); assert.equal(r.body.of, 2); assert.equal(r.body.entry.name, "Jo b"); }
}
ok("second player: perfect round ranks first; name is cleaned");

// half-finished round for a third player shouldn't appear on the leaderboard
const C = "player-cccc-cccc-cccc-0003";
await post(play, "/api/play", { playerId: C, name: "Al", puzzle: t.body.puzzle, step: 0, guess: "more" });

const lb = await get(leaderboard, `/api/leaderboard?scope=day&me=${A}`);
assert.equal(lb.body.players, 2); assert.equal(lb.body.rows[0].name, "Jo b"); assert.equal(lb.body.mine.name, "Sam");
assert.ok(!JSON.stringify(lb.body).includes("player-")); ok("day leaderboard: 2 finished players, ids never sent");
const all = await get(leaderboard, `/api/leaderboard?scope=all&me=${B}`);
assert.equal(all.body.rows[0].total, 10); assert.equal(all.body.rows[0].streak, 1); ok("all-time leaderboard with streaks");

// bad input
assert.equal((await post(play, "/api/play", { playerId: A, name: "Sam", puzzle: 999, step: 0, guess: "more" })).status, 400);
assert.equal((await post(play, "/api/play", { playerId: "x", name: "Sam", puzzle: 1, step: 0, guess: "more" })).status, 400);
assert.equal((await post(play, "/api/play", { playerId: A, name: "S", puzzle: 1, step: 0, guess: "more" })).status, 400);
assert.equal((await post(play, "/api/play", { playerId: A, name: "Sam", puzzle: 1, step: 0, guess: "maybe" })).status, 400);
ok("bad requests are refused");

restore();
console.log(`\nAll ${passed} checks passed.`);
