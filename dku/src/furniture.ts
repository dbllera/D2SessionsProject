import * as THREE from 'three';
import { box, merge, planarUV, post, rod, roundedRectShape, slab, tube } from './geo';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * Lobed round table (IMG_9798): ~1.0 m five-lobed walnut top with book-matched segments,
 * tapered legs with brass ferrules, a ring apron and curved cross stretchers.
 */
export function roundTableGeometry() {
  const R = 0.5;
  const shape = new THREE.Shape();
  const N = 200;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const phase = ((a * 5) / (Math.PI * 2) + 0.5) % 1;
    const d = Math.min(phase, 1 - phase);
    const notch = Math.exp(-((d / 0.035) ** 2));
    const r = R * (1 - 0.055 * notch);
    const x = Math.cos(a - Math.PI / 2) * r;
    const y = Math.sin(a - Math.PI / 2) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const top = planarUV(slab(shape, 0.035, 0.725, 0.006, 4), 0, 0, 2 * R);

  const wood: THREE.BufferGeometry[] = [];
  const brass: THREE.BufferGeometry[] = [];
  const lr = 0.36;
  const legPts: THREE.Vector3[] = [];
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const x = Math.cos(a) * lr;
    const z = Math.sin(a) * lr;
    legPts.push(V(x, 0, z));
    wood.push(post(0.026, 0.017, 0.69, x, 0.04, z, 12));
    brass.push(post(0.0175, 0.0175, 0.04, x, 0, z, 12));
  }
  // apron ring
  const apron = new THREE.LatheGeometry(
    [new THREE.Vector2(0.385, 0), new THREE.Vector2(0.41, 0), new THREE.Vector2(0.41, 0.06), new THREE.Vector2(0.385, 0.06), new THREE.Vector2(0.385, 0)],
    48,
  );
  apron.translate(0, 0.665, 0);
  wood.push(apron);
  // curved cross stretchers dipping toward the centre (S-curve braces)
  for (const [i, j] of [
    [0, 2],
    [1, 3],
  ]) {
    const a = legPts[i];
    const b = legPts[j];
    wood.push(
      tube(
        [V(a.x, 0.6, a.z), V(a.x * 0.6, 0.5, a.z * 0.6), V(0, 0.47, 0), V(b.x * 0.6, 0.5, b.z * 0.6), V(b.x, 0.6, b.z)],
        0.011,
        24,
        6,
      ),
    );
  }
  return { top, wood: merge(wood), brass: merge(brass) };
}

/**
 * Ming-style armchair (IMG_9799): straight rear posts carrying a crest rail, S-curved splat,
 * arms on the front posts, box stretchers, light gray seat pad. Sitter faces local +z.
 */
export function armchairGeometry(opts: { highBack?: boolean } = {}) {
  const wood: THREE.BufferGeometry[] = [];
  const cushion: THREE.BufferGeometry[] = [];
  const hw = 0.27; // half width (post centres)
  const zb = -0.2;
  const zf = 0.2;
  const s = 0.034; // post section
  const backH = opts.highBack ? 1.12 : 1.0;
  const seatY = 0.45;
  const armY = 0.68;

  for (const sx of [-1, 1]) {
    wood.push(box(s, backH, s, sx * hw, backH / 2, zb));
    wood.push(box(s, armY, s, sx * hw, armY / 2, zf));
    // arm rail, rounded off at the front with a short drop
    wood.push(box(0.03, 0.03, zf - zb + 0.02, sx * hw, armY, (zf + zb) / 2));
    wood.push(box(0.03, 0.06, 0.03, sx * hw, armY - 0.02, zf + 0.012));
    // side seat rail and stretchers
    wood.push(box(0.028, 0.045, zf - zb, sx * hw, seatY - 0.03, 0));
    wood.push(box(0.022, 0.022, zf - zb, sx * hw, 0.09, 0));
    // short support post under the arm
    wood.push(box(0.018, armY - seatY, 0.018, sx * hw, (armY + seatY) / 2, 0.02));
  }
  // crest rail with slightly overhanging, rounded ends
  wood.push(box(2 * hw + 0.07, 0.034, 0.045, 0, backH, zb));
  for (const sx of [-1, 1]) {
    const g = new THREE.CylinderGeometry(0.024, 0.024, 0.045, 10);
    g.rotateX(Math.PI / 2);
    g.translate(sx * (hw + 0.035), backH, zb);
    wood.push(g);
  }
  // front + back seat rails, front apron, front/back stretchers
  wood.push(box(2 * hw, 0.045, 0.028, 0, seatY - 0.03, zf));
  wood.push(box(2 * hw, 0.045, 0.028, 0, seatY - 0.03, zb));
  wood.push(box(2 * hw - 0.02, 0.05, 0.02, 0, seatY - 0.085, zf));
  wood.push(box(2 * hw, 0.022, 0.022, 0, 0.09, zf + 0.005));
  wood.push(box(2 * hw, 0.022, 0.022, 0, 0.14, zb));
  // seat board
  wood.push(box(2 * hw - 0.02, 0.018, zf - zb - 0.02, 0, seatY - 0.012, 0));

  if (opts.highBack) {
    // upholstered back panel (chair behind the kidney table, IMG_9801)
    const back = new RoundedBoxGeometry(0.34, backH - seatY - 0.14, 0.05, 3, 0.02);
    back.rotateX(-0.08);
    back.translate(0, (seatY + backH) / 2 + 0.02, zb + 0.015);
    cushion.push(back);
  } else {
    // S-curved splat extruded across its width
    const curve = new THREE.CatmullRomCurve3([V(0, seatY + 0.01, zb + 0.03), V(0, 0.62, zb - 0.025), V(0, 0.82, zb + 0.005), V(0, backH - 0.02, zb)]);
    const pts = curve.getPoints(24);
    const shape = new THREE.Shape();
    const t = 0.009;
    pts.forEach((p, i) => (i === 0 ? shape.moveTo(p.z - t, p.y) : shape.lineTo(p.z - t, p.y)));
    for (let i = pts.length - 1; i >= 0; i--) shape.lineTo(pts[i].z + t, pts[i].y);
    const splat = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false });
    splat.rotateY(-Math.PI / 2);
    splat.translate(0.075, 0, 0);
    wood.push(splat);
  }
  const pad = new RoundedBoxGeometry(2 * hw - 0.05, 0.035, zf - zb - 0.04, 2, 0.012);
  pad.translate(0, seatY + 0.016, 0);
  cushion.push(pad);
  return { wood: merge(wood), cushion: merge(cushion) };
}

/** Bentwood lounge chair (IMG_9803): horseshoe walnut arm frame, blue-gray upholstery. Faces +z. */
export function loungeChairGeometry() {
  const wood: THREE.BufferGeometry[] = [];
  const fabric: THREE.BufferGeometry[] = [];
  const arm = [V(-0.37, 0.5, 0.3), V(-0.39, 0.58, 0.02), V(-0.3, 0.62, -0.26), V(0, 0.63, -0.35), V(0.3, 0.62, -0.26), V(0.39, 0.58, 0.02), V(0.37, 0.5, 0.3)];
  wood.push(tube(arm, 0.021, 64, 8));
  // flared legs, front legs curve up into the arm ends
  for (const sx of [-1, 1]) {
    wood.push(tube([V(sx * 0.36, 0.0, 0.33), V(sx * 0.35, 0.25, 0.3), V(sx * 0.37, 0.5, 0.3)], 0.022, 12, 8));
    wood.push(tube([V(sx * 0.33, 0.0, -0.34), V(sx * 0.3, 0.3, -0.25), V(sx * 0.3, 0.62, -0.26)], 0.022, 12, 8));
    wood.push(rod(V(sx * 0.35, 0.22, 0.3), V(sx * 0.31, 0.24, -0.27), 0.014));
  }
  wood.push(rod(V(-0.35, 0.22, 0.3), V(0.35, 0.22, 0.3), 0.014));
  const seat = new RoundedBoxGeometry(0.62, 0.17, 0.6, 4, 0.06);
  seat.translate(0, 0.33, 0.02);
  fabric.push(seat);
  const back = new RoundedBoxGeometry(0.6, 0.42, 0.13, 4, 0.06);
  back.rotateX(-0.2);
  back.translate(0, 0.6, -0.22);
  fabric.push(back);
  return { wood: merge(wood), fabric: merge(fabric) };
}

/** Round tray-top side table with tripod legs and a Y stretcher (IMG_9804). */
export function sideTableGeometry() {
  const parts: THREE.BufferGeometry[] = [];
  const top = new THREE.LatheGeometry(
    [new THREE.Vector2(0, 0), new THREE.Vector2(0.24, 0), new THREE.Vector2(0.255, 0.01), new THREE.Vector2(0.26, 0.035), new THREE.Vector2(0.245, 0.04), new THREE.Vector2(0.235, 0.022), new THREE.Vector2(0, 0.022)],
    40,
  );
  top.translate(0, 0.5, 0);
  parts.push(top);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const foot = V(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22);
    const head = V(Math.cos(a) * 0.15, 0.5, Math.sin(a) * 0.15);
    parts.push(rod(foot, head, 0.016));
    parts.push(rod(V(foot.x * 0.85, 0.08, foot.z * 0.85), V(0, 0.08, 0), 0.013));
  }
  return merge(parts);
}

/** Kidney / crescent table (IMG_9801), ~2.0 x 0.72 m, concave edge facing local -z. */
export function kidneyTableGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.95, 0.05);
  s.bezierCurveTo(-1.02, -0.25, -0.75, -0.36, -0.45, -0.34);
  s.bezierCurveTo(-0.15, -0.3, 0.2, -0.3, 0.5, -0.34);
  s.bezierCurveTo(0.85, -0.36, 1.05, -0.2, 0.97, 0.06);
  s.bezierCurveTo(0.9, 0.26, 0.65, 0.33, 0.4, 0.28);
  s.bezierCurveTo(0.2, 0.2, -0.2, 0.2, -0.4, 0.28);
  s.bezierCurveTo(-0.65, 0.36, -0.9, 0.28, -0.95, 0.05);
  const top = slab(s, 0.045, 0.715, 0.008, 24);
  const legs: THREE.BufferGeometry[] = [];
  for (const [x, z] of [
    [-0.72, 0.05],
    [0.72, 0.05],
    [-0.35, -0.18],
    [0.35, -0.18],
  ]) {
    legs.push(post(0.026, 0.02, 0.715, x, 0, z, 10));
  }
  legs.push(box(1.4, 0.05, 0.03, 0, 0.67, -0.12));
  return { top, legs: merge(legs) };
}

/** Curved bench stool, one of the four arranged around the kidney table. */
export function benchGeometry() {
  const s = new THREE.Shape();
  const r0 = 1.25;
  const r1 = 1.55;
  const a = 0.2;
  s.absarc(0, 0, r1, Math.PI / 2 - a, Math.PI / 2 + a, false);
  s.absarc(0, 0, r0, Math.PI / 2 + a, Math.PI / 2 - a, true);
  const top = slab(s, 0.035, 0.42, 0.006, 16);
  top.translate(0, 0, 1.4); // centre the seat at the origin
  const parts = [top];
  for (const [x, z] of [
    [-0.2, -0.08],
    [0.2, -0.08],
    [-0.2, 0.08],
    [0.2, 0.08],
  ]) {
    parts.push(rod(V(x * 1.15, 0, z * 1.3), V(x * 0.85, 0.42, z * 0.8), 0.017));
  }
  return merge(parts);
}

/** Oval tea cabinet with stone top and faucet (IMG_9802). Long axis along local x. */
export function teaCabinetGeometry() {
  const body = slab(roundedRectShape(0.9, 0.42, 0.2), 0.74, 0.02, 0.004, 24);
  const top = slab(roundedRectShape(0.94, 0.46, 0.22), 0.045, 0.76, 0.006, 24);
  const plinth = slab(roundedRectShape(0.86, 0.38, 0.18), 0.02, 0.0, 0, 16);
  const faucet: THREE.BufferGeometry[] = [
    post(0.012, 0.012, 0.25, -0.33, 0.8, 0.1),
    tube([V(-0.33, 1.05, 0.1), V(-0.31, 1.12, 0.1), V(-0.25, 1.1, 0.1), V(-0.23, 1.02, 0.1)], 0.007, 12, 6),
  ];
  return { body: merge([body, plinth]), top, faucet: merge(faucet) };
}

/** Freestanding dark open bookcase (Panorama 2, right edge). Back along local -z. */
export function openBookcaseGeometry(w = 0.9, h = 1.95, d = 0.36) {
  const t = 0.03;
  const parts: THREE.BufferGeometry[] = [];
  parts.push(box(t, h, d, -w / 2 + t / 2, h / 2, 0));
  parts.push(box(t, h, d, w / 2 - t / 2, h / 2, 0));
  for (let i = 0; i < 5; i++) parts.push(box(w, t, d, 0, 0.06 + i * ((h - 0.08) / 4), 0));
  parts.push(box(w, 0.25, 0.02, 0, h - 0.2, -d / 2 + 0.01));
  return merge(parts);
}

/**
 * Pivoting lattice screen (IMG_9809): honey-toned frame, fine vertical slats, square grid bands
 * at top and bottom and a triple rail at mid-height. Local origin at the bottom of the left
 * stile (the pivot), panel spans local +x.
 */
export function latticePanelGeometry(w: number, h: number) {
  const parts: THREE.BufferGeometry[] = [];
  const depth = 0.04;
  const st = 0.045;
  const y0 = 0.015; // floor clearance
  parts.push(box(st, h, depth, st / 2, y0 + h / 2, 0));
  parts.push(box(st, h, depth, w - st / 2, y0 + h / 2, 0));
  parts.push(box(w, st, depth, w / 2, y0 + h - st / 2, 0));
  parts.push(box(w, st, depth, w / 2, y0 + st / 2, 0));
  const inner = w - 2 * st;
  const n = 11;
  const step = inner / (n + 1);
  const slatW = 0.014;
  for (let i = 1; i <= n; i++) {
    const x = st + i * step;
    parts.push(box(slatW, h - 2 * st, 0.026, x, y0 + h / 2, 0));
  }
  const band = 0.42;
  // extra half-step verticals inside the grid bands make the small squares
  for (let i = 0; i <= n; i++) {
    const x = st + (i + 0.5) * step;
    parts.push(box(slatW, band, 0.026, x, y0 + st + band / 2, 0));
    parts.push(box(slatW, band, 0.026, x, y0 + h - st - band / 2, 0));
  }
  const rows = 6;
  for (let r = 1; r <= rows; r++) {
    const y = y0 + st + (r / (rows + 0.2)) * band;
    parts.push(box(inner, slatW, 0.026, w / 2, y, 0));
    parts.push(box(inner, slatW, 0.026, w / 2, y0 + h - y, 0));
  }
  for (const dy of [-0.07, 0, 0.07]) parts.push(box(inner, slatW, 0.026, w / 2, y0 + h * 0.52 + dy, 0));
  return merge(parts);
}

export type LanternKind = 'bell' | 'bicone' | 'hourglass';

/** Lathe profiles for the silk lantern pendants (IMG_9806 / IMG_9810). y = 0 at the bottom. */
export function lanternGeometry(kind: LanternKind) {
  const p: [number, number][] =
    kind === 'bell'
      ? [
          [0.15, 0],
          [0.2, 0.08],
          [0.27, 0.27],
          [0.32, 0.47],
          [0.335, 0.58],
          [0.3, 0.68],
          [0.18, 0.75],
          [0.03, 0.77],
        ]
      : kind === 'bicone'
        ? [
            [0.09, 0],
            [0.18, 0.1],
            [0.28, 0.3],
            [0.31, 0.42],
            [0.27, 0.58],
            [0.16, 0.76],
            [0.05, 0.84],
          ]
        : [
            [0.27, 0],
            [0.3, 0.07],
            [0.25, 0.24],
            [0.15, 0.42],
            [0.14, 0.48],
            [0.21, 0.6],
            [0.29, 0.74],
            [0.27, 0.83],
            [0.06, 0.87],
          ];
  const shell = new THREE.LatheGeometry(
    p.map(([r, y]) => new THREE.Vector2(r, y)),
    36,
  );
  const disk = new THREE.CircleGeometry(p[0][0] * 0.96, 32);
  disk.rotateX(Math.PI / 2);
  disk.translate(0, 0.01, 0);
  const height = p[p.length - 1][1];
  return { shell, disk, height };
}
