/* Environment map: a small painted panorama of the room (cream vault, window wall to the east,
   wood and parquet below) so polished surfaces pick up believable reflections. */
import * as THREE from 'three';
import { scene } from './renderer';
import { tex } from './textures';

export function applyEnvironmentMap() {
  var e = tex(512, 256, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#5a4630');
    gr.addColorStop(0.2, '#a8956c');
    gr.addColorStop(0.36, '#b9a987');
    gr.addColorStop(0.47, '#3b2517');
    gr.addColorStop(0.56, '#3b2517');
    gr.addColorStop(0.62, '#6b4526');
    gr.addColorStop(1, '#7a4f2a');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff8e6';
    for (var i = 0; i < 12; i++) {
      var x = w * 0.5 + (i - 5.5) * w * 0.031;
      g.fillRect(x - 4, h * 0.3, 8, h * 0.14);
    }
    g.fillRect(w * 0.25 - 12, h * 0.24, 24, h * 0.2);
    g.fillStyle = 'rgba(255,214,150,0.9)';
    [0.12, 0.5, 0.88].forEach(function (u) {
      g.beginPath();
      g.ellipse(w * u, h * 0.12, 16, 7, 0, 0, 7);
      g.fill();
    });
    g.fillStyle = 'rgba(255,236,190,0.35)';
    g.fillRect(w * 0.36, h * 0.7, w * 0.28, h * 0.16);
  });
  e.wrapS = e.wrapT = THREE.ClampToEdgeWrapping;
  e.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = e;
}
