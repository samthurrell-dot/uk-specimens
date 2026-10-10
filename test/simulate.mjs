// Simulate daily puzzles. With no argument it uses stand-in counts; pass a JSON file of {sci: count} for real ones.
// Run: node test/simulate.mjs [counts.json] [days]
import { readFileSync } from "node:fs";
import { SPECIES, ROUNDS, simulate, simSummary, puzzleNumber } from "../public/specimens.mjs";
const known = { "Sciurus carolinensis": 4460, "Taxus brevifolia": 129, "Pica pica": 1162, "Salix alba": 1190, "Clathrus archeri": 81,
  "Calluna vulgaris": 1553, "Cygnus olor": 100, "Salmo salar": 701, "Welwitschia mirabilis": 95, "Troglodytes troglodytes": 447, "Hyacinthoides non-scripta": 711 };
const h = (s) => { let x = 2166136261; for (const c of s) x = Math.imul(x ^ c.charCodeAt(0), 16777619) >>> 0; return x; };
const normal = (s) => { const u = (h(s) % 10000 + 0.5) / 10000, v = (h(s + "#") % 10000 + 0.5) / 10000; return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const counts = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8"))
  : Object.fromEntries(SPECIES.map(([, sci]) => [sci, known[sci] || Math.max(3, Math.round(Math.exp(Math.log(800) + 1.8 * normal(sci))))]));
const days = simulate(counts, puzzleNumber(), Number(process.argv[3] || 90)), s = simSummary(days);
const x = (r) => (r >= 10 ? Math.round(r) : r.toFixed(2)) + "x";
console.log(`${process.argv[2] ? "Real" : "Stand-in"} counts, ${s.days} days`);
console.log("Average gap by guess:", s.byStep.map(x).join(", "));
console.log(`Expected score: keen ${s.keen.toFixed(1)}/10, casual ${s.casual.toFixed(1)}/10`);
const ks = days.filter((d) => !d.failed).map((d) => d.keen).sort((a, b) => a - b);
console.log(`Keen score range: hardest day ${ks[0].toFixed(1)}, easiest day ${ks[ks.length - 1].toFixed(1)}`);
console.log(`Days ending on an easy pair (>1.6x): ${s.easyEnd}/${s.days} · failed: ${s.failed}`);
console.log(`"More" per day: ${s.ups.toFixed(1)} · same-group pairs per day: ${s.sameGroup.toFixed(1)}`);
console.log(`Different species used: ${s.species}/${SPECIES.length} · most used: ${s.most.join(", ")}`);
const d = days.find((d) => !d.failed); console.log(`\nExample, No. ${d.puzzle}:`, d.names.map((n, k) => `${n} ${d.counts[k]}`).join(" > "));
