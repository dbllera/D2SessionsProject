// End-to-end crossing test: DKU stair → Duke south door → back to the DKU stair top.
//   npm run dev            (both worlds: 5173 DKU, 5174 Duke)
//   npm run smoke:portal   HEADED=1 to watch; DKU_URL / DUKE_URL to test a preview build
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || 'smoke-shots';
mkdirSync(OUT, { recursive: true });
const DKU_URL = process.env.DKU_URL || 'http://127.0.0.1:5173/';
const DUKE_URL = process.env.DUKE_URL || 'http://127.0.0.1:5174/';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: !process.env.HEADED,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on(
  'console',
  (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push('console: ' + m.text()),
);
// report missing files by URL; the browser's automatic /favicon.ico probe is not ours
page.on(
  'response',
  (r) => r.status() >= 400 && !r.url().endsWith('/favicon.ico') && errors.push(`${r.status()} ${r.url()}`),
);

const wait = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `${OUT}/portal-${name}.png` });
const lib = () => page.evaluate(() => window.__lib.state);
// In a build Duke lives under DKU (…/duke/), so "in DKU" must also mean "not in Duke".
const isDuke = (u) => u.startsWith(DUKE_URL);
const isDku = (u) => u.startsWith(DKU_URL) && !isDuke(u);

try {
  // ---- 1. DKU: climb the atrium stair to the doorway
  await page.goto(DKU_URL + '?debug');
  await wait(3000);
  await page.mouse.click(720, 600);
  await wait(600);
  let s = await lib();
  check('DKU: pointer lock', s.locked);
  check('DKU: plain visit has no arrival', s.arrival === null, String(s.arrival));
  await page.evaluate(() => window.__lib.setPose(0, 10.6, Math.PI, 0)); // corridor, facing the stair
  await wait(200);
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await wait(1800);
  s = await lib();
  check(
    'DKU: climbing raises the eye',
    s.floor > 1 && s.eye > 2.6,
    `floor=${s.floor.toFixed(2)} eye=${s.eye.toFixed(2)} z=${s.z.toFixed(2)}`,
  );
  check('DKU: stays on the flight', Math.abs(s.x) < 0.9, `x=${s.x.toFixed(2)}`);
  await shot('1-dku-climbing');
  await page.waitForURL((u) => isDuke(u.href), { timeout: 12000 }).catch(() => {});
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  check('DKU → Duke: doorway at the top loads Duke', isDuke(page.url()), page.url());

  // ---- 2. Duke: arrive by the south door, then use it
  await page.waitForFunction(() => window.__d2, null, { timeout: 15000 });
  await wait(1200);
  const d2 = () =>
    page.evaluate(() => ({
      arrival: window.__d2.arrival,
      state: window.__d2.game.state,
      door: !!window.__d2.game.door,
      x: window.__d2.player.x,
      z: window.__d2.player.z,
    }));
  let d = await d2();
  check('Duke: arrival read', d.arrival === 'south-door', String(d.arrival));
  check('Duke: address bar cleaned', !page.url().includes('arrive='), page.url());
  const h1 = await page.textContent('#start h1');
  check('Duke: welcome card', h1 === 'Welcome to Duke', h1);
  await shot('2-duke-welcome');
  await page.click('#enter');
  await wait(800);
  d = await d2();
  check(
    'Duke: spawn by the south door',
    Math.abs(d.x) < 0.2 && Math.abs(d.z - 15.2) < 0.2,
    `(${d.x.toFixed(2)}, ${d.z.toFixed(2)})`,
  );
  check('Duke: door not focused while facing the room', !d.door);
  await page.evaluate(() => window.__d2.teleport(0, 16.1, Math.PI, 0)); // face the door
  await wait(400);
  d = await d2();
  check('Duke: door prompt when facing it', d.door && (await page.textContent('#promptMain')).includes('DKU'));
  await shot('3-duke-door');
  await page.keyboard.press('e');
  await page.waitForURL((u) => isDku(u.href), { timeout: 8000 }).catch(() => {});
  check('Duke → DKU: E at the door loads DKU', isDku(page.url()), page.url());

  // ---- 3. DKU: arrive at the stair top, walk down without bouncing back
  await page.waitForFunction(() => window.__lib, null, { timeout: 15000 });
  await wait(2500);
  s = await lib();
  check(
    'DKU: arrival at stair top',
    s.arrival === 'stairs-top' && s.floor > 5.9 && s.z > 23.5,
    `floor=${s.floor.toFixed(2)} z=${s.z.toFixed(2)}`,
  );
  check('DKU: lattice open for the way back', s.latticeOpen);
  check('DKU: debug flag kept across trips', page.url().includes('debug'), page.url());
  check('DKU: welcome-back card', (await page.textContent('#overlay-eyebrow')) === 'Back from Duke');
  await shot('4-dku-arrival');
  await page.mouse.click(720, 600);
  await wait(500);
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await wait(4200);
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  await wait(400);
  s = await lib();
  check(
    'DKU: walking down reaches the corridor',
    s.floor < 0.2 && s.z < 11.5,
    `floor=${s.floor.toFixed(2)} z=${s.z.toFixed(2)}`,
  );
  check('DKU: no re-trigger on arrival', isDku(page.url()) && !s.traveling);
  await shot('5-dku-corridor');
} catch (e) {
  check('no exceptions', false, e.message);
}

check('no page errors', errors.length === 0, errors.slice(0, 4).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
