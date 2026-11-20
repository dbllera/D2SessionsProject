/* Artifact 01: listening post with headphones. */
import * as THREE from 'three';
import { tex, T } from '../../textures';
import { mesh, box } from '../../geo';
import { std, glowMat, M } from '../../materials';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function audioStation(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var g = new THREE.Group();
  g.position.set(a.pos[0], 0, a.pos[2]);
  g.rotation.y = a.ry;
  root.add(g);
  var m1 = glowMat({ map: T.woodMid, roughness: 0.45 }),
    m2 = glowMat({ map: T.woodDark, roughness: 0.4 });
  mesh(box(0.5, 0.95, 0.42), m1, 0, 0.475, 0, g);
  mesh(box(0.58, 0.05, 0.5), M.woodDark, 0, 0.975, 0, g);
  mesh(box(0.42, 0.3, 0.22), m2, 0, 1.15, -0.03, g);
  var gr = tex(128, 128, function (c, w, h) {
    c.fillStyle = '#2a2118';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#b08a45';
    for (var i = 6; i < w; i += 10)
      for (var j = 6; j < h; j += 10) {
        c.beginPath();
        c.arc(i, j, 2.4, 0, 7);
        c.fill();
      }
  });
  var grille = mesh(
    new THREE.CircleGeometry(0.105, 28),
    std({ map: gr, roughness: 0.4, metalness: 0.5 }),
    -0.07,
    1.15,
    0.082,
    g,
    true,
  );
  mesh(new THREE.TorusGeometry(0.108, 0.012, 8, 28), M.brass, -0.07, 1.15, 0.082, g, true);
  [1.21, 1.12].forEach(function (y) {
    var k = mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 14), M.brass, 0.13, y, 0.09, g, true);
    k.rotation.x = Math.PI / 2;
  });
  var led = mesh(
    new THREE.SphereGeometry(0.012, 8, 8),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.6, 0.4) }),
    0.13,
    1.05,
    0.085,
    g,
    true,
  );
  var hp = new THREE.Group();
  hp.position.set(0, 1.42, -0.03);
  g.add(hp);
  mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 24, Math.PI), M.black, 0, 0, 0, hp);
  [-0.1, 0.1].forEach(function (x) {
    var c = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 16), M.black, x, -0.02, 0, hp);
    c.rotation.z = Math.PI / 2;
  });
  mesh(box(0.02, 0.12, 0.02), M.brass, 0, 1.36, -0.03, g);
  room.addBox(a.pos[0], a.pos[2], 0.26, 0.3);
  placard(a, a.pos[0] - 0.15, a.pos[2] + 0.75, -Math.PI / 2 + 0.35, root);
  return [m1, m2];
}
