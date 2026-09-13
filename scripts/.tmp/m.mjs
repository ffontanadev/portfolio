import { chromium } from 'playwright';
const b = await chromium.launch();
for (const width of [390, 768, 1023]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  await p.goto('http://localhost:4173/es/', { waitUntil: 'load' });
  const r = await p.evaluate(() => {
    const H = innerHeight;
    const ndcY = (v) => +(1 - 2*v/H).toFixed(3);
    const box = (sel) => { const e=document.querySelector(sel); if(!e) return null;
      const r=e.getBoundingClientRect(); return { top: ndcY(r.y), bot: ndcY(r.y+r.height) }; };
    return { h1: box('#hero h1'), mono: box('#hero p.font-mono'), ctas: box('#hero nav') };
  });
  console.log(width, JSON.stringify(r));
  await p.close();
}
await b.close();
