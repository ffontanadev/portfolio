// scripts/og-image-script.js  —  pnpm og  (or: node scripts/og-image-script.js)
//
// Renders scripts/og-template.html into public/og-image.jpg, the card that
// LinkedIn, Slack and X show when the site is shared. index.html points
// og:image and twitter:image at it.
//
// Requires playwright, which is NOT a project dependency — install it before
// running: pnpm add -D playwright && pnpm exec playwright install chromium
import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const html = readFileSync('scripts/og-template.html', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2, // rasterize at 2400×1260 so hairlines and serifs stay sharp
});
await page.setContent(html, { waitUntil: 'networkidle' });
// networkidle fires when the Google Fonts CSS lands, not when the font files
// are parsed and ready to paint. Without this the card renders in the serif
// fallback and the metrics are wrong.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({
  path: 'public/og-image.jpg',
  type: 'jpeg',
  quality: 90,
  // Downsample the 2× raster back to the 1200×630 the OG spec asks for.
  // Without this the file ships at 2400×1260 — deviceScaleFactor alone does
  // not scale the output down.
  scale: 'css',
});
await browser.close();
