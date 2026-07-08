import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const csvPath = process.argv[2] || "/tmp/freefrom365_master.csv";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];

    if (quoted) {
      if (c === '"' && n === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        cell += c;
      }
      continue;
    }

    if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") {
      cell += c;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function recordsFromCsv(text) {
  const rows = parseCsv(text).filter((r) => r.some((v) => String(v || "").trim()));
  const headers = rows.shift();
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]))
  );
}

function isTrue(value) {
  return String(value || "").toUpperCase() === "TRUE";
}

function splitList(value) {
  return String(value || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitSteps(value) {
  return String(value || "")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function paragraphs(value) {
  return splitSteps(value)
    .map((step) => `<p>${step}</p>`)
    .join("");
}

function titleCaseBg(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const map = {
    "закуска": "Закуска",
    "обяд": "Обяд",
    "вечеря": "Вечеря",
    "снак": "Снак",
    "десерт": "Десерт",
    "салата": "Салата",
  };
  return map[normalized] || "Обяд";
}

function imageFor(row) {
  return row.image_url && row.image_status === "ready" ? row.image_url : "";
}

function writeFreeFrom(rows) {
  const recipes = rows
    .filter((row) => isTrue(row.is_healthy_gut))
    .map((row, index) => ({
      id: index + 1,
      source_id: row.global_id,
      cat: titleCaseBg(row.meal_type),
      time: `${row.time_min || "30"} мин`,
      tag: row.tag || row.recipe_quality || "curated",
      name: row.canonical_name_bg,
      img: imageFor(row),
      ingredients: splitList(row.ingredients_bg),
      steps: splitSteps(row.steps_bg),
    }));

  const file = path.join(root, "free-from", "index.html");
  const current = fs.readFileSync(file, "utf8");
  const next = current.replace(
    /    const recipes = \[[\s\S]*?\n\s*\];\n\n    const categories/,
    `    const recipes = ${JSON.stringify(recipes, null, 10)};\n\n    const categories`
  );
  if (next !== current) fs.writeFileSync(file, next);

  const shellRecipes = rows
    .filter((row) => isTrue(row.is_healthy_gut))
    .map((row, index) => ({
      id: index + 1,
      source_id: row.global_id,
      name: row.canonical_name_bg,
      base: titleCaseBg(row.meal_type),
      icon: "◇",
      image: imageFor(row),
      ingredients: splitList(row.ingredients_bg).join(", "),
      recipe: paragraphs(row.steps_bg),
      name_en: row.canonical_name_bg,
      base_en: titleCaseBg(row.meal_type),
      ingredients_en: splitList(row.ingredients_bg).join(", "),
      recipe_en: paragraphs(row.steps_bg),
      name_de: row.canonical_name_bg,
      base_de: titleCaseBg(row.meal_type),
      ingredients_de: splitList(row.ingredients_bg).join(", "),
      recipe_de: paragraphs(row.steps_bg),
      name_es: row.canonical_name_bg,
      base_es: titleCaseBg(row.meal_type),
      ingredients_es: splitList(row.ingredients_bg).join(", "),
      recipe_es: paragraphs(row.steps_bg),
      name_ru: row.canonical_name_bg,
      base_ru: titleCaseBg(row.meal_type),
      ingredients_ru: splitList(row.ingredients_bg).join(", "),
      recipe_ru: paragraphs(row.steps_bg),
    }));

  fs.writeFileSync(
    path.join(root, "free-from", "data.js"),
    `window.BREAKFAST_DATA = ${JSON.stringify(shellRecipes, null, 2)};\n`
  );

  return recipes.length;
}

function writeBreakfast(rows) {
  const recipes = rows
    .filter((row) => isTrue(row.is_breakfast))
    .sort((a, b) => Number(a.breakfast_slot || 9999) - Number(b.breakfast_slot || 9999))
    .map((row, index) => ({
      id: index + 1,
      source_id: row.global_id,
      name: row.canonical_name_bg,
      base: row.tag || titleCaseBg(row.meal_type),
      icon: "◇",
      image: imageFor(row),
      ingredients: splitList(row.ingredients_bg).join(", "),
      recipe: paragraphs(row.steps_bg),
      name_en: row.canonical_name_bg,
      base_en: row.tag || titleCaseBg(row.meal_type),
      ingredients_en: splitList(row.ingredients_bg).join(", "),
      recipe_en: paragraphs(row.steps_bg),
      name_de: row.canonical_name_bg,
      base_de: row.tag || titleCaseBg(row.meal_type),
      ingredients_de: splitList(row.ingredients_bg).join(", "),
      recipe_de: paragraphs(row.steps_bg),
      name_es: row.canonical_name_bg,
      base_es: row.tag || titleCaseBg(row.meal_type),
      ingredients_es: splitList(row.ingredients_bg).join(", "),
      recipe_es: paragraphs(row.steps_bg),
      name_ru: row.canonical_name_bg,
      base_ru: row.tag || titleCaseBg(row.meal_type),
      ingredients_ru: splitList(row.ingredients_bg).join(", "),
      recipe_ru: paragraphs(row.steps_bg),
    }));

  const file = path.join(root, "breakfast", "data.js");
  fs.writeFileSync(file, `window.BREAKFAST_DATA = ${JSON.stringify(recipes, null, 2)};\n`);
  return recipes.length;
}

const rows = recordsFromCsv(fs.readFileSync(csvPath, "utf8")).filter(
  (row) => row.status === "ready" && row.recipe_quality === "curated"
);

const freeFromCount = writeFreeFrom(rows);
const breakfastCount = writeBreakfast(rows);

console.log(`Synced ${freeFromCount} Healthy Gut recipes and ${breakfastCount} Brunch recipes.`);
