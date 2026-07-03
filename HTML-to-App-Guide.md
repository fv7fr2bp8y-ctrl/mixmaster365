# HTML → App: наръчник (изпитан на практика)

Как единичен `index.html` (PWA) става **публикувано приложение** на Google Play (и план за iOS).
Базиран на реалния опит с MixMaster / 365 Mocktails / 365 Breakfast.

---

## 0. Предпоставки на уеб апп-а (PWA)
Приложението е един `index.html` + тези файлове, хостнати на **HTTPS** домейн:
- `manifest.json` — `name`, `short_name`, `start_url`, `scope`, `display:"standalone"`, `theme_color`, икони 192 + 512 (`purpose:"any maskable"`).
- `sw.js` — service worker (офлайн кеш). Вдигай `CACHE_NAME` при всеки ъпдейт.
- `icon-192.png`, `icon-512.png`.
- Хостинг: GitHub Pages + custom domain (CNAME) работи чудесно и е безплатно.

Няколко апа на един домейн: сложи всеки в подпапка (`/mocktails/`, `/breakfast/`) със свой `manifest.json` (`scope` и `start_url` сочат подпапката) и свой `sw.js`.

---

## 1. Android → Google Play (TWA чрез PWABuilder)

### 1.1 Билд
1. [pwabuilder.com](https://www.pwabuilder.com) → въведи **точния URL** (с подпапката, напр. `https://site.eu/mocktails/`).
   ⚠️ Провери, че показва правилното име + икона (иначе чете кеширан друг manifest).
2. **Package For Stores → Android → Google Play → Options:**
   - **Package ID** — задай своя (напр. `eu.myapp.app`). Не може да се сменя после.
   - **Signing key: New** (или **Use mine** + keystore при повторен билд).
   - ☑ **Google Play Billing** (ако има премиум/IAP).
   - Start URL = подпапката (напр. `/mocktails/`).
3. **Download** → изчакай да **СТРОИ** → разархивирай zip-а.
   Вътре: `.aab`, `signing.keystore`, `signing-key-info.txt` (**пази ги!** — трябват за ъпдейти).

### 1.2 ⚠️ КАПАН: PWABuilder кешира по хост
PWABuilder често връща **кеширан билд** с package, деривиран от хоста (напр. `eu.host.twa`),
**игнорирайки** твоето Package ID. Затова **винаги проверявай package-а ПРЕДИ качване**:
```bash
unzip -p app.aab base/manifest/AndroidManifest.xml | strings | grep -oE 'eu\.[a-z0-9.]+\.(app|twa)\.[A-Z]' | sort -u
unzip -p app.aab base/resources.pb | strings | grep -o 'https://site.eu/subfolder/'   # start_url верен?
```
Ако package-ът не е твоят: (а) hard refresh + пресъздай, или (б) **приеми деривирания package**
(той е вътрешен, невидим за потребителя — само в store URL-а) и създай Play апп-а с него.

### 1.3 Play Console
1. **Create app** → име, **Package name = точния от .aab**, App, **Free**.
2. **Set up your app** задачи:
   - App access: all functionality available
   - Ads: No (ако няма реклами)
   - **Content rating**: въпросник → рейтингът зависи от съдържанието (алкохол → 18+; храна → Everyone)
   - Target audience, Data safety (камера → услуга, не се съхранява; иначе no data)
   - Store settings: категория, contact email, website
   - **Privacy policy URL** (задължителна — хостни `privacy.html`)
3. **Store listing**: заглавие, кратко (80) + пълно (4000) описание, икона 512,
   feature graphic 1024×500, **phone screenshots** (мин. 2) + tablet.

### 1.4 ⚠️ КАПАН: Metadata policy (скрийншоти)
Google **отхвърля** скрийншоти, които изглеждат като промо-постери (само лого/текст).
Правило: **≥50% реален UI**. Формула: горе ~22% caption банер, долу ~78% **реален екран** в device frame.
Генерирай реални екрани с **headless Chrome**:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --window-size=720,1280 --force-device-scale-factor=2 --virtual-time-budget=20000 \
  --run-all-compositor-stages-before-draw --screenshot=out.png --user-data-dir=/tmp/p "http://localhost:PORT/app/#state"
```
(сервирай локално копие; в URL хеш зареди състояние: home/recipe/settings и т.н.)

### 1.5 Release + подпис
1. **Production → Create release** → Upload `.aab` → приеми **Play App Signing**.
2. **Countries/regions** → Select all. → Save.
3. **Digital Asset Links (за full-screen TWA без адресна лента):**
   Google преподписва с **свой** ключ → нужен е **App signing key SHA-256** (не upload key).
   Вземи го: Latest bundles → bundle → **Downloads** → свали „Signed universal APK" → извади:
   ```bash
   keytool -printcert -jarfile signed.apk | grep SHA256
   ```
   Сложи го в `https://site.eu/.well-known/assetlinks.json` (един файл може да съдържа
   **няколко приложения** на един домейн — по едно statement за package):
   ```json
   [{ "relation":["delegate_permission/common.handle_all_urls"],
      "target":{ "namespace":"android_app", "package_name":"eu.myapp.app",
                 "sha256_cert_fingerprints":["<APP_SIGNING_SHA256>"] } }]
   ```
   ⚠️ GitHub Pages не сервира папки с точка → добави празен `.nojekyll` в root.
4. **Publishing overview → Send N changes for review** (Managed publishing off = авто-публикуване при одобрение).

### 1.6 Монетизация (IAP)
- **Merchant акаунт** (еднократно за целия Play акаунт): Monetize → Get started →
  бизнес инфо + банка + данъци (**финансова стъпка — прави я собственикът**).
- **One-time products** → Product ID = **точно каквото кодът търси** (напр. `premium_unlock`),
  цена, Activate. Purchase option ID (тире, не underscore).
- В кода: покупката минава през **Digital Goods API + PaymentRequest** (`https://play.google.com/billing`) —
  работи само вътре в TWA/апп-а; на уеб показвай „Get it on Google Play" значка.

### 1.7 Чести грешки
- „package name mismatch" → .aab package ≠ Play апп package (виж 1.2).
- „signed with the wrong key" → преизползвай **същия keystore** при повторен билд (Use mine).
- „No countries selected" → добави държави в Production track.
- „doGet was deleted" → не пипай/пре-деплойвай Apps Script endpoint проекта.

---

## 2. Секрети / API ключове
- **Никога** не слагай billing-ключ в публичен клиентски код — GitHub secret scanning блокира push
  и всеки може да го извлече (билинг злоупотреба).
- AI извиквания дръж **server-side** (Google Apps Script / прокси). Клиентът вика твоя endpoint,
  ключът стои в скрипта (не в repo-то).

---

## 3. iOS / App Store (по-скъпо и по-строго)
Apple **не** позволява просто обвиване на уебсайт (Guideline 4.2). Няма TWA-еквивалент.
- Акаунт: **$99/година**. Инструмент: **Xcode** (пълен, ~7GB) + CocoaPods + Mac.
- **StoreKit** IAP (не Play Billing) → нужен нативен мост за покупките.
- Препоръка: **Capacitor** (нативна черупка + плъгини: camera, StoreKit, preferences).
  ```
  npm i @capacitor/core @capacitor/cli
  npx cap init "App" eu.myapp.app --web-dir=www
  npx cap add ios && npx cap open ios   # Xcode → archive → App Store Connect
  ```
  Един Capacitor проект → много апове (config per app).

---

## 4. „365 X" фабрика (data-driven двигател)
Един `index.html` двигател обслужва много апове само със смяна на **данни + бранд**:
1. Генерирай 365 реда (CSV) → Google Sheet.
2. Универсален GAS endpoint (`doGet` header-keyed JSON, param `?ssid=&gid=`).
3. `generate_images.gs` (Gemini, авто-таймер) → снимки в колона `image`.
4. `translate_recipes.gs` (Gemini) → колони `name_en … recipe_ru` (5 езика).
5. Transform на `index.html`: бранд, филтри (`base` категориите), иконата, endpoint URL, SKU/цена.
6. Deploy `/subfolder/` → PWABuilder → Play (виж раздел 1).

Архитектура на апп-а: `I18N` + `t()` + `data-i18n`; `loc(item,field)` за локализирано съдържание
(fallback на оригинала); `convertUnits()` за мл↔oz; логиката (филтри/любими/COTD) ползва оригиналните полета.
