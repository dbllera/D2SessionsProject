// Smoke test: drives the museum in a real browser through the window.__d2 hook.
//   npm run dev            (in another terminal)
//   npm run smoke          headless; screenshots in ./smoke-shots
//   HEADED=1 npm run smoke watch it run
//   URL=http://127.0.0.1:4173/ npm run smoke   test the production preview instead
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = process.argv[2] || 'smoke-shots';
mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://127.0.0.1:5173/';

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
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text());
});
page.on('response', (r) => {
  if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`HTTP ${r.status()} ${r.url()}`);
});
page.on('framenavigated', (f) => {
  if (f === page.mainFrame()) console.log('NAV', f.url());
});
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

const wait = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const st = () =>
  page.evaluate(() => {
    const d = window.__d2;
    return {
      state: d.game.state,
      found: d.game.found,
      focus: d.game.focus && d.game.focus.id,
      x: d.player.x,
      z: d.player.z,
      ride: d.ride.phase,
    };
  });
const teleport = (x, z, yaw, pitch = 0) =>
  page.evaluate(([x, z, yaw, pitch]) => window.__d2.teleport(x, z, yaw, pitch), [x, z, yaw, pitch]);
const press = async (k, ms = 250) => {
  await page.keyboard.press(k);
  await wait(ms);
};
const visible = (id) => page.evaluate((id) => !document.getElementById(id).hidden, id);

await page.goto(URL);
await wait(2500);
await shot('00-start');
check('page loads without errors', errors.length === 0, errors.slice(0, 3).join(' | '));

const arts = await page.evaluate(() =>
  window.__d2.artifacts.map((a) => ({ id: a.id, pos: a.pos, glow: (a.glow || []).length })),
);
check('10 artifacts built', arts.length === 10, String(arts.length));
check(
  'every artifact has glow materials',
  arts.every((a) => a.glow > 0),
);

await page.click('#enter');
await wait(800);
let s = await st();
check('Enter Museum starts play', s.state === 'playing', s.state);

// Fixed view for visual comparison between versions
await teleport(0, 15.2, 0, -0.02);
await wait(1200);
await shot('01-spawn');

// Walk
const z0 = (await st()).z;
await page.keyboard.down('w');
await wait(1000);
await page.keyboard.up('w');
await wait(300);
s = await st();
check('W walks forward', z0 - s.z > 1, `dz=${(z0 - s.z).toFixed(2)}`);

// Visit every artifact: focus it, open the panel with E, close with E
for (const a of arts) {
  const [ax, , az] = a.pos;
  const px = Math.abs(ax) > 0.3 ? ax - Math.sign(ax) * 1.3 : ax;
  const pz = Math.abs(ax) > 0.3 ? az : az + 1.3;
  await teleport(px, pz, Math.atan2(-(ax - px), -(az - pz)), -0.25);
  await wait(400);
  s = await st();
  const focused = s.focus === a.id;
  await press('e', 500);
  const opened = (await st()).state === 'panel';
  const body = await page.evaluate(() => document.getElementById('pBody').innerHTML.length);
  if (a.id === 'i95' || a.id === 'gsoy') await shot(`02-panel-${a.id}`);
  await press('e', 600);
  const closed = (await st()).state === 'playing';
  check(`artifact ${a.id}: focus, open, close`, focused && opened && body > 100 && closed, `focus=${s.focus}`);
}
s = await st();
check('all artifacts marked discovered', s.found === 10, `${s.found}`);
check('counter reads 10 / 10', (await page.textContent('#count')).trim() === '10 / 10');

// Bull ride: R beside the bull opens the menu, ride, climb off with Esc
const bull = arts.find((a) => a.id === 'bull');
await teleport(bull.pos[0] + 1.6, bull.pos[2], Math.PI / 2, -0.2);
await wait(400);
await press('r', 400);
check('R beside the bull opens the ride menu', (await st()).state === 'rideMenu' && (await visible('rideMenu')));
await page.click('#rideMenu .lvl[data-level="0"]');
await wait(4000);
s = await st();
check('ride starts and counts down to go', s.state === 'riding' && s.ride === 'go', `${s.state}/${s.ride}`);
await shot('03-riding');
await press('Escape', 1600);
check('Esc climbs off and shows the result', (await st()).state === 'rideResult' && (await visible('rideResult')));
await page.click('#rideBack');
await wait(400);
check('back to the museum', (await st()).state === 'playing');

// Pause and resume: losing pointer lock (what Esc does for a real user) pauses; without lock, Esc pauses
await page.evaluate(() => (document.pointerLockElement ? document.exitPointerLock() : null));
await wait(300);
if ((await st()).state === 'playing') await press('Escape', 300);
check('Esc pauses', (await st()).state === 'paused' && (await visible('pause')));
await page.click('#resume');
await wait(300);
check('Resume returns to play', (await st()).state === 'playing');

// Collisions: walking into the north gable wall stops at the wall
await teleport(0, -15.5, 0, 0);
await page.keyboard.down('w');
await wait(1500);
await page.keyboard.up('w');
s = await st();
check('wall stops the player', s.z > -17 + 0.3, `z=${s.z.toFixed(2)}`);

check('no console errors during the run', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
