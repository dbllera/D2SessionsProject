/* Artifact 08: Ginger + Soy takeout box, steamer and framed photo. */
import * as THREE from 'three';
import { tex, speckle } from '../../textures';
import { mesh, box } from '../../geo';
import { std, glowMat, M } from '../../materials';
import { placard } from '../placard';
import { GSOY_PHOTO } from '../photos';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function takeout(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var g = new THREE.Group();
  g.position.set(a.pos[0], 0.77, a.pos[2]);
  g.rotation.y = -0.25;
  root.add(g);
  var bx = tex(512, 128, function (c, w, h) {
    c.fillStyle = '#f4f1ea';
    c.fillRect(0, 0, w, h);
    speckle(c, w, h, 1500, 131, '120,110,90', 0.05, 1.5);
    c.fillStyle = '#2b2b2b';
    c.font = 'bold 30px "Source Sans 3",Arial,sans-serif';
    c.textAlign = 'center';
    [w * 0.125, w * 0.625].forEach(function (x) {
      c.fillText('GINGER + SOY', x, h * 0.58);
    });
    c.strokeStyle = '#b8862b';
    c.lineWidth = 4;
    [w * 0.375, w * 0.875].forEach(function (x) {
      c.beginPath();
      c.arc(x, h * 0.5, 22, 0, 7);
      c.stroke();
    });
    c.fillStyle = 'rgba(0,0,0,0.12)';
    c.fillRect(0, h - 10, w, 10);
  });
  var m1 = glowMat({ map: bx, roughness: 0.8 });
  var pail = mesh(new THREE.CylinderGeometry(0.085, 0.06, 0.12, 4, 1), m1, 0, 0.06, 0, g);
  pail.rotation.y = Math.PI / 4;
  var flap = std({ color: 0xeeeae0, roughness: 0.85 });
  [
    [0, 0.045, 0.35],
    [0, -0.045, -0.35],
  ].forEach(function (f) {
    var p = mesh(box(0.115, 0.004, 0.05), flap, 0, 0.128, f[1], g);
    p.rotation.x = f[2];
  });
  var hd = mesh(new THREE.TorusGeometry(0.06, 0.003, 6, 24, Math.PI), M.black, 0, 0.12, 0, g, true);
  hd.rotation.y = Math.PI / 2;
  var bam = tex(256, 64, function (c, w, h) {
    c.fillStyle = '#d8b878';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(120,85,35,0.55)';
    c.lineWidth = 2;
    for (var y = 6; y < h; y += 9) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
  });
  var m2 = glowMat({ map: bam, roughness: 0.7 });
  var sm = new THREE.Group();
  sm.position.set(0.24, 0, 0.05);
  g.add(sm);
  mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 32), m2, 0, 0.03, 0, sm);
  var lid = tex(256, 256, function (c, w, h) {
    c.fillStyle = '#d9bc80';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(120,85,35,0.45)';
    c.lineWidth = 3;
    for (var k = -h; k < w + h; k += 14) {
      c.beginPath();
      c.moveTo(k, 0);
      c.lineTo(k + h, h);
      c.stroke();
      c.beginPath();
      c.moveTo(k, h);
      c.lineTo(k + h, 0);
      c.stroke();
    }
  });
  mesh(new THREE.CylinderGeometry(0.102, 0.102, 0.025, 32), std({ map: lid, roughness: 0.7 }), 0, 0.072, 0, sm);
  var dish = new THREE.Group();
  dish.position.set(-0.16, 0, 0.13);
  g.add(dish);
  mesh(box(0.08, 0.02, 0.08), std({ color: 0xf2efe8, roughness: 0.3 }), 0, 0.01, 0, dish);
  mesh(box(0.064, 0.004, 0.064), std({ color: 0x3a0f08, roughness: 0.15 }), 0, 0.02, 0, dish, true);
  [-0.008, 0.008].forEach(function (o) {
    var cs = mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.22, 6), M.woodMid, 0.1 + o, 0.006, 0.17, g, true);
    cs.rotation.z = Math.PI / 2;
    cs.rotation.y = 0.5;
  });
  var pf = new THREE.Group();
  pf.position.set(-0.05, 0, -0.2);
  pf.rotation.y = 0.3;
  g.add(pf);
  var pm = glowMat({ color: 0xffffff, roughness: 0.6 });
  var img = new Image();
  img.onload = function () {
    var t = new THREE.Texture(img);
    t.encoding = THREE.sRGBEncoding;
    t.needsUpdate = true;
    pm.map = t;
    pm.needsUpdate = true;
  };
  img.src = GSOY_PHOTO;
  var fr = mesh(box(0.15, 0.185, 0.012), M.woodDark, 0, 0.09, 0, pf);
  fr.rotation.x = -0.18;
  var ph = mesh(new THREE.PlaneGeometry(0.128, 0.158), pm, 0, 0.09, 0, pf, true);
  ph.rotation.x = -0.18;
  ph.position.z = 0.007;
  ph.position.y = 0.0915;
  placard(a, -0.75, a.pos[2] - 1.2, 0.5, root);
  room.addBox(-0.75, a.pos[2] - 1.2, 0.1, 0.1);
  return [m1, m2, pm];
}
