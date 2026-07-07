# MixMaster365 Apps

This repository now contains several related recipe/drink PWAs:

- Main MixMaster cocktail/mocktail app at `/`
- Brunch 365 at `/breakfast/`
- Healthy Gut 365 at `/free-from/`

For the current Healthy Gut work, read:

- `HEALTHY_GUT_README.md`
- `OTHER_CHAT_HANDOFF.md`
- `google-play-assets/PLAY_PREP.md`

Latest Healthy Gut status as of 2026-07-07:

- App file: `free-from/index.html`
- Recipes in app: 36
- Drive images in app: 36
- Google Sheet recipes: 365
- Ready image rows in sheet: 36
- Current service worker cache: `healthy-gut-365-v18`
- Production image policy: Google Drive + Google Sheet, not local recipe image paths.

---

# MixMaster · Atelier 🍸

Art-Deco каталог с **365 коктейла + 365 безалкохолни** напитки. PWA, 5 езика, AI скенер за бутилки, ml/oz, Cocktail of the Day.

**Live:** https://mixmaster365.eu · **Repo:** `fv7fr2bp8y-ctrl/mixmaster365` (branch `main`)

---

## 🗂 Структура на репото

| Файл | Какво е |
|---|---|
| `index.html` | Цялото приложение (single-file). Това е, което GitHub Pages сервира. |
| `MixMaster365-Deco v0.4.html` | Огледало на index.html (текуща версия). |
| `manifest.json` | PWA манифест. |
| `sw.js` | Service worker (офлайн кеш). Вдигай `CACHE_NAME` при ъпдейт. |
| `icon-192.png` / `icon-512.png` | PWA икони. |
| `privacy.html` | Политика за поверителност (двуезична) — за Google Play. |
| `CNAME` | `mixmaster365.eu` (custom domain). |
| `scripts/*.gs` | Google Apps Script помощници (виж по-долу). |

---

## 🔑 API ключ (Gemini)

Скриптовете в `scripts/` имат `PASTE_YOUR_GEMINI_KEY_HERE`. Вземи ключ от
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) и го постави преди пускане.
**Не качвай ключа в публичния repo.**

Ключът за уеб приложението (бутилков скенер) е в `index.html` като `geminiKey` (`AIza...`) — този може да е публичен.

---

## 📊 Данни (Google Sheets)

Една таблица, два таба (tab):
- **Spreadsheet ID:** `1GNVZxY3X6k3iDRWLu8CAL2sNM0I2GcI5FiWLXZYQ1hk`
- **Коктейли:** `gid=2075268599`
- **Безалкохолни:** `gid=116292126`

Колони: `id, name, base, icon, image, ingredients, recipe` + по 4 преводни колони на език
(`name_en, base_en, ingredients_en, recipe_en, … _de, _es, _ru`) = 23 колони общо.

**Универсален endpoint** (връща всички колони като JSON):
```
https://script.google.com/macros/s/AKfycbwo8yV8kY20USsHptW_Mvd8wNXI_jBoOLtq6UI58ys7O9SgxxbAnMAeDrrWaEwriMS2/exec?gid=<GID>
```
Кодът му е `scripts/doGet_universal.gs`. В `index.html`: `apiUrl` = коктейли, `mocktailsUrl` = безалкохолни.

Бърза проверка на прогреса:
```bash
curl -sL "https://docs.google.com/spreadsheets/d/1GNVZxY3X6k3iDRWLu8CAL2sNM0I2GcI5FiWLXZYQ1hk/export?format=csv&gid=116292126" | \
python3 -c "import csv,sys; r=list(csv.reader(sys.stdin)); h=r[0]; ni=h.index('name_en'); ii=h.index('image'); \
print('преводи', sum(1 for x in r[1:] if len(x)>ni and x[ni].strip()),'/365'); \
print('снимки', sum(1 for x in r[1:] if len(x)>ii and x[ii].strip().startswith('http')),'/365')"
```

---

## ⚙️ Apps Script помощници (`scripts/`)

Всеки е **авто-режим**: пускаш `startAuto()` веднъж → таймер го върти сам до край → спира се сам.
`stopAuto()` спира таймера. Виж напредък с `checkProgress()` / `checkTranslationProgress()`.

| Скрипт | Функция | Бележки |
|---|---|---|
| `translate_recipes.gs` | превежда BG → EN/DE/ES/RU | Постави ключ. Смени `SHEET_GID` за другия таб. |
| `generate_images.gs` | генерира снимки (Gemini image) | Записва в Google Drive, линк в колона E. |
| `doGet_universal.gs` | endpoint-ът | Deploy → Web app → Anyone. |

**Важно:** всеки скрипт = **отделен Apps Script проект** (иначе `const API_KEY` се дублира → грешка).
6-минутният лимит е нормален — таймерът продължава автоматично.

---

## ✅ Статус (към 7 юни 2026)

| | Коктейли | Безалкохолни |
|---|---|---|
| Снимки | 365/365 ✅ | ~127/365 ⏳ (таймер върви) |
| Преводи (×4 ез.) | 365/365 ✅ | 365/365 ✅ |

Готово също: домейн + HTTPS, PWA (manifest/SW/икони), privacy policy, 5 езика, ml⇄oz, Cocktail of the Day, споделяне, age gate (под 18 → само безалкохолни), бутилков скенер.

---

## 💰 Монетизация — Freemium (внедрено ✅)

- **Безплатно:** всички 365 безалкохолни + първите 20 коктейла (пълна рецепта) + преглед на всички коктейли (снимка/име/база).
- **Премиум (€3.99 еднократно):** рецептите на коктейли 21–365 + AI скенер за бутилки.
- Код: `isLocked()`, `openPaywall()`, `buyPremium()`/`restorePremium()` (Google Play Billing през Digital Goods API). Флаг в `localStorage['mixmaster-premium']`.
- SKU: **`premium_unlock`**. Цена-етикет в `PRICE_LABEL` (`index.html`); реалната цена идва от Play.

## ⏳ ТЕКУЩ БЛОКЕР (Play publishing)

Play приложението е създадено с package **`eu.mixmaster365.app`**, но PWABuilder билдът
излиза с **`eu.mixmaster365.twa`** → Play отказва. При повторно сваляне PWABuilder върна
**кеширан** стар билд (1913867 байта, идентичен) дори след смяна на Package ID.

**Решение — генерирай ПРЕСЕН билд:**
- PWABuilder → hard refresh → `https://mixmaster365.eu` → Android
- **Package ID: `eu.mixmaster365.app`** (задължително)
- Signing key: **Use mine** → `signing.keystore` + alias/пароли от `signing-key-info.txt`
  (в `~/Downloads/MixMaster - Google Play package/`)
- Изчакай да СТРОИ → свали. Провери package ПРЕДИ качване:
  ```bash
  unzip -p NEW.aab base/manifest/AndroidManifest.xml | strings | grep -c '\.twa\.DYNAMIC'
  # 0 = правилно (.app);  >0 = пак е .twa (грешен/кеширан)
  ```
- Ако пак кешира → построй локално: `npx @bubblewrap/cli init --manifest https://mixmaster365.eu/manifest.json`
- След правилния .aab: качи → App integrity → копирай **App signing SHA-256** →
  добави го в `.well-known/assetlinks.json` (към съществуващия) → публикувай.

## 🚀 Остава до Google Play

1. ✅ Снимки + преводи (365/365 за двете) — **готово**.
2. ✅ Freemium заключване — **готово**.
3. **Play Console** ($25) → създай **managed product** с ID `premium_unlock`, цена €3.99.
4. **TWA билд:** [pwabuilder.com](https://pwabuilder.com) → `https://mixmaster365.eu` → Android →
   **включи Google Play Billing** в опциите → свали `.aab`.
5. **assetlinks.json:** PWABuilder дава SHA-256 → създай `/.well-known/assetlinks.json` в репото.
6. **Обява:** скрийншоти, икона, content rating (алкохол → 18+),
   privacy policy = `https://mixmaster365.eu/privacy.html`, качи `.aab`.

---

## 🛠 Как да редактирам приложението

`index.html` е всичко. След промяна:
```bash
cp index.html "MixMaster365-Deco v0.4.html"   # синхронизирай огледалото
# вдигни CACHE_NAME в sw.js (mixmaster-vN+1), за да получат хората новото
git add -A && git commit -m "..." && git push origin main
```
GitHub Pages се ъпдейтва за ~1 мин. Хард рефреш: **Cmd+Shift+R**.

### Архитектура накратко
- **i18n:** обект `I18N` + `t(key)` + `data-i18n` атрибути. Език в `localStorage['mixmaster-lang']`.
- **Преводи на съдържание:** `loc(item, field)` връща `item.<field>_<lang>` или пада на български.
- **Единици:** `convertUnits(text)` (мл/ml → oz). Избор в `localStorage['mixmaster-unit']`.
- **Логиката** (филтри, любими, COTD) винаги ползва оригиналните български полета.

---

## 🍎 iOS / App Store (за по-късно — отложено)

Apple не позволява просто TWA-обвиване (Guideline 4.2 отхвърля „wrapped website").
**Препоръчан път: Capacitor** (нативна черупка + native plugins).

Предпоставки:
- Apple Developer Program — **$99/година**
- **Xcode** (пълен, ~7GB, от Mac App Store) + CocoaPods (Mac ✅ наличен)
- **StoreKit** IAP вместо Play Billing → нужен нативен мост за премиума (уеб Digital Goods API не работи на iOS)

План (когато решим): `npm i @capacitor/core @capacitor/cli` → `npx cap init` → добави iOS платформа →
плъгини (camera, in-app-purchase/StoreKit, preferences) → Xcode archive → App Store Connect.
Един Capacitor проект може да обслужи и трите апа (config per app).
