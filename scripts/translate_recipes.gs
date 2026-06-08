// MixMaster — Recipe translation via Gemini (BG → EN/DE/ES/RU)
// AUTO MODE: run startAuto() ONCE — a timer re-runs it every 5 min until done.
// stopAuto() cancels the timer. checkTranslationProgress() shows status.

const API_KEY   = 'PASTE_YOUR_GEMINI_KEY_HERE';

const SHEET_ID  = '1GNVZxY3X6k3iDRWLu8CAL2sNM0I2GcI5FiWLXZYQ1hk';
const SHEET_GID = 116292126;    // 116292126 = безалкохолни | 2075268599 = коктейли

const BATCH_SIZE = 25;          // rows per run (fits in 6-min limit)
const LANGS  = ['en','de','es','ru'];
const FIELDS = ['name','base','ingredients','recipe'];

// ===== AUTO TRIGGER CONTROL =====
function startAuto() {
  stopAuto();
  ScriptApp.newTrigger('translateAll').timeBased().everyMinutes(5).create();
  Logger.log('▶ Авто-режим стартиран — преводът ще върви сам на всеки 5 мин.');
  translateAll();
}
function stopAuto() {
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (tr.getHandlerFunction() === 'translateAll') ScriptApp.deleteTrigger(tr);
  });
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheets().find(s => s.getSheetId() === SHEET_GID) || ss.getActiveSheet();
}

function ensureColumns_(sheet) {
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => (h||'').toString().trim());
  const colOf = {};
  headers.forEach((h, i) => { if (h) colOf[h] = i + 1; });
  const needed = [];
  LANGS.forEach(l => FIELDS.forEach(f => { const key = f + '_' + l; if (!colOf[key]) needed.push(key); }));
  if (needed.length) {
    let next = sheet.getLastColumn() + 1;
    needed.forEach(key => { sheet.getRange(1, next).setValue(key); colOf[key] = next; next++; });
  }
  const fixed = { name:2, base:3, ingredients:6, recipe:7 };
  ['name','base','ingredients','recipe'].forEach(f => { if (!colOf[f]) colOf[f] = fixed[f]; });
  return colOf;
}

function translateAll() {
  const sheet  = getSheet_();
  const colOf  = ensureColumns_(sheet);
  const lastRow = sheet.getLastRow();
  const data    = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();

  // Are there any rows left?
  const remaining = data.slice(1).filter(r => {
    const nm = (r[colOf['name']-1]||'').toString().trim();
    const en = (r[colOf['name_en']-1]||'').toString().trim();
    return nm && !en;
  }).length;

  if (remaining === 0) {
    stopAuto();
    Logger.log('✅ ВСИЧКО ГОТОВО! Всички редове са преведени. Таймерът е спрян.');
    return;
  }

  let processed = 0, errors = 0;
  for (let r = 1; r < data.length && processed < BATCH_SIZE; r++) {
    const rowNum = r + 1;
    const name   = (data[r][colOf['name']-1] || '').toString().trim();
    if (!name) continue;
    if ((data[r][colOf['name_en']-1] || '').toString().trim()) continue;

    const src = {
      name: name,
      base:        (data[r][colOf['base']-1] || '').toString().trim(),
      ingredients: (data[r][colOf['ingredients']-1] || '').toString().trim(),
      recipe:      (data[r][colOf['recipe']-1] || '').toString().trim(),
    };
    const out = translateRow_(src);
    if (out) {
      LANGS.forEach(l => FIELDS.forEach(f => {
        sheet.getRange(rowNum, colOf[f + '_' + l]).setValue(out[l] && out[l][f] != null ? out[l][f] : '');
      }));
      SpreadsheetApp.flush();
      Logger.log('✅ ' + rowNum + ' ' + name);
      processed++;
    } else { Logger.log('FAILED: ' + name); errors++; }
    Utilities.sleep(4000);
  }
  Logger.log('Партида: +' + processed + ' | грешки: ' + errors + ' | оставаха: ' + remaining);
}

function translateRow_(src) {
  const prompt =
    'You are a professional translator for a premium cocktail app. ' +
    'Translate the following Bulgarian drink data into English, German, Spanish and Russian.\n' +
    'RULES:\n' +
    '- Keep international cocktail names as-is (e.g. "Cosmopolitan", "Mojito").\n' +
    '- Translate descriptive Bulgarian names naturally.\n' +
    '- In "ingredients": translate words but KEEP all numbers; convert unit "мл" to "ml". Keep comma separators.\n' +
    '- In "recipe": preserve any HTML tags exactly (e.g. <p></p>), translate only inner text.\n' +
    '- Return STRICT JSON only: {"en":{"name":"","base":"","ingredients":"","recipe":""},"de":{...},"es":{...},"ru":{...}}\n\n' +
    'DATA (Bulgarian):\nname: ' + src.name + '\nbase: ' + src.base +
    '\ningredients: ' + src.ingredients + '\nrecipe: ' + src.recipe + '\n';

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  for (const model of models) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + API_KEY;
    const resp = UrlFetchApp.fetch(url, {
      method: 'post', headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, responseMimeType: 'application/json' } }),
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() === 200) {
      try {
        const obj = JSON.parse(JSON.parse(resp.getContentText()).candidates[0].content.parts[0].text);
        if (obj.en && obj.de && obj.es && obj.ru) return obj;
      } catch (e) { Logger.log('parse err ' + model + ': ' + e.message); }
    }
  }
  return null;
}

function checkTranslationProgress() {
  const sheet  = getSheet_();
  const colOf  = ensureColumns_(sheet);
  const lastRow = sheet.getLastRow();
  const vals = sheet.getRange(2, colOf['name_en'], lastRow - 1, 1).getValues();
  const done = vals.filter(r => (r[0]||'').toString().trim()).length;
  Logger.log('✅ Преведени: ' + done + ' / ' + (lastRow - 1) + ' | ⏳ Остатъчни: ' + (lastRow - 1 - done));
}
