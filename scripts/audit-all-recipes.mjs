import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const target = Number(process.argv[2] || 365);
const languages = ["en", "es", "fr", "de", "ru"];
const localizedFields = [
  "name",
  "description",
  "ingredients",
  "recipe",
  "base",
  "difficulty",
  "country",
  "tag",
];
const apps = [
  ["Brunch", "breakfast"],
  ["Healthy Gut", "free-from"],
  ["Gluten Free", "gluten-free"],
  ["Dairy Free", "dairy-free"],
  ["Meat Free", "meat-free"],
  ["Plant Based", "plant-based"],
];

function loadRecipes(directory) {
  const context = { window: {} };
  const file = path.join(root, directory, "data.js");
  vm.runInNewContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  if (!Array.isArray(context.window.BREAKFAST_DATA)) {
    throw new Error(`${directory}/data.js does not export BREAKFAST_DATA`);
  }
  return context.window.BREAKFAST_DATA;
}

function hasValue(value) {
  return String(value ?? "").trim().length > 0;
}

function hasQuantities(value) {
  return /\d/.test(String(value ?? ""));
}

function imageId(value) {
  return String(value ?? "").match(/\/d\/([^/]+)\//)?.[1] || "";
}

const reports = apps.map(([app, directory]) => {
  const recipes = loadRecipes(directory);
  const ids = recipes.map((recipe) => String(recipe.source_id || "").trim());
  const images = recipes.map((recipe) => imageId(recipe.image)).filter(Boolean);
  const missing = {};

  for (const language of languages) {
    missing[language] = recipes.filter((recipe) =>
      localizedFields.some((field) => !hasValue(recipe[`${field}_${language}`]))
    ).length;
  }

  const complete = recipes.filter((recipe) =>
    hasValue(recipe.source_id) &&
    hasValue(recipe.name) &&
    hasValue(recipe.description) &&
    hasValue(recipe.recipe) &&
    hasQuantities(recipe.ingredients) &&
    imageId(recipe.image) &&
    languages.every((language) =>
      localizedFields.every((field) => hasValue(recipe[`${field}_${language}`])) &&
      hasQuantities(recipe[`ingredients_${language}`])
    )
  ).length;

  return {
    app,
    directory,
    total: recipes.length,
    complete,
    images: images.length,
    remaining: Math.max(0, target - recipes.length),
    overTarget: Math.max(0, recipes.length - target),
    duplicateIds: ids.length - new Set(ids).size,
    duplicateImages: images.length - new Set(images).size,
    missing,
  };
});

console.table(
  reports.map(({ app, total, complete, images, remaining, overTarget, duplicateIds, duplicateImages }) => ({
    app,
    total,
    complete,
    images,
    remaining,
    overTarget,
    duplicateIds,
    duplicateImages,
  }))
);

for (const report of reports) {
  const missing = Object.entries(report.missing).filter(([, count]) => count > 0);
  if (missing.length) {
    console.log(`${report.app}: missing localized records ${missing.map(([lang, count]) => `${lang}=${count}`).join(", ")}`);
  }
}

const failures = reports.filter((report) =>
  report.complete !== report.total ||
  report.images !== report.total ||
  report.duplicateIds > 0 ||
  report.duplicateImages > 0 ||
  Object.values(report.missing).some((count) => count > 0)
);

if (failures.length) process.exitCode = 1;
