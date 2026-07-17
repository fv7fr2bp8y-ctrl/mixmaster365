# Local files

The website and Android source stay in their existing app directories. Large working assets and old packages are kept locally and are excluded from Git.

## Working assets

- `local-assets/generated/brunch/` - original Brunch image batches and mappings.
- `local-assets/generated/healthy-gut/` - original Healthy Gut image batches.
- `local-assets/generated/shared-recipes/` - shared Free From recipe image batches.
- `local-assets/icon-candidates/<app>/` - unused icon candidates.
- `local-assets/icon-sources/` - selected high-resolution logo sources.
- `local-assets/contact-sheets/` - visual image indexes.
- `local-assets/data-exports/` - local spreadsheet exports.

These files are source material. Production recipe images are served from Google Drive URLs stored in each app's `data.js`.

## Archive

- `local-archive/design-experiments/` - superseded HTML design explorations.
- `local-archive/legacy-google-play/` - old MixMaster and Mocktails packages and signing material.

Do not delete signing files. Do not move active app folders (`breakfast`, `free-from`, `gluten-free`, `dairy-free`, `meat-free`, `plant-based`) without updating deployment configuration.

## Current content rule

Only recipes with an image, ingredient quantities, and complete translations for the selected language should be shown. Incomplete legacy rows remain in data until they are fully curated.
