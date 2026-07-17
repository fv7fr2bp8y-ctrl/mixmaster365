const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const appSlug = process.env.APP_SLUG || 'plant-based';
const recipeKey = process.env.RECIPE_KEY || 'PB-C001';
const output = path.join(root, 'google-play-assets', 'screenshots-play', appSlug);
const baseUrl = `https://${appSlug}.freefrom365.com/`;

async function waitForImages(page) {
  await page.waitForTimeout(6000);
}

async function capture(page, filename) {
  await waitForImages(page);
  const target = path.join(output, filename);
  await page.screenshot({ path: target, type: 'png' });
  if (!fs.existsSync(target)) throw new Error(`Screenshot was not written: ${target}`);
  process.stdout.write(`Created ${target}\n`);
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 360, height: 640 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'bg-BG',
  });

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await capture(page, '01-home.png');

  await page.evaluate(() => window.scrollTo({ top: 450, behavior: 'instant' }));
  await capture(page, '02-catalog.png');

  await page.goto(`${baseUrl}?r=${encodeURIComponent(recipeKey)}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  await capture(page, '03-recipe.png');

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.locator('button[onclick="openSettings()"]').first().click();
  await page.locator('#settings-modal .sheet-panel').evaluate((panel) => {
    panel.style.top = '0';
    panel.style.bottom = 'auto';
    panel.style.maxHeight = '100vh';
  });
  await capture(page, '04-languages.png');

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
