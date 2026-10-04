// POST /api/play {playerId, name, puzzle, step, guess}
// Marks one guess on the server and reveals the next count. Guesses are saved as they're made,
// so a round can't be restarted to try again. After the tenth guess the round goes on the leaderboard.
import { ROUNDS, puzzleNumber, isRight } from "../../public/specimens.mjs";
import { openStore, getPuzzle, publicView, json, validId, cleanName } from "../lib/puzzle.mjs";
import { dayRows } from "../lib/scores.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Send guesses with POST." }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "That request couldn't be read." }, 400); }
  const { playerId, name, puzzle, step, guess } = body || {};

  if (!validId(playerId)) return json({ error: "Missing player id." }, 400);
  const nm = cleanName(name);
  if (nm.length < 2) return json({ error: "Choose a name of at least 2 characters." }, 400);
  if (guess !== "more" && guess !== "fewer") return json({ error: "Guess 'more' or 'fewer'." }, 400);
  const today = puzzleNumber();
  if (!Number.isInteger(puzzle) || puzzle < Math.max(1, today - 1) || puzzle > today)
    return json({ error: "That puzzle has closed. Rounds count on the day (UK time)." }, 400);
  if (!Number.isInteger(step) || step < 0 || step >= ROUNDS) return json({ error: "Unknown step." }, 400);

  const store = openStore();
  let record;
  try { record = await getPuzzle(store, puzzle); }
  catch { return json({ error: "The museum data couldn't be reached just now. Please try again in a minute." }, 503); }

  const pk = `prog/${puzzle}/${playerId}`;
  const cur = await store.getWithMetadata(pk, { type: "json" });
  const prog = (cur && cur.data) || { name: nm, guesses: [], marks: [], started: new Date().toISOString() };
  const state = () => ({ species: publicView(record, prog.marks.length + 1), progress: { guesses: prog.guesses, marks: prog.marks } });

  // only the next unanswered step can be played (stops double taps and replays)
  if (prog.marks.length !== step) return json({ error: "That guess has already been made.", ...state() }, 409);

  const c = record.chain;
  const right = isRight(c[step].count, c[step + 1].count, guess);
  prog.guesses.push(guess); prog.marks.push(right ? 1 : 0); prog.name = nm;
  const write = await store.setJSON(pk, prog, cur && cur.etag ? { onlyIfMatch: cur.etag } : { onlyIfNew: true });
  if (write && write.modified === false) {
    const again = await store.get(pk, { type: "json" });
    if (again) { prog.guesses = again.guesses; prog.marks = again.marks; }
    return json({ error: "That guess has already been made.", ...state() }, 409);
  }

  const out = { right, count: c[step + 1].count, ...state() };
  if (prog.marks.length === ROUNDS) {
    const score = prog.marks.reduce((a, b) => a + b, 0);
    const entry = { name: nm, score, marks: prog.marks, at: new Date().toISOString() };
    await store.setJSON(`day/${puzzle}/${playerId}`, entry, { onlyIfNew: true });
    const saved = (await store.get(`day/${puzzle}/${playerId}`, { type: "json" })) || entry;
    const rows = await dayRows(store, puzzle);
    const better = rows.filter((e) => e.score > saved.score || (e.score === saved.score && e.at < saved.at)).length;
    out.entry = saved; out.rank = better + 1; out.of = rows.length;
  }
  return json(out);
};

export const config = { path: "/api/play" };
