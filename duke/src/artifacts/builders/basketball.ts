/* Artifact 07: K-Ville basketball and tent on a pedestal. */
import * as THREE from 'three';
import { tex, speckle, T } from '../../textures';
import { mesh, box } from '../../geo';
import { std, glowMat, M } from '../../materials';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function basketball(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var g = new THREE.Group();
  g.position.set(a.pos[0], 0, a.pos[2]);
  root.add(g);
  var m1 = glowMat({ map: T.woodDark, roughness: 0.45 });
  mesh(box(0.58, 0.86, 0.58), m1, 0, 0.43, 0, g);
  mesh(box(0.66, 0.05, 0.66), M.woodDark, 0, 0.885, 0, g);
  mesh(box(0.66, 0.06, 0.66), M.woodDark, 0, 0.03, 0, g);
  mesh(box(0.6, 0.01, 0.6), std({ color: 0x1d2a52, roughness: 1 }), 0, 0.915, 0, g, true);
  var ring = mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 24), M.brass, 0, 0.93, 0, g, true);
  ring.rotation.x = Math.PI / 2;
  var bt = tex(512, 256, function (c, w, h) {
    c.fillStyle = '#c4581f';
    c.fillRect(0, 0, w, h);
    speckle(c, w, h, 9000, 121, '90,30,5', 0.25, 1.6);
    speckle(c, w, h, 3000, 122, '255,190,140', 0.12, 1.4);
    c.strokeStyle = '#1a1410';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, h / 2);
    c.lineTo(w, h / 2);
    c.stroke();
    [0, w / 2, w].forEach(function (x) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    });
    [w * 0.25, w * 0.75].forEach(function (x0) {
      c.beginPath();
      for (var y = 0; y <= h; y += 4) {
        var x = x0 + Math.cos((y / h) * Math.PI * 2) * 46;
        if (y) c.lineTo(x, y);
        else c.moveTo(x, y);
      }
      c.stroke();
    });
  });
  var m2 = glowMat({ map: bt, roughness: 0.75 });
  var ball = mesh(new THREE.SphereGeometry(0.12, 40, 28), m2, 0, 1.05, 0, g);
  ball.rotation.set(0.35, 0.6, 0.2);
  var tent = new THREE.Group();
  tent.position.set(0.19, 0.92, 0.17);
  tent.rotation.y = 0.6;
  g.add(tent);
  var tm = std({ color: 0x22398f, roughness: 0.85 });
  var tb = mesh(new THREE.ConeGeometry(0.1, 0.13, 4, 1), tm, 0, 0.065, 0, tent);
  tb.rotation.y = Math.PI / 4;
  tb.scale.set(1, 1, 1.5);
  var door = mesh(
    new THREE.PlaneGeometry(0.05, 0.07),
    std({ color: 0x0e1530, roughness: 1 }),
    0,
    0.035,
    0.105,
    tent,
    true,
  );
  var st = tex(256, 96, function (c, w, h) {
    c.fillStyle = '#ece4cf';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#5a3a20';
    c.lineWidth = 6;
    c.strokeRect(3, 3, w - 6, h - 6);
    c.fillStyle = '#1f3454';
    c.font = 'bold 40px Georgia';
    c.textAlign = 'center';
    c.fillText('K-VILLE', w / 2, 48);
    c.font = '20px Georgia';
    c.fillText('Tent 37', w / 2, 78);
  });
  st.wrapS = st.wrapT = THREE.ClampToEdgeWrapping;
  var sg = new THREE.Group();
  sg.position.set(-0.2, 0.92, 0.2);
  sg.rotation.y = 0.3;
  g.add(sg);
  mesh(box(0.012, 0.12, 0.012), M.woodMid, 0, 0.06, 0, sg, true);
  mesh(new THREE.PlaneGeometry(0.14, 0.055), std({ map: st, roughness: 0.8 }), 0, 0.12, 0.008, sg, true);
  var band = mesh(
    new THREE.TorusGeometry(0.035, 0.006, 6, 20),
    std({ color: 0xe8e2d0, roughness: 0.6 }),
    -0.04,
    0.925,
    -0.2,
    g,
    true,
  );
  band.rotation.x = Math.PI / 2;
  room.addBox(a.pos[0], a.pos[2], 0.36, 0.36);
  placard(a, a.pos[0] + 0.8, a.pos[2] - 0.75, Math.PI / 2 - 0.5, root);
  room.addBox(a.pos[0] + 0.8, a.pos[2] - 0.75, 0.1, 0.1);
  return [m1, m2];
}
