// Stand-ins for local testing only: an in-memory Netlify Blobs store and a fake GBIF API with made-up counts.
export function memoryStore() {
  const m = new Map(); let n = 0;
  const tag = () => `e${++n}`;
  return {
    _map: m,
    async get(key, o) { const v = m.get(key); return v ? (o && o.type === "json" ? JSON.parse(v.body) : v.body) : null; },
    async getWithMetadata(key) { const v = m.get(key); return v ? { data: JSON.parse(v.body), etag: v.etag, metadata: {} } : null; },
    async setJSON(key, value, o = {}) {
      const cur = m.get(key);
      if (o.onlyIfNew && cur) return { modified: false };
      if (o.onlyIfMatch && (!cur || cur.etag !== o.onlyIfMatch)) return { modified: false };
      const etag = tag(); m.set(key, { body: JSON.stringify(value), etag }); return { modified: true, etag };
    },
    async list({ prefix = "" } = {}) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).sort().map((key) => ({ key, etag: m.get(key).etag })) }; },
  };
}

const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };

// options.noRecords: names that should come back with zero records; options.down: GBIF unreachable
export function fakeGbif(options = {}) {
  const real = globalThis.fetch;
  globalThis.__gbifCalls = 0;
  globalThis.fetch = async (url, init) => {
    const u = new URL(String(url));
    if (u.hostname !== "api.gbif.org") return real(url, init);
    globalThis.__gbifCalls++;
    if (options.down) return new Response("down", { status: 503 });
    const ok = (o) => new Response(JSON.stringify(o), { status: 200, headers: { "content-type": "application/json" } });
    if (u.pathname === "/v1/species/match") {
      const name = u.searchParams.get("name"), rank = u.searchParams.get("rank");
      if ((options.noMatch || []).includes(name)) return ok({ matchType: "NONE" });
      return ok({ usageKey: hash(name) % 9000000 + 1000, matchType: "EXACT", rank, scientificName: name });
    }
    if (u.pathname === "/v1/occurrence/search") {
      const key = Number(u.searchParams.get("taxonKey"));
      const zero = (options.noRecords || []).some((n) => hash(n) % 9000000 + 1000 === key);
      const count = zero ? 0 : Math.round(Math.exp((hash(String(key)) % 1000) / 1000 * 12)); // 1 to ~160,000
      if (u.searchParams.get("mediaType") === "StillImage") {
        if (key % 3 === 0) return ok({ count, results: [] });
        return ok({ count, results: [{ key: key * 7, institutionCode: "TEST", license: "http://creativecommons.org/licenses/by/4.0/legalcode",
          media: [{ type: "StillImage", identifier: "https://example.invalid/specimen.jpg", rightsHolder: "Test Museum" }] }] });
      }
      return ok({ count, results: [] });
    }
    return new Response("not found", { status: 404 });
  };
  return () => { globalThis.fetch = real; };
}
