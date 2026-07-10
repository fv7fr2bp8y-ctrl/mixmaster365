# FreeFrom365 recipe apps

This repository contains two separate product families:

1. **FreeFrom365 recipe apps**: six light recipe PWAs that share one curated recipe catalogue.
2. **MixMaster365**: the existing cocktail and mocktail app at the repository root.

Do not mix their data or deployment work. Recipe-app changes belong in the six app directories and the shared master spreadsheet. The root MixMaster files should only be changed when the cocktail app is explicitly in scope.

## Live recipe apps

| App | Directory | Production domain |
|---|---|---|
| Brunch 365 | `breakfast/` | https://brunch.freefrom365.com |
| Healthy Gut 365 | `free-from/` | https://healthy-gut.freefrom365.com |
| Gluten Free 365 | `gluten-free/` | https://gluten-free.freefrom365.com |
| Dairy Free 365 | `dairy-free/` | https://dairy-free.freefrom365.com |
| Meat Free 365 | `meat-free/` | https://meat-free.freefrom365.com |
| Plant Based 365 | `plant-based/` | https://plant-based.freefrom365.com |

`https://freefrom365.com` and `https://www.freefrom365.com` currently redirect to Healthy Gut 365. The old `breakfast.freefrom365.com` address redirects to `brunch.freefrom365.com`.

Host-based routing is defined in `vercel.json`. Every PWA is served at the root of its own domain even though its files live in a repository subdirectory.

## Current status

Status verified from the generated `data.js` files on 10 July 2026:

| App | Visible recipes | Images | Complete translated recipe records | Recipes with quantities |
|---|---:|---:|---:|---:|
| Brunch | 180 | 180 | 180 | 180 |
| Healthy Gut | 153 | 153 | 153 | 91 |
| Gluten Free | 167 | 167 | 167 | 105 |
| Dairy Free | 161 | 161 | 161 | 99 |
| Meat Free | 195 | 195 | 195 | 133 |
| Plant Based | 143 | 143 | 143 | 81 |

The six supported languages are Bulgarian, English, German, Spanish, French and Russian.

The **180 complete Brunch recipes** milestone is finished. Future additions should continue in curated blocks with quantities, all translations and a real Drive image before they are published.

## Source of truth

The recipe catalogue is not maintained in local HTML or directly in the generated `data.js` files.

- Google spreadsheet: `FreeFrom365 Master Recipes`
- Spreadsheet ID: `1wxcQ28CslNUa_7-hrhkIKEuO6fF2HAkfSrKxRYmIRek`
- Tab: `Master_Recipes`
- Sheet gid: `1571845576`
- Sheet URL: https://docs.google.com/spreadsheets/d/1wxcQ28CslNUa_7-hrhkIKEuO6fF2HAkfSrKxRYmIRek/edit
- Recipe image folder ID: `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`

The spreadsheet and Google Drive are the source of truth. Local recipe data is generated output.

### Publishing rules

A recipe is exported only when all of these conditions are true:

- `status` is `ready`;
- `recipe_quality` is `curated`;
- the app-specific flag is `TRUE`;
- `image_status` is `ready`;
- `image_url` is present.

This deliberately keeps recipes without approved images invisible on the sites.

Each recipe has one stable `global_id`. The app flags decide which catalogues include it, so overlapping recipes are stored once rather than copied into separate tables. The app slot columns determine the order in each app.

## Recipe data requirements

Every new recipe must include:

- a unique stable ID;
- Bulgarian name, description, tag, ingredients and preparation steps;
- realistic ingredient quantities and units;
- preparation time and meal type;
- correct country or cuisine attribution;
- English, German, Spanish, French and Russian translations;
- accurate dietary flags;
- an app ordering slot;
- one approved food image in Google Drive;
- `status=ready`, `recipe_quality=curated` and `image_status=ready` only after review.

Dietary flags must describe the actual ingredients. Do not mark recipes containing dairy as dairy-free, recipes containing wheat as gluten-free, or recipes containing fish as meat-free. Plant-based recipes must contain no meat, fish, eggs, dairy or honey.

Quantities should be useful in a real kitchen. Avoid vague ingredient-only lists, impossible portions, repeated template text and translations that merely fall back to Bulgarian.

## Images

Recipe images live in the shared Google Drive folder and their Drive links are stored in `image_url` in the master sheet.

Image requirements:

- one newly generated image per recipe, not crops from a contact sheet;
- food must visibly match the recipe and key ingredients;
- editorial natural-light food photography;
- no text, logos, watermarks, hands or unrelated garnish;
- no random placeholder services such as LoremFlickr;
- upload to Drive first, then write the final link and `ready` status to the sheet.

Do not add local image paths as a production workaround. Local generated-image folders are working material and are not the catalogue source.

## Synchronizing the apps

Export the current master sheet to a temporary CSV:

```bash
curl -L "https://docs.google.com/spreadsheets/d/1wxcQ28CslNUa_7-hrhkIKEuO6fF2HAkfSrKxRYmIRek/export?format=csv&gid=1571845576" \
  -o /tmp/freefrom365_master.csv
```

Generate the six local data files:

```bash
node scripts/sync-master-recipes.mjs /tmp/freefrom365_master.csv
```

The script writes:

- `breakfast/data.js`
- `free-from/data.js`
- `gluten-free/data.js`
- `dairy-free/data.js`
- `meat-free/data.js`
- `plant-based/data.js`

Never hand-edit these generated files. Fix the master sheet and run the sync again.

## Verification

Check JavaScript syntax and all manifests:

```bash
for file in \
  scripts/sync-master-recipes.mjs \
  breakfast/data.js free-from/data.js gluten-free/data.js \
  dairy-free/data.js meat-free/data.js plant-based/data.js
do
  node --check "$file"
done

for file in \
  breakfast/manifest.json free-from/manifest.json gluten-free/manifest.json \
  dairy-free/manifest.json meat-free/manifest.json plant-based/manifest.json
do
  node -e "JSON.parse(require('fs').readFileSync('$file', 'utf8'))"
done
```

Count the generated recipes:

```bash
for dir in breakfast free-from gluten-free dairy-free meat-free plant-based
do
  printf '%s: ' "$dir"
  node -e "global.window={};require('./$dir/data.js');console.log(window.BREAKFAST_DATA.length)"
done
```

Before publishing, open all six apps at desktop and mobile widths and verify:

- splash and icon render without a frame inside a frame;
- the recipe of the day has a valid image and opens correctly;
- search and filters remain readable in the light theme;
- filter labels change with the language;
- ingredient quantities and steps use the selected language;
- recipe share creates a direct recipe link and has a copy fallback;
- back navigation from a recipe is obvious;
- no broken images or console errors appear;
- service worker and manifest load from the correct app domain.

## App structure

Each recipe directory contains:

- `index.html`: interface, translations, filtering, favourites and sharing;
- `data.js`: generated recipe catalogue;
- `manifest.json`: installable PWA metadata;
- `sw.js`: offline cache;
- `icon-192.png` and `icon-512.png`: PWA icons;
- splash/icon artwork used by that app.

The six apps intentionally share the Brunch visual and interaction system: light editorial layout, recipe of the day, image-only visible catalogue, search, compact filters, favourites, language settings and direct recipe sharing.

When changing cached application files, increment the cache name in the relevant `sw.js` so installed PWAs receive the update.

## Deployment

The recipe apps are deployed through the Vercel project connected to this repository. `vercel.json` maps each custom hostname to its app directory.

Normal release flow:

1. Update the master spreadsheet and Drive assets.
2. Export the CSV and synchronize all six apps.
3. Review the generated counts and diff.
4. Run syntax, manifest and browser checks.
5. Commit only the intended files.
6. Push the current branch to `main`:

```bash
git push origin HEAD:main
```

7. Verify the production domains after Vercel finishes deploying.

Do not stage unrelated OneDrive files, generated contact sheets, old icon candidates, downloaded Google Play packages or other untracked working assets.

## Product roadmap

Current priority order:

1. Review the 48-recipe Brunch expansion in all six languages and polish any machine-assisted phrasing.
2. Complete quantities for all existing recipes in the other five apps.
3. Continue each catalogue toward 365 carefully curated recipes.
4. Perform a six-app editorial, translation and accessibility review.
5. Finalize icons, splash screens, manifests, privacy pages and screenshots.
6. Prepare and validate the six Google Play packages.

## MixMaster365 boundary

The repository root (`index.html`, root `manifest.json`, root `sw.js`, `mocktails/` and the MixMaster assets) belongs to the cocktail application at https://mixmaster365.eu.

MixMaster has its own spreadsheet, image pipeline, PWA settings and Google Play package. It is not part of the FreeFrom365 master recipe sync. Do not modify it while working on Brunch or the five dietary apps unless the task explicitly asks for MixMaster changes.
