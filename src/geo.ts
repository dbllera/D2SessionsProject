/* Geometry helpers: mesh/instancing shortcuts, geometry merging, Gothic arch outlines. */
import * as THREE from 'three';
import { world } from './renderer';

/** Create a mesh at (x, y, z), add it to `parent` (default: world). Casts and receives shadows unless noShadow. */
export function mesh(
  geo: THREE.BufferGeometry,
  mat: THREE.Material | THREE.Material[],
  x?: number,
  y?: number,
  z?: number,
  parent?: THREE.Object3D,
  noShadow?: boolean,
): THREE.Mesh<any, any> {
  var m = new THREE.Mesh(geo, mat);
  m.position.set(x || 0, y || 0, z || 0);
  if (!noShadow) {
    m.castShadow = true;
    m.receiveShadow = true;
  }
  (parent || world).add(m);
  return m;
}
export function box(w: number, h: number, d: number) {
  return new THREE.BoxGeometry(w, h, d);
}
/** A geometry plus its placement, for merge(). Rotation order YXZ. */
export function part(
  geo: THREE.BufferGeometry,
  x: number,
  y: number,
  z: number,
  ry?: number,
  rx?: number,
  rz?: number,
): [THREE.BufferGeometry, THREE.Matrix4] {
  var m = new THREE.Matrix4();
  if (ry || rx || rz) m.makeRotationFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0, 'YXZ'));
  m.setPosition(x, y, z);
  return [geo, m];
}
/** Merge part() pieces into one non-indexed geometry (position, normal, uv). */
export function merge(parts: [THREE.BufferGeometry, THREE.Matrix4][]) {
  var pos = [],
    nor = [],
    uv = [];
  parts.forEach(function (p) {
    var g = p[0].toNonIndexed();
    if (p[1]) g.applyMatrix4(p[1]);
    var a = g.attributes.position.array,
      b = g.attributes.normal.array,
      c = g.attributes.uv.array,
      i;
    for (i = 0; i < a.length; i++) pos.push(a[i]);
    for (i = 0; i < b.length; i++) nor.push(b[i]);
    for (i = 0; i < c.length; i++) uv.push(c[i]);
  });
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return out;
}
/** One InstancedMesh from a list of transforms {x, y, z, rx, ry, rz, sx, sy, sz, color}. */
export function instanced(geo: THREE.BufferGeometry, mat: THREE.Material, transforms: any[], parent?: THREE.Object3D) {
  var im = new THREE.InstancedMesh(geo, mat, transforms.length),
    d = new THREE.Object3D();
  transforms.forEach(function (t, i) {
    d.position.set(t.x, t.y || 0, t.z);
    d.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
    d.scale.set(t.sx || 1, t.sy || 1, t.sz || 1);
    d.updateMatrix();
    im.setMatrixAt(i, d.matrix);
    if (t.color) im.setColorAt(i, new THREE.Color(t.color));
  });
  im.castShadow = true;
  im.receiveShadow = true;
  (parent || world).add(im);
  return im;
}
/** Trace a pointed Gothic arch: sill y0, springing ys, apex ya, centred on cx. Works on a Shape or a hole Path. */
export function archPts<P extends THREE.Path>(P: P, cx: number, y0: number, w: number, ys: number, ya: number): P {
  var k = 0.62;
  P.moveTo(cx - w / 2, y0);
  P.lineTo(cx + w / 2, y0);
  P.lineTo(cx + w / 2, ys);
  P.quadraticCurveTo(cx + w / 2, ys + (ya - ys) * k, cx, ya);
  P.quadraticCurveTo(cx - w / 2, ys + (ya - ys) * k, cx - w / 2, ys);
  P.lineTo(cx - w / 2, y0);
  return P;
}
export function circlePath(x: number, y: number, r: number) {
  var p = new THREE.Path();
  p.absarc(x, y, r, 0, Math.PI * 2, false);
  return p;
}
export function extrude(shape: THREE.Shape, depth: number) {
  return new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 20 });
}
