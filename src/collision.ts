/**
 * Floor-plane (XZ) collision. The player is a circle; the world is a list of circles,
 * oriented boxes and thick line segments. Dynamic colliders (the pivoting lattice panel)
 * mutate their segment in place every frame.
 */
export type Circle = { kind: 'circle'; x: number; z: number; r: number; tag?: string };
export type OBB = { kind: 'obb'; x: number; z: number; hx: number; hz: number; yaw: number; tag?: string };
export type Segment = { kind: 'seg'; ax: number; az: number; bx: number; bz: number; r: number; tag?: string };
export type Collider = Circle | OBB | Segment;

export class CollisionWorld {
  colliders: Collider[] = [];

  circle(x: number, z: number, r: number, tag?: string): Circle {
    const c: Circle = { kind: 'circle', x, z, r, tag };
    this.colliders.push(c);
    return c;
  }

  /** Box with half extents hx (local x) and hz (local z), yawed like a three.js object (rotation.y). */
  obb(x: number, z: number, hx: number, hz: number, yaw = 0, tag?: string): OBB {
    const b: OBB = { kind: 'obb', x, z, hx, hz, yaw, tag };
    this.colliders.push(b);
    return b;
  }

  seg(ax: number, az: number, bx: number, bz: number, r = 0.05, tag?: string): Segment {
    const s: Segment = { kind: 'seg', ax, az, bx, bz, r, tag };
    this.colliders.push(s);
    return s;
  }

  /** Push a circle (px, pz, radius) out of every collider. Returns the corrected position. */
  resolve(px: number, pz: number, radius: number, iterations = 4): { x: number; z: number; hit: boolean } {
    let x = px;
    let z = pz;
    let hit = false;
    for (let it = 0; it < iterations; it++) {
      let moved = false;
      for (const c of this.colliders) {
        const p = closestPoint(c, x, z);
        let dx = x - p.x;
        let dz = z - p.z;
        const extra = c.kind === 'circle' ? 0 : c.kind === 'seg' ? c.r : 0;
        const d2 = dx * dx + dz * dz;
        const min = radius + extra;
        if (p.inside) {
          // centre is inside an OBB: push out along the nearest face normal
          x = p.x + p.nx * (radius + 0.001);
          z = p.z + p.nz * (radius + 0.001);
          moved = hit = true;
          continue;
        }
        if (d2 < min * min) {
          const d = Math.sqrt(d2);
          if (d < 1e-6) {
            dx = 1;
            dz = 0;
          } else {
            dx /= d;
            dz /= d;
          }
          x = p.x + dx * (min + 0.0005);
          z = p.z + dz * (min + 0.0005);
          moved = hit = true;
        }
      }
      if (!moved) break;
    }
    return { x, z, hit };
  }

  /** True when a circle at (x, z) overlaps any collider (optionally ignoring one). */
  overlaps(x: number, z: number, radius: number, ignore?: Collider): boolean {
    for (const c of this.colliders) {
      if (c === ignore) continue;
      const p = closestPoint(c, x, z);
      if (p.inside) return true;
      const extra = c.kind === 'seg' ? c.r : 0;
      const dx = x - p.x;
      const dz = z - p.z;
      if (dx * dx + dz * dz < (radius + extra) ** 2) return true;
    }
    return false;
  }
}

type CP = { x: number; z: number; inside: boolean; nx: number; nz: number };

export function closestPoint(c: Collider, x: number, z: number): CP {
  if (c.kind === 'circle') {
    const dx = x - c.x;
    const dz = z - c.z;
    const d = Math.hypot(dx, dz) || 1e-6;
    if (d < c.r) return { x: c.x + (dx / d) * c.r, z: c.z + (dz / d) * c.r, inside: true, nx: dx / d, nz: dz / d };
    return { x: c.x + (dx / d) * c.r, z: c.z + (dz / d) * c.r, inside: false, nx: 0, nz: 0 };
  }
  if (c.kind === 'seg') {
    const vx = c.bx - c.ax;
    const vz = c.bz - c.az;
    const l2 = vx * vx + vz * vz || 1e-9;
    let t = ((x - c.ax) * vx + (z - c.az) * vz) / l2;
    t = Math.max(0, Math.min(1, t));
    return { x: c.ax + vx * t, z: c.az + vz * t, inside: false, nx: 0, nz: 0 };
  }
  // OBB: transform into local space. three.js yaw maps local +x to (cos, -sin) in (x, z).
  const cos = Math.cos(c.yaw);
  const sin = Math.sin(c.yaw);
  const dx = x - c.x;
  const dz = z - c.z;
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  const cx = Math.max(-c.hx, Math.min(c.hx, lx));
  const cz = Math.max(-c.hz, Math.min(c.hz, lz));
  let inside = false;
  let nlx = 0;
  let nlz = 0;
  let qx = cx;
  let qz = cz;
  if (Math.abs(lx) < c.hx && Math.abs(lz) < c.hz) {
    inside = true;
    const ex = c.hx - Math.abs(lx);
    const ez = c.hz - Math.abs(lz);
    if (ex < ez) {
      nlx = Math.sign(lx) || 1;
      qx = nlx * c.hx;
      qz = lz;
    } else {
      nlz = Math.sign(lz) || 1;
      qz = nlz * c.hz;
      qx = lx;
    }
  }
  // back to world: inverse rotation
  const wx = qx * cos + qz * sin;
  const wz = -qx * sin + qz * cos;
  const wnx = nlx * cos + nlz * sin;
  const wnz = -nlx * sin + nlz * cos;
  return { x: c.x + wx, z: c.z + wz, inside, nx: wnx, nz: wnz };
}
