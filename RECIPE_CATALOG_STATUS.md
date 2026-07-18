# Recipe catalogue status

Run the current audit with:

```bash
node scripts/audit-all-recipes.mjs
```

## Fill plan to 365

Brunch is complete and must not be changed while the other catalogues are being expanded.

The remaining five apps share dietary-compatible recipes through stable source IDs. The most efficient editorial plan is:

1. Add 126 carefully curated recipes that are plant-based, gluten-free, dairy-free and meat-free. Reuse each approved recipe and Drive image in every compatible app.
2. Use the first 48 for Meat Free, the first 117 for Dairy Free, the first 121 for Gluten Free and all 126 for Plant Based and Healthy Gut.
3. Add 24 additional Healthy Gut recipes that are gluten-free and dairy-free, with carefully selected fish or lean meat where appropriate.

This reaches 365 in every app with 150 new recipe records and images instead of creating 562 unrelated duplicates.

## Batch rules

Work in reviewed batches of 12. A batch is complete only when every recipe has:

- realistic Bulgarian quantities and preparation steps;
- English, Spanish, French, German and Russian translations;
- verified dietary flags and cuisine attribution;
- one matching 4:3 food image in the shared Google Drive folder;
- `ready` and `curated` status in the master spreadsheet;
- a successful six-app synchronization and audit.

The spreadsheet and Drive remain the source of truth. Do not publish local-only images or hand-edit generated catalogue files as the long-term workflow.
