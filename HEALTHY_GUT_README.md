# Healthy Gut 365

Updated: 2026-07-07

Healthy Gut 365 is the gluten-free and dairy-free recipe app inside the MixMaster365 repository.

## App

- Local file: `free-from/index.html`
- Service worker: `free-from/sw.js`
- Manifest: `free-from/manifest.json`
- Web start URL: `https://mixmaster365.eu/free-from/`
- Local preview URL used in Codex: `file:///Users/spasspasov/Library/CloudStorage/OneDrive-Personal/App%20Projects/MixMaster365/free-from/index.html`
- Google Play package planned in prep docs: `eu.healthygut365.twa`

## Current Status

- Recipes in the app: 36
- Recipes in Google Sheet: 365
- Ready Drive images in Google Sheet: 36
- Missing Drive images: 329
- Image source policy: Google Drive URLs only. Do not switch the app back to local recipe images.
- App image rendering converts Drive file URLs to thumbnail URLs with `imageSrc()`.
- Current service worker cache: `healthy-gut-365-v18`

## Google Sheet

- Spreadsheet title: `healthy_gut_365_final` (local export: `local-assets/data-exports/healthy_gut_365_final.xlsx`)
- Spreadsheet ID: `1GT8j75VnRNwtqfhoc3XiUFyZQeETDi_bRGs1ALSyMBM`
- URL: `https://docs.google.com/spreadsheets/d/1GT8j75VnRNwtqfhoc3XiUFyZQeETDi_bRGs1ALSyMBM/edit`
- Main tab: `healthy_gut_365`
- Sheet ID: `492315616`

Columns:

| Column | Name |
| --- | --- |
| A | `id` |
| B | `name` |
| C | `category` |
| D | `time` |
| E | `tag` |
| F | `image` |
| G | `image_status` |
| H | `old_placeholder_image` |
| I | `ingredients` |
| J | `steps` |
| K | `image_prompt` |

Rows with `image_status=ready` are ready for the app. Rows with `missing_drive_image` still need generated food photos.

## Drive Folder

- Folder name: `Healthy Gut 365 Images`
- Folder ID: `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`
- Folder URL: `https://drive.google.com/drive/folders/1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`

Every generated image must be uploaded into this folder and must be accessible by link. The app should store the canonical Drive file URL in the sheet:

```text
https://drive.google.com/file/d/<FILE_ID>/view?usp=drivesdk
```

The app then renders it as:

```text
https://drive.google.com/thumbnail?id=<FILE_ID>&sz=w1200
```

## Generated Image Batches

Local generated images are archived under:

```text
local-assets/generated/healthy-gut/
```

Known batches:

- `batch-013-024/`
- `batch-025-036/`

These local files are only archives/reference assets. The production app uses the Drive URLs from the sheet.

## Apps Script Automation

Apps Script reference file:

```text
google-apps-script/healthy-gut-image-generator.gs
```

Purpose:

1. Reads rows from the Google Sheet.
2. Finds rows without an image and not marked `ready`.
3. Uses `image_prompt` to generate food images through the OpenAI Images API.
4. Uploads each image into the Drive folder.
5. Sets Drive sharing to anyone with link.
6. Writes the Drive URL into column F.
7. Writes `ready` into column G.

Setup in Google Sheets:

1. Open the Healthy Gut sheet.
2. Go to `Extensions` -> `Apps Script`.
3. Paste `google-apps-script/healthy-gut-image-generator.gs` into `Code.gs`.
4. Add Script Property:

```text
OPENAI_API_KEY=<OpenAI API key>
```

5. Run `generateNextHealthyGutBatch` once and approve permissions.
6. Use the custom menu `Healthy Gut Images`.

Recommended automation:

- Generate next 1 or 2 manually when checking quality.
- Use `Create 15 min trigger` only when comfortable with automatic generation and API costs.

## Splash And Branding

Healthy Gut splash was updated to remove the double-frame logo issue.

Current behavior:

- No extra square frame around the logo.
- Logo has a soft drop shadow.
- Thin rotating halo accent behind the logo.
- Subtle breathing animation.
- Thin animated progress line.
- `prefers-reduced-motion` disables animation for users who prefer reduced motion.

Relevant files:

- `free-from/index.html`
- `free-from/logo-source.png`
- `free-from/icon-192.png`
- `free-from/icon-512.png`

## Google Play Prep

See:

```text
google-play-assets/PLAY_PREP.md
google-play-assets/healthy-gut-store-listing-bg.md
```

Important values:

- App name: `Healthy Gut 365`
- Start URL: `https://mixmaster365.eu/free-from/`
- Package: `eu.healthygut365.twa`
- Privacy policy: `https://mixmaster365.eu/privacy.html`

Before building Android:

1. Push the latest GitHub commit to `main`.
2. Wait for GitHub Pages to publish.
3. Open `https://mixmaster365.eu/free-from/` and confirm the latest recipes and splash.
4. Generate the Android bundle from the published URL.
5. Update `.well-known/assetlinks.json` if Play App Signing gives a different SHA-256.

## Development Rules

- Keep edits scoped to `free-from/` unless working on shared publishing assets.
- Increase `CACHE_NAME` in `free-from/sw.js` after every user-visible change.
- Keep generated recipe photos in Drive and the Google Sheet.
- Do not commit local generated image batches unless explicitly requested.
- Do not commit API keys.
- If adding recipes to the local app, validate:

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('free-from/index.html','utf8');
const match = html.match(/const recipes = (\[[\s\S]*?\n    \]);/);
const recipes = Function(`return ${match[1]}`)();
console.log('recipes', recipes.length);
console.log('driveImages', recipes.filter(r => /^https:\/\/drive\.google\.com\/file\/d\//.test(r.img)).length);
console.log('missingImg', recipes.filter(r => !r.img).length);
console.log('uniqueIds', new Set(recipes.map(r => r.id)).size);
NODE
```

Expected after the latest update:

```text
recipes 36
driveImages 36
missingImg 0
uniqueIds 36
```
