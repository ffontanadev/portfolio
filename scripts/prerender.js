// scripts/prerender.js  —  pnpm prerender  (runs automatically as part of pnpm build)
//
// Spec §8: all four locales must be pre-rendered — client-only translation is
// invisible to crawlers and to link unfurlers, which never run JavaScript.
//
// Serves the production build with `vite preview`, visits each locale route in
// a headless browser, waits for the app to settle, and writes the resulting DOM
// to dist/<locale>/index.html.
//
// This is a *snapshot*, not server-side rendering: main.tsx mounts with
// createRoot, so the client clears #root and renders again rather than
// hydrating. That is fine — the point is that the localized prose, <title> and
// <html lang> are in the bytes a crawler receives without running any script.
//
// Requires playwright, already a devDependency (added for pnpm og), *and* its
// Chromium binary. A CI image has the package but not the browser, so the
// deploy build runs through the `vercel-build` script, which installs the
// headless shell into node_modules (PLAYWRIGHT_BROWSERS_PATH=0) so Vercel's
// dependency cache keeps it between builds.
import { chromium } from 'playwright';
import { preview } from 'vite';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const LOCALES = ['en', 'es', 'pt', 'zh'];
const PORT = 4178;

// Start from the untouched SPA shell. Without this, a standalone `pnpm
// prerender` over an already-prerendered dist would snapshot its own output.
for (const locale of LOCALES) {
  await rm(`dist/${locale}`, { recursive: true, force: true });
}

const server = await preview({ preview: { port: PORT, strictPort: true } });
const origin = `http://localhost:${PORT}`;

let browser;
try {
  browser = await chromium.launch();
} catch (cause) {
  await server.close();
  // The build must fail here rather than ship a deploy whose four locales are
  // invisible to crawlers again — that is the whole point of §8.
  throw new Error(
    "prerender: could not launch Chromium. Locally, run 'pnpm exec playwright install chromium " +
      "--only-shell'. On Vercel, the build must run through the 'vercel-build' script, which " +
      'installs it with PLAYWRIGHT_BROWSERS_PATH=0.',
    { cause },
  );
}
const page = await browser.newPage();

try {
  for (const locale of LOCALES) {
    const url = `${origin}/${locale}`;
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    if (!response || !response.ok()) {
      throw new Error(`prerender: ${url} returned ${response?.status() ?? 'no response'}`);
    }

    // The h1 is the last thing the hero renders; if it is present, the tree settled.
    await page.waitForSelector('h1', { timeout: 15_000 });

    // …but framer-motion then holds the hero at opacity: 0 for roughly three
    // seconds before its entry animation runs, and `page.content()` freezes
    // whatever the inline style says at that instant. Snapshotting too early
    // ships an invisible hero.
    //
    // Test the inline `style` attribute, not `getComputedStyle`: framer-motion
    // drives the animation through WAAPI, so the computed opacity reaches 1
    // while the attribute still reads `opacity: 0`, and the attribute is what
    // gets serialized. Waiting on the computed value snapshots too early.
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector('h1');
        if (h1 === null) return false;
        const opacity = (h1.getAttribute('style') ?? '').match(/opacity:\s*([\d.]+)/);
        return opacity === null || Number(opacity[1]) > 0.99;
      },
      undefined,
      { timeout: 20_000 },
    );

    // Elements further down the page stay at opacity: 0 by design — they are
    // `whileInView` and animate on scroll. Their text is still in the markup,
    // which is what a crawler reads.

    const html = await page.content();
    if (!html.includes('<h1')) {
      throw new Error(`prerender: ${url} produced no h1 — the app did not render`);
    }
    if (!html.includes(`lang="${locale}"`)) {
      throw new Error(`prerender: ${url} did not carry lang="${locale}"`);
    }
    if (/<h1[^>]*style="[^"]*opacity: 0/.test(html)) {
      throw new Error(`prerender: ${url} snapshotted the hero mid-animation (h1 is invisible)`);
    }

    await mkdir(`dist/${locale}`, { recursive: true });
    await writeFile(`dist/${locale}/index.html`, html, 'utf-8');
    console.log(`prerendered /${locale} -> dist/${locale}/index.html`);
  }
} finally {
  await browser.close();
  await server.close();
}
