import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import type { CollisionWorld } from './collision';
import { CORRIDOR_Z, EYE, PLAYER_R, SPAWN, X0, X1, Z0 } from './dims';

const WALK = 2.4; // m/s, natural walking pace
const FAST = 4.0;
const ACCEL = 10; // 1/s, exponential approach to target velocity
const MAX_STEP = 0.08; // metres per collision sub-step (well under the player radius)
const CLIMB = 14; // 1/s, how quickly the eye follows the floor height on stairs

export interface PlayerOptions {
  /** Floor height under (x, z); defaults to flat ground at y = 0. */
  ground?: (x: number, z: number) => number;
  /** Furthest +z the safety clamp allows (default: the corridor balustrade). */
  zMax?: number;
}

export class Player {
  controls: PointerLockControls;
  vel = new THREE.Vector2();
  pos = new THREE.Vector2(SPAWN.x, SPAWN.z);
  frozen = false;
  /** Test hook: overrides keyboard input when set. */
  forced: { ix: number; iz: number } | null = null;
  private keys = new Set<string>();
  private bob = 0;
  /** Smoothed floor height under the player. */
  private floorY = 0;
  private ground: (x: number, z: number) => number;
  private zMax: number;

  constructor(
    public camera: THREE.PerspectiveCamera,
    dom: HTMLElement,
    private world: CollisionWorld,
    opts: PlayerOptions = {},
  ) {
    this.ground = opts.ground ?? (() => 0);
    this.zMax = opts.zMax ?? CORRIDOR_Z;
    this.controls = new PointerLockControls(camera, dom);
    this.controls.pointerSpeed = 0.9;
    camera.rotation.order = 'YXZ';
    this.reset();
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  reset() {
    this.pos.set(SPAWN.x, SPAWN.z);
    this.vel.set(0, 0);
    this.floorY = this.ground(SPAWN.x, SPAWN.z);
    this.camera.rotation.set(SPAWN.pitch, SPAWN.yaw, 0, 'YXZ');
    this.camera.position.set(SPAWN.x, EYE + this.floorY, SPAWN.z);
  }

  setPose(x: number, z: number, yaw: number, pitch = 0) {
    const r = this.world.resolve(x, z, PLAYER_R, 8);
    this.pos.set(r.x, r.z);
    this.vel.set(0, 0);
    this.floorY = this.ground(r.x, r.z);
    this.camera.rotation.set(pitch, yaw, 0, 'YXZ');
    this.camera.position.set(r.x, EYE + this.floorY, r.z);
  }

  /** Height of the floor under the player (smoothed), e.g. 6 on the atrium gallery landing. */
  get floor() {
    return this.floorY;
  }

  get yaw() {
    return this.camera.rotation.y;
  }

  update(dt: number) {
    let ix = 0;
    let iz = 0;
    const active = this.controls.isLocked && !this.frozen;
    if (this.forced) {
      ix = this.forced.ix;
      iz = this.forced.iz;
    } else if (active) {
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) iz += 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) iz -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ix += 1;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ix -= 1;
    }
    const len = Math.hypot(ix, iz);
    const speed = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? FAST : WALK;
    const yaw = this.camera.rotation.y;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    let tx = 0;
    let tz = 0;
    if (len > 0) {
      tx = ((fx * iz + rx * ix) / len) * speed;
      tz = ((fz * iz + rz * ix) / len) * speed;
    }
    const k = 1 - Math.exp(-ACCEL * dt);
    this.vel.x += (tx - this.vel.x) * k;
    this.vel.y += (tz - this.vel.y) * k;
    if (this.vel.lengthSq() < 1e-6 && len === 0) this.vel.set(0, 0);

    const dx = this.vel.x * dt;
    const dz = this.vel.y * dt;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / MAX_STEP));
    let x = this.pos.x;
    let z = this.pos.y;
    for (let i = 0; i < steps; i++) {
      x += dx / steps;
      z += dz / steps;
      const r = this.world.resolve(x, z, PLAYER_R);
      x = r.x;
      z = r.z;
    }
    // dynamic colliders (the pivot panel) can push a standing player too
    if (steps === 1 && dx === 0 && dz === 0) {
      const r = this.world.resolve(x, z, PLAYER_R);
      x = r.x;
      z = r.z;
    }
    // hard safety clamp: never leave the room + corridor (+ atrium stair) envelope
    x = THREE.MathUtils.clamp(x, X0 + PLAYER_R, X1 - PLAYER_R);
    z = THREE.MathUtils.clamp(z, Z0 + PLAYER_R, this.zMax - PLAYER_R);
    if (!Number.isFinite(x) || !Number.isFinite(z)) {
      this.reset();
      return;
    }
    const moved = Math.hypot(x - this.pos.x, z - this.pos.y);
    this.pos.set(x, z);
    // subtle head bob scaled by actual ground speed
    this.bob += moved * 7.5;
    const sp = Math.min(1, moved / Math.max(dt, 1e-4) / WALK);
    this.floorY += (this.ground(x, z) - this.floorY) * (1 - Math.exp(-CLIMB * dt));
    this.camera.position.set(x, EYE + this.floorY + Math.sin(this.bob) * 0.012 * sp, z);
  }
}
