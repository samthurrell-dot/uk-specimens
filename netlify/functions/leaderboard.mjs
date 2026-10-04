// GET /api/leaderboard?scope=day|all&puzzle=N&me=<playerId>
// Names and scores only; player ids are never sent back.
import { puzzleNumber } from "../../public/specimens.mjs";
import { openStore, json } from "../lib/puzzle.mjs";
import { dayRows, allRows, totals } from "../lib/scores.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") === "all" ? "all" : "day";
  const today = puzzleNumber();
  const me = url.searchParams.get("me") || "";
  const store = openStore();

  if (scope === "day") {
    let puzzle = parseInt(url.searchParams.get("puzzle") || today, 10);
    if (!Number.isInteger(puzzle) || puzzle < 1 || puzzle > today) puzzle = today;
    const rows = (await dayRows(store, puzzle)).map((r) => ({ name: r.name, score: r.score, marks: r.marks, at: r.at, me: r.id === me }));
    rows.sort((a, b) => b.score - a.score || (a.at < b.at ? -1 : 1));
    rows.forEach((r, k) => { r.rank = k + 1; delete r.at; });
    return json({ scope, puzzle, today, players: rows.length, rows: rows.slice(0, 50), mine: rows.find((r) => r.me) || null });
  }

  const rows = totals(await allRows(store), today).map(({ id, ...p }) => ({ ...p, me: id === me }));
  rows.sort((a, b) => b.total - a.total || b.average - a.average);
  rows.forEach((r, k) => (r.rank = k + 1));
  return json({ scope, today, players: rows.length, rows: rows.slice(0, 50), mine: rows.find((r) => r.me) || null });
};

export const config = { path: "/api/leaderboard" };
