# Recipe catalogue status

Run the current audit with:

```bash
node scripts/audit-all-recipes.mjs
```

## Verified status

Status synchronized from `Master_Recipes` on 18 July 2026:

| App | Ready source pool | Published | Remaining to 365 |
|---|---:|---:|---:|
| Brunch | 365 | 365 | 0 |
| Healthy Gut | 258 | 258 | 107 |
| Gluten Free | 286 | 286 | 79 |
| Dairy Free | 305 | 305 | 60 |
| Vegetarian | 398 | 365 | 0 |
| Vegan | 254 | 254 | 111 |

The source pool may contain more than 365 suitable recipes. Each generated app publishes at most 365, ordered by its app slot. This leaves an editorial reserve without bloating the public catalogue.

## Fill plan to 365

Brunch is complete and must not be changed while the other catalogues are being expanded.

The remaining five apps share dietary-compatible recipes through stable source IDs. The most efficient editorial plan is:

1. Add 72 carefully curated recipes that are plant-based, gluten-free, dairy-free and suitable for Healthy Gut. This completes Dairy Free and raises all compatible pools together.
2. Continue with 47 additional plant-based recipes selected to complete Healthy Gut and strengthen the Gluten Free reserve. The public catalogues remain capped at 365.
3. Add 4 final Vegan recipes, which may use gluten-containing whole grains when that improves variety and keeps the dietary flags accurate.

This reaches 365 in every app with 123 new recipe records and images instead of creating separate duplicates for each catalogue.

## Batch rules

Work in reviewed batches of 12. A batch is complete only when every recipe has:

- realistic Bulgarian quantities and preparation steps;
- English, Spanish, French, German and Russian translations;
- verified dietary flags and cuisine attribution;
- one matching 4:3 food image in the shared Google Drive folder;
- `ready` and `curated` status in the master spreadsheet;
- a successful six-app synchronization and audit.

The spreadsheet and Drive remain the source of truth. Do not publish local-only images or hand-edit generated catalogue files as the long-term workflow.
