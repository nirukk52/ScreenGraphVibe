#!/usr/bin/env -S node --loader ts-node/esm
/**
 * Capture /graph page screenshot using Playwright.
 */
import { chromium } from 'playwright';

async function main() {
  const baseUrl = process.env.UI_BASE_URL || 'http://localhost:3001';
  const out = process.env.OUT_PATH || 'pr-artifacts/screenshots/graph.png';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/graph`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  console.log(`Saved screenshot: ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
