import * as THREE from 'three';
import { CEIL } from './dims';
import { lanternGeometry, type LanternKind } from './furniture';
import type { Ctx } from './room';

export interface Pendant {
  group: THREE.Group;
  shell: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  diffuserMat: THREE.MeshStandardMaterial;
  on: boolean;
  level: number;
  kind: LanternKind;
  index: number;
  cluster: number;
  power: number;
}

/**
 * Placement of the silk lantern cluster. Positions and drop heights are a plausible
 * reading of IMG_9806 / IMG_9810 / Panorama 1-2, not a survey.
 */
const LAYOUT: { x: number; z: number; bottom: number; kind: LanternKind; s: number }[] = [
  { x: -3.8, z: -4.8, bottom: 5.2, kind: 'hourglass', s: 1.25 },
  { x: -1.6, z: -5.6, bottom: 6.3, kind: 'bicone', s: 0.95 },
  { x: 0.9, z: -4.2, bottom: 4.6, kind: 'bell', s: 1.3 },
  { x: 3.4, z: -5.2, bottom: 5.8, kind: 'bicone', s: 1.1 },
  { x: -2.6, z: -1.8, bottom: 4.3, kind: 'bicone', s: 1.2 },
  { x: 0.2, z: -0.6, bottom: 5.6, kind: 'hourglass', s: 1.45 },
  { x: 2.8, z: -1.4, bottom: 4.9, kind: 'bell', s: 1.1 },
  { x: 4.8, z: 0.8, bottom: 6.4, kind: 'bicone', s: 0.9 },
  { x: -3.4, z: 1.8, bottom: 5.9, kind: 'bell', s: 1.0 },
  { x: -0.9, z: 2.6, bottom: 4.5, kind: 'bicone', s: 1.35 },
  { x: 1.9, z: 2.2, bottom: 6.0, kind: 'hourglass', s: 1.15 },
  { x: -1.8, z: 5.4, bottom: 5.4, kind: 'hourglass', s: 1.1 },
  { x: 1.2, z: 6.0, bottom: 4.8, kind: 'bicone', s: 1.0 },
  { x: 3.8, z: 4.4, bottom: 5.5, kind: 'bell', s: 1.2 },
];

/** Candela per unit lantern scale. */
export const PENDANT_INTENSITY = 7.0;

/**
 * Performance: one real point light per lantern made every fragment evaluate 14+ lights.
 * Lanterns are instead pooled into four quadrant "cluster" lights placed at their centroid.
 * Switching a lantern off removes its share from its cluster, so the room still dims nearby.
 */
export class Pendants {
  list: Pendant[] = [];
  clusters: THREE.PointLight[] = [];

  constructor(ctx: Ctx) {
    const { scene, mats } = ctx;
    const geos = {
      bell: lanternGeometry('bell'),
      bicone: lanternGeometry('bicone'),
      hourglass: lanternGeometry('hourglass'),
    };
    const cableMat = new THREE.MeshBasicMaterial({ color: '#2a2622' });
    const sums = [0, 1, 2, 3].map(() => ({ x: 0, y: 0, z: 0, n: 0 }));
    LAYOUT.forEach((p, index) => {
      const g = geos[p.kind];
      const group = new THREE.Group();
      group.position.set(p.x, p.bottom, p.z);
      const mat = mats.lantern.clone();
      const diffuserMat = mats.lanternDiffuser.clone();
      const shell = new THREE.Mesh(g.shell, mat);
      shell.scale.setScalar(p.s);
      shell.name = `pendant-${index}`;
      shell.userData.pendant = index;
      const disk = new THREE.Mesh(g.disk, diffuserMat);
      disk.scale.setScalar(p.s);
      disk.userData.pendant = index;
      group.add(shell, disk);
      const topY = g.height * p.s;
      const cableLen = CEIL - (p.bottom + topY);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, cableLen, 4), cableMat);
      cable.position.y = topY + cableLen / 2;
      group.add(cable);
      const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), mats.brass);
      canopy.position.y = CEIL - p.bottom - 0.06;
      group.add(canopy);
      scene.add(group);
      const cluster = (p.x < 0.5 ? 0 : 1) + (p.z < 0.6 ? 0 : 2);
      const c = sums[cluster];
      c.x += p.x;
      c.y += p.bottom + topY * 0.4;
      c.z += p.z;
      c.n++;
      this.list.push({ group, shell, mat, diffuserMat, on: true, level: 1, kind: p.kind, index, cluster, power: PENDANT_INTENSITY * p.s });
    });
    for (const c of sums) {
      const l = new THREE.PointLight('#ffdcb0', 0, 0, 2);
      // lifted above the lantern centroid so the pooled light spreads instead of hot-spotting
      if (c.n) l.position.set(c.x / c.n, c.y / c.n + 1.2, c.z / c.n);
      scene.add(l);
      this.clusters.push(l);
    }
    this.applyClusters();
  }

  meshes(): THREE.Object3D[] {
    return this.list.flatMap((p) => p.group.children.filter((c) => c.userData.pendant !== undefined));
  }

  toggle(i: number): boolean {
    const p = this.list[i];
    p.on = !p.on;
    return p.on;
  }

  private applyClusters() {
    const totals = [0, 0, 0, 0];
    for (const p of this.list) totals[p.cluster] += p.power * p.level;
    this.clusters.forEach((l, i) => (l.intensity = totals[i]));
  }

  update(dt: number) {
    let changed = false;
    for (const p of this.list) {
      const t = p.on ? 1 : 0;
      if (p.level === t) continue;
      p.level += (t - p.level) * (1 - Math.exp(-dt * 8));
      if (Math.abs(t - p.level) < 0.002) p.level = t;
      p.mat.emissiveIntensity = 1.7 * p.level + 0.03;
      p.diffuserMat.emissiveIntensity = 2.6 * p.level + 0.02;
      changed = true;
    }
    if (changed) this.applyClusters();
  }
}
