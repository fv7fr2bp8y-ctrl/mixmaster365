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

function textField(row, field, fallback = "") {
  const value = String(row[field] || "").trim();
  return value || fallback;
}

function translatedField(row, lang, field, fallback = "") {
  return textField(row, `${field}_${lang}`, fallback);
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

function difficultyForLang(row, lang) {
  const bg = difficultyFor(row);
  const maps = {
    en: {
      "Лесно": "Easy",
      "Средно": "Medium",
      "Трудно": "Hard",
    },
    de: {
      "Лесно": "Einfach",
      "Средно": "Mittel",
      "Трудно": "Schwer",
    },
    es: {
      "Лесно": "Fácil",
      "Средно": "Media",
      "Трудно": "Difícil",
    },
    ru: {
      "Лесно": "Легко",
      "Средно": "Средне",
      "Трудно": "Сложно",
    },
  };
  return translatedField(row, lang, "difficulty", maps[lang]?.[bg] || bg);
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

function countryForLang(row, lang, bgCountry) {
  if (row[`country_${lang}`]) return row[`country_${lang}`];
  const maps = {
    en: {
      "Турция": "Turkey",
      "Индия": "India",
      "Япония": "Japan",
      "Виетнам": "Vietnam",
      "Гърция": "Greece",
      "Мексико": "Mexico",
      "Перу": "Peru",
      "Етиопия": "Ethiopia",
      "Мароко": "Morocco",
      "Корея": "Korea",
      "Ливан": "Lebanon",
      "Тайланд": "Thailand",
      "Испания": "Spain",
      "Италия": "Italy",
      "България": "Bulgaria",
      "Средиземноморие": "Mediterranean",
      "Скандинавия": "Scandinavia",
      "Великобритания": "United Kingdom",
      "Китай": "China",
      "Египет": "Egypt",
      "Домашна кухня": "Home cooking",
      "Източна Европа": "Eastern Europe",
      "Световна кухня": "World cuisine",
    },
    de: {
      "Турция": "Türkei",
      "Индия": "Indien",
      "Япония": "Japan",
      "Виетнам": "Vietnam",
      "Гърция": "Griechenland",
      "Мексико": "Mexiko",
      "Перу": "Peru",
      "Етиопия": "Äthiopien",
      "Мароко": "Marokko",
      "Корея": "Korea",
      "Ливан": "Libanon",
      "Тайланд": "Thailand",
      "Испания": "Spanien",
      "Италия": "Italien",
      "България": "Bulgarien",
      "Средиземноморие": "Mittelmeerraum",
      "Скандинавия": "Skandinavien",
      "Великобритания": "Vereinigtes Königreich",
      "Китай": "China",
      "Египет": "Ägypten",
      "Домашна кухня": "Hausmannskost",
      "Източна Европа": "Osteuropa",
      "Световна кухня": "Weltküche",
    },
    es: {
      "Турция": "Turquía",
      "Индия": "India",
      "Япония": "Japón",
      "Виетнам": "Vietnam",
      "Гърция": "Grecia",
      "Мексико": "México",
      "Перу": "Perú",
      "Етиопия": "Etiopía",
      "Мароко": "Marruecos",
      "Корея": "Corea",
      "Ливан": "Líbano",
      "Тайланд": "Tailandia",
      "Испания": "España",
      "Италия": "Italia",
      "България": "Bulgaria",
      "Средиземноморие": "Mediterráneo",
      "Скандинавия": "Escandinavia",
      "Великобритания": "Reino Unido",
      "Китай": "China",
      "Египет": "Egipto",
      "Домашна кухня": "Cocina casera",
      "Източна Европа": "Europa del Este",
      "Световна кухня": "Cocina mundial",
    },
    ru: {
      "Турция": "Турция",
      "Индия": "Индия",
      "Япония": "Япония",
      "Виетнам": "Вьетнам",
      "Гърция": "Греция",
      "Мексико": "Мексика",
      "Перу": "Перу",
      "Етиопия": "Эфиопия",
      "Мароко": "Марокко",
      "Корея": "Корея",
      "Ливан": "Ливан",
      "Тайланд": "Таиланд",
      "Испания": "Испания",
      "Италия": "Италия",
      "България": "Болгария",
      "Средиземноморие": "Средиземноморье",
      "Скандинавия": "Скандинавия",
      "Великобритания": "Великобритания",
      "Китай": "Китай",
      "Египет": "Египет",
      "Домашна кухня": "Домашняя кухня",
      "Източна Европа": "Восточная Европа",
      "Световна кухня": "Мировая кухня",
    },
  };
  return maps[lang]?.[bgCountry] || bgCountry;
}

function localizedRecipeFields(row, lang, fallbacks) {
  const ingredientsSource = translatedField(row, lang, "ingredients", row.ingredients_bg);
  const stepsSource = translatedField(row, lang, "steps", row.steps_bg);
  return {
    name: translatedField(row, lang, "name", row.canonical_name_bg),
    description: translatedField(row, lang, "description", row.description_bg),
    base: translatedField(row, lang, "tag", fallbacks.base),
    ingredients: splitList(ingredientsSource).join(", "),
    recipe: paragraphs(stepsSource),
    difficulty: difficultyForLang(row, lang),
    country: countryForLang(row, lang, fallbacks.country),
    tag: translatedField(row, lang, "tag", fallbacks.tag),
  };
}

function recipeFor(row, index) {
  const base = row.tag || titleCaseBg(row.meal_type);
  const ingredients = splitList(row.ingredients_bg).join(", ");
  const recipe = paragraphs(row.steps_bg);
  const difficulty = difficultyFor(row);
  const country = countryFor(row);
  const tag = row.tag || row.recipe_quality || "curated";
  const fallbacks = { base, country, tag };
  const en = localizedRecipeFields(row, "en", fallbacks);
  const de = localizedRecipeFields(row, "de", fallbacks);
  const es = localizedRecipeFields(row, "es", fallbacks);
  const ru = localizedRecipeFields(row, "ru", fallbacks);

  return {
    id: index + 1,
    source_id: row.global_id,
    name: row.canonical_name_bg,
    base,
    icon: "◇",
    image: imageFor(row),
    description: row.description_bg,
    ingredients,
    recipe,
    time: Number(row.time_min || 30),
    difficulty,
    country,
    tag,
    description_en: en.description,
    name_en: en.name,
    base_en: en.base,
    ingredients_en: en.ingredients,
    recipe_en: en.recipe,
    difficulty_en: en.difficulty,
    country_en: en.country,
    tag_en: en.tag,
    description_de: de.description,
    name_de: de.name,
    base_de: de.base,
    ingredients_de: de.ingredients,
    recipe_de: de.recipe,
    difficulty_de: de.difficulty,
    country_de: de.country,
    tag_de: de.tag,
    description_es: es.description,
    name_es: es.name,
    base_es: es.base,
    ingredients_es: es.ingredients,
    recipe_es: es.recipe,
    difficulty_es: es.difficulty,
    country_es: es.country,
    tag_es: es.tag,
    description_ru: ru.description,
    name_ru: ru.name,
    base_ru: ru.base,
    ingredients_ru: ru.ingredients,
    recipe_ru: ru.recipe,
    difficulty_ru: ru.difficulty,
    country_ru: ru.country,
    tag_ru: ru.tag,
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
