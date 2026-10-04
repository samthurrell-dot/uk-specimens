// GET /api/today?me=<playerId>[&puzzle=N]
// Today's chain of species. Counts are only included for species the player has already reached,
// so the answers can't be read from the page.
import { ROUNDS, puzzleNumber, puzzleDate } from "../../public/specimens.mjs";
import { openStore, getPuzzle, publicView, json, validId } from "../lib/puzzle.mjs";

export default async (req) => {
  const url = new URL(req.url);
  const today = puzzleNumber();
  let puzzle = parseInt(url.searchParams.get("puzzle") || today, 10);
  if (!Number.isInteger(puzzle) || puzzle < Math.max(1, today - 1) || puzzle > today) puzzle = today;
  const me = url.searchParams.get("me") || "";
  const store = openStore();

  let record;
  try { record = await getPuzzle(store, puzzle); }
  catch (e) {
    console.error(e);
    return json({ error: "The museum data couldn't be reached just now. Please try again in a minute." }, 503);
  }

  const prog = validId(me) ? (await store.get(`prog/${puzzle}/${me}`, { type: "json" })) : null;
  const entry = validId(me) ? (await store.get(`day/${puzzle}/${me}`, { type: "json" })) : null;
  const marks = (prog && prog.marks) || [];
  return json({
    puzzle, today, date: puzzleDate(puzzle), rounds: ROUNDS,
    species: publicView(record, marks.length + 1),
    progress: { guesses: (prog && prog.guesses) || [], marks },
    entry,
  });
};

export const config = { path: "/api/today" };
