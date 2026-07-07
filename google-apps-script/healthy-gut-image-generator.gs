/**
 * Healthy Gut 365 image generator for Google Apps Script.
 *
 * Sheet:
 *   https://docs.google.com/spreadsheets/d/1GT8j75VnRNwtqfhoc3XiUFyZQeETDi_bRGs1ALSyMBM/edit
 *
 * Setup:
 * 1. Open the Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Project Settings -> Script properties:
 *    OPENAI_API_KEY = your OpenAI API key
 * 5. Run generateNextHealthyGutBatch once and approve permissions.
 */

const HEALTHY_GUT_CONFIG = {
  spreadsheetId: "1GT8j75VnRNwtqfhoc3XiUFyZQeETDi_bRGs1ALSyMBM",
  sheetName: "healthy_gut_365",
  imageFolderId: "1OD_LY098yehbLRA4jYcucQ7FuxzUq2hN",
  openAiEndpoint: "https://api.openai.com/v1/images/generations",
  model: "gpt-image-2",
  size: "1536x1024",
  quality: "medium",
  outputFormat: "jpeg",
  outputCompression: 85,
  defaultBatchSize: 2,
  firstDataRow: 2,
  columns: {
    id: 1,
    name: 2,
    image: 6,
    imageStatus: 7,
    ingredients: 9,
    imagePrompt: 11
  }
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Healthy Gut Images")
    .addItem("Generate next 2", "generateNextHealthyGutBatch")
    .addItem("Generate next 1", "generateOneHealthyGutImage")
    .addItem("Create 15 min trigger", "createHealthyGutImageTrigger")
    .addItem("Remove triggers", "removeHealthyGutImageTriggers")
    .addToUi();
}

function generateOneHealthyGutImage() {
  generateHealthyGutImages_(1);
}

function generateNextHealthyGutBatch() {
  generateHealthyGutImages_(HEALTHY_GUT_CONFIG.defaultBatchSize);
}

function createHealthyGutImageTrigger() {
  removeHealthyGutImageTriggers();
  ScriptApp.newTrigger("generateNextHealthyGutBatch")
    .timeBased()
    .everyMinutes(15)
    .create();
}

function removeHealthyGutImageTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === "generateNextHealthyGutBatch")
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
}

function generateHealthyGutImages_(batchSize) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("Missing Script property OPENAI_API_KEY");
    }

    const sheet = SpreadsheetApp
      .openById(HEALTHY_GUT_CONFIG.spreadsheetId)
      .getSheetByName(HEALTHY_GUT_CONFIG.sheetName);
    const folder = DriveApp.getFolderById(HEALTHY_GUT_CONFIG.imageFolderId);

    const lastRow = sheet.getLastRow();
    if (lastRow < HEALTHY_GUT_CONFIG.firstDataRow) {
      return 0;
    }

    const lastColumn = Math.max(sheet.getLastColumn(), HEALTHY_GUT_CONFIG.columns.imagePrompt);
    const values = sheet
      .getRange(HEALTHY_GUT_CONFIG.firstDataRow, 1, lastRow - 1, lastColumn)
      .getValues();

    let generated = 0;
    for (let index = 0; index < values.length && generated < batchSize; index++) {
      const rowNumber = HEALTHY_GUT_CONFIG.firstDataRow + index;
      const row = values[index];
      const id = row[HEALTHY_GUT_CONFIG.columns.id - 1];
      const name = row[HEALTHY_GUT_CONFIG.columns.name - 1];
      const currentImage = row[HEALTHY_GUT_CONFIG.columns.image - 1];
      const currentStatus = String(row[HEALTHY_GUT_CONFIG.columns.imageStatus - 1] || "").trim();

      if (currentImage || currentStatus === "ready" || currentStatus === "generating") {
        continue;
      }

      const prompt = buildHealthyGutPrompt_(row);
      sheet.getRange(rowNumber, HEALTHY_GUT_CONFIG.columns.imageStatus).setValue("generating");
      SpreadsheetApp.flush();

      try {
        const imageBytes = callOpenAiImageGeneration_(apiKey, prompt);
        const filename = `${pad3_(id)} - ${sanitizeFileName_(name)}.jpg`;
        const blob = Utilities.newBlob(imageBytes, "image/jpeg", filename);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        const driveUrl = `https://drive.google.com/file/d/${file.getId()}/view?usp=sharing`;
        sheet.getRange(rowNumber, HEALTHY_GUT_CONFIG.columns.image).setValue(driveUrl);
        sheet.getRange(rowNumber, HEALTHY_GUT_CONFIG.columns.imageStatus).setValue("ready");
        generated++;
      } catch (error) {
        sheet
          .getRange(rowNumber, HEALTHY_GUT_CONFIG.columns.imageStatus)
          .setValue(`failed: ${String(error.message || error).slice(0, 180)}`);
      }
    }

    return generated;
  } finally {
    lock.releaseLock();
  }
}

function callOpenAiImageGeneration_(apiKey, prompt) {
  const payload = {
    model: HEALTHY_GUT_CONFIG.model,
    prompt,
    size: HEALTHY_GUT_CONFIG.size,
    quality: HEALTHY_GUT_CONFIG.quality,
    output_format: HEALTHY_GUT_CONFIG.outputFormat,
    output_compression: HEALTHY_GUT_CONFIG.outputCompression
  };

  const response = UrlFetchApp.fetch(HEALTHY_GUT_CONFIG.openAiEndpoint, {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error(`OpenAI ${code}: ${text.slice(0, 500)}`);
  }

  const json = JSON.parse(text);
  const item = json && json.data && json.data[0];
  const base64 = item && item.b64_json;
  if (base64) {
    return Utilities.base64Decode(base64);
  }

  const imageUrl = item && item.url;
  if (imageUrl) {
    return UrlFetchApp.fetch(imageUrl).getBlob().getBytes();
  }

  throw new Error(`OpenAI response missing image data: ${text.slice(0, 500)}`);
}

function buildHealthyGutPrompt_(row) {
  const name = row[HEALTHY_GUT_CONFIG.columns.name - 1];
  const ingredients = row[HEALTHY_GUT_CONFIG.columns.ingredients - 1];
  const promptFromSheet = row[HEALTHY_GUT_CONFIG.columns.imagePrompt - 1];

  if (promptFromSheet) {
    return `${promptFromSheet}

Additional production constraints:
Photorealistic natural-light food photography. No text, no watermark, no hands, no packaging, no visible brand labels. Must look gluten-free and dairy-free. No bread, no wheat, no milk, no cheese, no yogurt, no cream.`;
  }

  return `Professional natural-light food photography, gluten-free and dairy-free healthy recipe, ${name}, visible ingredients: ${ingredients}. Warm light background, appetizing, realistic, no text, no hands, no packaging, no dairy, no gluten.`;
}

function pad3_(value) {
  return String(value).padStart(3, "0");
}

function sanitizeFileName_(value) {
  return String(value || "recipe")
    .replace(/[\\/:*?"<>|#%{}~&]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}
