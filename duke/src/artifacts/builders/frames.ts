/* Artifact 04: three framed meal pictures on the west wall alcove. */
import * as THREE from 'three';
import { mesh, box } from '../../geo';
import { std, glowMat, M } from '../../materials';
import { FOOD } from '../foodTextures';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function frames(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var wg = room.walls.west.g,
    mats = [];
  [4.55, 3.8, 3.05].forEach(function (u, i) {
    var fm = glowMat({ color: 0x2a1d12, roughness: 0.4 });
    mats.push(fm);
    mesh(box(0.66, 0.51, 0.05), fm, u, 1.6, 0.05, wg);
    mesh(box(0.6, 0.45, 0.012), std({ color: 0xf1ead8, roughness: 0.9 }), u, 1.6, 0.074, wg, true);
    var pm = glowMat({ map: FOOD[i], roughness: 0.5 });
    mats.push(pm);
    mesh(new THREE.PlaneGeometry(0.48, 0.36), pm, u, 1.6, 0.082, wg, true);
  });
  mesh(box(1.9, 0.03, 0.07), M.brass, 3.8, 2.12, 0.12, wg, true);
  placard(a, -4.75, -2.95, Math.PI / 2 - 0.3, root);
  return mats;
}
