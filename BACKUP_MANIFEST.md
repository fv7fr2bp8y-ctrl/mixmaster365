# Brunch 365 production backup

Този манифест описва пълното production копие на Brunch 365, направено на **14 юли 2026 г.**

## Състояние на архива

- Production URL: https://brunch.freefrom365.com
- Рецепти: **365**
- Оригинални снимки: **365**
- Езици: английски, испански, френски, немски, руски и български
- Всички рецепти имат количества, преводи, инструкции и уникална снимка
- Source of truth: Google Sheet `1wxcQ28CslNUa_7-hrhkIKEuO6fF2HAkfSrKxRYmIRek`
- Google Drive image folder: `1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN`
- Последен production release преди документацията: `e4b05b9d8ccf073cbeefa1d2ca730f43eea8b6a0`

## Местоположение в OneDrive

```text
App Projects/Backups/Brunch365/2026-07-14-production/
```

## Съдържание

| Папка или файл | Съдържание |
|---|---|
| `source/breakfast/` | Пълният production source на Brunch PWA |
| `images/` | 365 оригинални PNG снимки от Google Drive |
| `data/FreeFrom365_All_Apps_Master_2026-07-14.csv` | CSV export на master таблицата |
| `data/FreeFrom365_All_Apps_Master_2026-07-14.xlsx` | XLSX export на master таблицата |
| `data/brunch-365-data.js` | Точно копие на генерирания Brunch каталог |
| `data/brunch-365-image-inventory.csv` | Връзка между recipe ID, Drive ID и архивен файл |
| `data/image-backup-report.json` | Резултат от проверката на 365-те снимки |
| `scripts/` | Sync и release audit скриптове |
| `google-play-assets/` | Икони, screenshots, splash и feature graphic |
| `docs/` | README, Play бележки, store listing и Vercel routing |
| `git/mixmaster365-all-history-2026-07-14.bundle` | Пълна Git история с всички refs |
| `SHA256SUMS.txt` | SHA-256 контролни суми за всички архивирани файлове |

## Проверка на целостта

От root папката на архива:

```bash
shasum -a 256 -c SHA256SUMS.txt
```

Всички редове трябва да завършват с `OK`.

## Възстановяване

### Само Brunch сайта

1. Копирай `source/breakfast/` в `breakfast/` на repository.
2. Копирай `scripts/` и `docs/vercel.json` на съответните им места.
3. Пусни `node scripts/audit-brunch-release.mjs 365`.
4. Commit-ни, push-ни и провери production домейна.

### Цялото Git repository

```bash
git clone git/mixmaster365-all-history-2026-07-14.bundle MixMaster365-restored
```

След clone добави отново GitHub remote, ако е необходимо.

### Данните и снимките

Master CSV/XLSX пазят snapshot на цялата таблица. Папка `images/` пази оригиналите, а `brunch-365-image-inventory.csv` свързва всеки файл с recipe ID и Google Drive file ID.

## Важно

- Архивът не съдържа API ключове, Stripe secrets, пароли или други environment secrets.
- Google Sheet и Google Drive остават оперативният source of truth.
- Архивът е отделен snapshot за възстановяване и не трябва да се редактира като работно копие.
- За бъдещи рецепти следвай процеса в `BRUNCH365_README.md`, на проверени партиди по 12.
