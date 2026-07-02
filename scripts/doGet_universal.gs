// MixMaster — Universal data endpoint
// Returns ALL columns (incl. translations name_en, recipe_ru, ...) as header-keyed JSON.
// One deployment serves many sheets via ?ssid= and ?gid=
//   cocktails:   .../exec?gid=2075268599
//   mocktails:   .../exec?gid=116292126
//   breakfasts:  .../exec?ssid=1L4HfW_Mnyk0546Xw2CdY-XZqbpkcLicHuteJIg4YIcE&gid=2030962117
//
// DEPLOY (re-deploy after editing to keep the SAME url: Deploy → Manage deployments → edit → new version):
//   Execute as: Me → Who has access: Anyone.

const SPREADSHEET_ID = '1GNVZxY3X6k3iDRWLu8CAL2sNM0I2GcI5FiWLXZYQ1hk'; // default (cocktails+mocktails)

function doGet(e) {
  try {
    const ssid = e && e.parameter && e.parameter.ssid ? e.parameter.ssid : SPREADSHEET_ID;
    const ss = SpreadsheetApp.openById(ssid);
    const gid = e && e.parameter && e.parameter.gid ? parseInt(e.parameter.gid, 10) : null;

    let sheet = null;
    if (gid != null) sheet = ss.getSheets().find(s => s.getSheetId() === gid) || null;
    if (!sheet) sheet = ss.getSheets()[0];

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) return json_([]);

    const values  = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0].map(h => (h || '').toString().trim());

    const out = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      // skip fully empty rows
      if (!row.some(c => (c || '').toString().trim())) continue;
      const obj = {};
      for (let c = 0; c < headers.length; c++) {
        if (headers[c]) obj[headers[c]] = row[c];
      }
      out.push(obj);
    }
    return json_(out);
  } catch (err) {
    return json_({ error: err.message });
  }
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
