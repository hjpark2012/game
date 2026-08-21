import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.WORDLY_TEST_URL || 'http://127.0.0.1:5173/game/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const consoleErrors = [];

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(await page.title(), 'wordly — 오프라인 영단어');
  assert.equal(await page.locator('link[rel="manifest"]').getAttribute('href'), '/game/manifest.webmanifest');

  await page.getByRole('tab', { name: /TOEIC/ }).click();
  const levels = await page.locator('.level-card').allTextContents();
  assert.deepEqual(levels.map((level) => level.match(/\d{3}/)?.[0]), ['500', '700', '850']);

  await page.locator('.level-card[data-level="toeic700"]').click();
  await page.getByRole('button', { name: /학습 시작하기/ }).click();
  await page.locator('#studyView.active').waitFor();
  assert.match(await page.locator('#studyLevelName').textContent(), /700/);
  assert.ok((await page.locator('#collocationText').textContent())?.length > 0);

  await Promise.race([
    page.evaluate(() => navigator.serviceWorker.ready),
    page.waitForTimeout(15_000).then(async () => {
      const state = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        return {
          controller: Boolean(navigator.serviceWorker.controller),
          installing: registration?.installing?.state,
          waiting: registration?.waiting?.state,
          active: registration?.active?.state,
        };
      });
      throw new Error(`Service worker was not ready after first visit: ${JSON.stringify(state)}`);
    }),
  ]);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.title(), 'wordly — 오프라인 영단어');
  assert.equal(
    await page.evaluate(() => fetch(`${location.pathname}not-cached`).then(() => false).catch(() => true)),
    true,
  );

  const relevantErrors = consoleErrors.filter(
    (message) => !message.includes('ERR_INTERNET_DISCONNECTED') && !message.includes('Failed to load resource'),
  );
  assert.deepEqual(relevantErrors, []);
  console.log('Smoke test passed: mobile TOEIC flow, PWA manifest, and cold first-visit offline reload.');
} finally {
  await browser.close();
}
