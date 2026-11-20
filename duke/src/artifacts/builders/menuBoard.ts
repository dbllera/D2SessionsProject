/* Artifact 10: I95 Burger sandwich-board menu. */
import * as THREE from 'three';
import { tex } from '../../textures';
import { mesh, box } from '../../geo';
import { std, glowMat, M } from '../../materials';
import { drawMenu } from '../menu';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function menuBoard(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var g = new THREE.Group();
  g.position.set(a.pos[0], 0, a.pos[2]);
  g.rotation.y = -Math.PI / 2 + 0.15;
  root.add(g);
  var mt = tex(1024, 640, function (c, w, h) {
    drawMenu(c, w, h, a.media);
  });
  mt.wrapS = mt.wrapT = THREE.ClampToEdgeWrapping;
  a.menuTex = mt;
  var m1 = glowMat({ map: mt, roughness: 0.55 }),
    m2 = glowMat({ color: 0x7a1620, roughness: 0.5, metalness: 0.2 });
  var ang = 0.2,
    hgt = 1.55;
  [1, -1].forEach(function (sd) {
    var leaf = new THREE.Group();
    leaf.position.set(0, 0, sd * 0.02);
    leaf.rotation.x = sd * ang;
    g.add(leaf);
    mesh(box(1.12, hgt, 0.035), m2, 0, hgt / 2, 0, leaf);
    var face = mesh(
      new THREE.PlaneGeometry(1.02, 0.64),
      sd > 0 ? m1 : std({ map: mt, roughness: 0.55 }),
      0,
      hgt - 0.42,
      sd * 0.019,
      leaf,
      true,
    );
    if (sd < 0) face.rotation.y = Math.PI;
    var stripe = tex(256, 64, function (c, w, h) {
      c.fillStyle = '#7a1620';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#f6e9d0';
      c.font = 'bold 30px Georgia';
      c.textAlign = 'center';
      c.fillText('BURGERS', w / 2, 42);
    });
    stripe.wrapS = stripe.wrapT = THREE.ClampToEdgeWrapping;
    var sp = mesh(
      new THREE.PlaneGeometry(0.6, 0.15),
      std({ map: stripe, roughness: 0.6 }),
      0,
      0.55,
      sd * 0.019,
      leaf,
      true,
    );
    if (sd < 0) sp.rotation.y = Math.PI;
  });
  var bun = std({ color: 0xc98a3a, roughness: 0.6 }),
    patty = std({ color: 0x4a2512, roughness: 0.8 }),
    cheese = std({ color: 0xf0b52c, roughness: 0.5 });
  var bg = new THREE.Group();
  bg.position.set(0, 0, 0.55);
  g.add(bg);
  mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.62, 20), M.woodDark, 0, 0.31, 0, bg);
  mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.01, 24),
    std({ color: 0xe9e2d2, roughness: 0.9 }),
    0,
    0.625,
    0,
    bg,
    true,
  );
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), bun, 0, 0.64, 0, bg);
  mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.018, 24), patty, 0, 0.658, 0, bg);
  var ch = mesh(box(0.11, 0.004, 0.11), cheese, 0, 0.669, 0, bg, true);
  ch.rotation.y = 0.4;
  var top = mesh(new THREE.SphereGeometry(0.062, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), bun, 0, 0.672, 0, bg);
  top.scale.y = 0.7;
  room.addBox(a.pos[0], a.pos[2], 0.42, 0.62);
  room.addBox(a.pos[0] + 0.02, a.pos[2] + 0.55, 0.2, 0.2);
  placard(a, a.pos[0] - 0.9, a.pos[2] - 0.95, -Math.PI / 2 - 0.6, root);
  room.addBox(a.pos[0] - 0.9, a.pos[2] - 0.95, 0.1, 0.1);
  return [m1, m2];
}
