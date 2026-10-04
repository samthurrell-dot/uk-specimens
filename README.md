# UK Specimens

Small projects built on Britain's natural science collections, using open data from
[DiSSCo UK](https://dissco-uk.org/) via the [GBIF API](https://techdocs.gbif.org/en/openapi/).

## More or less?

A daily game. You see a species and how many UK specimens there are, then guess whether the next one has
more or fewer. Ten guesses, one go a day, new puzzle at midnight UK time. No. 1 = 4 October 2026.

- `public/specimens.mjs` is shared by the page and the server: species list, daily selection, marking.
- `netlify/lib/gbif.mjs` asks GBIF for each species' taxon key, record count and one openly licensed photo.
- `netlify/lib/puzzle.mjs` builds each day's chain once and saves it in Netlify Blobs, so everyone gets the same numbers all day.
- `netlify/functions/` — `/api/today`, `/api/play` (marks each guess on the server), `/api/leaderboard`.

### What the counts mean

Records published to GBIF by UK-based organisations that are preserved specimens, fossil specimens or material
samples. The DiSSCo UK portal also requires each publisher to have a GRSciColl collection entry, so its numbers
can differ a little. Counts change as museums publish more records.

### No-server version (docs/index.html)

A single self-contained HTML file that asks GBIF directly from the browser and keeps progress and scores on the
device. No leaderboard, but it can run from a downloaded file or from GitHub Pages (Settings → Pages → main, /docs),
which costs no Netlify credits. Rebuild it after changing the species list or styles with `npm run build:static`.

### Testing locally

```
npm install
npm test        # plays full rounds against the real function code with in-memory Blobs and fake GBIF numbers
npm run dev     # local server on http://localhost:8888 with fake numbers
```

Colours are from Sanzo Wada's *A Dictionary of Color Combinations* via Matt DesLauriers' dataset (MIT);
hex values are converted from print and approximate.
