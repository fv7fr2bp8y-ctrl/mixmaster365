# Brunch 365

Този документ описва текущата production версия на Brunch 365, източниците на данни, начина за добавяне на рецепти, синхронизацията, проверките, публикуването, Google Play подготовката и резервните копия.

Последна проверка: **14 юли 2026 г.**

## 1. Текущо състояние

- Production: https://brunch.freefrom365.com
- GitHub: https://github.com/fv7fr2bp8y-ctrl/mixmaster365
- Vercel: проектът, свързан с това repository
- Android package: `eu.brunch365.twa`
- Рецепти: **365**
- Уникални Google Drive снимки: **365**
- Езици: български, английски, испански, френски, немски и руски
- Всички публикувани рецепти имат количества, инструкции, снимка и шестезично съдържание
- Интерфейсът е само със светла тема
- Публикуваният release commit е `e4b05b9`

Последният release audit минава с:

```text
recipes: 365
uniqueIds: 365
uniqueImages: 365
failures: 0
```

## 2. Граници на проекта

Brunch 365 е едно от шестте FreeFrom365 приложения. Файловете му са в `breakfast/`, но Vercel го публикува в root на отделния домейн.

MixMaster365 е отделното приложение за коктейли в root на repository. Не променяй root `index.html`, root `manifest.json`, root `sw.js` или `mocktails/`, когато задачата е само за Brunch.

## 3. Основни файлове

| Файл | Предназначение |
|---|---|
| `breakfast/index.html` | Интерфейс, шест езика, търсене, филтри, любими и споделяне |
| `breakfast/data.js` | Генериран production каталог; не се редактира ръчно |
| `breakfast/manifest.json` | PWA име, икони, screenshots и Android metadata |
| `breakfast/sw.js` | Offline/app-shell cache и ограничен runtime cache |
| `breakfast/privacy.html` | Политика за поверителност на английски и български |
| `breakfast/icon-*.png` | PWA и maskable икони |
| `breakfast/screenshots/` | PWA/Play screenshots, 1080 x 1920 |
| `scripts/sync-master-recipes.mjs` | Генерира `data.js` от master таблицата |
| `scripts/audit-brunch-release.mjs` | Строг release audit за Brunch |
| `vercel.json` | Host-based routing към шестте приложения |
| `google-play-assets/` | Икони, feature graphic, screenshots и Play бележки |

## 4. Източник на истината

Рецептите не се поддържат ръчно в HTML или `data.js`.

- Google Sheet: `FreeFrom365_All_Apps_Master`
- Spreadsheet ID: `1wxcQ28CslNUa_7-hrhkIKEuO6fF2HAkfSrKxRYmIRek`
- Tab: `Master_Recipes`
- Sheet ID / gid: `1571845576`
- URL: https://docs.google.com/spreadsheets/d/1wxcQ28CslNUa_7-hrhkIKEuO6fF2HAkfSrKxRYmIRek/edit
- Google Drive image folder ID: `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`
- Folder URL: https://drive.google.com/drive/folders/1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN

Google Sheet и Google Drive са source of truth. Локалният `breakfast/data.js` е генериран release артефакт.

## 5. Кога една рецепта става видима

Синхронизаторът публикува рецепта в Brunch само когато:

- `status=ready`;
- `recipe_quality=curated`;
- `is_breakfast=TRUE`;
- `image_status=ready`;
- `image_url` съдържа валиден Google Drive линк.

Рецепта без одобрена снимка остава в master таблицата, но не се показва на сайта.

## 6. Задължителни данни за нова рецепта

Всяка бъдеща рецепта трябва да има:

1. Уникален и постоянен `global_id`, например `BR-C230`.
2. Уникално българско и преведено заглавие.
3. Българско описание, съставки и стъпки.
4. Реални количества за конкретен брой порции.
5. Време за приготвяне, тип хранене и редакционен таг.
6. Коректна държава или кулинарен регион.
7. Английски, испански, френски, немски и руски превод.
8. Количества на всичките шест езика.
9. Коректни dietary flags.
10. Уникален `breakfast_slot`.
11. Една отделна одобрена снимка в Google Drive.
12. `status=ready`, `recipe_quality=curated`, `image_status=ready` само след проверка.

Не използвай шаблонни вариации само за достигане на брой. Преди добавяне сравнявай заглавието, основната техника, главните продукти и държавата със съществуващите 365 рецепти.

## 7. Правила за количествата

- Количествата трябва да могат да се използват директно в кухнята.
- Посочвай порции, грамове, милилитри, бройки, чаени и супени лъжици.
- Не оставяй списък само с имена на продукти.
- Количествата в преводите трябва да съвпадат с българските.
- Температурите и времената трябва да са еднакви във всички езици.
- Избягвай невъзможни порции и прекалено големи количества мазнина или сол.

## 8. Правила за преводите

Поддържан ред в езиковото меню:

1. English
2. Español
3. Français
4. Deutsch
5. Русский
6. Български

Преди публикуване провери:

- естествено заглавие, а не буквален машинен превод;
- кулинарните термини да са правилни за езика;
- името на държавата да не е преведено като продукт или животно;
- всяка стъпка да е пълно изречение;
- да няма български fallback в чужд език;
- количествата, температурите и порциите да съвпадат.

## 9. Правила за снимките

- Една нова снимка за една рецепта.
- Не се изрязват отделни кадри от contact sheet.
- Храната трябва да съвпада с рецептата и основните продукти.
- Предпочитан стил: естествена дневна светлина, реалистична редакционна food фотография.
- Без текст, лого, watermark, ръце, опаковки и случайна декорация.
- Без LoremFlickr или други динамични placeholder услуги.
- Production линкът винаги е Google Drive линк.
- Препоръчителен изход: квадратен PNG, минимум 1200 x 1200.

Именувай работния файл с ID и кратко име, например:

```text
BR-C230-country-dish-name.png
```

След генериране:

1. Прегледай снимката визуално.
2. Качи я в Drive folder `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`.
3. Запиши Drive file ID и линка в master таблицата.
4. Едва тогава постави `image_status=ready`.

## 10. Добавяне на бъдещи рецепти

Работи на проверени партиди от 12 рецепти:

1. Направи inventory на съществуващите рецепти по държава, техника и основен продукт.
2. Избери 12 различни и полезни предложения.
3. Напиши българските текстове и реалните количества.
4. Направи петте превода и езикова редакция.
5. Попълни флаговете и уникалните Brunch slots.
6. Генерирай 12 отделни снимки.
7. Провери снимките и ги качи в Drive по три.
8. Запиши Drive линковете и статусите в Sheet.
9. Export-ни master таблицата.
10. Синхронизирай само Brunch.
11. Пусни release audit с новия очакван брой.
12. Провери интерфейса на телефон и desktop.
13. Commit, push и production проверка.

След достигането на 365 не увеличавай броя автоматично. Новите рецепти могат:

- да заменят по-слаба или дублирана рецепта;
- да останат `draft`, докато се вземе продуктово решение за разширяване;
- да се добавят над 365 само ако името и позиционирането на продукта бъдат променени съзнателно.

## 11. Export и синхронизация

Export на master таблицата:

```bash
curl -L "https://docs.google.com/spreadsheets/d/1wxcQ28CslNUa_7-hrhkIKEuO6fF2HAkfSrKxRYmIRek/export?format=csv&gid=1571845576" \
  -o /tmp/freefrom365_master.csv
```

Синхронизиране само на Brunch:

```bash
node scripts/sync-master-recipes.mjs /tmp/freefrom365_master.csv breakfast
```

Синхронизиране на шестте приложения:

```bash
node scripts/sync-master-recipes.mjs /tmp/freefrom365_master.csv
```

Не редактирай `breakfast/data.js` ръчно. Поправката се прави в Sheet и след това се синхронизира отново.

## 12. Задължителни проверки

Строг Brunch audit:

```bash
node scripts/audit-brunch-release.mjs 365
```

Той проверява:

- точен брой рецепти;
- уникални ID;
- уникални Drive снимки;
- задължителни полета;
- количества във всеки език;
- липсващи преводи;
- точен и близък дубликат на заглавия;
- manifest, икони, screenshots и service worker.

Синтаксис и JSON:

```bash
node --check breakfast/data.js
node --check breakfast/sw.js
node --check scripts/sync-master-recipes.mjs
node --check scripts/audit-brunch-release.mjs
node -e "JSON.parse(require('fs').readFileSync('breakfast/manifest.json'))"
node -e "JSON.parse(require('fs').readFileSync('breakfast/.well-known/assetlinks.json'))"
```

Провери и реалното отваряне на всички Drive images, не само наличието на URL.

## 13. Интерфейс и функционалност

Преди release провери на mobile и desktop:

- заглавие и горни бутони;
- Brunch of the Day и снимката му;
- търсене по име и съставка;
- филтри и броячи с арабски цифри;
- хоризонтално скролиране на филтрите без page overflow;
- любими и запазване в localStorage;
- споделяне на директен URL `?r=<global_id>`;
- езиците в правилния ред;
- преведени съставки, количества, държави и стъпки;
- contact `office@newage-studio.com`;
- privacy линк и back-to-top;
- липса на console errors и счупени снимки.

## 14. PWA и cache

При промяна на cached файлове:

1. Увеличи версията в `breakfast/sw.js`.
2. При голяма промяна на данните увеличи query версията на `data.js` в `breakfast/index.html`.
3. Провери manifest, иконите, maskable иконите и screenshots.

Runtime cache е ограничен, за да не записва стотици големи Drive снимки в устройството.

## 15. Публикуване

Нормален release flow:

1. Sheet и Drive са завършени.
2. Export и sync.
3. Audit и browser проверки.
4. Преглед на `git diff`.
5. Stage само на Brunch файловете.
6. Commit.
7. Push към production branch:

```bash
git push origin HEAD:main
```

8. Изчакай Vercel.
9. Сравни production `data.js`, manifest, service worker и privacy page с локалните файлове.
10. Провери директно https://brunch.freefrom365.com.

## 16. Google Play

Готови материали:

- package: `eu.brunch365.twa`;
- manifest и Digital Asset Links;
- app и maskable икони;
- feature graphic 1024 x 500;
- три актуални screenshots 1080 x 1920;
- privacy policy;
- store listing draft в `google-play-assets/`.

Преди реално качване:

- генерирай/провери Android App Bundle;
- потвърди SHA-256 fingerprint от Play App Signing в `assetlinks.json`;
- попълни Data safety, Content rating и App access;
- ако се добавя платено отключване в Android, използвай Google Play Billing, не Stripe вътре в приложението.

Текущата web/PWA версия на Brunch няма account, ads или payment flow.

## 17. Резервни копия

Repository вече се намира в OneDrive:

```text
/Users/spasspasov/Library/CloudStorage/OneDrive-Personal/App Projects/MixMaster365
```

Отделният production backup трябва да съдържа:

- Brunch source snapshot;
- master Sheet export като CSV и XLSX;
- 365 локални копия на Drive снимките;
- image inventory с ID, име и Drive URL;
- Google Play assets;
- Git bundle с цялата история;
- този README и checksum manifest.

Не слагай API ключове, Stripe secrets, Vercel tokens или други credentials в backup или Git.

## 18. Възстановяване

При повреден локален проект:

1. Възстанови Git repository от GitHub или `.bundle` архива.
2. Върни Brunch source snapshot.
3. Провери master Sheet export и image inventory.
4. Export-ни актуалния Sheet от Google, ако е достъпен.
5. Sync-ни `breakfast/data.js`.
6. Пусни `node scripts/audit-brunch-release.mjs 365`.
7. Публикувай едва след нула failures.

## 19. Следващи разумни задачи

1. Финална проверка на Google Play Console и Android bundle.
2. Решение за free, freemium или еднократно плащане.
3. При платено Android съдържание: Google Play Billing и server-side entitlement.
4. Периодичен editorial review на рецепти и преводи.
5. Подмяна на рецепта само след сравнение и пълен release audit.

