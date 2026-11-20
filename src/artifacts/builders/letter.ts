/* Artifact 02: handwritten letter on a reading table. */
import * as THREE from 'three';
import { tex, speckle, wrapText } from '../../textures';
import { mesh, box } from '../../geo';
import { glowMat, M } from '../../materials';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function letter(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var lt = tex(420, 600, function (g, w, h) {
    g.fillStyle = '#f2e9d3';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 900, 91, '140,110,60', 0.06, 2);
    g.fillStyle = '#2b2a45';
    g.font = 'italic 21px "Segoe Script","Bradley Hand","Brush Script MT",cursive';
    wrapText(g, a.media.text, 34, 56, w - 64, 27);
  });
  lt.wrapS = lt.wrapT = THREE.ClampToEdgeWrapping;
  var m1 = glowMat({ map: lt, roughness: 0.8 }),
    m2 = glowMat({ color: 0xe9dfc6, roughness: 0.8 });
  var p = mesh(new THREE.PlaneGeometry(0.3, 0.42), m1, a.pos[0], 0.774, a.pos[2], root);
  p.rotation.x = -Math.PI / 2;
  p.rotation.z = Math.PI / 2 + 0.12;
  var e = mesh(box(0.24, 0.004, 0.12), m2, a.pos[0] + 0.28, 0.774, a.pos[2] + 0.33, root);
  e.rotation.y = 0.5;
  var pen = mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.15, 8),
    M.black,
    a.pos[0] + 0.02,
    0.778,
    a.pos[2] - 0.3,
    root,
  );
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.3;
  var st = mesh(box(0.16, 0.07, 0.01), M.brass, a.pos[0] - 0.3, 0.81, a.pos[2] - 0.3, root);
  st.rotation.y = Math.PI / 2;
  placard(a, 0.78, 9.75, -0.9, root);
  room.addBox(0.78, 9.75, 0.1, 0.1);
  return [m1, m2];
}
