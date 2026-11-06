# Knight Game Helper

A small static companion site for Knight Game, built with plain HTML, CSS, and JavaScript.

## Run locally

Serve the project folder with a static file server so folder routes resolve as they will on GitHub Pages:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Project layout

- `index.html` is the home page.
- Root route folders hold the pages served at extensionless URLs: `tips/`, `vassals/`, `equipment/`, and `tools/`.
- Nested route folders hold category and calculator pages, such as `equipment/weapons/` and `tools/best-army/`.
- `assets/css/` and `scripts/` hold the shared styles and site scripts.
- `assets/images/game/source/` keeps Knight Game artwork in its original static path structure.
- `assets/source-css/` contains the five supplied Knight Game stylesheets.

GitHub Pages serves each route folder's `index.html` as an extensionless URL, such as `/tips/`. The trailing slash may be added by GitHub Pages automatically. Internal links use these route paths instead of `.html` filenames.

`scripts/site.js` builds the shared header, WgHelp-style section tabs, footer disclaimer and home accordion.

The equipment section has the three Knight Game categories: Weapons, Shields, and Armour. Its 30 regular item images and five premium images per category are mapped from the IDs in `retina.css`. The Vassals guide lists 14 regular vassals from weakest to strongest, with positive income, attack, defence, original game portraits, and the game's panel spacing. Four additional Premium Economy portraits are mapped in CSS, but the supplied HTML does not provide their names or stats. Unlock levels, most recruitment costs, and calculator formulas remain empty until confirmed; War Game values are not reused.

The page structure follows the local `wgweb` source. The visual layer uses the Knight Game textures, panel trims, icons and sprites. The supplied game stylesheets and all 263 referenced images are stored locally, so the site does not need the game server at runtime. See [ASSET_SOURCES.md](ASSET_SOURCES.md) for the mapping.
