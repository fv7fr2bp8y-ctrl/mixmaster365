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

const appConfigs = [
  { dir: "breakfast", label: "Brunch", flag: "is_breakfast", slot: "breakfast_slot" },
  { dir: "free-from", label: "Healthy Gut", flag: "is_healthy_gut", slot: "healthy_gut_slot" },
  { dir: "gluten-free", label: "Gluten Free", flag: "is_gluten_free", slot: "gluten_free_slot" },
  { dir: "dairy-free", label: "Dairy Free", flag: "is_dairy_free", slot: "dairy_free_slot" },
  { dir: "meat-free", label: "Meat Free", flag: "is_meat_free", slot: "meat_free_slot" },
  { dir: "plant-based", label: "Plant Based", flag: "is_plant_based", slot: "plant_based_slot" },
];

function difficultyFor(row) {
  const minutes = Number(row.time_min || 30);
  if (minutes <= 25) return "Лесно";
  if (minutes <= 40) return "Средно";
  return "Трудно";
}

function countryFor(row) {
  const haystack = `${row.tag || ""} ${row.canonical_name_bg || ""} ${row.seo_title_bg || ""}`.toLowerCase();
  const mappings = [
    ["тур", "Турция"], ["индий", "Индия"], ["япон", "Япония"], ["виетнам", "Виетнам"],
    ["гръц", "Гърция"], ["мексикан", "Мексико"], ["перуан", "Перу"], ["етип", "Етиопия"],
    ["етиоп", "Етиопия"], ["марок", "Мароко"], ["корей", "Корея"], ["ливан", "Ливан"],
    ["леван", "Ливан"], ["тайланд", "Тайланд"], ["испан", "Испания"], ["италиан", "Италия"],
    ["българ", "България"], ["средизем", "Средиземноморие"], ["скандинав", "Скандинавия"],
    ["британ", "Великобритания"], ["китай", "Китай"], ["египет", "Египет"], ["домаш", "Домашна кухня"],
    ["елда", "Източна Европа"], ["бобена", "България"], ["тава", "Домашна кухня"],
  ];
  return mappings.find(([needle]) => haystack.includes(needle))?.[1] || "Световна кухня";
}

function recipeFor(row, index) {
  const base = row.tag || titleCaseBg(row.meal_type);
  const ingredients = splitList(row.ingredients_bg).join(", ");
  const recipe = paragraphs(row.steps_bg);
  const difficulty = difficultyFor(row);
  const country = countryFor(row);
  return {
    id: index + 1,
    source_id: row.global_id,
    name: row.canonical_name_bg,
    base,
    icon: "◇",
    image: imageFor(row),
    ingredients,
    recipe,
    time: Number(row.time_min || 30),
    difficulty,
    country,
    tag: row.tag || row.recipe_quality || "curated",
    name_en: row.canonical_name_bg,
    base_en: base,
    ingredients_en: ingredients,
    recipe_en: recipe,
    difficulty_en: difficulty,
    country_en: country,
    tag_en: row.tag || row.recipe_quality || "curated",
    name_de: row.canonical_name_bg,
    base_de: base,
    ingredients_de: ingredients,
    recipe_de: recipe,
    difficulty_de: difficulty,
    country_de: country,
    tag_de: row.tag || row.recipe_quality || "curated",
    name_es: row.canonical_name_bg,
    base_es: base,
    ingredients_es: ingredients,
    recipe_es: recipe,
    difficulty_es: difficulty,
    country_es: country,
    tag_es: row.tag || row.recipe_quality || "curated",
    name_ru: row.canonical_name_bg,
    base_ru: base,
    ingredients_ru: ingredients,
    recipe_ru: recipe,
    difficulty_ru: difficulty,
    country_ru: country,
    tag_ru: row.tag || row.recipe_quality || "curated",
  };
}

function writeApp(rows, config) {
  const recipes = rows
    .filter((row) => isTrue(row[config.flag]))
    .filter((row) => imageFor(row))
    .sort((a, b) => Number(a[config.slot] || 9999) - Number(b[config.slot] || 9999))
    .map(recipeFor);

  fs.writeFileSync(
    path.join(root, config.dir, "data.js"),
    `window.BREAKFAST_DATA = ${JSON.stringify(recipes, null, 2)};\n`
  );
  return recipes.length;
}

const rows = recordsFromCsv(fs.readFileSync(csvPath, "utf8")).filter(
  (row) => row.status === "ready" && row.recipe_quality === "curated"
);

for (const config of appConfigs) {
  const count = writeApp(rows, config);
  console.log(`Synced ${count} ${config.label} recipes.`);
}
