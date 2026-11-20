import * as THREE from 'three';
import { X0 } from './dims';
import { box, merge } from './geo';
import type { Ctx } from './room';
import { rng } from './textures';

/** Shelf run along the west wall (z extent inferred from Panorama 2). */
export const SZ0 = -4.4;
export const SZ1 = 7.6;
const DEPTH = 0.45;
const BASE_H = 0.9;
const ROW_H = 0.52;
const ROWS = 5;
const COL_W = 0.6;
const FRONT = X0 + DEPTH; // x of the shelf front face

export interface BookGroup {
  indices: number[];
  base: THREE.Matrix4[];
  t: number; // 0 shelved .. 1 pulled out
  target: number;
  row: number;
  count: number;
  z: number;
}

export class ShelfWall {
  books: THREE.InstancedMesh;
  groupProxies: THREE.InstancedMesh;
  groups: BookGroup[] = [];
  switchPanel: THREE.Mesh;
  switchLed: THREE.Mesh;
  lightsOn = true;
  private level = 1; // animated 0..1
  private rect: THREE.RectAreaLight;
  private spineMat: THREE.MeshStandardMaterial;
  private mats: Ctx['mats'];
  private tmp = new THREE.Matrix4();
  private offset = new THREE.Matrix4();

  constructor(ctx: Ctx, spineTexture: THREE.Texture) {
    const { scene, mats, world } = ctx;
    this.mats = mats;
    const len = SZ1 - SZ0;
    const zc = (SZ0 + SZ1) / 2;

    // --- base cabinets with door reveals and small brass knobs
    const cab: THREE.BufferGeometry[] = [box(DEPTH, BASE_H - 0.06, len, X0 + DEPTH / 2, 0.06 + (BASE_H - 0.06) / 2, zc)];
    scene.add(withShadow(new THREE.Mesh(merge(cab), mats.oak)));
    scene.add(new THREE.Mesh(box(DEPTH - 0.04, 0.06, len, X0 + DEPTH / 2 - 0.02, 0.03, zc), mats.black));
    const reveals: THREE.BufferGeometry[] = [];
    const knobs: THREE.BufferGeometry[] = [];
    for (let z = SZ0 + COL_W; z < SZ1 - 0.01; z += COL_W) reveals.push(box(0.004, BASE_H - 0.12, 0.006, FRONT + 0.001, 0.06 + (BASE_H - 0.06) / 2, z));
    for (let z = SZ0 + COL_W; z < SZ1 - 0.01; z += COL_W * 2) {
      for (const dz of [-0.05, 0.05]) {
        const k = new THREE.SphereGeometry(0.012, 10, 8);
        k.translate(FRONT + 0.012, BASE_H - 0.12, z + dz);
        knobs.push(k);
      }
    }
    scene.add(new THREE.Mesh(merge(reveals), mats.black));
    scene.add(new THREE.Mesh(merge(knobs), mats.brass));

    // --- glowing back panel, shelves, staggered dividers (IMG_9801 shows non-aligned dividers)
    const top = BASE_H + ROWS * ROW_H;
    const backG = new THREE.PlaneGeometry(len, ROWS * ROW_H);
    const uv = backG.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len * 1.2, uv.getY(i) * ROWS);
    const back = new THREE.Mesh(backG, mats.cubbyBack);
    back.rotation.y = Math.PI / 2;
    back.position.set(X0 + 0.012, BASE_H + (ROWS * ROW_H) / 2, zc);
    back.receiveShadow = true;
    scene.add(back);

    const frame: THREE.BufferGeometry[] = [];
    const leds: THREE.BufferGeometry[] = [];
    const rails: THREE.BufferGeometry[] = [];
    const t = 0.024;
    for (let r = 0; r <= ROWS; r++) {
      const y = BASE_H + r * ROW_H;
      frame.push(box(DEPTH - 0.02, t, len, X0 + 0.01 + (DEPTH - 0.02) / 2, y, zc));
      if (r > 0) leds.push(box(0.014, 0.008, len - 0.1, FRONT - 0.05, y - t / 2 - 0.006, zc));
      if (r < ROWS) rails.push(box(0.01, 0.03, len - 0.08, FRONT - 0.005, y + t / 2 + 0.015, zc));
    }
    const stagger = [0, 0.18, 0.06, 0.24, 0.1];
    const dividers: number[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const ys = BASE_H + r * ROW_H + ROW_H / 2;
      const list: number[] = [SZ0];
      for (let z = SZ0 + COL_W + stagger[r]; z < SZ1 - 0.25; z += COL_W) {
        frame.push(box(DEPTH - 0.02, ROW_H - t, 0.022, X0 + 0.01 + (DEPTH - 0.02) / 2, ys, z));
        list.push(z);
      }
      list.push(SZ1);
      dividers.push(list);
    }
    for (const z of [SZ0, SZ1]) frame.push(box(DEPTH, top - BASE_H + 0.03, 0.04, X0 + DEPTH / 2, (top + BASE_H) / 2, z));
    scene.add(withShadow(new THREE.Mesh(merge(frame), mats.oak)));
    scene.add(new THREE.Mesh(merge(leds), mats.shelfLed));
    scene.add(new THREE.Mesh(merge(rails), mats.steel));

    // --- sparse teal reference volumes (IMG_9805), as one instanced mesh with a photo spine
    const spineMat = mats.bookSpine.clone();
    this.spineMat = spineMat;
    spineMat.map = spineTexture;
    // the LED strip above each cubby washes the spines; a little emissive keeps them legible
    spineMat.emissive = new THREE.Color('#ffffff');
    spineMat.emissiveMap = spineTexture;
    spineMat.emissiveIntensity = 0.18;
    const bookG = new THREE.BoxGeometry(0.22, 0.3, 0.046);
    const placements: THREE.Matrix4[] = [];
    const R = rng(2024);
    const decor: THREE.BufferGeometry[] = [];
    const black: THREE.BufferGeometry[] = [];
    for (let r = 0; r < ROWS; r++) {
      const shelfY = BASE_H + r * ROW_H + t / 2;
      const list = dividers[r];
      for (let j = 0; j < list.length - 1; j++) {
        const a = list[j] + 0.03;
        const b = list[j + 1] - 0.03;
        const roll = R();
        if (r === 3 && (j === 3 || j === 13)) {
          // small black speakers seen in the panoramas
          black.push(box(0.16, 0.12, 0.22, X0 + 0.2, shelfY + 0.36, (a + b) / 2));
          continue;
        }
        if (roll < 0.43) {
          const count = 3 + Math.floor(R() * 5);
          const w = count * 0.048;
          if (w > b - a) continue;
          const left = R() < 0.5;
          const z0 = left ? a + 0.024 : b - w + 0.024;
          const g: BookGroup = { indices: [], base: [], t: 0, target: 0, row: r, count, z: z0 + w / 2 };
          for (let k = 0; k < count; k++) {
            const m = new THREE.Matrix4().makeTranslation(FRONT - 0.07 - 0.11, shelfY + 0.15, z0 + k * 0.048);
            g.indices.push(placements.length);
            g.base.push(m.clone());
            placements.push(m);
          }
          this.groups.push(g);
        } else if (roll < 0.5) {
          // spiral-bound calligraphy copybooks lying flat (IMG_9805, left)
          for (let k = 0; k < 3; k++) decor.push(box(0.2, 0.014, 0.13, FRONT - 0.18, shelfY + 0.008 + k * 0.015, (a + b) / 2 + (R() - 0.5) * 0.05, (R() - 0.5) * 0.3));
        } else if (roll < 0.53 && r === 2) {
          // brush rack (IMG_9801)
          black.push(box(0.03, 0.26, 0.2, FRONT - 0.2, shelfY + 0.13, (a + b) / 2));
          black.push(box(0.12, 0.02, 0.22, FRONT - 0.2, shelfY + 0.26, (a + b) / 2));
        }
      }
    }
    this.books = new THREE.InstancedMesh(bookG, [spineMat, mats.bookCloth, mats.pages, mats.bookCloth, mats.bookCloth, mats.bookCloth], placements.length);
    placements.forEach((m, i) => this.books.setMatrixAt(i, m));
    this.books.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.books.instanceMatrix.needsUpdate = true;
    this.books.castShadow = true;
    this.books.receiveShadow = true;
    this.books.computeBoundingSphere();
    this.books.name = 'books';
    scene.add(this.books);
    // One invisible hit box per group so aiming between two volumes still targets the group.
    this.groupProxies = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ visible: false }), this.groups.length);
    this.groups.forEach((g, i) => {
      const first = new THREE.Vector3().setFromMatrixPosition(g.base[0]);
      const last = new THREE.Vector3().setFromMatrixPosition(g.base[g.base.length - 1]);
      const c = first.clone().add(last).multiplyScalar(0.5);
      const m = new THREE.Matrix4().compose(c, new THREE.Quaternion(), new THREE.Vector3(0.24, 0.32, last.z - first.z + 0.06));
      this.groupProxies.setMatrixAt(i, m);
      g.z = c.z;
    });
    this.groupProxies.instanceMatrix.needsUpdate = true;
    this.groupProxies.computeBoundingSphere();
    scene.add(this.groupProxies);
    if (decor.length) scene.add(new THREE.Mesh(merge(decor), mats.copybook));
    if (black.length) scene.add(new THREE.Mesh(merge(black), mats.black));

    // --- area light standing in for the combined glow of all cubbies
    this.rect = new THREE.RectAreaLight('#ffb466', 3.2, len, ROWS * ROW_H);
    this.rect.position.set(FRONT + 0.05, BASE_H + (ROWS * ROW_H) / 2, zc);
    this.rect.lookAt(FRONT + 5, BASE_H + (ROWS * ROW_H) / 2, zc);
    scene.add(this.rect);

    // --- lighting control panel beside the shelf (black panel visible in Panorama 2)
    this.switchPanel = new THREE.Mesh(box(0.015, 0.16, 0.12, X0 + 0.008, 1.35, SZ0 - 0.4), mats.black);
    this.switchPanel.name = 'shelf-switch';
    scene.add(this.switchPanel);
    this.switchLed = new THREE.Mesh(
      box(0.01, 0.012, 0.012, X0 + 0.018, 1.4, SZ0 - 0.4),
      new THREE.MeshStandardMaterial({ color: '#103010', emissive: new THREE.Color('#38ff7a'), emissiveIntensity: 2 }),
    );
    scene.add(this.switchLed);

    world.obb(X0 + DEPTH / 2, zc, DEPTH / 2, len / 2, 0, 'shelf');
  }

  toggleLights(): boolean {
    this.lightsOn = !this.lightsOn;
    return this.lightsOn;
  }

  /** Toggle a group's pulled-out state. Returns the new state. */
  toggleGroup(i: number): boolean {
    const g = this.groups[i];
    g.target = g.target > 0.5 ? 0 : 1;
    return g.target > 0.5;
  }

  update(dt: number) {
    const target = this.lightsOn ? 1 : 0;
    this.level += (target - this.level) * (1 - Math.exp(-dt * 7));
    if (Math.abs(target - this.level) < 0.001) this.level = target;
    const l = this.level;
    this.mats.cubbyBack.emissiveIntensity = 1.5 * l;
    this.mats.shelfLed.emissiveIntensity = 3.0 * l + 0.02;
    this.rect.intensity = 3.2 * l;
    this.spineMat.emissiveIntensity = 0.18 * l;
    (this.switchLed.material as THREE.MeshStandardMaterial).emissive.set(this.lightsOn ? '#38ff7a' : '#ff7a2a');

    let dirty = false;
    for (const g of this.groups) {
      if (g.t === g.target) continue;
      const step = dt * 3.2;
      g.t = g.target > g.t ? Math.min(g.target, g.t + step) : Math.max(g.target, g.t - step);
      const e = g.t * g.t * (3 - 2 * g.t);
      this.offset.makeTranslation(0.17 * e, 0.012 * e, 0);
      g.indices.forEach((idx, k) => {
        this.tmp.multiplyMatrices(this.offset, g.base[k]);
        this.books.setMatrixAt(idx, this.tmp);
      });
      dirty = true;
    }
    if (dirty) {
      this.books.instanceMatrix.needsUpdate = true;
      this.books.computeBoundingSphere();
    }
  }
}

function withShadow(m: THREE.Mesh): THREE.Mesh {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
