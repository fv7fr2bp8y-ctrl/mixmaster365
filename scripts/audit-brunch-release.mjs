import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const targetCount = Number(process.argv[2] || 365);
const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
  } catch (error) {
    fail(`${relativePath}: ${error.message}`);
    return null;
  }
}

function pngSize(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`${relativePath}: missing file`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    fail(`${relativePath}: not a valid PNG`);
    return null;
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function expectPng(relativePath, width, height) {
  const size = pngSize(relativePath);
  if (size && (size.width !== width || size.height !== height)) {
    fail(`${relativePath}: expected ${width}x${height}, got ${size.width}x${size.height}`);
  }
}

const context = { window: {} };
try {
  vm.runInNewContext(
    fs.readFileSync(path.join(root, "breakfast/data.js"), "utf8"),
    context,
    { filename: "breakfast/data.js" }
  );
} catch (error) {
  fail(`breakfast/data.js: ${error.message}`);
}

const recipes = context.window.BREAKFAST_DATA;
if (!Array.isArray(recipes)) {
  fail("breakfast/data.js: BREAKFAST_DATA is not an array");
} else {
  if (recipes.length !== targetCount) {
    fail(`recipe count: expected ${targetCount}, got ${recipes.length}`);
  }

  const requiredBase = [
    "source_id", "name", "description", "ingredients", "recipe", "country", "image", "time"
  ];
  const languages = ["en", "es", "fr", "de", "ru"];
  const requiredLocalized = ["name", "description", "ingredients", "recipe", "country"];
  const ids = new Set();
  const imageIds = new Set();

  recipes.forEach((recipe, index) => {
    const label = recipe?.source_id || `row ${index + 1}`;
    requiredBase.forEach((field) => {
      if (!String(recipe?.[field] ?? "").trim()) fail(`${label}: missing ${field}`);
    });
    languages.forEach((language) => {
      requiredLocalized.forEach((field) => {
        const key = `${field}_${language}`;
        if (!String(recipe?.[key] ?? "").trim()) fail(`${label}: missing ${key}`);
      });
    });

    if (ids.has(recipe.source_id)) fail(`${label}: duplicate source_id`);
    ids.add(recipe.source_id);

    const imageId = String(recipe.image || "").match(/\/d\/([^/]+)\//)?.[1];
    if (!imageId) {
      fail(`${label}: image is not a Drive file URL`);
    } else if (imageIds.has(imageId)) {
      fail(`${label}: duplicate Drive image ${imageId}`);
    } else {
      imageIds.add(imageId);
    }

    const ingredientSets = [recipe.ingredients, ...languages.map((lang) => recipe[`ingredients_${lang}`])];
    ingredientSets.forEach((value, languageIndex) => {
      if (!/\d/.test(String(value || ""))) {
        const language = languageIndex === 0 ? "bg" : languages[languageIndex - 1];
        fail(`${label}: ${language} ingredients have no quantities`);
      }
    });
  });

  const expectedFeaturedCount = Math.min(72, recipes.length);
  const featuredRanks = recipes
    .map((recipe) => recipe.featured_rank)
    .filter((rank) => Number.isInteger(rank))
    .sort((a, b) => a - b);
  if (featuredRanks.length !== expectedFeaturedCount) {
    fail(`featured order: expected ${expectedFeaturedCount} ranked recipes, got ${featuredRanks.length}`);
  } else {
    featuredRanks.forEach((rank, index) => {
      if (rank !== index) fail(`featured order: expected rank ${index}, got ${rank}`);
    });
  }
}

const manifest = readJson("breakfast/manifest.json");
if (manifest) {
  if (manifest.name !== "Brunch 365") fail("manifest: unexpected app name");
  if (manifest.id !== "/" || manifest.start_url !== "/" || manifest.scope !== "/") {
    fail("manifest: id, start_url and scope must be /");
  }
  if (!String(manifest.description || "").includes("365")) fail("manifest: description must state 365 recipes");
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 4) fail("manifest: missing any/maskable icons");
  if (!Array.isArray(manifest.screenshots) || manifest.screenshots.length < 3) fail("manifest: missing screenshots");
}

readJson("breakfast/.well-known/assetlinks.json");
if (!fs.existsSync(path.join(root, "breakfast/privacy.html"))) fail("breakfast/privacy.html: missing file");

expectPng("breakfast/icon-192.png", 192, 192);
expectPng("breakfast/icon-512.png", 512, 512);
expectPng("breakfast/icon-maskable-192.png", 192, 192);
expectPng("breakfast/icon-maskable-512.png", 512, 512);
expectPng("google-play-assets/feature-graphics/brunch-1024x500.png", 1024, 500);
for (const name of ["01-home.png", "02-recipes.png", "03-recipe-steps.png"]) {
  expectPng(`google-play-assets/screenshots-play/brunch/${name}`, 1080, 1920);
}

const serviceWorker = fs.readFileSync(path.join(root, "breakfast/sw.js"), "utf8");
for (const asset of ["index.html", "data.js", "manifest.json", "icon-192.png", "icon-512.png"]) {
  if (!serviceWorker.includes(`appPath("${asset}")`)) fail(`service worker: missing ${asset}`);
}

const summary = {
  targetCount,
  recipes: Array.isArray(recipes) ? recipes.length : 0,
  uniqueIds: Array.isArray(recipes) ? new Set(recipes.map((recipe) => recipe.source_id)).size : 0,
  uniqueImages: Array.isArray(recipes)
    ? new Set(recipes.map((recipe) => String(recipe.image || "").match(/\/d\/([^/]+)\//)?.[1]).filter(Boolean)).size
    : 0,
  failures: failures.length,
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  failures.slice(0, 100).forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
}
