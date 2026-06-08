// MixMaster — Image generation via Gemini
// AUTO MODE: run startAuto() ONCE — a timer re-runs it every 8 min until done.
// stopAuto() cancels the timer. checkProgress() shows status.

const API_KEY    = 'PASTE_YOUR_GEMINI_KEY_HERE';
const SHEET_ID   = '1GNVZxY3X6k3iDRWLu8CAL2sNM0I2GcI5FiWLXZYQ1hk';
const SHEET_GID  = 116292126;   // 116292126 = безалкохолни | 2075268599 = коктейли
const FOLDER     = 'MixMaster Mocktails';
const BATCH_SIZE = 16;          // images per run (fits 6-min limit)

// ===== AUTO TRIGGER CONTROL =====
function startAuto() {
  stopAuto();
  ScriptApp.newTrigger('generateAllImages').timeBased().everyMinutes(10).create();
  Logger.log('▶ Авто-режим стартиран — снимките ще се генерират сами на всеки 10 мин.');
  generateAllImages();
}
function stopAuto() {
  ScriptApp.getProjectTriggers().forEach(tr => {
    if (tr.getHandlerFunction() === 'generateAllImages') ScriptApp.deleteTrigger(tr);
  });
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheets().find(s => s.getSheetId() === SHEET_GID) || ss.getActiveSheet();
}
function getOrCreateFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function generateAllImages() {
  const sheet   = getSheet_();
  const folder  = getOrCreateFolder_(FOLDER);
  const lastRow = sheet.getLastRow();
  const data    = sheet.getRange(2, 1, lastRow - 1, 5).getValues(); // A..E

  const remaining = data.filter(r => {
    const nm = (r[1]||'').toString().trim();
    const img = (r[4]||'').toString().trim();
    return nm && !img.startsWith('http');
  }).length;

  if (remaining === 0) {
    stopAuto();
    Logger.log('✅ ВСИЧКО ГОТОВО! Всички снимки са генерирани. Таймерът е спрян.');
    return;
  }

  let processed = 0, errors = 0;
  for (let i = 0; i < data.length && processed < BATCH_SIZE; i++) {
    const rowNum = i + 2;
    const name   = (data[i][1] || '').toString().trim();
    const base   = (data[i][2] || '').toString().trim();
    const exist  = (data[i][4] || '').toString().trim();
    if (!name || exist.startsWith('http')) continue;

    const bytes = callGeminiImage_(name, base);
    if (bytes) {
      const safe = name.replace(/[^\w\s-]/g, '').trim() || ('drink_' + rowNum);
      const file = folder.createFile(Utilities.newBlob(bytes, 'image/png', safe + '.png'));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      sheet.getRange(rowNum, 5).setValue('https://drive.google.com/file/d/' + file.getId() + '/view?usp=sharing');
      SpreadsheetApp.flush();
      Logger.log('✅ ' + rowNum + ' ' + name);
      processed++;
    } else { Logger.log('FAILED: ' + name); errors++; }
    Utilities.sleep(5000);
  }
  Logger.log('Партида: +' + processed + ' | грешки: ' + errors + ' | оставаха: ' + remaining);
}

function callGeminiImage_(name, base) {
  const prompt =
    'Professional mocktail photography, elegant crystal glass with ' + name + ' non-alcoholic drink, ' +
    (base ? base + ' based, ' : '') +
    'dark moody bar background, Art Deco gold accents, dramatic side lighting, ' +
    'cinematic atmosphere, photorealistic, high resolution, no text, no people';

  const models = ['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image'];
  for (const model of models) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + API_KEY;
    const resp = UrlFetchApp.fetch(url, {
      method: 'post', headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } }),
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() === 200) {
      const parts = (((JSON.parse(resp.getContentText()).candidates||[])[0]||{}).content||{}).parts || [];
      for (const p of parts) if (p.inlineData && p.inlineData.data) return Utilities.base64Decode(p.inlineData.data);
    }
  }
  return null;
}

function checkProgress() {
  const sheet   = getSheet_();
  const lastRow = sheet.getLastRow();
  const col     = sheet.getRange(2, 5, lastRow - 1, 1).getValues();
  const done    = col.filter(r => (r[0]||'').toString().startsWith('http')).length;
  Logger.log('✅ Снимки: ' + done + ' / ' + (lastRow - 1) + ' | ⏳ Остатъчни: ' + (lastRow - 1 - done));
}
