// Reading finished rounds for the leaderboard. Keys: day/<puzzle>/<playerId> = {name, score, marks, at}
export async function dayRows(store, puzzle) {
  const { blobs } = await store.list({ prefix: `day/${puzzle}/` });
  const rows = await Promise.all(blobs.slice(0, 2000).map(async (b) => {
    const e = await store.get(b.key, { type: "json" });
    return e && { ...e, id: b.key.split("/")[2] };
  }));
  return rows.filter(Boolean);
}

export async function allRows(store) {
  const { blobs } = await store.list({ prefix: "day/" });
  const rows = await Promise.all(blobs.slice(0, 5000).map(async (b) => {
    const [, puzzle, id] = b.key.split("/");
    const e = await store.get(b.key, { type: "json" });
    return e && { ...e, id, puzzle: Number(puzzle) };
  }));
  return rows.filter(Boolean);
}

// all-time totals per player, with their current daily streak
export function totals(rows, today) {
  const by = new Map();
  for (const r of rows) {
    const p = by.get(r.id) || { id: r.id, name: r.name, total: 0, played: 0, best: 0, days: new Set(), lastAt: "" };
    p.total += r.score; p.played += 1; p.best = Math.max(p.best, r.score); p.days.add(r.puzzle);
    if ((r.at || "") >= p.lastAt) { p.lastAt = r.at || ""; p.name = r.name; }
    by.set(r.id, p);
  }
  return [...by.values()].map((p) => {
    let streak = 0, d = p.days.has(today) ? today : today - 1;
    while (p.days.has(d)) { streak++; d--; }
    return { id: p.id, name: p.name, total: p.total, played: p.played, best: p.best,
      average: Math.round((p.total / Math.max(1, p.played)) * 10) / 10, streak };
  });
}
