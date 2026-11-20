/* Artifact 05: question-and-answer journal on a lectern. */
import * as THREE from 'three';
import { tex, wrapText, T } from '../../textures';
import { mesh, box } from '../../geo';
import { std, glowMat } from '../../materials';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function lectern(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var g = new THREE.Group();
  g.position.set(a.pos[0], 0, a.pos[2]);
  g.rotation.y = a.ry;
  root.add(g);
  var m1 = glowMat({ map: T.woodDark, roughness: 0.45 });
  mesh(box(0.5, 0.06, 0.42), m1, 0, 0.03, 0, g);
  mesh(box(0.14, 1.0, 0.14), m1, 0, 0.53, 0, g);
  var top = new THREE.Group();
  top.position.set(0, 1.06, 0.02);
  top.rotation.x = 0.42;
  g.add(top);
  mesh(box(0.66, 0.04, 0.48), m1, 0, 0, 0, top);
  mesh(box(0.66, 0.04, 0.03), m1, 0, 0.035, 0.225, top);
  var pg = tex(512, 340, function (c, w, h) {
    c.fillStyle = '#f3ecd9';
    c.fillRect(0, 0, w, h);
    var gr = c.createLinearGradient(w / 2 - 40, 0, w / 2 + 40, 0);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(0.5, 'rgba(0,0,0,0.28)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr;
    c.fillRect(w / 2 - 40, 0, 80, h);
    c.fillStyle = '#8a6a2c';
    c.font = '16px Georgia';
    c.fillText('QUESTIONS', 28, 34);
    c.fillText('ANSWERS', w / 2 + 28, 34);
    c.fillStyle = '#2b2a45';
    c.font = 'italic 15px Georgia';
    var y = 64;
    a.media.items.forEach(function (it) {
      var y2 = wrapText(c, it.q, 28, y, w / 2 - 60, 19);
      wrapText(c, it.a, w / 2 + 28, y, w / 2 - 60, 19);
      y = Math.max(y2, y + 64) + 8;
    });
  });
  pg.wrapS = pg.wrapT = THREE.ClampToEdgeWrapping;
  var m2 = glowMat({ map: pg, roughness: 0.8 });
  mesh(box(0.56, 0.035, 0.37), std({ color: 0x3a1f12, roughness: 0.6 }), 0, 0.036, -0.01, top);
  var pgs = mesh(new THREE.PlaneGeometry(0.53, 0.35), m2, 0, 0.056, -0.01, top, true);
  pgs.rotation.x = -Math.PI / 2;
  var rb = mesh(box(0.012, 0.002, 0.42), std({ color: 0x8a1f1f, roughness: 0.7 }), 0.02, 0.058, 0.02, top, true);
  room.addBox(a.pos[0], a.pos[2], 0.3, 0.36);
  placard(a, a.pos[0] + 0.15, a.pos[2] - 0.8, Math.PI / 2 - 0.4, root);
  return [m1, m2];
}
