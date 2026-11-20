/* Artifact 06: animated playlist display set into the east bookcase. */
import * as THREE from 'three';
import { MAXAN, REDUCED } from '../../renderer';
import { mesh, box } from '../../geo';
import { glowMat } from '../../materials';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function screen(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var wg = room.walls.east.g,
    u = a.pos[2];
  var m1 = glowMat({ color: 0x1a120c, roughness: 0.4 });
  mesh(box(1.56, 1.0, 0.07), m1, u, 1.45, 0.54, wg);
  var cv = document.createElement('canvas');
  cv.width = 560;
  cv.height = 340;
  var st = new THREE.CanvasTexture(cv);
  st.encoding = THREE.sRGBEncoding;
  st.anisotropy = MAXAN;
  var c = cv.getContext('2d');
  function draw(t) {
    var w = cv.width,
      h = cv.height,
      gr = c.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#0f1a2e');
    gr.addColorStop(1, '#0c2a2a');
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#cfa95e';
    c.font = '15px Georgia';
    c.fillText('D2 MUSEUM  ·  06  ·  MEDIA AND MUSIC', 28, 40);
    c.fillStyle = '#efe8d8';
    c.font = '30px Georgia';
    c.fillText('A Playlist for the', 28, 84);
    c.fillText('Time Difference', 28, 120);
    for (var i = 0; i < 44; i++) {
      var v = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.55 + t * 1.6) * Math.cos(i * 0.21 - t * 0.9));
      c.fillStyle = i < 22 ? 'rgba(143,169,230,0.9)' : 'rgba(134,205,182,0.9)';
      c.fillRect(28 + i * 11.6, 250 - v * 88, 7, v * 88);
    }
    c.fillStyle = '#a8a294';
    c.font = '15px Georgia';
    c.fillText('Durham', 28, 280);
    c.fillText('Kunshan', w - 92, 280);
    c.fillStyle = '#efe8d8';
    c.font = '16px Georgia';
    c.fillText('Press E to listen', 28, 314);
  }
  draw(0);
  var scr = mesh(
    new THREE.PlaneGeometry(1.44, 0.875),
    new THREE.MeshBasicMaterial({ map: st, color: new THREE.Color(1.25, 1.25, 1.25) }),
    u,
    1.45,
    0.578,
    wg,
    true,
  );
  var acc = 0;
  a.update = function (t, dt, dist) {
    acc += dt;
    if (dist < 9 && acc > 0.12 && !REDUCED) {
      acc = 0;
      draw(t);
      st.needsUpdate = true;
    }
  };
  placard(a, 4.25, a.pos[2] + 1.15, -Math.PI / 2 + 0.3, root);
  return [m1];
}
