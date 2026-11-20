/* Illustrated stand-in photos for artifact 04 (framed meals). */
import * as THREE from 'three';
import { rng } from '../util';
import { tex, grain } from '../textures';

function drawFood(kind) {
  return function (g, w, h) {
    var r = rng(kind * 7 + 3);
    grain(g, w, h, kind === 1 ? '#3a2a1e' : kind === 2 ? '#7d2f28' : '#2b3440', '0,0,0', 260, kind + 80);
    if (kind === 2) {
      g.fillStyle = 'rgba(255,255,255,0.16)';
      for (var i = 0; i < w; i += 40)
        for (var j = 0; j < h; j += 40) if ((i / 40 + j / 40) % 2 === 0) g.fillRect(i, j, 40, 40);
    }
    function shadow(x, y, rx, ry) {
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.beginPath();
      g.ellipse(x + 6, y + 8, rx, ry, 0, 0, 7);
      g.fill();
    }
    var cx = w * 0.48,
      cy = h * 0.53;
    if (kind === 1) {
      shadow(cx, cy, 118, 92);
      g.fillStyle = '#b98b4e';
      g.beginPath();
      g.ellipse(cx, cy, 118, 92, 0, 0, 7);
      g.fill();
      g.fillStyle = '#d9b673';
      g.beginPath();
      g.ellipse(cx, cy, 102, 78, 0, 0, 7);
      g.fill();
      g.strokeStyle = 'rgba(120,85,40,0.5)';
      g.lineWidth = 2;
      for (var k = -90; k < 100; k += 14) {
        g.beginPath();
        g.moveTo(cx + k, cy - 76);
        g.lineTo(cx + k, cy + 76);
        g.stroke();
      }
      for (var n = 0; n < 6; n++) {
        var a = (n * Math.PI) / 3 + 0.3,
          x = cx + Math.cos(a) * 52,
          y = cy + Math.sin(a) * 38;
        g.fillStyle = 'rgba(0,0,0,0.2)';
        g.beginPath();
        g.ellipse(x + 3, y + 4, 25, 19, a, 0, 7);
        g.fill();
        g.fillStyle = '#f4ecdc';
        g.beginPath();
        g.ellipse(x, y, 25, 19, a, 0, 7);
        g.fill();
        g.strokeStyle = 'rgba(170,150,120,0.8)';
        g.lineWidth = 1.5;
        for (var p = -3; p <= 3; p++) {
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + Math.cos(a + p * 0.22) * 20, y + Math.sin(a + p * 0.22) * 15);
          g.stroke();
        }
      }
      shadow(w * 0.86, h * 0.26, 26, 20);
      g.fillStyle = '#f1ede4';
      g.beginPath();
      g.ellipse(w * 0.86, h * 0.26, 26, 20, 0, 0, 7);
      g.fill();
      g.fillStyle = '#2a140c';
      g.beginPath();
      g.ellipse(w * 0.86, h * 0.26, 19, 14, 0, 0, 7);
      g.fill();
    } else if (kind === 2) {
      shadow(cx, cy, 125, 96);
      g.fillStyle = '#f3efe6';
      g.beginPath();
      g.ellipse(cx, cy, 125, 96, 0, 0, 7);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.08)';
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(cx, cy, 100, 74, 0, 0, 7);
      g.stroke();
      for (var q = 0; q < 70; q++) {
        g.fillStyle = 'hsl(' + (14 + r() * 14) + ',55%,' + (20 + r() * 18) + '%)';
        g.beginPath();
        g.ellipse(cx - 36 + (r() - 0.5) * 80, cy + 6 + (r() - 0.5) * 56, 7 + r() * 9, 3 + r() * 5, r() * 3, 0, 7);
        g.fill();
      }
      g.fillStyle = '#d9a93a';
      g.fillRect(cx + 38, cy - 52, 52, 42);
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.fillRect(cx + 38, cy - 52, 52, 6);
      for (var s = 0; s < 60; s++) {
        g.strokeStyle = r() < 0.7 ? '#cfe0b0' : '#e9a45a';
        g.lineWidth = 2;
        var sx = cx + 62 + (r() - 0.5) * 50,
          sy = cy + 34 + (r() - 0.5) * 30;
        g.beginPath();
        g.moveTo(sx, sy);
        g.lineTo(sx + (r() - 0.5) * 18, sy + (r() - 0.5) * 14);
        g.stroke();
      }
    } else {
      shadow(cx, cy, 122, 90);
      g.fillStyle = '#e9e4d8';
      g.beginPath();
      g.ellipse(cx, cy, 122, 90, 0, 0, 7);
      g.fill();
      [
        [-46, -12],
        [42, -18],
        [2, 30],
      ].forEach(function (o) {
        var x = cx + o[0],
          y = cy + o[1];
        g.fillStyle = 'rgba(0,0,0,0.25)';
        g.beginPath();
        g.ellipse(x + 4, y + 6, 36, 30, 0, 0, 7);
        g.fill();
        g.fillStyle = '#b9772c';
        g.beginPath();
        g.ellipse(x, y, 36, 30, 0, 0, 7);
        g.fill();
        g.fillStyle = '#d79a45';
        g.beginPath();
        g.ellipse(x, y - 3, 30, 24, 0, 0, 7);
        g.fill();
        g.strokeStyle = 'rgba(120,65,15,0.8)';
        g.lineWidth = 2;
        g.beginPath();
        g.ellipse(x, y - 3, 20, 15, 0, 0, 7);
        g.stroke();
        for (var k = 0; k < 8; k++) {
          var a = (k * Math.PI) / 4;
          g.beginPath();
          g.moveTo(x + Math.cos(a) * 8, y - 3 + Math.sin(a) * 6);
          g.lineTo(x + Math.cos(a) * 19, y - 3 + Math.sin(a) * 14);
          g.stroke();
        }
      });
      shadow(w * 0.87, h * 0.25, 28, 22);
      g.fillStyle = '#dfe6e2';
      g.beginPath();
      g.ellipse(w * 0.87, h * 0.25, 28, 22, 0, 0, 7);
      g.fill();
      g.fillStyle = '#8a6a2c';
      g.beginPath();
      g.ellipse(w * 0.87, h * 0.25, 21, 16, 0, 0, 7);
      g.fill();
    }
    var vg = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = vg;
    g.fillRect(0, 0, w, h);
  };
}
export var FOOD = [1, 2, 3].map(function (k) {
  var t = tex(400, 300, drawFood(k));
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
});
