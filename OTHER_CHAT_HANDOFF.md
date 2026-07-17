# Handoff For Another Chat

Use this when continuing MixMaster365 / Healthy Gut 365 in another Codex chat.

## Current Goal

We are preparing the `Healthy Gut 365` gluten-free and dairy-free recipe app for Google Play. The app is in the same repo as MixMaster365 and Brunch.

The immediate direction is:

1. Continue generating real food images for the remaining Healthy Gut recipes.
2. Keep every generated image in Google Drive.
3. Keep the Google Sheet as the source of truth for image URLs.
4. Keep the local app updated with each ready recipe batch.
5. Prepare Play-ready screenshots and Android packaging when enough content is ready.

## Repository

- Local repo: `/Users/spasspasov/Library/CloudStorage/OneDrive-Personal/App Projects/MixMaster365`
- GitHub repo: `https://github.com/fv7fr2bp8y-ctrl/mixmaster365`
- Branch used in Codex: `healthy-gut-ready-only`
- Remote target: `origin main`
- Live site root: `https://mixmaster365.eu`
- Healthy Gut URL: `https://mixmaster365.eu/free-from/`

## Latest Important Commits

These were pushed to `main`:

- `2c3bf46 Add Healthy Gut image generator Apps Script`
- `e86b978 Add next Healthy Gut recipes and Drive images`
- `217bc4b Refine Healthy Gut splash animation`
- `81a0dc0 Add Healthy Gut recipes 25 to 36`

Current local validation after `81a0dc0`:

```text
recipes 36
driveImages 36
missingImg 0
uniqueIds 36
```

## App Files

- Main app: `free-from/index.html`
- Service worker: `free-from/sw.js`
- Manifest: `free-from/manifest.json`
- Logo: `free-from/logo-source.png`
- Icons: `free-from/icon-192.png`, `free-from/icon-512.png`

Current service worker cache:

```text
healthy-gut-365-v18
```

Always bump this after visible changes.

## Google Sheet

- URL: `https://docs.google.com/spreadsheets/d/1GT8j75VnRNwtqfhoc3XiUFyZQeETDi_bRGs1ALSyMBM/edit`
- Spreadsheet ID: `1GT8j75VnRNwtqfhoc3XiUFyZQeETDi_bRGs1ALSyMBM`
- Tab: `healthy_gut_365`
- Sheet ID: `492315616`

Columns:

```text
A id
B name
C category
D time
E tag
F image
G image_status
H old_placeholder_image
I ingredients
J steps
K image_prompt
```

Status right now:

- IDs `1-36` are ready and have Drive images.
- IDs `37-365` still need generated Drive images.

## Google Drive

- Folder name: `Healthy Gut 365 Images`
- Folder ID: `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`
- URL: `https://drive.google.com/drive/folders/1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`

All generated images go here.

The app expects sheet image links like:

```text
https://drive.google.com/file/d/<FILE_ID>/view?usp=drivesdk
```

The app code converts them to:

```text
https://drive.google.com/thumbnail?id=<FILE_ID>&sz=w1200
```

Do not switch to local image paths.

## Image Generation Workflow

For the next batch:

1. Read rows `37-48` from the sheet.
2. Generate 12 photorealistic food images, one per recipe.
3. Save/copy the generated images into:

```text
local-assets/generated/healthy-gut/batch-037-048/
```

4. Make a contact sheet for QA.
5. Upload the 12 PNGs to Drive folder `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`.
6. Write each Drive URL to column F.
7. Write `ready` to column G.
8. Add the same 12 recipes to `free-from/index.html`.
9. Bump `free-from/sw.js` cache version.
10. Validate the local app count.
11. Commit and push.

Prompt style used so far:

```text
Use case: photorealistic-natural
Asset type: recipe card food photo for Healthy Gut 365 app
Primary request: Professional natural-light food photography, gluten-free and dairy-free healthy recipe: <recipe name>.
Subject: <visible ingredients and plating>.
Scene/backdrop: warm light neutral tabletop, appetizing realistic styling, 4:3 composition.
Constraints: no text, no watermark, no hands, no packaging, no visible brand labels, no bread, no wheat, no milk, no cheese, no yogurt, no cream.
```

## Apps Script

There is an Apps Script reference file:

```text
google-apps-script/healthy-gut-image-generator.gs
```

It is intended to automate generation from the Google Sheet using OpenAI Images API, upload to Drive, share files by link, and write the URL/status back to the sheet.

The user may still prefer manual checked batches of 12 because image quality matters.

## Splash Status

The old issue was that the logo showed as a frame inside another frame. It was fixed by removing the outer square border/background from the splash logo container.

Current splash:

- no outer square frame;
- soft logo shadow;
- rotating thin halo accent;
- breathing logo;
- thin progress line;
- reduced-motion fallback.

## User Preferences

- Bulgarian language.
- Direct, action-first style.
- Wants things to be production-ready, not patched.
- Very clear preference: images must be in Google Sheet and Google Drive, not local-only.
- Likes light theme for Brunch and Healthy Gut.
- Does not want emoji-heavy branding.
- Wants beautiful splash screens without emoji.
- Wants Play Store readiness.

## Good Next Prompt For Another Chat

```text
Продължи в repo `/Users/spasspasov/Library/CloudStorage/OneDrive-Personal/App Projects/MixMaster365`.

Работим по Healthy Gut 365 (`free-from/`). Прочети `HEALTHY_GUT_README.md` и `OTHER_CHAT_HANDOFF.md`.

Текущо: 36 рецепти са готови с Drive снимки. Следва да генерираш следващите 12 снимки за IDs 37-48 от Google Sheet:
https://docs.google.com/spreadsheets/d/1GT8j75VnRNwtqfhoc3XiUFyZQeETDi_bRGs1ALSyMBM/edit

Правилата:
- не използвай локални image paths в production;
- качи снимките в Drive folder `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`;
- запиши Drive URL в колона F;
- запиши `ready` в колона G;
- добави рецептите и Drive URL-ите в `free-from/index.html`;
- bump-ни cache-а в `free-from/sw.js`;
- валидирай, че app има 48 рецепти, 48 Drive images, 0 missing;
- commit и push към `main`.
```
