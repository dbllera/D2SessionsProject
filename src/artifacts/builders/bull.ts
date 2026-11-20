/* Artifact 09: Shooters II mechanical bull (rideable, see ../../ride.ts). */
import * as THREE from 'three';
import { rng } from '../../util';
import { REDUCED } from '../../renderer';
import { tex, speckle } from '../../textures';
import { mesh, box } from '../../geo';
import { std, glowMat, M } from '../../materials';
import { placard } from '../placard';
import { Ride } from '../../ride';
import type { Room } from '../../room';
import type { Artifact } from '../types';

export function bull(a: Artifact, root: THREE.Object3D, room: Room): THREE.MeshStandardMaterial[] {
  var base = new THREE.Group();
  base.position.set(a.pos[0], 0, a.pos[2]);
  root.add(base);
  var ringT = tex(256, 256, function (c, w, h) {
    c.fillStyle = '#17171b';
    c.fillRect(0, 0, w, h);
    speckle(c, w, h, 3000, 141, '90,90,100', 0.15, 2);
    c.strokeStyle = 'rgba(200,40,40,0.8)';
    c.lineWidth = 10;
    c.beginPath();
    c.arc(w / 2, h / 2, w / 2 - 12, 0, 7);
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.08)';
    c.lineWidth = 2;
    for (var k = 0; k < 12; k++) {
      var an = (k * Math.PI) / 6;
      c.beginPath();
      c.moveTo(w / 2, h / 2);
      c.lineTo(w / 2 + (Math.cos(an) * w) / 2, h / 2 + (Math.sin(an) * h) / 2);
      c.stroke();
    }
  });
  ringT.wrapS = ringT.wrapT = THREE.ClampToEdgeWrapping;
  mesh(
    new THREE.CylinderGeometry(0.98, 1.04, 0.14, 48),
    [std({ color: 0x1c1c22, roughness: 0.6 }), std({ map: ringT, roughness: 0.55 }), std({ color: 0x1c1c22 })],
    0,
    0.07,
    0,
    base,
  );
  mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.16, 24), M.black, 0, 0.2, 0, base);
  mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.42, 16),
    std({ color: 0x2a2a30, roughness: 0.4, metalness: 0.7 }),
    0,
    0.46,
    0,
    base,
  );
  var g = new THREE.Group();
  g.rotation.order = 'YXZ';
  base.add(g);
  a.bull = g;

  /* Hide: u runs around the body (0.25 = belly, 0.75 = spine), v runs tail (0) to head (1) */
  var hide = tex(512, 512, function (c, w, h) {
    var gr = c.createLinearGradient(0, 0, w, 0);
    [
      [0, '#8a3f1d'],
      [0.12, '#9c5228'],
      [0.18, '#d2b48c'],
      [0.25, '#efe5d0'],
      [0.32, '#d2b48c'],
      [0.38, '#9c5228'],
      [0.62, '#83391a'],
      [0.75, '#73311a'],
      [0.88, '#83391a'],
      [1, '#8a3f1d'],
    ].forEach(function (p: [number, string]) {
      gr.addColorStop(p[0], p[1]);
    });
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
    var fr = c.createLinearGradient(0, 0, 0, h * 0.2);
    fr.addColorStop(0, 'rgba(236,226,206,0.85)');
    fr.addColorStop(1, 'rgba(236,226,206,0)');
    c.fillStyle = fr;
    c.fillRect(0, 0, w, h * 0.2);
    var r = rng(151),
      i;
    for (i = 0; i < 9000; i++) {
      var x = r() * w,
        y = r() * h,
        l = 4 + r() * 14;
      c.strokeStyle = r() < 0.5 ? 'rgba(50,18,6,' + r() * 0.22 + ')' : 'rgba(230,180,130,' + r() * 0.12 + ')';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (r() - 0.5) * 3, y + l);
      c.stroke();
    }
    for (i = 0; i < 18; i++) {
      var px = w * (0.45 + r() * 0.5),
        py = h * (0.25 + r() * 0.6),
        rx = 8 + r() * 30,
        ry = 10 + r() * 40;
      c.fillStyle = 'rgba(205,160,110,' + (0.18 + r() * 0.3) + ')';
      c.beginPath();
      c.ellipse(px, py, rx, ry, r() * 3, 0, 7);
      c.fill();
    }
    for (i = 0; i < 60; i++) {
      c.strokeStyle = 'rgba(30,14,6,' + (0.2 + r() * 0.3) + ')';
      c.lineWidth = 1 + r() * 1.5;
      var sx = r() * w,
        sy = r() * h;
      c.beginPath();
      c.moveTo(sx, sy);
      c.lineTo(sx + (r() - 0.5) * 20, sy + (r() - 0.5) * 20);
      c.stroke();
    }
  });
  var face = tex(256, 256, function (c, w, h) {
    c.fillStyle = '#ece2cc';
    c.fillRect(0, 0, w, h);
    var r = rng(152);
    for (var i = 0; i < 1400; i++) {
      var x = r() * w,
        y = r() * h,
        rad = 2 + r() * 4;
      c.strokeStyle = 'rgba(' + (r() < 0.5 ? '170,140,100' : '255,250,238') + ',' + (0.25 + r() * 0.35) + ')';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(x, y, rad, r() * 6, r() * 6 + 3);
      c.stroke();
    }
    c.fillStyle = 'rgba(140,70,35,0.35)';
    c.beginPath();
    c.ellipse(w * 0.25, h * 0.5, 30, 22, 0, 0, 7);
    c.fill();
    c.beginPath();
    c.ellipse(w * 0.75, h * 0.5, 30, 22, 0, 0, 7);
    c.fill();
  });
  var m1 = glowMat({ map: hide, roughness: 0.85 }),
    m2 = glowMat({ map: face, roughness: 0.95 });

  var prof = [
    [0, -0.8],
    [0.16, -0.78],
    [0.27, -0.7],
    [0.33, -0.55],
    [0.355, -0.3],
    [0.37, 0],
    [0.385, 0.25],
    [0.37, 0.48],
    [0.31, 0.66],
    [0.2, 0.78],
    [0, 0.82],
  ].map(function (p) {
    return new THREE.Vector2(p[0], p[1]);
  });
  var body = mesh(new THREE.LatheGeometry(prof, 48), m1, 0, 0.9, 0, g);
  body.rotation.z = -Math.PI / 2;
  body.scale.set(1, 1, 0.86);
  var hump = mesh(new THREE.SphereGeometry(0.25, 32, 20), m1, 0.4, 1.13, 0, g);
  hump.scale.set(1.35, 0.72, 0.92);
  var neck = mesh(new THREE.SphereGeometry(0.24, 32, 20), m1, 0.7, 1.02, 0, g);
  neck.scale.set(0.95, 1.0, 0.88);

  var hg = new THREE.Group();
  hg.position.set(0.86, 1.02, 0);
  hg.rotation.z = -0.32;
  g.add(hg);
  var skull = mesh(new THREE.SphereGeometry(0.2, 32, 24), m2, 0.08, 0, 0, hg);
  skull.scale.set(1.15, 1.0, 0.92);
  var muz = mesh(new THREE.SphereGeometry(0.13, 28, 20), std({ color: 0xd2a189, roughness: 0.55 }), 0.27, -0.06, 0, hg);
  muz.scale.set(0.95, 0.82, 1.12);
  var dark = std({ color: 0x16110e, roughness: 0.15 });
  [1, -1].forEach(function (s) {
    mesh(new THREE.SphereGeometry(0.022, 10, 8), dark, 0.385, -0.07, s * 0.045, hg, true);
    mesh(new THREE.SphereGeometry(0.028, 14, 10), dark, 0.13, 0.06, s * 0.165, hg, true);
    var ear = mesh(new THREE.SphereGeometry(0.08, 16, 12), m1, -0.05, 0.06, s * 0.23, hg);
    ear.scale.set(0.45, 0.33, 1.25);
    ear.rotation.x = s * 0.3;
  });
  var cr = rng(161);
  for (var ci = 0; ci < 14; ci++) {
    mesh(
      new THREE.SphereGeometry(0.03 + cr() * 0.015, 10, 8),
      m2,
      -0.02 + cr() * 0.12,
      0.17 + cr() * 0.04,
      (cr() - 0.5) * 0.2,
      hg,
      true,
    );
  }
  function hornGeo(s) {
    var pts = [
      [-0.02, 0.12, 0.14],
      [0.0, 0.14, 0.26],
      [0.05, 0.16, 0.35],
      [0.13, 0.21, 0.39],
      [0.2, 0.29, 0.36],
    ].map(function (p) {
      return new THREE.Vector3(p[0], p[1], p[2] * s);
    });
    var curve = new THREE.CatmullRomCurve3(pts),
      TS = 24,
      RS = 10,
      geo = new THREE.TubeGeometry(curve, TS, 0.042, RS, false);
    var pos = geo.attributes.position,
      col = [],
      c = new THREE.Vector3(),
      cA = new THREE.Color(0xdccfae),
      cB = new THREE.Color(0x2e2820),
      cc = new THREE.Color();
    for (var i = 0; i <= TS; i++) {
      var t = i / TS;
      curve.getPointAt(t, c);
      var sc = 1 - 0.8 * t;
      for (var j = 0; j <= RS; j++) {
        var k = i * (RS + 1) + j;
        pos.setXYZ(k, c.x + (pos.getX(k) - c.x) * sc, c.y + (pos.getY(k) - c.y) * sc, c.z + (pos.getZ(k) - c.z) * sc);
        cc.copy(cA).lerp(cB, Math.max(0, (t - 0.6) / 0.4));
        col.push(cc.r, cc.g, cc.b);
      }
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    return geo;
  }
  var hornM = std({ vertexColors: true, roughness: 0.35 });
  mesh(hornGeo(1), hornM, 0, 0, 0, hg);
  mesh(hornGeo(-1), hornM, 0, 0, 0, hg);

  var blkT = tex(256, 128, function (c, w, h) {
    c.fillStyle = '#8a8d8f';
    c.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 4) {
      c.fillStyle = 'rgba(' + (y % 12 ? '60,64,66' : '170,174,178') + ',0.5)';
      c.fillRect(0, y, w, 2);
    }
    c.fillStyle = '#5f6d73';
    c.fillRect(0, h * 0.4, w, 10);
    c.fillStyle = 'rgba(255,255,255,0.15)';
    c.fillRect(0, 0, w, 6);
    c.fillRect(0, h - 6, w, 6);
  });
  function drape(r, len, half, mat, x) {
    var m = mesh(new THREE.CylinderGeometry(r, r, len, 40, 1, true, Math.PI / 2 - half, half * 2), mat, x, 0.9, 0, g);
    m.rotation.z = Math.PI / 2;
    m.scale.set(1, 1, 0.88);
    return m;
  }
  drape(0.4, 0.66, 1.15, std({ map: blkT, roughness: 0.95, side: THREE.DoubleSide }), -0.05);
  drape(0.415, 0.36, 0.6, std({ color: 0x6b4423, roughness: 0.45, side: THREE.DoubleSide }), 0.0);
  var hdl = mesh(
    new THREE.TorusGeometry(0.07, 0.015, 8, 20, Math.PI),
    std({ color: 0xe8e0cc, roughness: 0.9 }),
    0.2,
    1.3,
    0,
    g,
  );
  hdl.rotation.y = Math.PI / 2;
  var flank = mesh(
    new THREE.TorusGeometry(0.35, 0.012, 6, 48),
    std({ color: 0xe8e0cc, roughness: 0.9 }),
    -0.4,
    0.9,
    0,
    g,
    true,
  );
  flank.rotation.y = Math.PI / 2;
  flank.scale.set(0.88, 1, 1);
  var tc = new THREE.CatmullRomCurve3(
    [
      [-0.78, 1.05, 0],
      [-0.86, 0.92, 0.02],
      [-0.88, 0.68, 0.05],
      [-0.85, 0.48, 0.04],
    ].map(function (p) {
      return new THREE.Vector3(p[0], p[1], p[2]);
    }),
  );
  mesh(new THREE.TubeGeometry(tc, 16, 0.016, 6, false), std({ color: 0x5a2a14, roughness: 0.9 }), 0, 0, 0, g);
  var tuft = mesh(new THREE.SphereGeometry(0.05, 12, 10), std({ color: 0xd8cbb0, roughness: 1 }), -0.85, 0.44, 0.04, g);
  tuft.scale.set(0.6, 1.5, 0.6);

  var seat = new THREE.Object3D();
  seat.position.set(-0.12, 1.9, 0);
  seat.rotation.y = -Math.PI / 2;
  g.add(seat);
  a.seat = seat;

  var sign = tex(320, 120, function (c, w, h) {
    c.fillStyle = '#2a1a0e';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#b88a3a';
    c.lineWidth = 5;
    c.strokeRect(4, 4, w - 8, h - 8);
    c.fillStyle = '#f0d9a0';
    c.font = 'bold 34px Georgia';
    c.textAlign = 'center';
    c.fillText('RIDE AT YOUR', w / 2, 52);
    c.fillText('OWN RISK', w / 2, 94);
  });
  sign.wrapS = sign.wrapT = THREE.ClampToEdgeWrapping;
  var sp = new THREE.Group();
  sp.position.set(a.pos[0] - 0.6, 0, a.pos[2] + 1.05);
  sp.rotation.y = 0.5;
  root.add(sp);
  mesh(box(0.05, 1.3, 0.05), M.woodMid, 0, 0.65, 0, sp);
  mesh(new THREE.PlaneGeometry(0.42, 0.16), std({ map: sign, roughness: 0.7 }), 0, 1.24, 0.03, sp, true);
  room.addBox(a.pos[0], a.pos[2], 1.0, 1.0);
  room.addBox(a.pos[0] - 0.6, a.pos[2] + 1.05, 0.08, 0.08);
  placard(a, a.pos[0] + 1.3, a.pos[2] + 1.05, Math.PI / 2 - 0.45, root);
  room.addBox(a.pos[0] + 1.3, a.pos[2] + 1.05, 0.1, 0.1);
  a.update = function (t, dt, dist) {
    if (Ride.active) return;
    if (REDUCED) {
      g.rotation.set(0, 0, 0);
      return;
    }
    var act = dist < 4.5 ? 1 : 0.25;
    g.rotation.set(Math.sin(t * 1.3) * 0.04 * act, Math.sin(t * 0.55) * 0.22 * act, Math.sin(t * 0.9 + 1) * 0.03 * act);
  };
  return [m1, m2];
}
