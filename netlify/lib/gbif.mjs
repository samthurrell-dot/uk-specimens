// Talks to the free GBIF API (no key needed). Runs on Netlify only; nothing here is sent to the page directly.
// "UK specimens" here means: records published to GBIF by UK-based organisations that are preserved specimens,
// fossil specimens or material samples. That's close to the DiSSCo UK portal's own rule, but not identical
// (the portal also requires each publisher to have a GRSciColl collection entry), so counts are approximate.
import { findPhoto, fetchJSON, matchTaxon } from "../../public/specimens.mjs";
const API = "https://api.gbif.org/v1";
const FILTER = "publishingCountry=GB&basisOfRecord=PRESERVED_SPECIMEN&basisOfRecord=FOSSIL_SPECIMEN&basisOfRecord=MATERIAL_SAMPLE";

const getJSON = (url) => fetchJSON(url, { timeout: 7000, tries: 2 });

// Turn a scientific name into a GBIF taxon key (see matchTaxon in public/specimens.mjs).
export const matchName = (name, rank = "species") => matchTaxon(getJSON, name, rank);

export async function countFor(key) {
  const r = await getJSON(`${API}/occurrence/search?limit=0&taxonKey=${key}&${FILTER}`);
  return typeof r.count === "number" ? r.count : null;
}

// One openly licensed photo (paperwork filtered out), with credit, or null. Tries UK specimens, then specimens
// anywhere, then living examples; photo.kind says which.
export async function photoFor(key, group) {
  return (await findPhoto(getJSON, key, group)).photo;
}

// Link to the same records on GBIF so players can explore them.
export const gbifLink = (key) =>
  `https://www.gbif.org/occurrence/search?taxon_key=${key}&publishing_country=GB&basis_of_record=PRESERVED_SPECIMEN&basis_of_record=FOSSIL_SPECIMEN&basis_of_record=MATERIAL_SAMPLE`;
