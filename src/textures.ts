/* Canvas texture helpers and the shared procedural textures (wood, plaster, stone, parquet, books, glass, rug, portraits). */
import * as THREE from 'three';
import { rng } from './util';
import { MAXAN } from './renderer';

/** Paint a canvas with draw(ctx, w, h) and wrap it as an sRGB, repeating texture. */
export function tex(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  rx?: number,
  ry?: number,
): THREE.CanvasTexture {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  var t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx || 1, ry || 1);
  t.anisotropy = MAXAN;
  return t;
}
/** Clone a texture with a different repeat. */
export function rep(t: THREE.Texture, rx: number, ry: number) {
  var c = t.clone();
  c.repeat.set(rx, ry);
  c.needsUpdate = true;
  return c;
}
/** Wood grain: base colour plus n random streaks. */
export function grain(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  base: string,
  streak: string,
  n: number,
  seed: number,
  vertical?: boolean,
) {
  var r = rng(seed);
  g.fillStyle = base;
  g.fillRect(0, 0, w, h);
  for (var i = 0; i < n; i++) {
    var a = 0.03 + r() * 0.1;
    g.fillStyle = r() < 0.62 ? 'rgba(' + streak + ',' + a + ')' : 'rgba(255,220,170,' + a * 0.45 + ')';
    var len = 40 + r() * 320,
      t = 1 + r() * 1.6,
      x = r() * w - 40,
      y = r() * h;
    if (vertical) g.fillRect((y / h) * w, (x / w) * h, t, len);
    else g.fillRect(x, y, len, t);
  }
}
/** n random specks of colour "r,g,b" with alpha up to amax and size up to smax. */
export function speckle(
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  n: number,
  seed: number,
  rgb: string,
  amax: number,
  smax: number,
) {
  var r = rng(seed);
  for (var i = 0; i < n; i++) {
    g.fillStyle = 'rgba(' + rgb + ',' + r() * amax + ')';
    var s = 1 + r() * smax;
    g.fillRect(r() * w, r() * h, s, s);
  }
}
/** Word-wrap text into maxW; returns the y below the last line. */
export function wrapText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
): number {
  var paras = text.split('\n');
  for (var p = 0; p < paras.length; p++) {
    var words = paras[p].split(' '),
      line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (g.measureText(test).width > maxW && line) {
        g.fillText(line, x, y);
        y += lh;
        line = words[i];
      } else line = test;
    }
    g.fillText(line, x, y);
    y += lh;
  }
  return y;
}

export var T: Record<string, THREE.CanvasTexture> = {};
T.woodDark = tex(512, 512, function (g, w, h) {
  grain(g, w, h, '#4f2c1b', '30,12,4', 1500, 11);
});
T.woodMid = tex(512, 512, function (g, w, h) {
  grain(g, w, h, '#6a4630', '40,20,8', 1400, 12);
});
T.woodBeam = tex(
  512,
  512,
  function (g, w, h) {
    grain(g, w, h, '#5a341f', '28,12,4', 1500, 13);
  },
  0.35,
  0.35,
);
T.plaster = tex(
  512,
  512,
  function (g, w, h) {
    g.fillStyle = '#dccb9f';
    g.fillRect(0, 0, w, h);
    var r = rng(5);
    for (var i = 0; i < 90; i++) {
      var x = r() * w,
        y = r() * h,
        rad = 30 + r() * 110,
        gr = g.createRadialGradient(x, y, 0, x, y, rad);
      var dark = r() < 0.5;
      gr.addColorStop(0, dark ? 'rgba(150,125,85,0.07)' : 'rgba(255,248,225,0.08)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    speckle(g, w, h, 5000, 6, '120,100,70', 0.05, 2);
  },
  0.3,
  0.3,
);
T.stone = tex(
  512,
  512,
  function (g, w, h) {
    g.fillStyle = '#b7ab95';
    g.fillRect(0, 0, w, h);
    speckle(g, w, h, 9000, 7, '80,72,60', 0.1, 3);
    speckle(g, w, h, 5000, 8, '240,232,215', 0.08, 3);
    g.strokeStyle = 'rgba(70,62,52,0.35)';
    g.lineWidth = 2;
    for (var y = 0; y < h; y += 128) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
      for (var x = ((y / 128) % 2) * 128; x < w; x += 256) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x, y + 128);
        g.stroke();
      }
    }
  },
  1.2,
  1.2,
);
T.parquet = tex(512, 512, function (g, w, h) {
  var r = rng(21),
    n = 4,
    s = w / n;
  for (var i = 0; i < n; i++)
    for (var j = 0; j < n; j++) {
      var horiz = (i + j) % 2 === 0;
      for (var k = 0; k < 4; k++) {
        var l = 44 + r() * 12;
        g.fillStyle = 'hsl(' + (27 + r() * 5) + ',' + (40 + r() * 8) + '%,' + (l - 9) + '%)';
        if (horiz) g.fillRect(i * s, j * s + (k * s) / 4, s, s / 4);
        else g.fillRect(i * s + (k * s) / 4, j * s, s / 4, s);
        g.strokeStyle = 'rgba(60,32,10,0.35)';
        g.lineWidth = 1;
        if (horiz) g.strokeRect(i * s + 0.5, j * s + (k * s) / 4 + 0.5, s - 1, s / 4 - 1);
        else g.strokeRect(i * s + (k * s) / 4 + 0.5, j * s + 0.5, s / 4 - 1, s - 1);
      }
    }
  for (var q = 0; q < 1600; q++) {
    g.fillStyle = 'rgba(70,38,12,' + (0.03 + r() * 0.06) + ')';
    var x = r() * w,
      y = r() * h;
    var ci = Math.floor(x / s),
      cj = Math.floor(y / s);
    if ((ci + cj) % 2 === 0) g.fillRect(x, y, 10 + r() * 40, 1);
    else g.fillRect(x, y, 1, 10 + r() * 40);
  }
});
T.ceiling = tex(256, 256, function (g, w, h) {
  g.fillStyle = '#dccba6';
  g.fillRect(0, 0, w, h);
  speckle(g, w, h, 2500, 31, '120,95,60', 0.06, 2);
  g.strokeStyle = 'rgba(110,85,50,0.3)';
  g.lineWidth = 2;
  for (var y = 0; y < h; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
});
T.panel = tex(512, 512, function (g, w, h) {
  grain(g, w, h, '#55301d', '30,12,4', 1400, 41, true);
  var cols = 2,
    rows = 2,
    pw = w / cols,
    ph = h / rows;
  for (var i = 0; i < cols; i++)
    for (var j = 0; j < rows; j++) {
      var x = i * pw + 26,
        y = j * ph + 26,
        ww = pw - 52,
        hh = ph - 52;
      g.strokeStyle = 'rgba(20,8,2,0.75)';
      g.lineWidth = 5;
      g.strokeRect(x, y, ww, hh);
      g.strokeStyle = 'rgba(255,210,160,0.16)';
      g.lineWidth = 2;
      g.strokeRect(x + 5, y + 5, ww - 10, hh - 10);
      g.fillStyle = 'rgba(0,0,0,0.08)';
      g.fillRect(x + 5, y + 5, ww - 10, hh - 10);
    }
  g.fillStyle = 'rgba(20,8,2,0.5)';
  g.fillRect(0, 0, w, 5);
  g.fillRect(0, 0, 4, h);
});
T.books = tex(1024, 1024, function (g, w, h) {
  grain(g, w, h, '#532e1c', '30,12,4', 2600, 51);
  var r = rng(52),
    top = 46,
    plinth = 150,
    doors = 3,
    dw = w / doors;
  g.fillStyle = '#3d2012';
  g.fillRect(0, 0, w, top);
  g.fillStyle = 'rgba(255,210,160,0.18)';
  g.fillRect(0, top - 10, w, 3);
  g.fillRect(0, 12, w, 2);
  g.fillStyle = 'rgba(0,0,0,0.35)';
  g.fillRect(0, top, w, 6);
  var pal = [
    '#6b1f1f',
    '#1f3454',
    '#26452f',
    '#8a6a3a',
    '#3a2a22',
    '#7a3b1e',
    '#2b2b33',
    '#5d4a1e',
    '#4a1f33',
    '#9a8660',
    '#1f4a4a',
    '#7d1d14',
  ];
  for (var d = 0; d < doors; d++) {
    var x0 = d * dw + 22,
      x1 = (d + 1) * dw - 22,
      y0 = top + 26,
      y1 = h - plinth - 16;
    g.fillStyle = '#120c08';
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    var shelves = 5,
      sh = (y1 - y0) / shelves;
    for (var s = 0; s < shelves; s++) {
      var by = y0 + (s + 1) * sh - 7,
        x = x0 + 3;
      while (x < x1 - 8) {
        var bw = 9 + r() * 17,
          bh = sh * (0.62 + r() * 0.3);
        if (r() < 0.07) {
          x += bw * 1.2;
          continue;
        }
        if (x + bw > x1 - 3) break;
        var col = pal[Math.floor(r() * pal.length)];
        g.fillStyle = col;
        g.fillRect(x, by - bh, bw, bh);
        g.fillStyle = 'rgba(255,255,255,0.10)';
        g.fillRect(x, by - bh, 2, bh);
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.fillRect(x + bw - 2, by - bh, 2, bh);
        if (r() < 0.55) {
          g.fillStyle = 'rgba(214,178,96,0.75)';
          g.fillRect(x + 1, by - bh * 0.8, bw - 3, 2);
          g.fillRect(x + 1, by - bh * 0.3, bw - 3, 2);
        }
        x += bw + 0.5;
      }
      g.fillStyle = '#3a1f12';
      g.fillRect(x0, by, x1 - x0, 7);
      g.fillStyle = 'rgba(0,0,0,0.5)';
      g.fillRect(x0, by + 7, x1 - x0, 6);
    }
    var sgr = g.createLinearGradient(0, y0, 0, y0 + 60);
    sgr.addColorStop(0, 'rgba(0,0,0,0.6)');
    sgr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sgr;
    g.fillRect(x0, y0, x1 - x0, 60);
    g.save();
    g.beginPath();
    g.rect(x0, y0, x1 - x0, y1 - y0);
    g.clip();
    g.strokeStyle = 'rgba(215,185,130,0.13)';
    g.lineWidth = 1.5;
    for (var k = -h; k < w + h; k += 26) {
      g.beginPath();
      g.moveTo(x0 + k, y0);
      g.lineTo(x0 + k + (y1 - y0), y1);
      g.stroke();
      g.beginPath();
      g.moveTo(x0 + k, y1);
      g.lineTo(x0 + k + (y1 - y0), y0);
      g.stroke();
    }
    var gl = g.createLinearGradient(x0, y0, x1, y1);
    gl.addColorStop(0, 'rgba(255,255,255,0.10)');
    gl.addColorStop(0.4, 'rgba(255,255,255,0)');
    gl.addColorStop(0.7, 'rgba(255,255,255,0.05)');
    gl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gl;
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.restore();
    g.fillStyle = '#4a2817';
    g.fillRect((x0 + x1) / 2 - 7, y0, 14, y1 - y0);
    g.strokeStyle = 'rgba(20,8,2,0.8)';
    g.lineWidth = 4;
    g.strokeRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
    g.strokeStyle = 'rgba(255,210,160,0.14)';
    g.lineWidth = 2;
    g.strokeRect(x0 - 9, y0 - 9, x1 - x0 + 18, y1 - y0 + 18);
    g.fillStyle = '#b8974e';
    g.fillRect((x0 + x1) / 2 - 14, (y0 + y1) / 2, 5, 16);
    g.fillRect((x0 + x1) / 2 + 9, (y0 + y1) / 2, 5, 16);
    var py = h - plinth + 12;
    g.fillStyle = '#1a0f09';
    g.fillRect(x0, py, x1 - x0, plinth - 44);
    g.strokeStyle = 'rgba(170,130,80,0.5)';
    g.lineWidth = 2;
    for (var gx = x0 + 6; gx < x1; gx += 9) {
      g.beginPath();
      g.moveTo(gx, py + 4);
      g.lineTo(gx, py + plinth - 48);
      g.stroke();
    }
    g.strokeStyle = 'rgba(20,8,2,0.8)';
    g.lineWidth = 4;
    g.strokeRect(x0 - 2, py - 2, x1 - x0 + 4, plinth - 40);
  }
  g.fillStyle = '#2e170c';
  g.fillRect(0, h - 26, w, 26);
});
T.glass = tex(256, 512, function (g, w, h) {
  var gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#f4f8fb');
  gr.addColorStop(0.55, '#eef2e6');
  gr.addColorStop(1, '#dfe8cf');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  var r = rng(61);
  for (var i = 0; i < 40; i++) {
    var x = r() * w,
      y = h * 0.45 + r() * h * 0.55,
      rad = 20 + r() * 60,
      rg = g.createRadialGradient(x, y, 0, x, y, rad);
    rg.addColorStop(0, 'rgba(120,160,95,0.22)');
    rg.addColorStop(1, 'rgba(120,160,95,0)');
    g.fillStyle = rg;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  g.strokeStyle = 'rgba(70,74,70,0.85)';
  g.lineWidth = 2.5;
  for (var cx = 0; cx <= w; cx += w / 6) {
    g.beginPath();
    g.moveTo(cx, 0);
    g.lineTo(cx, h);
    g.stroke();
  }
  for (var cy = 0; cy <= h; cy += h / 16) {
    g.beginPath();
    g.moveTo(0, cy);
    g.lineTo(w, cy);
    g.stroke();
  }
});
T.rug = tex(512, 384, function (g, w, h) {
  g.fillStyle = '#7a2a22';
  g.fillRect(0, 0, w, h);
  var r = rng(71);
  g.strokeStyle = '#d9c39a';
  g.lineWidth = 6;
  g.strokeRect(14, 14, w - 28, h - 28);
  g.strokeStyle = '#1f2f4a';
  g.lineWidth = 14;
  g.strokeRect(30, 30, w - 60, h - 60);
  g.strokeStyle = '#d9c39a';
  g.lineWidth = 3;
  g.strokeRect(44, 44, w - 88, h - 88);
  for (var i = 0; i < 26; i++)
    for (var j = 0; j < 18; j++) {
      var x = 60 + (i * (w - 120)) / 25,
        y = 60 + (j * (h - 120)) / 17;
      g.fillStyle = (i + j) % 2 ? 'rgba(217,195,154,0.5)' : 'rgba(31,47,74,0.6)';
      g.beginPath();
      g.moveTo(x, y - 5);
      g.lineTo(x + 5, y);
      g.lineTo(x, y + 5);
      g.lineTo(x - 5, y);
      g.fill();
    }
  g.save();
  g.translate(w / 2, h / 2);
  g.fillStyle = '#1f2f4a';
  g.beginPath();
  g.ellipse(0, 0, 110, 75, 0, 0, 7);
  g.fill();
  g.fillStyle = '#d9c39a';
  g.beginPath();
  g.ellipse(0, 0, 84, 54, 0, 0, 7);
  g.fill();
  g.fillStyle = '#7a2a22';
  g.beginPath();
  g.ellipse(0, 0, 56, 34, 0, 0, 7);
  g.fill();
  g.restore();
  speckle(g, w, h, 6000, 72, '0,0,0', 0.12, 2);
});
function portraitTex(seed) {
  return tex(256, 352, function (g, w, h) {
    var r = rng(seed),
      hue = 20 + r() * 120;
    var gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, 'hsl(' + hue + ',22%,' + (16 + r() * 8) + '%)');
    gr.addColorStop(1, 'hsl(' + (hue + 20) + ',25%,7%)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    for (var i = 0; i < 140; i++) {
      g.strokeStyle = 'hsla(' + (hue + r() * 30) + ',25%,' + (15 + r() * 25) + '%,0.12)';
      g.lineWidth = 3 + r() * 8;
      g.beginPath();
      var x = r() * w,
        y = r() * h;
      g.moveTo(x, y);
      g.lineTo(x + r() * 60 - 30, y + r() * 60 - 30);
      g.stroke();
    }
    var cx = w * (0.45 + r() * 0.1),
      sy = h * 0.56;
    g.fillStyle = 'hsl(' + (210 + r() * 30) + ',18%,' + (9 + r() * 8) + '%)';
    g.beginPath();
    g.moveTo(cx - 88, h);
    g.quadraticCurveTo(cx - 84, sy + 12, cx - 28, sy);
    g.lineTo(cx + 28, sy);
    g.quadraticCurveTo(cx + 84, sy + 12, cx + 88, h);
    g.fill();
    g.fillStyle = 'rgba(235,228,214,0.85)';
    g.beginPath();
    g.moveTo(cx - 13, sy);
    g.lineTo(cx, sy + 34);
    g.lineTo(cx + 13, sy);
    g.fill();
    g.fillStyle = 'hsl(' + (22 + r() * 10) + ',' + (16 + r() * 12) + '%,' + (30 + r() * 20) + '%)';
    g.beginPath();
    g.ellipse(cx, sy - 44, 27, 35, 0, 0, 7);
    g.fill();
    var fg = g.createLinearGradient(cx - 27, 0, cx + 27, 0);
    fg.addColorStop(0, 'rgba(0,0,0,0)');
    fg.addColorStop(1, 'rgba(10,6,2,0.6)');
    g.fillStyle = fg;
    g.beginPath();
    g.ellipse(cx, sy - 44, 27, 35, 0, 0, 7);
    g.fill();
    var vg = g.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h / 2, h * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.6)');
    g.fillStyle = vg;
    g.fillRect(0, 0, w, h);
  });
}
export var portraitTexs = [101, 102, 103, 104, 105, 106, 107].map(portraitTex);
