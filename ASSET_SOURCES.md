# Asset sources

The original Knight Game CSS and every image it references are stored locally. The site does not request art or styles from the game server at runtime.

| Local files | Original source |
| --- | --- |
| `assets/source-css/base.css` | `https://knightgameserver3.evilgrog.com/static/css/base.css` |
| `assets/source-css/style.css` | `https://knightgameserver3.evilgrog.com/static/mobilemiddleages/css/style.css` |
| `assets/source-css/regular.css` | `https://knightgameserver3.evilgrog.com/static/mobilemiddleages/css/regular.css` |
| `assets/source-css/retina.css` | `https://knightgameserver3.evilgrog.com/static/mobilemiddleages/css/retina.css` |
| `assets/source-css/advanced.css` | `https://knightgameserver3.evilgrog.com/static/mobilemiddleages/css/advanced.css` |
| `assets/images/game/source/mobilemiddleages/img/**` | `https://knightgameserver3.evilgrog.com/static/mobilemiddleages/img/**` |
| `assets/images/game/source/img/**` | `https://knightgameserver3.evilgrog.com/static/img/**` |

There are 263 unique downloaded image files: 255 under `mobilemiddleages/img/` and 8 under `img/`. This includes the background, header/title plates, world map, home key visual, tab navigation sprite, panel textures and trims, item art and smaller game icons.

## wgweb source carried over

- The homepage menu hierarchy, section tabs, footer text, list pages and calculator types follow the local `wgweb` source.
- `assets/css/kg-assets.css` maps the original WgHelp layout to Knight Game textures and applies the Knight `#newsFeed` System row rules from `style.css` and `retina.css`. The full original game CSS remains in `assets/source-css/` for reference.
- The homepage art, category symbols, chevrons, map, textures and icons now point directly to the downloaded source files under `assets/images/game/source/`.
- `retina.css` maps Weapons to item art `1–30` and premium art `501–505`, Shields to `1001–1030` and `1501–1505`, and Armour to `2001–2030` and `2501–2505`. The same stylesheet supplies the item frames and stat icon sprites used by the equipment lists.
- The More page uses the Knight Game footer sprite for the Equipment helmet and the More navigation sprite for the Vassals, Tips question mark, and Tools gear icons. Menu arrows use the local `icon_chevron_2x.png` asset.
- The user-supplied Duel HTML contains 14 enemy vassal entries with names, attack, defence, and item art IDs `10001–10014`. Its negative upkeep values are displayed as positive income per the user's correction. Its displayed quantities belong to that opponent's order and are not used as general owned counts or unlock requirements.
- `retina.css` maps four additional images as `Premium Economy`, IDs `11001–11004`. They are not included in the ranked Vassals list because the supplied game HTML has no names or stats for them.
- No War Game troop, building or calculator values are used as Knight Game data.
