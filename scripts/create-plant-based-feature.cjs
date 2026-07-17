const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const logo = fs.readFileSync(path.join(root, 'plant-based', 'logo-source.png')).toString('base64');
const food = fs.readFileSync(path.join(root, 'google-play-assets', 'feature-graphics', 'plant-based-food.png')).toString('base64');
const output = path.join(root, 'google-play-assets', 'feature-graphics', 'plant-based-1024x500.png');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 } });
  await page.setContent(`
    <!doctype html>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1024px; height: 500px; overflow: hidden; }
      body { display: grid; grid-template-columns: 42% 58%; background: #fffaf0; color: #38291f; }
      .brand { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px 30px; }
      .brand::after { content: ''; position: absolute; right: 0; top: 48px; bottom: 48px; width: 1px; background: #d0a55f; }
      .logo { width: 122px; height: 122px; object-fit: cover; border-radius: 18px; margin-bottom: 22px; }
      h1 { margin: 0; font-family: Georgia, serif; font-weight: 400; font-size: 48px; line-height: 1; letter-spacing: 0; text-align: center; }
      .rule { width: 260px; height: 1px; background: #d0a55f; margin: 18px 0 13px; }
      .subtitle, .meta { font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 5px; color: #806b54; text-align: center; }
      .subtitle { font-size: 12px; }
      .meta { margin-top: 36px; color: #b77b27; font-size: 11px; letter-spacing: 3px; }
      .food { width: 100%; height: 100%; object-fit: cover; }
    </style>
    <section class="brand">
      <img class="logo" src="data:image/png;base64,${logo}" alt="">
      <h1>Plant Based 365</h1>
      <div class="rule"></div>
      <div class="subtitle">Без животински продукти</div>
      <div class="meta">Растителни рецепти · 6 езика</div>
    </section>
    <img class="food" src="data:image/png;base64,${food}" alt="">
  `, { waitUntil: 'load' });
  await page.screenshot({ path: output, type: 'png' });
  await browser.close();
  process.stdout.write(`Created ${output}\n`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
