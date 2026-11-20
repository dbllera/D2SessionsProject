/* Brass museum placard ("D2 MUSEUM · 0N") placed beside each artifact. */
import * as THREE from 'three';
import { tex, wrapText } from '../textures';
import { mesh, box } from '../geo';
import { std, M } from '../materials';

var placardGeo = new THREE.PlaneGeometry(0.34, 0.22);
export function placard(a, x, z, ry, root) {
  var t = tex(340, 220, function (g, w, h) {
    g.fillStyle = '#efe7d3';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b08a45';
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#8a6a2c';
    g.font = '22px Georgia';
    g.fillText('D2 MUSEUM  ·  ' + a.no, 22, 42);
    g.fillStyle = '#1c1814';
    g.font = '30px Georgia';
    wrapText(g, a.theme, 22, 92, w - 44, 36);
    g.fillStyle = '#6b6456';
    g.font = '19px Georgia';
    g.fillText('Press E to explore', 22, h - 24);
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  var g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  root.add(g);
  mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.98, 6), M.brass, 0, 0.49, 0, g);
  mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.025, 16), M.brass, 0, 0.012, 0, g);
  var p = mesh(box(0.36, 0.24, 0.012), M.brass, 0, 1.02, 0, g);
  p.rotation.x = -0.55;
  var f = mesh(placardGeo, std({ map: t, roughness: 0.6 }), 0, 1.024, 0.006, g, true);
  f.rotation.x = -0.55;
  f.position.y = 1.0235;
  f.position.z = 0.0075;
}
