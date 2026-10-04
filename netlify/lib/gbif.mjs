// Talks to the free GBIF API (no key needed). Runs on Netlify only; nothing here is sent to the page directly.
// "UK specimens" here means: records published to GBIF by UK-based organisations that are preserved specimens,
// fossil specimens or material samples. That's close to the DiSSCo UK portal's own rule, but not identical
// (the portal also requires each publisher to have a GRSciColl collection entry), so counts are approximate.
const API = "https://api.gbif.org/v1";
const FILTER = "publishingCountry=GB&basisOfRecord=PRESERVED_SPECIMEN&basisOfRecord=FOSSIL_SPECIMEN&basisOfRecord=MATERIAL_SAMPLE";

async function getJSON(url, ms = 7000) {
  const res = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`GBIF ${res.status} for ${url}`);
  return res.json();
}

// Turn a scientific name into a GBIF taxon key. Only accepts a clear match at the expected rank,
// so a typo can't quietly count a whole genus or family instead.
export async function matchName(name, rank = "species") {
  const m = await getJSON(`${API}/species/match?name=${encodeURIComponent(name)}&rank=${rank.toUpperCase()}&strict=true`);
  if (!m || !m.usageKey || m.matchType === "NONE" || m.matchType === "HIGHERRANK") return null;
  if (m.rank && m.rank !== rank.toUpperCase()) return null;
  return m.acceptedUsageKey || m.usageKey;
}

export async function countFor(key) {
  const r = await getJSON(`${API}/occurrence/search?limit=0&taxonKey=${key}&${FILTER}`);
  return typeof r.count === "number" ? r.count : null;
}

const okLicence = (l = "") => /publicdomain\/zero|licenses\/by\/|licenses\/by-nc\/|^CC0|^CC_BY(_NC)?(_|$)/i.test(l);
const licenceLabel = (l = "") => /zero|CC0/i.test(l) ? "CC0" : /by-nc|BY_NC/i.test(l) ? "CC BY-NC" : "CC BY";

// One openly licensed specimen photo, with credit, or null.
export async function photoFor(key) {
  const r = await getJSON(`${API}/occurrence/search?limit=10&mediaType=StillImage&taxonKey=${key}&${FILTER}`);
  for (const o of r.results || []) {
    for (const m of o.media || []) {
      const url = m.identifier || "", lic = m.license || o.license || "";
      if (m.type !== "StillImage" || !/^https:\/\//.test(url) || !okLicence(lic)) continue;
      const who = m.rightsHolder || m.creator || o.institutionCode || o.datasetName || "the publishing museum";
      return { url, credit: String(who).slice(0, 80), licence: licenceLabel(lic), occurrence: o.key };
    }
  }
  return null;
}

// Link to the same records on GBIF so players can explore them.
export const gbifLink = (key) =>
  `https://www.gbif.org/occurrence/search?taxon_key=${key}&publishing_country=GB&basis_of_record=PRESERVED_SPECIMEN&basis_of_record=FOSSIL_SPECIMEN&basis_of_record=MATERIAL_SAMPLE`;
