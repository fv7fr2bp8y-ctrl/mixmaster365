import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const csvPath = process.argv[2] || "/tmp/freefrom365_master.csv";
const targetApp = process.argv[3] || "";

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
    .split(/;\s*(?=[\p{Lu}\d])|(?<=[.!?])\s+(?=[\p{Lu}\d])/u)
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

function ingredientsFor(row, lang = "bg") {
  const quantifiedField = lang === "bg" ? "ingredients_qty_bg" : `ingredients_qty_${lang}`;
  const plainField = lang === "bg" ? "ingredients_bg" : `ingredients_${lang}`;
  return textField(row, quantifiedField, textField(row, plainField, row.ingredients_bg));
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
  {
    dir: "breakfast",
    label: "Brunch",
    flag: "is_breakfast",
    primaryApps: ["Brunch", "Breakfast"],
    slot: "breakfast_slot",
    featuredNewest: 72,
    featured: [
      "BR-C173", // Finnish Karelian pasties
      "BR-C169", // Tanzanian vitumbua
      "BR-C170", // Peruvian tacu tacu
      "BR-C148", // Azerbaijani pumpkin qutab
      "BR-C166", // Thai khao tom goong
      "BR-C172", // Bosnian ustipci
      "BR-C153", // Filipino tortang talong
      "BR-C157", // Emirati balaleet
      "BR-C171", // Mongolian boortsog
      "BR-C152", // Estonian kiluvoileib
      "BR-C164", // Georgian chvishtari
      "BR-C155", // Maldivian mas huni
    ],
  },
  { dir: "free-from", label: "Healthy Gut", flag: "is_healthy_gut", slot: "healthy_gut_slot", limit: 365 },
  { dir: "gluten-free", label: "Gluten Free", flag: "is_gluten_free", slot: "gluten_free_slot", limit: 365 },
  { dir: "dairy-free", label: "Dairy Free", flag: "is_dairy_free", slot: "dairy_free_slot", limit: 365 },
  { dir: "meat-free", label: "Vegetarian", flag: "is_meat_free", slot: "meat_free_slot", limit: 365, excludeSeafood: true },
  { dir: "plant-based", label: "Vegan", flag: "is_plant_based", slot: "plant_based_slot", limit: 365 },
  {
    dir: "seafood",
    label: "Seafood",
    flag: "is_seafood",
    slot: "seafood_slot",
    limit: 365,
    ingredientSeparator: " || ",
  },
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
    fr: {
      "Лесно": "Facile",
      "Средно": "Moyen",
      "Трудно": "Difficile",
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
    ["турск", "Турция"], ["индий", "Индия"], ["япон", "Япония"], ["виетнам", "Виетнам"],
    ["гръц", "Гърция"], ["мексикан", "Мексико"], ["перуан", "Перу"], ["етип", "Етиопия"],
    ["етиоп", "Етиопия"], ["марок", "Мароко"], ["корей", "Корея"], ["ливан", "Ливан"],
    ["леван", "Ливан"], ["тайланд", "Тайланд"], ["испан", "Испания"], ["италиан", "Италия"],
    ["българ", "България"], ["средизем", "Средиземноморие"], ["скандинав", "Скандинавия"],
    ["британ", "Великобритания"], ["китай", "Китай"], ["египет", "Египет"], ["домаш", "Домашна кухня"],
    ["швед", "Швеция"], ["френск", "Франция"], ["бретон", "Франция"], ["шриланк", "Шри Ланка"],
    ["елда", "Източна Европа"], ["елден", "Източна Европа"], ["източноевроп", "Източна Европа"],
    ["бобена", "България"], ["тава", "Домашна кухня"],
    ["полск", "Полша"], ["непал", "Непал"], ["нигер", "Нигерия"], ["филипин", "Филипини"],
    ["бразил", "Бразилия"], ["австрал", "Австралия"], ["ганай", "Гана"], ["индонез", "Индонезия"],
    ["сомал", "Сомалия"], ["канад", "Канада"], ["армен", "Армения"], ["лаоск", "Лаос"],
    ["португал", "Португалия"], ["грузин", "Грузия"], ["шри ланка", "Шри Ланка"],
    ["тел авив", "Израел"], ["израел", "Израел"], ["мелбърн", "Австралия"], ["лисабон", "Португалия"],
    ["лос анджелис", "САЩ"], ["париж", "Франция"], ["ню йорк", "САЩ"], ["буенос айрес", "Аржентина"],
    ["хонконг", "Хонконг"], ["ню орлиънс", "САЩ"], ["барселона", "Испания"], ["каталун", "Испания"],
    ["кейптаун", "Южна Африка"], ["южноафрикан", "Южна Африка"], ["стокхолм", "Швеция"],
    ["рейкявик", "Исландия"], ["дубай", "ОАЕ"], ["мумбай", "Индия"], ["сингапур", "Сингапур"],
    ["сан себастиан", "Испания"], ["баски", "Испания"], ["тбилиси", "Грузия"], ["монреал", "Канада"],
    ["окланд", "Нова Зеландия"], ["туниз", "Тунис"], ["датск", "Дания"], ["австр", "Австрия"],
    ["малайз", "Малайзия"], ["немск", "Германия"], ["аржентин", "Аржентина"],
    ["швейцар", "Швейцария"], ["финланд", "Финландия"],
    ["венецуел", "Венецуела"], ["украин", "Украйна"], ["хърват", "Хърватия"],
    ["сръб", "Сърбия"], ["белгий", "Белгия"], ["пуерторикан", "Пуерто Рико"],
    ["норвеж", "Норвегия"], ["чилий", "Чили"], ["йордан", "Йордания"],
    ["костарикан", "Коста Рика"], ["нидерланд", "Нидерландия"], ["иракск", "Ирак"],
    ["чешк", "Чехия"], ["албан", "Албания"],
    ["пакистан", "Пакистан"], ["еквадор", "Еквадор"], ["латвий", "Латвия"],
    ["румън", "Румъния"], ["хаитян", "Хаити"], ["саудит", "Саудитска Арабия"],
    ["салвадор", "Салвадор"], ["унгар", "Унгария"], ["мозамбик", "Мозамбик"],
    ["тринидад", "Тринидад и Тобаго"], ["северноирланд", "Северна Ирландия"],
    ["ирланд", "Ирландия"], ["сенегал", "Сенегал"],
    ["малтий", "Малта"], ["азербайджан", "Азербайджан"], ["мавриций", "Мавриций"],
    ["самоан", "Самоа"], ["бангладеш", "Бангладеш"], ["естон", "Естония"],
    ["малдив", "Малдиви"], ["уганд", "Уганда"], ["емирати", "ОАЕ"],
    ["уелс", "Уелс"], ["бирман", "Мианмар"], ["мианмар", "Мианмар"],
    ["танзаний", "Танзания"],
    ["монгол", "Монголия"], ["боснен", "Босна и Херцеговина"], ["карелск", "Финландия"],
    ["латино", "Латинска Америка"], ["тайван", "Тайван"], ["колумб", "Колумбия"],
    ["кений", "Кения"], ["калифорн", "САЩ"], ["американ", "САЩ"],
    ["шотланд", "Шотландия"], ["тоскан", "Италия"], ["ямай", "Ямайка"],
    ["иранск", "Иран"], ["новозеланд", "Нова Зеландия"], ["хавай", "САЩ"],
    ["сефарад", "Средиземноморие"], ["доминикан", "Доминиканска република"],
    ["оман", "Оман"], ["кубин", "Куба"], ["исланд", "Исландия"],
    ["молдов", "Молдова"], ["мадагаскар", "Мадагаскар"],
  ];
  return mappings.find(([needle]) => haystack.includes(needle))?.[1] || "Световна кухня";
}

function countryForLang(row, lang, bgCountry) {
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
      "Полша": "Poland",
      "Непал": "Nepal",
      "Нигерия": "Nigeria",
      "Филипини": "Philippines",
      "Бразилия": "Brazil",
      "Австралия": "Australia",
      "Гана": "Ghana",
      "Индонезия": "Indonesia",
      "Сомалия": "Somalia",
      "Канада": "Canada",
      "Армения": "Armenia",
      "Лаос": "Laos",
      "Португалия": "Portugal",
      "Грузия": "Georgia",
      "Шри Ланка": "Sri Lanka",
      "Израел": "Israel",
      "САЩ": "United States",
      "Аржентина": "Argentina",
      "Хонконг": "Hong Kong",
      "Южна Африка": "South Africa",
      "Швеция": "Sweden",
      "Исландия": "Iceland",
      "ОАЕ": "UAE",
      "Сингапур": "Singapore",
      "Нова Зеландия": "New Zealand",
      "Тунис": "Tunisia",
      "Дания": "Denmark",
      "Австрия": "Austria",
      "Малайзия": "Malaysia",
      "Германия": "Germany",
      "Латинска Америка": "Latin America",
      "Тайван": "Taiwan",
      "Колумбия": "Colombia",
      "Кения": "Kenya",
      "Франция": "France",
      "Малта": "Malta",
      "Азербайджан": "Azerbaijan",
      "Мавриций": "Mauritius",
      "Молдова": "Moldova",
      "Мадагаскар": "Madagascar",
      "Самоа": "Samoa",
      "Бангладеш": "Bangladesh",
      "Естония": "Estonia",
      "Малдиви": "Maldives",
      "Уганда": "Uganda",
      "Уелс": "Wales",
      "Мианмар": "Myanmar",
      "Северна Ирландия": "Northern Ireland",
      "Танзания": "Tanzania",
      "Монголия": "Mongolia",
      "Босна и Херцеговина": "Bosnia and Herzegovina",
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
      "Полша": "Polen",
      "Непал": "Nepal",
      "Нигерия": "Nigeria",
      "Филипини": "Philippinen",
      "Бразилия": "Brasilien",
      "Австралия": "Australien",
      "Гана": "Ghana",
      "Индонезия": "Indonesien",
      "Сомалия": "Somalia",
      "Канада": "Kanada",
      "Армения": "Armenien",
      "Лаос": "Laos",
      "Португалия": "Portugal",
      "Грузия": "Georgien",
      "Шри Ланка": "Sri Lanka",
      "Израел": "Israel",
      "САЩ": "USA",
      "Аржентина": "Argentinien",
      "Хонконг": "Hongkong",
      "Южна Африка": "Südafrika",
      "Швеция": "Schweden",
      "Исландия": "Island",
      "ОАЕ": "VAE",
      "Сингапур": "Singapur",
      "Нова Зеландия": "Neuseeland",
      "Тунис": "Tunesien",
      "Дания": "Dänemark",
      "Австрия": "Österreich",
      "Малайзия": "Malaysia",
      "Германия": "Deutschland",
      "Латинска Америка": "Lateinamerika",
      "Тайван": "Taiwan",
      "Колумбия": "Kolumbien",
      "Кения": "Kenia",
      "Франция": "Frankreich",
      "Малта": "Malta",
      "Азербайджан": "Aserbaidschan",
      "Мавриций": "Mauritius",
      "Молдова": "Moldau",
      "Мадагаскар": "Madagaskar",
      "Самоа": "Samoa",
      "Бангладеш": "Bangladesch",
      "Естония": "Estland",
      "Малдиви": "Malediven",
      "Уганда": "Uganda",
      "Уелс": "Wales",
      "Мианмар": "Myanmar",
      "Северна Ирландия": "Nordirland",
      "Танзания": "Tansania",
      "Монголия": "Mongolei",
      "Босна и Херцеговина": "Bosnien und Herzegowina",
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
      "Полша": "Polonia",
      "Непал": "Nepal",
      "Нигерия": "Nigeria",
      "Филипини": "Filipinas",
      "Бразилия": "Brasil",
      "Австралия": "Australia",
      "Гана": "Ghana",
      "Индонезия": "Indonesia",
      "Сомалия": "Somalia",
      "Канада": "Canadá",
      "Армения": "Armenia",
      "Лаос": "Laos",
      "Португалия": "Portugal",
      "Грузия": "Georgia",
      "Шри Ланка": "Sri Lanka",
      "Израел": "Israel",
      "САЩ": "Estados Unidos",
      "Аржентина": "Argentina",
      "Хонконг": "Hong Kong",
      "Южна Африка": "Sudáfrica",
      "Швеция": "Suecia",
      "Исландия": "Islandia",
      "ОАЕ": "EAU",
      "Сингапур": "Singapur",
      "Нова Зеландия": "Nueva Zelanda",
      "Тунис": "Túnez",
      "Дания": "Dinamarca",
      "Австрия": "Austria",
      "Малайзия": "Malasia",
      "Германия": "Alemania",
      "Латинска Америка": "Latinoamérica",
      "Тайван": "Taiwán",
      "Колумбия": "Colombia",
      "Кения": "Kenia",
      "Франция": "Francia",
      "Малта": "Malta",
      "Азербайджан": "Azerbaiyán",
      "Мавриций": "Mauricio",
      "Молдова": "Moldavia",
      "Мадагаскар": "Madagascar",
      "Самоа": "Samoa",
      "Бангладеш": "Bangladés",
      "Естония": "Estonia",
      "Малдиви": "Maldivas",
      "Уганда": "Uganda",
      "Уелс": "Gales",
      "Мианмар": "Myanmar",
      "Северна Ирландия": "Irlanda del Norte",
      "Танзания": "Tanzania",
      "Монголия": "Mongolia",
      "Босна и Херцеговина": "Bosnia y Herzegovina",
    },
    fr: {
      "Турция": "Turquie",
      "Индия": "Inde",
      "Япония": "Japon",
      "Виетнам": "Vietnam",
      "Гърция": "Grèce",
      "Мексико": "Mexique",
      "Перу": "Pérou",
      "Етиопия": "Éthiopie",
      "Мароко": "Maroc",
      "Корея": "Corée",
      "Ливан": "Liban",
      "Тайланд": "Thaïlande",
      "Испания": "Espagne",
      "Италия": "Italie",
      "България": "Bulgarie",
      "Средиземноморие": "Méditerranée",
      "Скандинавия": "Scandinavie",
      "Великобритания": "Royaume-Uni",
      "Китай": "Chine",
      "Египет": "Égypte",
      "Домашна кухня": "Cuisine maison",
      "Източна Европа": "Europe de l'Est",
      "Световна кухня": "Cuisine du monde",
      "Полша": "Pologne",
      "Непал": "Népal",
      "Нигерия": "Nigeria",
      "Филипини": "Philippines",
      "Бразилия": "Brésil",
      "Австралия": "Australie",
      "Гана": "Ghana",
      "Индонезия": "Indonésie",
      "Сомалия": "Somalie",
      "Канада": "Canada",
      "Армения": "Arménie",
      "Лаос": "Laos",
      "Португалия": "Portugal",
      "Грузия": "Géorgie",
      "Шри Ланка": "Sri Lanka",
      "Израел": "Israël",
      "САЩ": "États-Unis",
      "Аржентина": "Argentine",
      "Хонконг": "Hong Kong",
      "Южна Африка": "Afrique du Sud",
      "Швеция": "Suède",
      "Исландия": "Islande",
      "ОАЕ": "Émirats arabes unis",
      "Сингапур": "Singapour",
      "Нова Зеландия": "Nouvelle-Zélande",
      "Тунис": "Tunisie",
      "Дания": "Danemark",
      "Австрия": "Autriche",
      "Малайзия": "Malaisie",
      "Германия": "Allemagne",
      "Латинска Америка": "Amérique latine",
      "Тайван": "Taïwan",
      "Колумбия": "Colombie",
      "Кения": "Kenya",
      "Франция": "France",
      "Малта": "Malte",
      "Азербайджан": "Azerbaïdjan",
      "Мавриций": "Maurice",
      "Молдова": "Moldavie",
      "Мадагаскар": "Madagascar",
      "Самоа": "Samoa",
      "Бангладеш": "Bangladesh",
      "Естония": "Estonie",
      "Малдиви": "Maldives",
      "Уганда": "Ouganda",
      "Уелс": "Pays de Galles",
      "Мианмар": "Myanmar",
      "Северна Ирландия": "Irlande du Nord",
      "Танзания": "Tanzanie",
      "Монголия": "Mongolie",
      "Босна и Херцеговина": "Bosnie-Herzégovine",
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
      "Полша": "Польша",
      "Непал": "Непал",
      "Нигерия": "Нигерия",
      "Филипини": "Филиппины",
      "Бразилия": "Бразилия",
      "Австралия": "Австралия",
      "Гана": "Гана",
      "Индонезия": "Индонезия",
      "Сомалия": "Сомали",
      "Канада": "Канада",
      "Армения": "Армения",
      "Лаос": "Лаос",
      "Португалия": "Португалия",
      "Грузия": "Грузия",
      "Шри Ланка": "Шри-Ланка",
      "Израел": "Израиль",
      "САЩ": "США",
      "Аржентина": "Аргентина",
      "Хонконг": "Гонконг",
      "Южна Африка": "Южная Африка",
      "Швеция": "Швеция",
      "Исландия": "Исландия",
      "ОАЕ": "ОАЭ",
      "Сингапур": "Сингапур",
      "Нова Зеландия": "Новая Зеландия",
      "Тунис": "Тунис",
      "Дания": "Дания",
      "Австрия": "Австрия",
      "Малайзия": "Малайзия",
      "Германия": "Германия",
      "Латинска Америка": "Латинская Америка",
      "Тайван": "Тайвань",
      "Колумбия": "Колумбия",
      "Кения": "Кения",
      "Франция": "Франция",
      "Малта": "Мальта",
      "Азербайджан": "Азербайджан",
      "Мавриций": "Маврикий",
      "Молдова": "Молдова",
      "Мадагаскар": "Мадагаскар",
      "Самоа": "Самоа",
      "Бангладеш": "Бангладеш",
      "Естония": "Эстония",
      "Малдиви": "Мальдивы",
      "Уганда": "Уганда",
      "Уелс": "Уэльс",
      "Мианмар": "Мьянма",
      "Северна Ирландия": "Северная Ирландия",
      "Танзания": "Танзания",
      "Монголия": "Монголия",
      "Босна и Херцеговина": "Босния и Герцеговина",
    },
  };
  return maps[lang]?.[bgCountry] || row[`country_${lang}`] || bgCountry;
}

function localizedRecipeFields(row, lang, fallbacks, ingredientSeparator = ", ") {
  const ingredientsSource = ingredientsFor(row, lang);
  const stepsSource = translatedField(row, lang, "steps", row.steps_bg);
  return {
    name: translatedField(row, lang, "name", row.canonical_name_bg),
    description: translatedField(row, lang, "description", row.description_bg),
    base: translatedField(row, lang, "tag", fallbacks.base),
    ingredients: splitList(ingredientsSource).join(ingredientSeparator),
    recipe: paragraphs(stepsSource),
    difficulty: difficultyForLang(row, lang),
    country: countryForLang(row, lang, fallbacks.country),
    tag: translatedField(row, lang, "tag", fallbacks.tag),
  };
}

const editorialOverrides = {
  "BR-C013": {
    name_de: "Französische Socca mit Hummus, gerösteten Paprika und Rucola",
    name_es: "Socca francesa con hummus, pimientos asados y rúcula",
    name_fr: "Socca française au houmous, poivrons grillés et roquette",
    recipe_de: "<p>Kichererbsenmehl mit Wasser, Olivenöl und Salz verrühren.</p><p>Eine dünne Socca in einer sehr heißen Pfanne backen.</p><p>Mit Hummus bestreichen, dann Paprika, Rucola und Zitrone daraufgeben.</p>",
    recipe_es: "<p>Mezcla la harina de garbanzos con agua, aceite de oliva y sal.</p><p>Cocina una socca fina en una sartén muy caliente.</p><p>Unta con hummus y añade los pimientos, la rúcula y el limón.</p>",
    recipe_fr: "<p>Mélangez la farine de pois chiches avec l'eau, l'huile d'olive et le sel.</p><p>Faites cuire une fine socca dans une poêle bien chaude.</p><p>Tartinez de houmous, puis ajoutez les poivrons, la roquette et le citron.</p>",
  },
  "BR-C038": {
    recipe_fr: "<p>Mélangez la farine de sarrasin avec de l'eau et faites cuire de fines galettes.</p><p>Faites cuire les pommes de terre avec du cumin et du gingembre.</p><p>Servez avec l'achar de tomates.</p>",
  },
  "BR-C078": {
    name_de: "Hanoi Banh Mi Op La mit Pastete, Ei und eingelegtem Gemüse",
    name_es: "Banh mi op la de Hanói con paté, huevo y verduras encurtidas",
    name_fr: "Banh mi op la de Hanoï au pâté, oeuf et légumes marinés",
    description_de: "Knuspriges Baguette mit Ei, Pastete, eingelegten Karotten, Daikon, Gurke und Koriander.",
    description_es: "Baguette crujiente con huevo, paté, zanahorias encurtidas, daikon, pepino y cilantro.",
    description_fr: "Baguette croustillante garnie d'oeuf, de pâté, de carottes marinées, de daikon, de concombre et de coriandre.",
    recipe_de: "<p>Karotten und Daikon mit Essig und einer Prise Zucker marinieren.</p><p>Die Eier braten.</p><p>Die Baguettes mit Pastete und Mayonnaise bestreichen, dann Eier, Gemüse, Koriander und Chili daraufgeben.</p>",
    recipe_es: "<p>Marina las zanahorias y el daikon con vinagre y una pizca de azúcar.</p><p>Fríe los huevos.</p><p>Unta las baguettes con paté y mayonesa, luego añade los huevos, las verduras, el cilantro y el chile.</p>",
    recipe_fr: "<p>Faites mariner les carottes et le daikon dans du vinaigre avec une pincée de sucre.</p><p>Faites frire les oeufs.</p><p>Tartinez les baguettes de pâté et de mayonnaise, puis ajoutez les oeufs, les légumes, la coriandre et le piment.</p>",
  },
  "BR-C106": {
    description_de: "Goldene Bohnenküchlein mit pikanter Sauce, Gurke und frischem Salat.",
    description_es: "Buñuelos dorados de judías con salsa picante, pepino y ensalada fresca.",
    description_fr: "Beignets dorés de haricots avec sauce épicée, concombre et salade fraîche.",
    recipe_de: "<p>Bohnen einweichen und schälen.</p><p>Mit Zwiebel und Chili zu einer dicken Paste pürieren.</p><p>Kleine Bohnenküchlein ausbacken.</p><p>Mit Tomaten-Paprika-Sauce, Gurke und Limette servieren.</p>",
    recipe_es: "<p>Remoja y pela las judías.</p><p>Tritúralas con cebolla y chile hasta obtener una pasta espesa.</p><p>Fríe pequeños buñuelos.</p><p>Sirve con salsa de tomate y pimiento, pepino y lima.</p>",
    recipe_fr: "<p>Faites tremper les haricots et pelez-les.</p><p>Mixez-les avec l'oignon et le piment jusqu'à obtenir une pâte épaisse.</p><p>Faites frire de petits beignets.</p><p>Servez avec une sauce tomate-poivron, du concombre et du citron vert.</p>",
  },
  "BR-C109": {
    name_de: "Französische Buchweizen-Galette mit Ei und Pilzen",
    name_es: "Galette francesa de trigo sarraceno con huevo y champiñones",
    name_fr: "Galette bretonne au sarrasin avec oeuf et champignons",
    description_de: "Klassische Buchweizengalette mit Ei, Pilzen, Gruyère und grünem Salat.",
    description_es: "Galette clásica de trigo sarraceno con huevo, champiñones, gruyère y ensalada verde.",
    description_fr: "Galette classique au sarrasin avec oeuf, champignons, gruyère et salade verte.",
    recipe_de: "<p>Einen Buchweizenteig zubereiten und eine dünne Galette backen.</p><p>Pilze, Gruyère und Ei in die Mitte geben.</p><p>Die Ränder einklappen und weitergaren, bis das Ei gestockt ist.</p><p>Mit Rucola servieren.</p>",
    recipe_es: "<p>Prepara una masa de trigo sarraceno y cocina una galette fina.</p><p>Añade los champiñones, el gruyère y el huevo en el centro.</p><p>Dobla los bordes y sigue cocinando hasta que el huevo cuaje.</p><p>Sirve con rúcula.</p>",
    recipe_fr: "<p>Préparez une pâte de sarrasin et faites cuire une fine galette.</p><p>Ajoutez les champignons, le gruyère et l'oeuf au centre.</p><p>Repliez les bords et poursuivez la cuisson jusqu'à ce que l'oeuf soit pris.</p><p>Servez avec de la roquette.</p>",
  },
};

function applyEditorialOverrides(recipe) {
  const overrides = editorialOverrides[recipe.source_id];
  return overrides ? { ...recipe, ...overrides } : recipe;
}

function recipeFor(row, index, ingredientSeparator = ", ") {
  const base = row.tag || titleCaseBg(row.meal_type);
  const ingredients = splitList(ingredientsFor(row)).join(ingredientSeparator);
  const recipe = paragraphs(row.steps_bg);
  const difficulty = difficultyFor(row);
  const country = countryFor(row);
  const tag = row.tag || row.recipe_quality || "curated";
  const fallbacks = { base, country, tag };
  const en = localizedRecipeFields(row, "en", fallbacks, ingredientSeparator);
  const de = localizedRecipeFields(row, "de", fallbacks, ingredientSeparator);
  const es = localizedRecipeFields(row, "es", fallbacks, ingredientSeparator);
  const fr = localizedRecipeFields(row, "fr", fallbacks, ingredientSeparator);
  const ru = localizedRecipeFields(row, "ru", fallbacks, ingredientSeparator);

  return applyEditorialOverrides({
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
    description_fr: fr.description,
    name_fr: fr.name,
    base_fr: fr.base,
    ingredients_fr: fr.ingredients,
    recipe_fr: fr.recipe,
    difficulty_fr: fr.difficulty,
    country_fr: fr.country,
    tag_fr: fr.tag,
    description_ru: ru.description,
    name_ru: ru.name,
    base_ru: ru.base,
    ingredients_ru: ru.ingredients,
    recipe_ru: ru.recipe,
    difficulty_ru: ru.difficulty,
    country_ru: ru.country,
    tag_ru: ru.tag,
  });
}

function writeApp(rows, config) {
  const eligibleRows = rows
    .filter((row) =>
      config.primaryApps
        ? config.primaryApps.includes(row.app_primary)
        : isTrue(row[config.flag])
    )
    .filter((row) => {
      if (!config.excludeSeafood) return true;
      const text = `${row.canonical_name_bg || ""} ${row.name_en || ""} ${row.ingredients_bg || ""} ${row.ingredients_en || ""} ${row.ingredients_qty_bg || ""} ${row.ingredients_qty_en || ""}`.toLowerCase();
      return !/(риба|риба\s*тон|сьомга|треска|лаврак|скарид|мид|калмар|октопод|морски дар|fish|salmon|tuna|cod|sea bass|shrimp|prawn|mussel|squid|octopus|seafood)/i.test(text);
    })
    .filter((row) => imageFor(row));

  const featuredIds = [...(config.featured || [])];
  if (config.featuredNewest && featuredIds.length < config.featuredNewest) {
    const fixedIds = new Set(featuredIds);
    const recent = eligibleRows
      .filter((row) => !fixedIds.has(row.global_id))
      .sort((a, b) => Number(b[config.slot] || 0) - Number(a[config.slot] || 0))
      .slice(0, config.featuredNewest - featuredIds.length);

    const groupFor = (row) => {
      const text = `${row.canonical_name_bg || ""} ${row.tag || ""} ${row.ingredients_bg || ""}`.toLowerCase();
      if (/риб|сьомг|пъстър|тон|скарид|морск/.test(text)) return "fish";
      if (/яйц|омлет|шакшук|менемен|фритат/.test(text)) return "eggs";
      if (/палачин|галет|доса|креп|вафл|рости|лефсе/.test(text)) return "pancakes";
      if (/хляб|питк|тост|сандвич|пирож|банич|скон|качит|печив/.test(text)) return "breads";
      if (/боб|нахут|леща|дал|грах/.test(text)) return "legumes";
      if (/каша|ориз|овес|киноа|просо|мюсли|гранола/.test(text)) return "bowls";
      if (/плод|ябъл|круш|манго|банан|портокал|малин|боровин|мед|слад/.test(text)) return "sweet";
      return "world";
    };

    const groups = new Map();
    recent.forEach((row) => {
      const group = groupFor(row);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(row.global_id);
    });
    const buckets = Array.from(groups.values()).sort((a, b) => b.length - a.length);
    while (buckets.some((bucket) => bucket.length)) {
      buckets.forEach((bucket) => {
        if (bucket.length) featuredIds.push(bucket.shift());
      });
    }
  }

  const featuredOrder = new Map(
    featuredIds.map((sourceId, index) => [sourceId, index])
  );
  const physicalFeaturedOrder = new Map(
    (config.featured || []).map((sourceId, index) => [sourceId, index])
  );
  const orderedRows = eligibleRows
    .sort((a, b) => {
      const aFeatured = physicalFeaturedOrder.get(a.global_id);
      const bFeatured = physicalFeaturedOrder.get(b.global_id);
      if (aFeatured !== undefined || bFeatured !== undefined) {
        if (aFeatured === undefined) return 1;
        if (bFeatured === undefined) return -1;
        return aFeatured - bFeatured;
      }
      return Number(a[config.slot] || 9999) - Number(b[config.slot] || 9999);
    });
  const recipes = orderedRows
    .slice(0, config.limit || orderedRows.length)
    .map((row, index) => {
      const featuredRank = featuredOrder.get(row.global_id);
      return {
        ...recipeFor(row, index, config.ingredientSeparator),
        ...(featuredRank === undefined ? {} : { featured_rank: featuredRank }),
      };
    });

  fs.writeFileSync(
    path.join(root, config.dir, "data.js"),
    `window.BREAKFAST_DATA = ${JSON.stringify(recipes, null, 2)};\n`
  );
  return recipes.length;
}

const rows = recordsFromCsv(fs.readFileSync(csvPath, "utf8")).filter(
  (row) => row.status === "ready" && row.recipe_quality === "curated"
);

const selectedConfigs = targetApp
  ? appConfigs.filter((config) => config.dir === targetApp)
  : appConfigs;

if (targetApp && selectedConfigs.length === 0) {
  throw new Error(`Unknown app directory: ${targetApp}`);
}

for (const config of selectedConfigs) {
  const count = writeApp(rows, config);
  console.log(`Synced ${count} ${config.label} recipes.`);
}
