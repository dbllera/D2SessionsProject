import * as THREE from 'three';
import { ATRIUM, BULK_Y1, CORRIDOR_Z, STAIR_GAP_HALF } from './dims';
import { box, merge, post, rod } from './geo';
import type { Ctx } from './room';

/** Half-width of the walkable flight (centred on x = 0, in line with the opening lattice panel). */
const HALF = STAIR_GAP_HALF;
/** Half-width of the seating steps and of the top landing. */
const SEAT_HALF = 4;
/** First riser, just past the corridor slab edge. */
const S = CORRIDOR_Z + 0.3;
/** End of the flight = front edge of the top landing (same line as the top seating step). */
const E = 23.4;
/** Landing / gallery level. */
const TOP = BULK_Y1;
/** Back of the landing (face of the atrium's far wall). */
const BACK = ATRIUM.z1 - 0.1;
const RISERS = 35; // ≈0.17 m rise, ≈0.34 m going
const TREAD_DEPTH = 0.35; // vertical thickness of each tread block
/** Walking into this strip at the back of the landing, in front of the doorway, travels to Duke. */
const TRIGGER_Z = BACK - 0.7;
const TRIGGER_HALF = 1.0;

function mesh(g: THREE.BufferGeometry, m: THREE.Material, cast = false, receive = true): THREE.Mesh {
  const o = new THREE.Mesh(g, m);
  o.castShadow = cast;
  o.receiveShadow = receive;
  return o;
}

/** Canvas texture for the doorway: a lit pointed-arch window and a sign naming where it leads. */
function doorwayTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 1024;
  const g = c.getContext('2d');
  if (!g) throw new Error('2D canvas unavailable');
  const bg = g.createLinearGradient(0, 0, 0, 1024);
  bg.addColorStop(0, '#3a2414');
  bg.addColorStop(1, '#1d120a');
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 1024);
  // pointed arch, glowing warm like the Gothic Reading Room's lamps
  const arch = new Path2D();
  arch.moveTo(96, 980);
  arch.lineTo(96, 420);
  arch.quadraticCurveTo(96, 250, 256, 150);
  arch.quadraticCurveTo(416, 250, 416, 420);
  arch.lineTo(416, 980);
  arch.closePath();
  const glow = g.createRadialGradient(256, 520, 40, 256, 560, 520);
  glow.addColorStop(0, '#fff2cf');
  glow.addColorStop(0.55, '#f2c27a');
  glow.addColorStop(1, '#a8682c');
  g.fillStyle = glow;
  g.fill(arch);
  g.strokeStyle = '#140c06';
  g.lineWidth = 18;
  g.stroke(arch);
  // tracery mullion and transom
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(256, 160);
  g.lineTo(256, 980);
  g.moveTo(96, 560);
  g.lineTo(416, 560);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function signTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  if (!g) throw new Error('2D canvas unavailable');
  g.fillStyle = '#012169'; // Duke blue
  g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = '#c9a259';
  g.lineWidth = 8;
  g.strokeRect(14, 14, 996, 228);
  g.fillStyle = '#f5f1e6';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '600 76px Georgia, serif';
  g.fillText('To Duke', 512, 100);
  g.font = '44px Georgia, serif';
  g.fillText('Gothic Reading Room', 512, 182);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * The atrium stair behind the lattice: wide timber seating steps with a walkable flight up the
 * middle, from the corridor (y = 0) to the gallery landing (y = BULK_Y1). The doorway at the back
 * of the landing leads to the Duke world (main.ts calls shared/portal travel()).
 */
export class AtriumStair {
  /** Where to stand when arriving from Duke: on the landing, facing back down the flight. */
  readonly topArrival = { x: 0, z: BACK - 1.6, yaw: 0, pitch: -0.28 };
  /** Furthest +z the player may reach (used by the player's safety clamp). */
  readonly zMax = BACK;
  /** Bounds of the corridor approach where main.ts shows the "stairs up to Duke" hint. */
  readonly approach = { x0: -1.6, x1: 1.6, z0: CORRIDOR_Z - 1.6, z1: S + 1.2 };

  constructor(ctx: Ctx) {
    const { scene, mats, world } = ctx;
    const y0 = ATRIUM.y0;
    const rise = TOP / RISERS;
    const going = (E - S) / RISERS;
    const flightBottom = (z: number) => ((z - S) / (E - S)) * TOP - TREAD_DEPTH;

    // ---- seating steps (the original atrium stair), split around the walking flight
    const seats: THREE.BufferGeometry[] = [];
    const steps = 14;
    const sideW = SEAT_HALF - HALF - 0.05;
    for (let i = 0; i < steps; i++) {
      const h = y0 + (i + 1) * ((TOP - y0) / steps);
      const z = 15 + i * 0.6;
      for (const s of [-1, 1]) seats.push(box(sideW, h - y0, 0.6, s * (SEAT_HALF - sideW / 2), (h + y0) / 2, z));
      // under the flight the step stops short of the treads
      const top = Math.min(h, flightBottom(z - 0.3));
      if (top > y0 + 0.05) seats.push(box(2 * HALF + 0.1, top - y0, 0.6, 0, (top + y0) / 2, z));
    }
    scene.add(mesh(merge(seats), mats.atriumWood));

    // ---- walking flight: stepped tread blocks + steel stringers
    const treads: THREE.BufferGeometry[] = [];
    for (let k = 0; k < RISERS; k++) {
      const top = (k + 1) * rise;
      treads.push(box(2 * HALF, TREAD_DEPTH, going, 0, top - TREAD_DEPTH / 2, S + (k + 0.5) * going));
    }
    scene.add(mesh(merge(treads), mats.oak, true, true));
    const len = Math.hypot(E - S, TOP);
    const angle = Math.atan2(TOP, E - S);
    const stringers: THREE.BufferGeometry[] = [];
    for (const s of [-1, 1]) stringers.push(box(0.04, 0.5, len, s * (HALF + 0.02), TOP / 2 - 0.12, (S + E) / 2, 0, -angle));
    scene.add(mesh(merge(stringers), mats.mullion, false, false));

    // ---- landing at gallery level
    scene.add(mesh(box(2 * SEAT_HALF, 0.3, BACK - E, 0, TOP - 0.15, (E + BACK) / 2), mats.atriumWood));

    // ---- handrails: along the flight, then around the landing
    const rails: THREE.BufferGeometry[] = [];
    const RH = 0.95;
    for (const s of [-1, 1]) {
      const x = s * (HALF + 0.03);
      rails.push(rod(new THREE.Vector3(x, RH, CORRIDOR_Z), new THREE.Vector3(x, RH, S), 0.022));
      rails.push(rod(new THREE.Vector3(x, RH, S), new THREE.Vector3(x, TOP + RH, E), 0.022));
      for (let z = S + 0.6; z < E; z += 1.2) {
        const y = ((z - S) / (E - S)) * TOP;
        rails.push(post(0.016, 0.016, RH, x, y, z, 8));
      }
      // landing: front edge beside the flight, then the side
      const xs = s * SEAT_HALF;
      rails.push(rod(new THREE.Vector3(x, TOP + RH, E), new THREE.Vector3(xs, TOP + RH, E), 0.022));
      rails.push(rod(new THREE.Vector3(xs, TOP + RH, E), new THREE.Vector3(xs, TOP + RH, BACK), 0.022));
      for (const px of [x, (x + xs) / 2, xs]) rails.push(post(0.016, 0.016, RH, px, TOP, E, 8));
      for (let z = E + 0.8; z < BACK; z += 0.8) rails.push(post(0.016, 0.016, RH, xs, TOP, z, 8));
    }
    scene.add(mesh(merge(rails), mats.steel, false, false));

    // ---- doorway to Duke on the far atrium wall, with a sign above it
    const doorW = 1.7;
    const doorH = 2.6; // the upper gallery slab sits at y ≈ 9.4, so door + sign must fit below it
    const frame: THREE.BufferGeometry[] = [
      box(0.14, doorH + 0.14, 0.12, -(doorW / 2 + 0.07), TOP + (doorH + 0.14) / 2, BACK - 0.06),
      box(0.14, doorH + 0.14, 0.12, doorW / 2 + 0.07, TOP + (doorH + 0.14) / 2, BACK - 0.06),
      box(doorW + 0.28, 0.14, 0.12, 0, TOP + doorH + 0.07, BACK - 0.06),
    ];
    scene.add(mesh(merge(frame), mats.walnutDark, false, true));
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(doorW, doorH),
      new THREE.MeshBasicMaterial({ map: doorwayTexture(), toneMapped: false }),
    );
    glow.position.set(0, TOP + doorH / 2, BACK - 0.02);
    glow.rotation.y = Math.PI;
    glow.name = 'duke-doorway';
    scene.add(glow);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: signTexture() }));
    sign.position.set(0, TOP + doorH + 0.46, BACK - 0.03);
    sign.rotation.y = Math.PI;
    scene.add(sign);
    const warm = new THREE.PointLight('#ffcf8a', 6, 7, 2);
    warm.position.set(0, TOP + 1.6, BACK - 0.9);
    scene.add(warm);

    // ---- colliders: keep the player on the flight and the landing
    const r = 0.04;
    for (const s of [-1, 1]) {
      world.seg(s * HALF, CORRIDOR_Z, s * HALF, E, r, 'stair-side');
      world.seg(s * HALF, E, s * SEAT_HALF, E, r, 'landing-front');
      world.seg(s * SEAT_HALF, E, s * SEAT_HALF, BACK, r, 'landing-side');
    }
    world.seg(-SEAT_HALF, BACK, SEAT_HALF, BACK, r, 'landing-back');
  }

  /** Floor height under (x, z): a straight ramp along the flight so the camera climbs smoothly. */
  heightAt(x: number, z: number): number {
    if (z <= S) return 0;
    if (z < E) return Math.abs(x) <= HALF + 0.3 ? ((z - S) / (E - S)) * TOP : 0;
    return Math.abs(x) <= SEAT_HALF + 0.3 ? TOP : 0;
  }

  /** True when standing in front of the doorway at the back of the landing. */
  isAtDoorway(x: number, z: number): boolean {
    return z >= TRIGGER_Z && Math.abs(x) <= TRIGGER_HALF;
  }

  inApproach(x: number, z: number): boolean {
    const a = this.approach;
    return x >= a.x0 && x <= a.x1 && z >= a.z0 && z <= a.z1;
  }
}
