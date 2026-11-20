import {
  armchairGeometry,
  benchGeometry,
  kidneyTableGeometry,
  loungeChairGeometry,
  openBookcaseGeometry,
  roundTableGeometry,
  sideTableGeometry,
  teaCabinetGeometry,
} from './furniture';
import { instanced } from './geo';
import type { Ctx } from './room';
import { rng } from './textures';

type P = { x: number; z: number; yaw: number };

/** Yaw that makes a chair (facing local +z) look from (x, z) toward (tx, tz). */
const faceToward = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z);

/**
 * Furniture placement. Counts and positions follow the panoramas loosely (about a dozen lobed
 * tables with four chairs each, two kidney tables by the shelves, lounge pairs by the glass);
 * exact spacing is an assumption tuned for walkable aisles (>= 0.8 m).
 */
export function buildFurniture(ctx: Ctx) {
  const { scene, mats, world } = ctx;
  const R = rng(9);
  const tables: P[] = [];
  const chairs: P[] = [];

  const addChairSet = (cx: number, cz: number, n: number, base: number, radius = 0.74) => {
    for (let k = 0; k < n; k++) {
      const a = base + (k / n) * Math.PI * 2 + (R() - 0.5) * 0.22;
      const r = radius + (R() - 0.5) * 0.06;
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      chairs.push({ x, z, yaw: faceToward(x, z, cx, cz) + (R() - 0.5) * 0.16 });
    }
  };

  for (const x of [-2.6, 0.8, 4.2]) {
    for (const z of [-4.6, -1.4, 1.8, 5.0]) {
      const jx = x + (R() - 0.5) * 0.3;
      const jz = z + (R() - 0.5) * 0.3;
      tables.push({ x: jx, z: jz, yaw: R() * Math.PI });
      addChairSet(jx, jz, 4, Math.PI / 4 + (R() - 0.5) * 0.4);
    }
  }
  // small table in front of the lattice with chairs lined up against the screens (IMG_9808)
  tables.push({ x: 3.4, z: 7.45, yaw: 0.3 });
  for (const x of [2.7, 4.1]) chairs.push({ x, z: 8.22, yaw: Math.PI + (R() - 0.5) * 0.1 });
  chairs.push({ x: 3.4, z: 6.72, yaw: 0 });
  // pair of chairs standing in front of the display, facing the room (Panorama 1)
  chairs.push({ x: 6.75, z: -0.5, yaw: -Math.PI / 2 + 0.15 });
  chairs.push({ x: 6.75, z: 1.4, yaw: -Math.PI / 2 - 0.1 });

  const tg = roundTableGeometry();
  scene.add(instanced(tg.top, mats.tableTop, tables));
  scene.add(instanced(tg.wood, mats.walnut, tables));
  scene.add(instanced(tg.brass, mats.brass, tables, false));
  for (const t of tables) world.circle(t.x, t.z, 0.5, 'table');

  const cg = armchairGeometry();
  scene.add(instanced(cg.wood, mats.walnut, chairs));
  scene.add(instanced(cg.cushion, mats.cushion, chairs));
  for (const c of chairs) world.obb(c.x, c.z, 0.3, 0.26, c.yaw, 'chair');

  // ---- kidney tables, high-back chair and curved benches by the shelf wall (IMG_9801)
  const kidneys: P[] = [
    { x: -5.5, z: -1.3, yaw: Math.PI / 2 },
    { x: -5.5, z: 4.5, yaw: Math.PI / 2 },
  ];
  const kg = kidneyTableGeometry();
  scene.add(instanced(kg.top, mats.walnut, kidneys));
  scene.add(instanced(kg.legs, mats.walnut, kidneys));
  const highBack: P[] = [];
  const benches: P[] = [];
  for (const k of kidneys) {
    world.obb(k.x, k.z, 1.0, 0.36, k.yaw, 'kidney-table');
    const hx = k.x - 0.45;
    highBack.push({ x: hx, z: k.z, yaw: Math.PI / 2 });
    world.obb(hx, k.z, 0.3, 0.26, Math.PI / 2, 'chair');
    const cx = k.x - 0.6;
    for (const phi of [-0.62, -0.21, 0.21, 0.62]) {
      const bx = cx + Math.cos(phi) * 1.48;
      const bz = k.z + Math.sin(phi) * 1.48;
      benches.push({ x: bx, z: bz, yaw: faceToward(bx, bz, cx, k.z) });
      world.circle(bx, bz, 0.27, 'bench');
    }
  }
  const hb = armchairGeometry({ highBack: true });
  scene.add(instanced(hb.wood, mats.walnut, highBack));
  scene.add(instanced(hb.cushion, mats.cushion, highBack));
  scene.add(instanced(benchGeometry(), mats.walnut, benches));

  // ---- oval tea cabinet with faucet (IMG_9802)
  const tea: P = { x: -6.55, z: 1.6, yaw: Math.PI / 2 };
  const tc = teaCabinetGeometry();
  scene.add(instanced(tc.body, mats.walnutDark, [tea]));
  scene.add(instanced(tc.top, mats.stone, [tea]));
  scene.add(instanced(tc.faucet, mats.steel, [tea], false));
  world.obb(tea.x, tea.z, 0.47, 0.23, tea.yaw, 'tea-cabinet');

  // ---- lounge chairs + tripod side tables by the glazing (IMG_9803, IMG_9804)
  const lounges: P[] = [
    { x: -6.45, z: -7.95, yaw: 0.55 },
    { x: -4.95, z: -8.3, yaw: 0.05 },
    { x: 5.0, z: -8.3, yaw: -0.1 },
    { x: 6.5, z: -7.85, yaw: -0.6 },
  ];
  const lg = loungeChairGeometry();
  scene.add(instanced(lg.wood, mats.walnut, lounges));
  scene.add(instanced(lg.fabric, mats.loungeFabric, lounges));
  for (const l of lounges) world.obb(l.x, l.z, 0.4, 0.38, l.yaw, 'lounge');
  const sides: P[] = [
    { x: -5.7, z: -8.45, yaw: 0 },
    { x: 5.8, z: -8.5, yaw: 0.4 },
  ];
  scene.add(instanced(sideTableGeometry(), mats.walnut, sides));
  for (const s of sides) world.circle(s.x, s.z, 0.27, 'side-table');

  // ---- dark open bookcases in front of the glass, west of the doors (Panorama 1 centre)
  const cases: P[] = [-3.5, -2.56, -1.62].map((x) => ({ x, z: -8.74, yaw: 0 }));
  scene.add(instanced(openBookcaseGeometry(), mats.walnutDark, cases));
  world.obb(-2.56, -8.74, 1.42, 0.19, 0, 'bookcases');

  return { tables, chairs };
}

export type FurnitureLayout = ReturnType<typeof buildFurniture>;
