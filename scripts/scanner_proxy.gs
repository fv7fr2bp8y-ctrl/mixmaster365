// MixMaster v2 — Gemini bottle-scanner proxy (server-side)
//
// Защо: Gemini ключът НЕ може да стои в index.html (публичен код -> GitHub блокира
// push-а, а всеки може да го извлече и да ти изяде билинга). Затова браузърът вика
// ТОЗИ скрипт, а скриптът вика Gemini с ключа, който стои само тук.
//
// Deploy (НОВ, отделен Apps Script проект — не пипай doGet endpoint-а!):
//   1. script.google.com -> New project -> постави този код
//   2. Сложи ключа в API_KEY по-долу -> Save
//   3. Deploy -> New deployment -> Web app
//        Execute as:      Me
//        Who has access:  Anyone
//   4. Копирай /exec URL-а и го сложи в SCANNER_PROXY_URL в index.html

const API_KEY = 'PASTE_YOUR_GEMINI_KEY_HERE';

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

const PROMPT =
  'Погледни снимката. Изброй само алкохолните напитки / спиртове, които виждаш на ' +
  'бутилките (напр. водка, джин, ром, текила, уиски, бърбън, мескал, коняк, ликьор и т.н.). ' +
  'Върни САМО JSON масив с имената на български, без обяснения. Пример: ["водка","джин"]. ' +
  'Ако не виждаш алкохол, върни [].';

// Браузърът праща text/plain, за да няма CORS preflight (Apps Script не отговаря на OPTIONS).
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (!body.image) return json_({ spirits: [], error: 'no image' });
    return json_({ spirits: analyze_(body.image, body.mime || 'image/jpeg') });
  } catch (err) {
    return json_({ spirits: [], error: String(err) });
  }
}

// За бърза проверка, че деплойментът е жив.
function doGet() {
  return json_({ ok: true, service: 'mixmaster-scanner' });
}

function analyze_(imageB64, mime) {
  for (const model of MODELS) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model +
                ':generateContent?key=' + API_KEY;
    const resp = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mime, data: imageB64 } },
            { text: PROMPT }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      }),
      muteHttpExceptions: true
    });

    if (resp.getResponseCode() === 200) {
      const parts = (((JSON.parse(resp.getContentText()).candidates || [])[0] || {}).content || {}).parts || [];
      const text  = (parts[0] || {}).text || '';
      const match = text.match(/\[[\s\S]*?\]/);
      if (match) {
        try { return JSON.parse(match[0]); } catch (err) { /* пробвай следващия модел */ }
      }
    }
  }
  return [];
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
