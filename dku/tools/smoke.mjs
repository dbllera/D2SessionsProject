import { chromium } from 'playwright-core';

const OUT = process.argv[2] || 'smoke-shots';
import { mkdirSync } from 'node:fs';
mkdirSync(OUT, { recursive: true });
const HEADLESS = process.env.HEADED ? false : true;
const URL = (process.env.URL || 'http://127.0.0.1:5173/') + '?debug';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: HEADLESS,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 860 } });
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
});
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

const st = () => page.evaluate(() => window.__lib.state);
const wait = (ms) => page.waitForTimeout(ms);
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const hold = async (key, ms) => {
  await page.keyboard.down(key);
  await wait(ms);
  await page.keyboard.up(key);
  await wait(250);
};
const pose = (x, z, yaw, pitch = 0) => page.evaluate(([x, z, yaw, pitch]) => window.__lib.setPose(x, z, yaw, pitch), [x, z, yaw, pitch]);
const press = async (k) => {
  await page.keyboard.press(k);
  await wait(120);
};

await page.goto(URL);
await wait(3500);
await shot('00-start-overlay');
check('no console errors at load', errors.length === 0, errors.slice(0, 5).join(' | '));

// --- pointer lock
await page.mouse.click(720, 600);
await wait(600);
let s = await st();
check('pointer lock engages on click', s.locked, `locked=${s.locked}`);
if (!s.locked) {
  console.log('Pointer lock unavailable in this mode; aborting interactive checks.');
  await browser.close();
  process.exit(2);
}
await wait(1200);
s = await st();
check('eye height ~1.65 m', Math.abs(s.eye - 1.65) < 0.03, s.eye.toFixed(3));
await shot('01-spawn-view');
console.log('fps', s.fps.toFixed(1), 'draws', s.draws);

// --- movement
const z0 = s.z;
await hold('w', 1200);
s = await st();
check('W walks forward', s.z - z0 > 1.5, `dz=${(s.z - z0).toFixed(2)}`);
await pose(-0.9, -2.0, Math.PI);
await wait(150);
const x1 = (await st()).x;
await hold('d', 600);
s = await st();
check('D strafes', Math.abs(s.x - x1) > 0.5, `dx=${(s.x - x1).toFixed(2)}`);

// --- mouse look
const yaw0 = s.yaw;
for (let i = 0; i < 10; i++) await page.mouse.move(720 + (i + 1) * 30, 430);
await wait(200);
s = await st();
check('mouse movement turns the view', Math.abs(s.yaw - yaw0) > 0.05, `dyaw=${(s.yaw - yaw0).toFixed(3)}`);

// --- collisions
await pose(0, -8.0, 0);
await hold('w', 2000);
s = await st();
check('glass wall blocks (north)', s.z >= -9 + 0.27, `z=${s.z.toFixed(3)}`);
await pose(6.0, 3.6, -Math.PI / 2);
await hold('w', 2500);
s = await st();
check('display wall blocks (east)', s.x <= 7.5 - 0.27, `x=${s.x.toFixed(3)}`);
await pose(-6.3, -3.6, Math.PI / 2);
await hold('w', 2000);
s = await st();
check('shelf wall blocks (west)', s.x >= -7.5 + 0.45 + 0.27, `x=${s.x.toFixed(3)}`);
await pose(2.0, 7.4, Math.PI);
await hold('w', 2500);
s = await st();
check('closed lattice blocks (south)', s.z < 8.72, `z=${s.z.toFixed(3)}`);
// a table: walk at the first round table from 2 m away
const tablePos = await page.evaluate(() => ({ x: 0.8, z: -1.4 }));
await pose(tablePos.x, tablePos.z - 2.2, Math.PI);
await hold('w', 2500);
s = await st();
check('furniture blocks (table/chairs)', s.z < tablePos.z - 0.6, `z=${s.z.toFixed(3)} (table at ${tablePos.z})`);

// --- interaction 1: inspect books (3 repetitions)
const groups = await page.evaluate(() => window.__lib.groups());
const gi = groups.findIndex((g) => g.row === 2 && ((g.z > -4.2 && g.z < -2.8) || (g.z > 5.9 && g.z < 7.4)));
const g = groups[gi];
const bookY = 0.9 + g.row * 0.52 + 0.012 + 0.15;
const dist = -6.55 - (-7.05 - 0.07);
await pose(-6.55, g.z, Math.PI / 2, Math.atan2(bookY - 1.65, dist));
await wait(300);
s = await st();
check('book prompt appears when aiming', s.target && s.target.kind === 'book', JSON.stringify(s.target));
let okBooks = true;
for (let i = 0; i < 3; i++) {
  await press('e');
  await wait(500);
  s = await st();
  if (s.inspecting === null) okBooks = false;
  if (i === 0) await shot('02-inspect-books');
  await press('e');
  await wait(600);
  s = await st();
  if (s.inspecting !== null) okBooks = false;
}
check('inspect opens/closes repeatedly (3x)', okBooks);
await shot('03-books-returned');

// --- interaction 2a: shelf lighting panel (3 repetitions)
await pose(-6.55, -4.8, Math.PI / 2, Math.atan2(1.35 - 1.65, 0.95));
await wait(300);
s = await st();
check('shelf-switch prompt appears', s.target && s.target.kind === 'shelf-switch', JSON.stringify(s.target));
let okShelf = true;
for (let i = 0; i < 3; i++) {
  const before = (await st()).shelfLights;
  await press('e');
  await wait(800);
  s = await st();
  if (s.shelfLights === before) okShelf = false;
  if (i === 0) {
    await pose(-2.0, -2.5, Math.PI / 2 + 0.25, 0.05);
    await wait(700);
    await shot('04-shelf-lights-off');
    await pose(-6.55, -4.8, Math.PI / 2, Math.atan2(1.35 - 1.65, 0.95));
    await wait(200);
  }
}
// leave on
if (!(await st()).shelfLights) await press('e');
check('shelf lighting toggles repeatedly (3x)', okShelf);

// --- interaction 2b: pendant toggle (3 repetitions)
const pp = await page.evaluate(() => window.__lib.pendantPos(5));
await pose(pp.x - 1.8, pp.z - 1.8, Math.atan2(-(1.8), -(1.8)) + Math.PI, 0);
// look at the lantern centre
s = await st();
await page.evaluate(
  ([px, py, pz]) => {
    const st = window.__lib.state;
    const dx = px - st.x;
    const dz = pz - st.z;
    const yaw = Math.atan2(-dx, -dz);
    const pitch = Math.atan2(py - 1.65, Math.hypot(dx, dz));
    window.__lib.setPose(st.x, st.z, yaw, pitch);
  },
  [pp.x, pp.y + 0.5, pp.z],
);
await wait(300);
s = await st();
check('pendant prompt appears when looking up at it', s.target && s.target.kind === 'pendant', JSON.stringify(s.target));
let okPend = true;
const idx = s.target ? s.target.index : 5;
for (let i = 0; i < 3; i++) {
  const before = (await st()).pendantsOn[idx];
  await press('e');
  await wait(700);
  s = await st();
  if (s.pendantsOn[idx] === before) okPend = false;
  if (i === 0) await shot('05-pendant-off');
}
if (!(await st()).pendantsOn[idx]) await press('e');
check('pendant toggles repeatedly (3x)', okPend);

// --- interaction 3: lattice panel open/close + walk through
const piv = await page.evaluate(() => window.__lib.latticePivot());
const front = { x: piv.x + 0.4, z: 7.7 };
let okLat = true;
for (let i = 0; i < 2; i++) {
  await pose(front.x, front.z, Math.PI, -0.1);
  await wait(250);
  s = await st();
  if (!s.target || s.target.kind !== 'lattice') okLat = false;
  await press('e');
  await wait(1500);
  s = await st();
  if (!s.latticeOpen || s.latticeAmount < 0.99) okLat = false;
  if (i === 0) await shot('06-lattice-open');
  await press('e');
  await wait(1500);
  s = await st();
  if (s.latticeOpen || s.latticeAmount > 0.01) okLat = false;
}
check('lattice panel opens/closes repeatedly (2x)', okLat);
// open and walk into the corridor
await pose(front.x, front.z, Math.PI, -0.1);
await wait(200);
await press('e');
await wait(1500);
await hold('w', 2200);
s = await st();
check('can walk through the opened panel into the corridor', s.z > 9.2, `z=${s.z.toFixed(2)}`);
// the balustrade is open in the middle (x within ±0.9) where the atrium stair starts; test beside the gap
await pose(2.5, 10.4, Math.PI, 0);
await hold('w', 2000);
s = await st();
check('balustrade blocks at the corridor edge', s.z <= 11.2 - 0.27, `z=${s.z.toFixed(3)}`);
await pose(0, 10.4, Math.PI, 0);
await hold('w', 1500);
s = await st();
check('stair gap in the balustrade lets you onto the flight', s.z > 11.4 && s.floor > 0.1, `z=${s.z.toFixed(2)} floor=${s.floor.toFixed(2)}`);
await pose(0.6, 10.6, Math.PI, 0);
await shot('07-corridor');
// try to close while standing in the swing arc: must refuse
await pose(piv.x + 0.45, 9.3, Math.PI / 2, -0.1);
await wait(200);
s = await st();
const tgtInDoor = s.target && s.target.kind === 'lattice';
await press('e');
await wait(300);
s = await st();
check('closing is refused while standing in the swing', s.latticeOpen === true, `target=${tgtInDoor}`);
// step back into the room and close it
await pose(front.x, front.z, Math.PI, -0.1);
await wait(200);
await press('e');
await wait(1500);
s = await st();
check('panel closes again from the room side', !s.latticeOpen && s.latticeAmount < 0.01);

// --- reset
await pose(-3, 3, 1);
await press('r');
await wait(300);
s = await st();
check('R resets to spawn', Math.abs(s.x - 1.6) < 0.01 && Math.abs(s.z + 7.3) < 0.01, `(${s.x.toFixed(2)}, ${s.z.toFixed(2)})`);

// --- frame-rate independence: identical 3 s walk simulated at 144, 60, 30 and 15 fps
const d = await page.evaluate(() => [1 / 144, 1 / 60, 1 / 30, 1 / 15].map((dt) => window.__lib.simulateWalk(dt, 3)));
const spread = Math.max(...d) - Math.min(...d);
check('walk distance independent of frame rate (144/60/30/15 fps)', spread < 0.12, d.map((v) => v.toFixed(3)).join(' / ') + ' m');

// a few views for visual review
await pose(-3.2, 6.6, 2.0, 0.1);
await wait(500);
await shot('08-view-shelf-wall');
await pose(-5.0, -6.0, 2.5, 0.18);
await wait(500);
await shot('09-view-toward-lattice');
await pose(-2.0, 6.5, 0.3 - 0.6, 0.15);
await wait(500);
await shot('10-view-toward-glass');
await pose(0, 1.0, -Math.PI / 2 - 0.15, 0.1);
await wait(500);
await shot('11-view-display');
await pose(1.0, 0.0, 0.6, 0.85);
await wait(500);
await shot('12-pendants-ceiling');

// --- escape releases pointer lock
await page.keyboard.press('Escape');
await wait(500);
s = await st();
check('Esc releases pointer lock', !s.locked);
await shot('13-paused');
s = await st();
console.log('final fps', s.fps.toFixed(1), 'draws', s.draws);
check('no console errors during run', errors.length === 0, errors.slice(0, 8).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
