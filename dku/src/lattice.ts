import * as THREE from 'three';
import type { Segment } from './collision';
import { PLAYER_R, X0, X1 } from './dims';
import { latticePanelGeometry } from './furniture';
import { merge } from './geo';
import type { Ctx } from './room';

const PANEL_H = 3.4;
const COUNT = 18;
const LINE_Z = 8.72;
const ZIG = 0.12; // accordion depth (Panorama 1 right side shows a shallow zig-zag)
export const OPEN_INDEX = 9;
const OPEN_ANGLE = THREE.MathUtils.degToRad(82);

/**
 * Row of honey-wood pivot screens along the south side (IMG_9808, IMG_9809, Panorama 1 right).
 * One panel (OPEN_INDEX) pivots on its floor pin to open a gap into the corridor behind.
 */
export class LatticeScreens {
  door: THREE.Group;
  doorMesh: THREE.Mesh;
  doorway: THREE.Mesh;
  open = false;
  private angle = 0; // 0 closed .. OPEN_ANGLE
  private closedYaw = 0;
  private pivot = new THREE.Vector2();
  private width = 0;
  private seg: Segment;
  blockedReason = '';

  constructor(ctx: Ctx) {
    const { scene, mats, world } = ctx;
    const x0 = X0 + 0.25;
    const x1 = X1 - 0.25;
    const dx = (x1 - x0) / COUNT;
    const w = Math.sqrt(dx * dx + ZIG * ZIG);
    this.width = w;
    const geo = latticePanelGeometry(w, PANEL_H);
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= COUNT; i++) pts.push(new THREE.Vector2(x0 + i * dx, LINE_Z + (i % 2 ? ZIG : 0)));

    const fixed = new THREE.InstancedMesh(geo, mats.honey, COUNT - 1);
    fixed.castShadow = true;
    fixed.receiveShadow = true;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    let n = 0;
    const pins: THREE.BufferGeometry[] = [];
    for (let i = 0; i < COUNT; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const yaw = Math.atan2(-(b.y - a.y), b.x - a.x);
      const pin = new THREE.CylinderGeometry(0.04, 0.04, 0.006, 20);
      pin.translate(a.x, 0.003, a.y);
      pins.push(pin);
      if (i === OPEN_INDEX) {
        this.closedYaw = yaw;
        this.pivot.copy(a);
        continue;
      }
      q.setFromAxisAngle(up, yaw);
      m.compose(new THREE.Vector3(a.x, 0, a.y), q, new THREE.Vector3(1, 1, 1));
      fixed.setMatrixAt(n++, m);
      world.seg(a.x, a.y, b.x, b.y, 0.03, 'lattice');
    }
    fixed.instanceMatrix.needsUpdate = true;
    fixed.computeBoundingSphere();
    fixed.name = 'lattice';
    scene.add(fixed);
    scene.add(new THREE.Mesh(merge(pins), mats.steel));

    // the openable panel: own mesh in a pivot group so it can swing on its pin
    this.door = new THREE.Group();
    this.door.position.set(this.pivot.x, 0, this.pivot.y);
    this.door.rotation.y = this.closedYaw;
    this.doorMesh = new THREE.Mesh(geo, mats.honey.clone());
    this.doorMesh.castShadow = true;
    this.doorMesh.receiveShadow = true;
    this.doorMesh.name = 'lattice-door';
    this.door.add(this.doorMesh);
    // small brass pull so the operable panel reads as different
    const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 8), mats.brass);
    pull.position.set(w - 0.1, 1.15, -0.03);
    this.door.add(pull);
    scene.add(this.door);
    // Invisible hit area filling the doorway; used while the panel is open (it is edge-on then).
    const a9 = pts[OPEN_INDEX];
    const b9 = pts[OPEN_INDEX + 1];
    this.doorway = new THREE.Mesh(new THREE.BoxGeometry(w, 3.3, 0.4), new THREE.MeshBasicMaterial({ visible: false }));
    this.doorway.position.set((a9.x + b9.x) / 2, 1.7, (a9.y + b9.y) / 2);
    this.doorway.rotation.y = this.closedYaw;
    scene.add(this.doorway);
    const b = this.freeEnd(0);
    this.seg = world.seg(this.pivot.x, this.pivot.y, b.x, b.y, 0.03, 'lattice-door');
  }

  private yawAt(angle: number) {
    // opening swings the free end toward +z (away from the reading room, into the corridor)
    return this.closedYaw - angle;
  }

  private freeEnd(angle: number) {
    const yaw = this.yawAt(angle);
    return new THREE.Vector2(this.pivot.x + Math.cos(yaw) * this.width, this.pivot.y - Math.sin(yaw) * this.width);
  }

  /** Is the player standing inside the swing arc (so the panel would hit them)? */
  playerInSwing(px: number, pz: number): boolean {
    const dx = px - this.pivot.x;
    const dz = pz - this.pivot.y;
    const d = Math.hypot(dx, dz);
    if (d > this.width + PLAYER_R + 0.05) return false;
    // angle of the player measured the same way as the panel
    const a = this.closedYaw - Math.atan2(-dz, dx);
    const ang = Math.atan2(Math.sin(a), Math.cos(a));
    const pad = Math.asin(Math.min(1, (PLAYER_R + 0.05) / Math.max(d, 0.01)));
    return ang > -pad && ang < OPEN_ANGLE + pad;
  }

  /** Toggle open/closed. Returns false (and sets blockedReason) if the player is in the way. */
  toggle(px: number, pz: number): boolean {
    if (this.playerInSwing(px, pz)) {
      this.blockedReason = 'Step back from the panel first';
      return false;
    }
    this.blockedReason = '';
    this.open = !this.open;
    return true;
  }

  get pivotPoint() {
    return this.pivot.clone();
  }

  get openAmount() {
    return this.angle / OPEN_ANGLE;
  }

  /** Advances the swing. Returns true while the panel is moving (shadows need refreshing). */
  update(dt: number): boolean {
    const target = this.open ? OPEN_ANGLE : 0;
    if (this.angle === target) return false;
    {
      const step = dt * 1.6;
      this.angle = target > this.angle ? Math.min(target, this.angle + step) : Math.max(target, this.angle - step);
      this.door.rotation.y = this.yawAt(this.angle);
      const b = this.freeEnd(this.angle);
      this.seg.bx = b.x;
      this.seg.bz = b.y;
    }
    return true;
  }
}
