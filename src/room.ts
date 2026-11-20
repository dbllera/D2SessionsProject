import * as THREE from 'three';
import type { CollisionWorld } from './collision';
import { BULK_Y0, BULK_Y1, CEIL, CORRIDOR_Z, SLAT_Y, X0, X1, Z0, Z1 } from './dims';
import { box, merge, post } from './geo';
import type { Materials } from './materials';

export interface Ctx {
  scene: THREE.Scene;
  mats: Materials;
  world: CollisionWorld;
}

function mesh(g: THREE.BufferGeometry, m: THREE.Material, cast = true, receive = true): THREE.Mesh {
  const o = new THREE.Mesh(g, m);
  o.castShadow = cast;
  o.receiveShadow = receive;
  return o;
}

/** Plane with UVs in metres (u along the plane's width, v along its height) for tiling textures. */
function metrePlane(w: number, h: number, uvScale = 1): THREE.PlaneGeometry {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * uvScale, uv.getY(i) * h * uvScale);
  return g;
}

/** Glazed bay: a glass sheet plus mullions/transoms, in a vertical plane z = const facing +z or -z. */
function glazingZ(ctx: Ctx, x0: number, x1: number, y0: number, y1: number, z: number, bays: number, transoms: number[], depth = 0.14) {
  const glass = new THREE.PlaneGeometry(x1 - x0, y1 - y0);
  glass.translate((x0 + x1) / 2, (y0 + y1) / 2, z);
  const g = new THREE.Mesh(glass, ctx.mats.glass);
  g.renderOrder = 2;
  ctx.scene.add(g);
  const frame: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= bays; i++) {
    const x = x0 + ((x1 - x0) * i) / bays;
    frame.push(box(0.06, y1 - y0, depth, x, (y0 + y1) / 2, z));
  }
  for (const ty of [y0, y1, ...transoms]) frame.push(box(x1 - x0, 0.06, depth, (x0 + x1) / 2, ty, z));
  ctx.scene.add(mesh(merge(frame), ctx.mats.mullion, false, true));
}

export function buildRoom(ctx: Ctx) {
  const { scene, mats, world } = ctx;

  // ---------- floor (room + corridor behind the lattice)
  const fw = X1 - X0;
  const fl = CORRIDOR_Z - Z0;
  const floorG = metrePlane(fw, fl);
  floorG.rotateX(-Math.PI / 2);
  floorG.translate((X0 + X1) / 2, 0, (Z0 + CORRIDOR_Z) / 2);
  const floor = mesh(floorG, mats.floor, false, true);
  floor.name = 'floor';
  scene.add(floor);

  // ---------- side walls: plaster below, vertical wood slat cladding above, LED cove line between
  for (const side of [-1, 1] as const) {
    const x = side < 0 ? X0 : X1;
    const wall = mesh(new THREE.PlaneGeometry(Z1 - Z0, SLAT_Y), mats.plaster, false, true);
    wall.position.set(x, SLAT_Y / 2, (Z0 + Z1) / 2);
    wall.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(wall);

    const backing = mesh(new THREE.PlaneGeometry(Z1 - Z0, CEIL - SLAT_Y + 0.4), mats.slatBacking, false, false);
    backing.position.set(x - side * 0.005, (SLAT_Y + CEIL + 0.4) / 2, (Z0 + Z1) / 2);
    backing.rotation.y = wall.rotation.y;
    scene.add(backing);
    const slats: THREE.BufferGeometry[] = [];
    for (let z = Z0 + 0.05; z < Z1; z += 0.1) slats.push(box(0.05, CEIL - SLAT_Y, 0.032, x - side * 0.03, (SLAT_Y + CEIL) / 2, z));
    scene.add(mesh(merge(slats), mats.slat, false, true));
    const led = mesh(box(0.03, 0.025, Z1 - Z0, x - side * 0.045, SLAT_Y - 0.01, (Z0 + Z1) / 2), mats.ledStrip, false, false);
    scene.add(led);

    // corridor side walls behind the lattice
    const cw = mesh(new THREE.PlaneGeometry(CORRIDOR_Z - Z1, BULK_Y0), mats.atriumPlain, false, true);
    cw.position.set(x, BULK_Y0 / 2, (Z1 + CORRIDOR_Z) / 2);
    cw.rotation.y = wall.rotation.y;
    scene.add(cw);
  }

  // ---------- ceiling: dark wood grid of deep slats + cross members (IMG_9806, IMG_9810)
  const ceil: THREE.BufferGeometry[] = [];
  for (let z = Z0 + 0.06; z < Z1; z += 0.15) ceil.push(box(X1 - X0, 0.12, 0.03, 0, CEIL, z));
  for (let x = X0 + 0.3; x < X1; x += 0.6) ceil.push(box(0.03, 0.05, Z1 - Z0, x, CEIL + 0.07, 0));
  scene.add(mesh(merge(ceil), mats.slat, false, false));
  const ceilBack = mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), mats.slatBacking, false, false);
  ceilBack.rotation.x = Math.PI / 2;
  ceilBack.position.set(0, CEIL + 0.3, 0);
  scene.add(ceilBack);

  // ---------- north: two-storey glazed wall with glass double doors and a white spandrel band
  glazingZ(ctx, X0, X1, 0, 4.4, Z0, 10, [3.25]);
  const band = mesh(box(X1 - X0, 1.3, 0.3, 0, 4.4 + 0.65, Z0 - 0.05), mats.whitePanel, false, true);
  scene.add(band);
  const joints: THREE.BufferGeometry[] = [];
  for (let x = X0 + 1.5; x < X1; x += 1.5) joints.push(box(0.012, 1.3, 0.01, x, 5.05, Z0 + 0.105));
  scene.add(mesh(merge(joints), mats.mullion, false, false));
  glazingZ(ctx, X0, X1, 5.7, CEIL + 0.3, Z0, 10, [7.2]);
  // door leaves (x 0.8 .. 2.4) with heavier frames and long pull handles
  const doorFrame: THREE.BufferGeometry[] = [];
  for (const x of [0.8, 1.6, 2.4]) doorFrame.push(box(0.09, 2.75, 0.16, x, 1.375, Z0 + 0.02));
  doorFrame.push(box(1.7, 0.1, 0.16, 1.6, 2.75, Z0 + 0.02));
  scene.add(mesh(merge(doorFrame), mats.mullion, false, true));
  const handles: THREE.BufferGeometry[] = [];
  for (const x of [1.5, 1.7]) handles.push(post(0.012, 0.012, 0.9, x, 0.75, Z0 + 0.11, 8));
  scene.add(mesh(merge(handles), mats.steel, false, false));

  // exterior at night: ground, hedge, and a painted backdrop (no remote assets)
  const ground = mesh(new THREE.PlaneGeometry(80, 22), mats.nightGround, false, false);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, Z0 - 11);
  scene.add(ground);
  scene.add(mesh(box(30, 0.7, 1.2, 0, 0.35, Z0 - 4.5), mats.hedge, false, false));
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(90, 34), mats.night);
  backdrop.position.set(0, 12, Z0 - 22);
  scene.add(backdrop);

  // ---------- south: bulkhead with slot diffuser, upper glazing, corridor, balustrade, atrium
  scene.add(mesh(box(X1 - X0, BULK_Y1 - BULK_Y0, 3.5, 0, (BULK_Y0 + BULK_Y1) / 2, Z1 + 1.75), mats.cream, false, true));
  scene.add(mesh(box(X1 - X0 - 0.4, 0.06, 0.02, 0, BULK_Y0 + 0.45, Z1 - 0.005), mats.black, false, false));
  glazingZ(ctx, X0, X1, BULK_Y1, CEIL + 0.3, Z1, 8, [], 0.1);
  // corridor soffit light panels
  const soffit = mesh(new THREE.PlaneGeometry(X1 - X0, CORRIDOR_Z - Z1), mats.atriumPlain, false, false);
  soffit.rotation.x = Math.PI / 2;
  soffit.position.set(0, BULK_Y0 - 0.001, (Z1 + CORRIDOR_Z) / 2);
  scene.add(soffit);
  // glass balustrade with steel rail and posts
  const bal = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 1.05), mats.glass);
  bal.position.set(0, 0.55, CORRIDOR_Z);
  bal.renderOrder = 2;
  scene.add(bal);
  const rail: THREE.BufferGeometry[] = [box(X1 - X0, 0.05, 0.06, 0, 1.1, CORRIDOR_Z)];
  for (let x = X0 + 1; x < X1; x += 1.5) rail.push(box(0.04, 1.1, 0.04, x, 0.55, CORRIDOR_Z + 0.03));
  scene.add(mesh(merge(rail), mats.steel, false, false));
  // floor edge of the corridor slab
  scene.add(mesh(box(X1 - X0 + 9, 0.5, 0.3, 0, -0.25, CORRIDOR_Z + 0.15), mats.atriumPlain, false, false));

  // atrium volume (bright, simplified): walls, lower floor, gallery, wide wood stair seating
  const A = { x0: -12, x1: 12, z0: CORRIDOR_Z, z1: 26, y0: -4.5, y1: 14 };
  const atrium: THREE.BufferGeometry[] = [
    box(A.x1 - A.x0, 0.2, A.z1 - A.z0, 0, A.y0 - 0.1, (A.z0 + A.z1) / 2), // lower floor
    box(A.x1 - A.x0, A.y1 - A.y0, 0.2, 0, (A.y0 + A.y1) / 2, A.z1), // far wall
    box(0.2, A.y1 - A.y0, A.z1 - A.z0, A.x0, (A.y0 + A.y1) / 2, (A.z0 + A.z1) / 2),
    box(0.2, A.y1 - A.y0, A.z1 - A.z0, A.x1, (A.y0 + A.y1) / 2, (A.z0 + A.z1) / 2),
    box(A.x1 - A.x0, 0.2, A.z1 - A.z0, 0, A.y1, (A.z0 + A.z1) / 2), // skylight ceiling
    box(A.x1 - A.x0, 0.4, 1.8, 0, BULK_Y1 - 0.2, Z1 + 3.4), // gallery slab overhang
    box(A.x1 - A.x0, 0.25, 6, 0, 9.5, A.z1 - 3), // upper gallery far side
  ];
  // lower-level side wall below the corridor slab
  atrium.push(box(A.x1 - A.x0, -A.y0, 0.2, 0, A.y0 / 2, CORRIDOR_Z + 0.2));
  scene.add(mesh(merge(atrium), mats.atrium, false, false));
  const stairs: THREE.BufferGeometry[] = [];
  const steps = 14;
  for (let i = 0; i < steps; i++) {
    const h = A.y0 + (i + 1) * ((BULK_Y1 - A.y0) / steps);
    const z = 15 + i * 0.6;
    stairs.push(box(8, h - A.y0, 0.6, 0, (h + A.y0) / 2, z));
  }
  scene.add(mesh(merge(stairs), mats.atriumWood, false, false));
  const galleryGlass = new THREE.Mesh(new THREE.PlaneGeometry(A.x1 - A.x0, 1.1), mats.glass);
  galleryGlass.position.set(0, BULK_Y1 + 0.55, Z1 + 4.3);
  galleryGlass.renderOrder = 2;
  scene.add(galleryGlass);

  // ---------- east: display wall (Panorama 1/2): large black screen with speaker columns
  const dz = 1.0;
  const dispW = 6.0;
  const dispH = 3.4;
  scene.add(mesh(box(0.05, dispH + 0.12, dispW + 0.12, X1 - 0.03, 0.14 + dispH / 2, dz), mats.black, false, true));
  const screen = mesh(box(0.02, dispH, dispW, X1 - 0.065, 0.14 + dispH / 2, dz), mats.display, false, true);
  screen.name = 'display';
  scene.add(screen);
  for (const s of [-1, 1]) scene.add(mesh(box(0.09, 3.0, 0.1, X1 - 0.08, 1.75, dz + s * (dispW / 2 + 0.06)), mats.black, false, true));
  // baseboard line visible in both panoramas
  for (const side of [-1, 1]) scene.add(mesh(box(0.012, 0.1, Z1 - Z0, side < 0 ? X0 + 0.006 : X1 - 0.006, 0.05, 0), mats.whitePanel, false, true));
  // recycling cabinet near the glass corner
  const rx = X1 - 0.22;
  const rz = -6.6;
  scene.add(mesh(box(0.42, 0.85, 0.92, rx, 0.425, rz), mats.recycle));
  const holes: THREE.BufferGeometry[] = [];
  const labels = ['#1d2a44', '#1f7a3e', '#1f5fa8'];
  labels.forEach((c, i) => {
    const h = new THREE.CylinderGeometry(0.07, 0.07, 0.01, 20);
    h.rotateZ(Math.PI / 2);
    h.translate(rx - 0.215, 0.72, rz - 0.28 + i * 0.28);
    holes.push(h);
    const lab = mesh(box(0.01, 0.14, 0.2, rx - 0.215, 0.5, rz - 0.28 + i * 0.28), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }), false, false);
    scene.add(lab);
  });
  scene.add(mesh(merge(holes), mats.black, false, false));
  world.obb(rx, rz, 0.21, 0.46, 0, 'recycling');

  // exit signs (low, green) and a light switch plate
  scene.add(mesh(box(0.02, 0.12, 0.32, X1 - 0.01, 0.4, -5.4), mats.exitSign, false, false));
  scene.add(mesh(box(0.02, 0.12, 0.32, X0 + 0.01, 0.4, -5.05), mats.exitSign, false, false));
  scene.add(mesh(box(0.01, 0.12, 0.08, X1 - 0.005, 1.3, -5.1), mats.whitePanel, false, false));

  // ---------- west: service door near the glazed corner (Panorama 2, right)
  const doorZ = -6.55;
  scene.add(mesh(box(0.06, 2.45, 1.05, X0 + 0.03, 1.225, doorZ), mats.whitePanel, false, true));
  scene.add(mesh(box(0.05, 2.55, 0.06, X0 + 0.025, 1.275, doorZ - 0.555), mats.mullion, false, false));
  scene.add(mesh(box(0.05, 2.55, 0.06, X0 + 0.025, 1.275, doorZ + 0.555), mats.mullion, false, false));
  scene.add(mesh(box(0.05, 0.02, 0.14, X0 + 0.08, 1.05, doorZ + 0.38), mats.steel, false, false));

  // ---------- room boundary colliders
  world.seg(X0, Z0, X0, CORRIDOR_Z, 0.02, 'wall-w');
  world.seg(X1, Z0, X1, CORRIDOR_Z, 0.02, 'wall-e');
  world.seg(X0, Z0, X1, Z0, 0.06, 'glass-n');
  world.seg(X0, CORRIDOR_Z, X1, CORRIDOR_Z, 0.04, 'balustrade');
}
