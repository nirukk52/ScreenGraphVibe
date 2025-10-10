#!/usr/bin/env -S node --loader ts-node/esm
/**
 * Capture /graph page screenshot using Playwright.
 */
import { chromium } from 'playwright';

async function main() {
  const baseUrl = process.env.UI_BASE_URL || 'http://localhost:3001';
  const out = process.env.OUT_PATH || 'pr-artifacts/screenshots/graph.png';
  
  console.log(`Starting screenshot capture...`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Output path: ${out}`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  try {
    console.log(`Navigating to ${baseUrl}/graph...`);
    
    // Add error handling for navigation
    const response = await page.goto(`${baseUrl}/graph`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response?.status()} ${response?.statusText()}`);
    }
    
    console.log(`Page loaded successfully (${response.status()})`);
    
    // Wait for the page to be fully rendered
    await page.waitForTimeout(2000);
    
    // Check if the page has content (not just a blank page)
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Take screenshot
    console.log(`Taking screenshot...`);
    await page.screenshot({ path: out, fullPage: true });
    
    console.log(`✅ Screenshot saved successfully: ${out}`);
    
  } catch (error) {
    console.error(`❌ Error during screenshot capture:`, error);
    
    // Try to get page content for debugging
    try {
      const content = await page.content();
      console.log(`Page content length: ${content.length} characters`);
      if (content.length < 1000) {
        console.log(`Page content: ${content}`);
      }
    } catch (contentError) {
      console.error(`Could not retrieve page content:`, contentError);
    }
    
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch((e) => { 
  console.error('❌ Screenshot capture failed:', e); 
  process.exit(1); 
});
