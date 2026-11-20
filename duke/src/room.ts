/* Room: Gothic Reading Room. Returns colliders, spawn point and a per-frame update,
   so other rooms can be added later with the same contract. */
import * as THREE from 'three';
import { rng } from './util';
import { REDUCED } from './renderer';
import { tex, rep, T, portraitTexs } from './textures';
import { mesh, box, part, merge, instanced, archPts, circlePath, extrude } from './geo';
import { std, M } from './materials';
import { L, W, H, R, HL, HW, TRUSS_Z, BAY_C, SUN_POS } from './dims';

export function buildGothicReadingRoom(root: THREE.Object3D) {
  var colliders = [];
  function wallGroup(x, z, ry) {
    var g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    root.add(g);
    return g;
  }
  var walls = {
    east: {
      g: wallGroup(HW, 0, -Math.PI / 2),
      s: 1,
      w: function (u, d) {
        return [HW - d, u];
      },
    },
    west: {
      g: wallGroup(-HW, 0, Math.PI / 2),
      s: -1,
      w: function (u, d) {
        return [-HW + d, -u];
      },
    },
    north: {
      g: wallGroup(0, -HL, 0),
      s: 1,
      w: function (u, d) {
        return [u, -HL + d];
      },
    },
    south: {
      g: wallGroup(0, HL, Math.PI),
      s: -1,
      w: function (u, d) {
        return [-u, HL - d];
      },
    },
  };
  function addCollider(wall, u0, u1, depth) {
    var a = wall.w(u0, 0),
      b = wall.w(u1, depth);
    colliders.push({
      x0: Math.min(a[0], b[0]),
      x1: Math.max(a[0], b[0]),
      z0: Math.min(a[1], b[1]),
      z1: Math.max(a[1], b[1]),
    });
  }
  function addBox(x, z, hx, hz) {
    colliders.push({ x0: x - hx, x1: x + hx, z0: z - hz, z1: z + hz });
  }

  /* Floor and roof */
  var floorTex = rep(T.parquet, (W + 1.2) / 1.7, (L + 1.2) / 1.7);
  floorTex.center.set(0.5, 0.5);
  floorTex.rotation = Math.PI / 4;
  M.floor.map = floorTex;
  var floor = mesh(new THREE.PlaneGeometry(W + 1.2, L + 1.2), M.floor, 0, 0, 0, root);
  floor.rotation.x = -Math.PI / 2;
  floor.castShadow = false;

  var slope = Math.sqrt(HW * HW + (R - H) * (R - H)),
    ang = Math.atan2(R - H, HW);
  [1, -1].forEach(function (sg) {
    var g = new THREE.BufferGeometry(),
      x = sg * (HW + 0.02),
      z = HL + 0.6;
    g.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([x, H, z, x, H, -z, 0, R, -z, x, H, z, 0, R, -z, 0, R, z], 3),
    );
    var ul = (2 * z) / 1.4,
      vl = slope / 1.4;
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, ul, 0, ul, vl, 0, 0, ul, vl, 0, vl], 2));
    g.computeVertexNormals();
    var m = mesh(g, M.ceiling, 0, 0, 0, root);
    m.material.shadowSide = THREE.DoubleSide;
  });
  var rafterGeo = box(slope, 0.17, 0.1),
    rt = [];
  for (var rz = -HL + 0.45; rz < HL; rz += 0.87) {
    var near = TRUSS_Z.some(function (t) {
      return Math.abs(t - rz) < 0.3;
    });
    if (near) continue;
    rt.push({ x: HW / 2, y: (H + R) / 2 - 0.1, z: rz, rz: -ang });
    rt.push({ x: -HW / 2, y: (H + R) / 2 - 0.1, z: rz, rz: ang });
  }
  instanced(rafterGeo, M.beamPlain, rt, root).castShadow = false;
  [0.34, 0.67].forEach(function (f) {
    [1, -1].forEach(function (sg) {
      var p = mesh(box(0.2, 0.26, L), M.beam, sg * HW * (1 - f), H + (R - H) * f - 0.22, 0, root);
      p.rotation.z = -sg * ang;
      p.castShadow = false;
    });
  });
  mesh(box(0.22, 0.32, L), M.beam, 0, R - 0.24, 0, root).castShadow = false;

  /* Trusses */
  var ts = new THREE.Shape();
  ts.moveTo(-HW - 0.05, 5.6);
  ts.lineTo(-HW - 0.05, H + 0.15);
  ts.lineTo(0, R + 0.15);
  ts.lineTo(HW + 0.05, H + 0.15);
  ts.lineTo(HW + 0.05, 5.6);
  ts.lineTo(HW - 0.3, 5.6);
  ts.quadraticCurveTo(4.75, 8.9, 0, 11.15);
  ts.quadraticCurveTo(-4.75, 8.9, -HW + 0.3, 5.6);
  ts.lineTo(-HW - 0.05, 5.6);
  var trussGeo = extrude(ts, 0.34);
  var ts2 = new THREE.Shape();
  ts2.moveTo(HW - 0.3, 5.75);
  ts2.quadraticCurveTo(4.6, 8.75, 0, 10.95);
  ts2.quadraticCurveTo(-4.6, 8.75, -HW + 0.3, 5.75);
  ts2.lineTo(-HW + 0.42, 5.75);
  ts2.quadraticCurveTo(-4.5, 8.6, 0, 10.78);
  ts2.quadraticCurveTo(4.5, 8.6, HW - 0.42, 5.75);
  ts2.lineTo(HW - 0.3, 5.75);
  var ribGeo = extrude(ts2, 0.5);
  var pend = [];
  TRUSS_Z.forEach(function (tz, i) {
    mesh(trussGeo, M.beam, 0, 0, tz - 0.17, root);
    mesh(ribGeo, M.beamPlain, 0, 0, tz - 0.25, root).castShadow = false;
    [1, -1].forEach(function (sg) {
      mesh(box(0.36, 0.5, 0.56), M.stone, sg * (HW - 0.17), 5.36, tz, root);
      mesh(box(0.26, 0.22, 0.42), M.stone, sg * (HW - 0.12), 5.02, tz, root);
    });
    if (i % 3 !== 1) {
      pend.push({ x: 2.6, y: 8.9, z: tz + 0.3 });
      pend.push({ x: -2.6, y: 8.9, z: tz + 0.3 });
    }
  });
  var pendGeo = merge([
    part(new THREE.CylinderGeometry(0.07, 0.17, 0.34, 14), 0, 0, 0),
    part(new THREE.CylinderGeometry(0.008, 0.008, 1.6, 5), 0, 0.95, 0),
  ]);
  instanced(pendGeo, M.black, pend, root).castShadow = false;

  /* Windows */
  function windowUnit(wall, cx, y0, w, ys, ya, big) {
    var g = wall.g;
    var sur = archPts(new THREE.Shape(), cx, y0 - 0.16, w + 0.36, ys, ya + 0.2);
    sur.holes.push(archPts(new THREE.Path(), cx, y0, w, ys, ya));
    mesh(extrude(sur, 0.1), M.stone, 0, 0, -0.03, g).castShadow = false;
    mesh(box(w + 0.5, 0.12, 0.3), M.stone, cx, y0 - 0.2, 0.06, g).castShadow = false;
    var tr = archPts(new THREE.Shape(), cx, y0, w, ys, ya),
      n = big ? 4 : 2,
      m = big ? 0.14 : 0.11,
      lw = (w - (n + 1) * m) / n;
    for (var i = 0; i < n; i++) {
      var lc = cx - w / 2 + m + lw / 2 + i * (lw + m);
      tr.holes.push(archPts(new THREE.Path(), lc, y0 + m, lw, ys - (big ? 0.6 : 0.25), ys + (big ? 0.3 : 0.4)));
    }
    if (big) {
      tr.holes.push(circlePath(cx - 1.1, ys + 0.95, 0.42));
      tr.holes.push(circlePath(cx + 1.1, ys + 0.95, 0.42));
      tr.holes.push(circlePath(cx, ys + 2.0, 0.5));
    } else tr.holes.push(circlePath(cx, ys + 0.72, 0.2));
    mesh(extrude(tr, 0.14), M.stone, 0, 0, -0.4, g);
    var bars = big ? [0.36, 0.7] : [0.5];
    bars.forEach(function (f) {
      mesh(box(w, 0.09, 0.14), M.stone, cx, y0 + (ys - 0.3 - y0) * f, -0.33, g);
    });
    var gt = rep(T.glass, big ? 3 : 1, big ? 1.6 : 1);
    var gm = new THREE.MeshBasicMaterial({ map: gt, color: new THREE.Color(1.9, 1.85, 1.7) });
    var gl = new THREE.Mesh(new THREE.PlaneGeometry(w, ya - y0), gm);
    gl.position.set(cx, (y0 + ya) / 2, -0.43);
    g.add(gl);
  }
  /* East wall with window openings */
  var WIN = { y0: 3.1, w: 1.5, ys: 5.5, ya: 6.9 },
    eastWins = [];
  BAY_C.forEach(function (c) {
    eastWins.push(c - 1.05);
    eastWins.push(c + 1.05);
  });
  var es = new THREE.Shape();
  es.moveTo(-HL - 0.6, 0);
  es.lineTo(HL + 0.6, 0);
  es.lineTo(HL + 0.6, H + 0.3);
  es.lineTo(-HL - 0.6, H + 0.3);
  es.lineTo(-HL - 0.6, 0);
  eastWins.forEach(function (c) {
    es.holes.push(archPts(new THREE.Path(), c, WIN.y0, WIN.w, WIN.ys, WIN.ya));
  });
  mesh(extrude(es, 0.6), M.plaster, 0, 0, -0.6, walls.east.g);
  eastWins.forEach(function (c) {
    windowUnit(walls.east, c, WIN.y0, WIN.w, WIN.ys, WIN.ya, false);
  });
  /* West wall */
  var wp = std({ map: rep(T.plaster, L / 3.3, H / 3.3), roughness: 0.95, envMapIntensity: 0.15 });
  var ww = mesh(new THREE.PlaneGeometry(L + 1.2, H + 0.3), wp, 0, (H + 0.3) / 2, 0, walls.west.g);
  ww.castShadow = false;
  /* Gable walls */
  function gable(wall, hole) {
    var s = new THREE.Shape();
    s.moveTo(-HW - 0.6, 0);
    s.lineTo(HW + 0.6, 0);
    s.lineTo(HW + 0.6, H);
    s.lineTo(0, R + 0.55);
    s.lineTo(-HW - 0.6, H);
    s.lineTo(-HW - 0.6, 0);
    if (hole) s.holes.push(hole);
    mesh(extrude(s, 0.6), M.plaster, 0, 0, -0.6, wall.g);
  }
  var GW = { y0: 2.95, w: 4.6, ys: 6.2, ya: 9.4 };
  gable(walls.north, archPts(new THREE.Path(), 0, GW.y0, GW.w, GW.ys, GW.ya));
  windowUnit(walls.north, 0, GW.y0, GW.w, GW.ys, GW.ya, true);
  gable(walls.south, null);

  /* Bookcases */
  var cornice = [];
  function bookcase(wall, a, b) {
    var u0 = Math.min(wall.s * a, wall.s * b),
      u1 = Math.max(wall.s * a, wall.s * b),
      len = u1 - u0,
      h = 2.3,
      d = 0.5;
    mesh(box(len, h, d), M.woodDark, (u0 + u1) / 2, h / 2, d / 2, wall.g);
    var fm = std({ map: rep(T.books, len / 2.6, 1), roughness: 0.24, envMapIntensity: 0.6 });
    var f = mesh(new THREE.PlaneGeometry(len, h), fm, (u0 + u1) / 2, h / 2, d + 0.004, wall.g);
    f.castShadow = false;
    mesh(box(len + 0.06, 0.09, d + 0.08), M.woodDark, (u0 + u1) / 2, h + 0.045, d / 2 + 0.02, wall.g);
    addCollider(wall, u0, u1, d + 0.02);
  }
  function pier(wall, a) {
    var u = wall.s * a,
      pm = std({ map: rep(T.panel, 0.5, 1), roughness: 0.5 });
    mesh(box(1.3, 2.95, 0.62), M.woodDark, u, 1.475, 0.31, wall.g);
    var f = mesh(new THREE.PlaneGeometry(1.2, 2.75), pm, u, 1.475, 0.624, wall.g);
    f.castShadow = false;
    mesh(box(1.42, 0.12, 0.72), M.woodDark, u, 3.0, 0.33, wall.g);
    addCollider(wall, u - 0.65, u + 0.65, 0.64);
  }
  bookcase(walls.east, -HL, HL);
  TRUSS_Z.forEach(function (z) {
    pier(walls.east, z);
  });
  bookcase(walls.west, -HL, -5.0);
  bookcase(walls.west, -2.6, HL);
  bookcase(walls.south, -5.0, -1.5);
  bookcase(walls.south, 1.5, 5.0);
  /* West alcove backing for framed photographs */
  var alc = mesh(
    new THREE.PlaneGeometry(2.4, 2.9),
    std({ map: rep(T.panel, 1, 1), roughness: 0.5 }),
    3.8,
    1.45,
    0.02,
    walls.west.g,
  );
  alc.castShadow = false;
  mesh(box(2.5, 0.1, 0.12), M.woodDark, 3.8, 2.92, 0.06, walls.west.g);
  /* North wainscot */
  var wn = mesh(
    new THREE.PlaneGeometry(W, 2.6),
    std({ map: rep(T.panel, 5, 1), roughness: 0.5 }),
    0,
    1.3,
    0.02,
    walls.north.g,
  );
  wn.castShadow = false;
  mesh(box(W, 0.1, 0.12), M.woodDark, 0, 2.62, 0.06, walls.north.g);
  /* South door and clock */
  mesh(box(2.1, 2.85, 0.1), M.stone, 0, 1.425, 0.03, walls.south.g);
  var dr = mesh(box(1.8, 2.65, 0.1), std({ map: rep(T.panel, 1, 1), roughness: 0.5 }), 0, 1.325, 0.07, walls.south.g);
  dr.castShadow = false;
  mesh(new THREE.SphereGeometry(0.035, 10, 8), M.brass, 0.1, 1.1, 0.14, walls.south.g);
  mesh(new THREE.SphereGeometry(0.035, 10, 8), M.brass, -0.1, 1.1, 0.14, walls.south.g);
  var clockTex = tex(256, 256, function (g, w, h) {
    g.fillStyle = '#f1ead8';
    g.beginPath();
    g.arc(128, 128, 126, 0, 7);
    g.fill();
    g.fillStyle = '#1c1814';
    g.font = '24px Georgia';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach(function (s, i) {
      var a = (i * Math.PI) / 6;
      g.fillText(s, 128 + Math.sin(a) * 98, 128 - Math.cos(a) * 98);
    });
    g.strokeStyle = '#1c1814';
    g.lineCap = 'round';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(128, 128);
    g.lineTo(128 + 52, 128 - 30);
    g.stroke();
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(128, 128);
    g.lineTo(128 - 22, 128 - 84);
    g.stroke();
  });
  var ck = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32), M.woodDark, 0, 6.9, 0.04, walls.south.g);
  ck.rotation.x = Math.PI / 2;
  var cf = mesh(
    new THREE.CircleGeometry(0.36, 32),
    std({ map: clockTex, roughness: 0.6 }),
    0,
    6.9,
    0.085,
    walls.south.g,
  );
  cf.castShadow = false;

  /* Portraits */
  var frameGeo = box(1, 1, 0.07),
    picGeo = new THREE.PlaneGeometry(1, 1),
    pi = 0;
  function portrait(wall, a, y, w, h) {
    var u = wall.s * a;
    var f = mesh(frameGeo, M.gold, u, y, 0.045, wall.g);
    f.scale.set(w, h, 1);
    var pm = std({ map: portraitTexs[pi++ % portraitTexs.length], roughness: 0.55 });
    var p = mesh(picGeo, pm, u, y, 0.083, wall.g);
    p.scale.set(w - 0.16, h - 0.16, 1);
    p.castShadow = false;
  }
  TRUSS_Z.forEach(function (z) {
    portrait(walls.east, z, 4.25, 1.0, 1.4);
  });
  TRUSS_Z.forEach(function (z) {
    portrait(walls.west, z, 4.45, 1.25, 1.7);
  });
  BAY_C.forEach(function (z) {
    portrait(walls.west, z, 4.3, 0.95, 1.3);
  });
  portrait(walls.north, -3.95, 4.3, 1.0, 1.4);
  portrait(walls.north, 3.95, 4.3, 1.0, 1.4);
  portrait(walls.south, -3.3, 4.3, 1.2, 1.6);
  portrait(walls.south, 3.3, 4.3, 1.2, 1.6);
  portrait(walls.south, 0, 4.6, 1.3, 1.7);

  /* Chandeliers */
  var chZ = [-10.4, 0, 10.4],
    chLights = [];
  var ringParts = [],
    bandParts = [];
  [
    [0.95, 0.3, 7.55],
    [0.7, 0.28, 7.24],
    [0.42, 0.24, 6.96],
  ].forEach(function (r) {
    ringParts.push(part(new THREE.CylinderGeometry(r[0], r[0], r[1], 28, 1, true), 0, r[2], 0));
    bandParts.push(part(new THREE.TorusGeometry(r[0], 0.028, 6, 28), 0, r[2] + r[1] / 2, 0, 0, Math.PI / 2));
    bandParts.push(part(new THREE.TorusGeometry(r[0], 0.028, 6, 28), 0, r[2] - r[1] / 2, 0, 0, Math.PI / 2));
  });
  ringParts.push(part(new THREE.CircleGeometry(0.42, 24), 0, 6.84, 0, 0, Math.PI / 2));
  for (var c4 = 0; c4 < 4; c4++) {
    var ca = (c4 * Math.PI) / 2 + 0.4;
    bandParts.push(
      part(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 5), Math.cos(ca) * 0.5, 8.2, Math.sin(ca) * 0.5, 0, 0, 0),
    );
  }
  bandParts.push(part(new THREE.CylinderGeometry(0.02, 0.02, 2.5, 6), 0, 9.95, 0));
  bandParts.push(part(new THREE.CylinderGeometry(0.55, 0.95, 0.06, 24, 1, true), 0, 7.72, 0));
  var ringGeo = merge(ringParts),
    bandGeo = merge(bandParts);
  chZ.forEach(function (z) {
    mesh(ringGeo, M.glow, 0, 0, z, root, true);
    var b = mesh(bandGeo, M.brass, 0, 0, z, root, true);
    b.material.side = THREE.DoubleSide;
    var pl = new THREE.PointLight(0xffca82, 0.85, 19, 1.6);
    pl.position.set(0, 6.7, z);
    root.add(pl);
    chLights.push(pl);
  });

  /* Furniture */
  var tableGeo = merge([
    part(box(2.6, 0.07, 1.1), 0, 0.735, 0),
    part(box(0.09, 0.7, 0.92), -1.12, 0.35, 0),
    part(box(0.09, 0.7, 0.92), 1.12, 0.35, 0),
    part(box(2.2, 0.1, 0.06), 0, 0.63, 0.4),
    part(box(2.2, 0.1, 0.06), 0, 0.63, -0.4),
    part(box(2.2, 0.07, 0.07), 0, 0.14, 0),
  ]);
  var chairGeo = merge([
    part(box(0.46, 0.05, 0.44), 0, 0.45, 0),
    part(box(0.46, 0.12, 0.035), 0, 0.9, -0.215),
    part(box(0.46, 0.07, 0.03), 0, 0.72, -0.215),
    part(box(0.045, 0.96, 0.045), -0.21, 0.48, -0.2),
    part(box(0.045, 0.96, 0.045), 0.21, 0.48, -0.2),
    part(box(0.045, 0.45, 0.045), -0.21, 0.225, 0.2),
    part(box(0.045, 0.45, 0.045), 0.21, 0.225, 0.2),
    part(box(0.04, 0.04, 0.4), -0.21, 0.2, 0),
    part(box(0.04, 0.04, 0.4), 0.21, 0.2, 0),
  ]);
  var tableRows = [12, 8.5, 5, -5.5, -9],
    tables = [],
    chairs = [],
    bookT = [],
    r = rng(301);
  var bookCols = ['#6b1f1f', '#1f3454', '#26452f', '#8a6a3a', '#e8e0cc', '#7a3b1e', '#2b2b33'];
  tableRows.forEach(function (z) {
    [-2.35, 2.35].forEach(function (x) {
      tables.push({ x: x, z: z });
      addBox(x, z, 1.32, 0.98);
      [-0.85, 0, 0.85].forEach(function (dx) {
        chairs.push({ x: x + dx + (r() - 0.5) * 0.06, z: z + 0.62 + r() * 0.14, ry: Math.PI + (r() - 0.5) * 0.3 });
        chairs.push({ x: x + dx + (r() - 0.5) * 0.06, z: z - 0.62 - r() * 0.14, ry: (r() - 0.5) * 0.3 });
      });
      var n = Math.floor(r() * 3) + 1;
      for (var i = 0; i < n; i++) {
        var bx = x + (r() - 0.5) * 1.5 + (x > 0 ? 0.35 : -0.35),
          bz = z + (r() - 0.5) * 0.6,
          stack = 1 + Math.floor(r() * 3),
          ry = r() * 3;
        for (var k = 0; k < stack; k++)
          bookT.push({
            x: bx,
            y: 0.79 + k * 0.042,
            z: bz,
            ry: ry + (r() - 0.5) * 0.4,
            sx: 0.8 + r() * 0.4,
            color: bookCols[Math.floor(r() * bookCols.length)],
          });
      }
    });
  });
  instanced(tableGeo, M.woodMid, tables, root);
  instanced(chairGeo, std({ map: T.woodDark, roughness: 0.5, color: 0xb9a79a }), chairs, root);
  instanced(box(0.2, 0.04, 0.27), std({ color: 0xffffff, roughness: 0.7 }), bookT, root);

  var armGeo = merge([
    part(box(0.84, 0.26, 0.8), 0, 0.32, 0),
    part(box(0.84, 0.56, 0.18), 0, 0.66, -0.33),
    part(box(0.16, 0.4, 0.78), -0.36, 0.5, 0.01),
    part(box(0.16, 0.4, 0.78), 0.36, 0.5, 0.01),
    part(box(0.6, 0.1, 0.56), 0, 0.48, 0.06),
  ]);
  var legGeo = merge([
    part(box(0.06, 0.2, 0.06), -0.36, 0.1, -0.34),
    part(box(0.06, 0.2, 0.06), 0.36, 0.1, -0.34),
    part(box(0.06, 0.2, 0.06), -0.36, 0.1, 0.34),
    part(box(0.06, 0.2, 0.06), 0.36, 0.1, 0.34),
  ]);
  var tanCh = [
    { x: -1.65, z: 0.3, ry: Math.PI / 2 },
    { x: 1.65, z: 0.3, ry: -Math.PI / 2 },
    { x: -0.62, z: -1.35, ry: 0.12 },
    { x: 0.62, z: -1.35, ry: -0.12 },
  ];
  var redCh = [
    { x: -0.62, z: 2.0, ry: Math.PI - 0.1 },
    { x: 0.62, z: 2.0, ry: Math.PI + 0.1 },
    { x: -3.3, z: -15.6, ry: 0.5 },
    { x: 3.3, z: -15.6, ry: -0.5 },
  ];
  instanced(armGeo, M.tan, tanCh, root);
  instanced(armGeo, M.red, redCh, root);
  instanced(legGeo, M.woodDark, tanCh.concat(redCh), root);
  tanCh.concat(redCh).forEach(function (c) {
    addBox(c.x, c.z, 0.47, 0.47);
  });
  mesh(box(1.1, 0.06, 0.6), M.woodMid, 0, 0.42, 0.3, root);
  mesh(box(0.9, 0.36, 0.44), M.woodDark, 0, 0.2, 0.3, root);
  addBox(0, 0.3, 0.57, 0.32);
  var rug = mesh(
    new THREE.PlaneGeometry(4.6, 5.0),
    std({ map: rep(T.rug, 1, 1), roughness: 0.95, envMapIntensity: 0.1 }),
    0,
    0.012,
    0.3,
    root,
  );
  rug.rotation.x = -Math.PI / 2;
  rug.rotation.z = Math.PI / 2;
  rug.castShadow = false;

  /* Light */
  var hemi = new THREE.HemisphereLight(0xd3dcea, 0x5a4630, 0.42);
  root.add(hemi);
  var sun = new THREE.DirectionalLight(0xfff0d6, 3.1);
  sun.position.copy(SUN_POS);
  sun.target.position.set(0, 2, 0);
  root.add(sun);
  root.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  var sc = sun.shadow.camera;
  sc.left = -22;
  sc.right = 22;
  sc.top = 14;
  sc.bottom = -14;
  sc.near = 5;
  sc.far = 90;
  sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  var fill = new THREE.DirectionalLight(0xdde6f4, 0.38);
  fill.position.set(10, 5, 1);
  root.add(fill);

  /* Sun shafts and dust */
  var d = SUN_POS.clone()
    .multiplyScalar(-1)
    .sub(new THREE.Vector3(0, -2, 0))
    .normalize();
  var sp = [],
    su = [];
  eastWins.forEach(function (zc) {
    [-0.38, 0.38].forEach(function (o) {
      var z = zc + o,
        x = HW - 0.05,
        l0 = WIN.y0 / -d.y,
        l1 = (WIN.ya - 0.5) / -d.y;
      var p0 = [x, WIN.y0, z],
        p1 = [x, WIN.ya - 0.5, z],
        p2 = [x + d.x * l1, 0.02, z + d.z * l1],
        p3 = [x + d.x * l0, 0.02, z + d.z * l0];
      [p0, p1, p2, p0, p2, p3].forEach(function (p) {
        sp.push(p[0], p[1], p[2]);
      });
      su.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
    });
  });
  var shaftGeo = new THREE.BufferGeometry();
  shaftGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  shaftGeo.setAttribute('uv', new THREE.Float32BufferAttribute(su, 2));
  var shaftTex = tex(64, 256, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, 'rgba(255,240,205,0)');
    gr.addColorStop(0.08, 'rgba(255,240,205,1)');
    gr.addColorStop(1, 'rgba(255,240,205,0.25)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    var e = g.createLinearGradient(0, 0, w, 0);
    e.addColorStop(0, 'rgba(0,0,0,0)');
    e.addColorStop(0.3, 'rgba(0,0,0,1)');
    e.addColorStop(0.7, 'rgba(0,0,0,1)');
    e.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = e;
    g.fillRect(0, 0, w, h);
  });
  shaftTex.flipY = true;
  var shafts = new THREE.Mesh(
    shaftGeo,
    new THREE.MeshBasicMaterial({
      map: shaftTex,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    }),
  );
  root.add(shafts);
  var DN = 420,
    dpos = new Float32Array(DN * 3),
    dr2 = rng(401),
    dvel = [];
  for (var i = 0; i < DN; i++) {
    dpos[i * 3] = -2.5 + dr2() * 7.5;
    dpos[i * 3 + 1] = 0.4 + dr2() * 5.5;
    dpos[i * 3 + 2] = -HL + 1 + dr2() * (L - 2);
    dvel.push([(dr2() - 0.5) * 0.03, (dr2() - 0.5) * 0.02, (dr2() - 0.5) * 0.03]);
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  var dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: 0xfff1cf,
      size: 0.022,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  root.add(dust);

  return {
    colliders: colliders,
    walls: walls,
    addBox: addBox,
    bounds: { x0: -HW, x1: HW, z0: -HL, z1: HL },
    spawn: { x: 0, z: 15.2, yaw: 0, pitch: -0.02 },
    tables: tables,
    effects: [shafts, dust],
    update: function (t, dt) {
      if (REDUCED) return;
      var a = dustGeo.attributes.position.array as Float32Array;
      for (var i = 0; i < DN; i++) {
        a[i * 3] += dvel[i][0] * dt;
        a[i * 3 + 1] += (dvel[i][1] + Math.sin(t * 0.3 + i) * 0.004) * dt;
        a[i * 3 + 2] += dvel[i][2] * dt;
        if (a[i * 3 + 1] > 6) a[i * 3 + 1] = 0.4;
        if (a[i * 3 + 1] < 0.3) a[i * 3 + 1] = 5.9;
        if (a[i * 3] > 5) a[i * 3] = -2.5;
        if (a[i * 3] < -2.5) a[i * 3] = 5;
      }
      dustGeo.attributes.position.needsUpdate = true;
      var f = 1 + Math.sin(t * 1.7) * 0.012 + Math.sin(t * 4.3) * 0.006;
      chLights.forEach(function (l) {
        l.intensity = 0.85 * f;
      });
    },
  };
}

export type Room = ReturnType<typeof buildGothicReadingRoom>;
