/* Artifact 03: glass display case with two first-day cards. */
import * as THREE from 'three';
import { tex, T } from '../../textures';
import { mesh, box } from '../../geo';
import { std, glowMat, M } from '../../materials';
import { placard } from '../placard';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function displayCase(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var g = new THREE.Group();
  g.position.set(a.pos[0], 0, a.pos[2]);
  root.add(g);
  var m1 = glowMat({ map: T.woodDark, roughness: 0.45 });
  mesh(box(1.3, 0.86, 0.7), m1, 0, 0.43, 0, g);
  mesh(box(1.38, 0.05, 0.78), M.woodDark, 0, 0.885, 0, g);
  mesh(box(1.24, 0.01, 0.64), std({ color: 0x24382c, roughness: 1 }), 0, 0.915, 0, g);
  var glass = mesh(
    box(1.26, 0.46, 0.66),
    std({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.14,
      envMapIntensity: 2.2,
      depthWrite: false,
    }),
    0,
    1.14,
    0,
    g,
    true,
  );
  var eg = new THREE.LineSegments(
    new THREE.EdgesGeometry(box(1.26, 0.46, 0.66)),
    new THREE.LineBasicMaterial({ color: 0xb08a45 }),
  );
  eg.position.set(0, 1.14, 0);
  g.add(eg);
  function card(label, sub, c1, c2, draw) {
    return tex(300, 200, function (c, w, h) {
      var gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, c1);
      gr.addColorStop(1, c2);
      c.fillStyle = gr;
      c.fillRect(0, 0, w, h);
      draw(c, w, h);
      c.fillStyle = 'rgba(255,255,255,0.92)';
      c.font = '26px Georgia';
      c.fillText(label, 16, h - 40);
      c.font = '15px Georgia';
      c.fillText(sub, 16, h - 16);
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 5;
      c.strokeRect(3, 3, w - 6, h - 6);
    });
  }
  var c1 = card('Durham', 'First day, 9:10 a.m.', '#2f4d8f', '#17264a', function (c, w, h) {
    c.fillStyle = 'rgba(215,205,185,0.9)';
    for (var i = 0; i < 3; i++) {
      var x = 70 + i * 70;
      c.beginPath();
      c.moveTo(x - 22, 120);
      c.lineTo(x - 22, 70);
      c.quadraticCurveTo(x - 22, 40, x, 24);
      c.quadraticCurveTo(x + 22, 40, x + 22, 70);
      c.lineTo(x + 22, 120);
      c.fill();
    }
  });
  var c2 = card('Kunshan', 'First day, 9:10 p.m.', '#1f6f68', '#0f2f3a', function (c, w, h) {
    c.strokeStyle = 'rgba(235,225,200,0.9)';
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(30, 105);
    c.quadraticCurveTo(150, 20, 270, 105);
    c.stroke();
    c.fillStyle = 'rgba(255,220,140,0.9)';
    [80, 150, 220].forEach(function (x) {
      c.beginPath();
      c.arc(x, 118, 5, 0, 7);
      c.fill();
    });
  });
  [c1, c2].forEach(function (t, i) {
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    var p = mesh(
      new THREE.PlaneGeometry(0.36, 0.24),
      std({ map: t, roughness: 0.6 }),
      i ? 0.3 : -0.3,
      1.03,
      -0.06,
      g,
      true,
    );
    p.rotation.x = -0.5;
    p.rotation.y = i ? -0.18 : 0.18;
  });
  [
    [-0.38, 0x3a5fb0],
    [0.38, 0x2a8a78],
  ].forEach(function (o) {
    var tag = mesh(box(0.09, 0.008, 0.15), std({ color: o[1], roughness: 0.6 }), o[0], 0.926, 0.2, g, true);
    tag.rotation.y = o[0] * 1.4;
  });
  mesh(
    new THREE.CylinderGeometry(0.035, 0.03, 0.06, 16),
    std({ color: 0xf1ede4, roughness: 0.3 }),
    0,
    0.95,
    0.16,
    g,
    true,
  );
  room.addBox(a.pos[0], a.pos[2], 0.7, 0.4);
  placard(a, a.pos[0] + 1.05, a.pos[2] + 0.35, -0.3, root);
  return [m1];
}
