/* Mechanical bull mini-game (artifact 09): level menu, balance physics, throw animation, results. */
import * as THREE from 'three';
import { $ } from './util';
import { canvas, camera } from './renderer';
import { ARTIFACTS } from './artifacts/data';
import { Sound } from './audio';
import { game, player, keys, clearKeys } from './state';
import { requestLock, releaseMouse } from './pointer';
import { markFound } from './panel';
/** Live state of a bull ride. Fields after `best` are (re)set by startRide(). */
export interface RideState {
  active: boolean;
  phase: 'idle' | 'countdown' | 'go' | 'thrown';
  level: number;
  /** Best time per level, persisted in localStorage under 'd2-bull-best'. */
  best: number[];
  clock?: number;
  t?: number;
  time?: number;
  next?: number;
  flash?: number;
  k?: number;
  /** Rider balance, -1..1; past +/-1 the rider is thrown. */
  bal?: number;
  vel?: number;
  roll?: number;
  rollT?: number;
  yaw?: number;
  yawV?: number;
  yawVT?: number;
  pitch?: number;
  pitchV?: number;
  eight?: boolean;
  shown?: boolean;
  voluntary?: boolean;
  p0?: THREE.Vector3;
  p1?: THREE.Vector3;
  q0?: THREE.Quaternion;
  q1?: THREE.Quaternion;
}

export var LEVELS = [
  { name: 'Gentle', k: 0.72 },
  { name: 'Saturday night', k: 1.0 },
  { name: 'The operator has a grudge', k: 1.38 },
];
export var Ride: RideState = { active: false, phase: 'idle', level: 1, best: [0, 0, 0] };
try {
  var savedBest = JSON.parse(localStorage.getItem('d2-bull-best') || 'null');
  if (savedBest && savedBest.length === 3) Ride.best = savedBest.map(Number);
} catch (e) {}
var _v = new THREE.Vector3(),
  _q = new THREE.Quaternion(),
  _q2 = new THREE.Quaternion(),
  _e = new THREE.Euler(0, 0, 0, 'YXZ'),
  _tmpCam = new THREE.PerspectiveCamera();
export function bullArt() {
  for (var i = 0; i < ARTIFACTS.length; i++) if (ARTIFACTS[i].id === 'bull') return ARTIFACTS[i];
}
export function openRideMenu() {
  markFound(bullArt());
  game.state = 'rideMenu';
  clearKeys();
  releaseMouse();
  LEVELS.forEach(function (l, i) {
    $('best' + i).textContent = Ride.best[i] ? 'Best ' + Ride.best[i].toFixed(2) + ' s' : 'Not ridden yet';
  });
  $('prompt').classList.remove('on');
  $('rideMenu').hidden = false;
  var b = document.querySelector<HTMLElement>('#rideMenu .lvl[data-level="' + Ride.level + '"]');
  if (b) b.focus();
}
export function closeRideMenu() {
  $('rideMenu').hidden = true;
  game.state = 'playing';
  canvas.focus();
  requestLock();
}
export function startRide(level) {
  var a = bullArt();
  Ride.level = level;
  Ride.active = true;
  Ride.phase = 'countdown';
  Ride.clock = 0;
  Ride.t = 0;
  Ride.bal = 0;
  Ride.vel = 0;
  Ride.roll = 0;
  Ride.rollT = 0;
  Ride.yaw = a.bull.rotation.y;
  Ride.yawV = 0;
  Ride.yawVT = 0;
  Ride.pitch = 0;
  Ride.pitchV = 0;
  Ride.next = 0.3;
  Ride.eight = false;
  Ride.flash = 0;
  Ride.shown = false;
  $('rideMenu').hidden = true;
  $('rideResult').hidden = true;
  $('hud').hidden = true;
  $('ride').hidden = false;
  $('panel').classList.remove('open');
  $('rDial').textContent = 'Operator dial: ' + LEVELS[level].name;
  $('rTime').textContent = '0.00';
  $('rCount').textContent = '3';
  $('rMark').style.left = '50%';
  game.state = 'riding';
  clearKeys();
  canvas.focus();
  Sound.init();
  Sound.resume();
}
function rideStep(h) {
  var R = Ride;
  if (R.phase === 'go') {
    var d = LEVELS[R.level].k * (1 + R.t / 5.5);
    R.next -= h;
    if (R.next <= 0) {
      R.next = (0.45 + Math.random() * 0.8) / Math.sqrt(d);
      R.rollT = (Math.random() * 2 - 1) * 0.2 * Math.min(d, 2);
      R.yawVT = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 1.2) * Math.min(d, 2.6);
      R.vel += (Math.random() * 2 - 1) * 0.5 * d;
      R.pitchV += (0.8 + Math.random() * 0.8) * Math.min(d, 2.2);
    }
    var input = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    var acc = R.roll * 8 + R.yawV * 0.6 + R.bal * 2.5 + input * 6 + (Math.random() - 0.5) * 1.9 * d;
    R.vel += acc * h;
    R.vel *= Math.exp(-2 * h);
    R.bal += R.vel * h;
    R.t += h;
  }
  R.roll += (R.rollT - R.roll) * (1 - Math.exp(-5 * h));
  R.yawV += (R.yawVT - R.yawV) * (1 - Math.exp(-2.5 * h));
  R.yaw += R.yawV * h;
  R.pitchV += (-R.pitch * 60 - R.pitchV * 6) * h;
  R.pitch += R.pitchV * h;
}
export function rideUpdate(dt) {
  var R = Ride,
    a = bullArt(),
    g = a.bull;
  R.clock += dt;
  if (R.phase === 'countdown') {
    var rem = 3 - R.clock;
    $('rCount').textContent = rem > 0 ? String(Math.ceil(rem)) : '';
    R.rollT = Math.sin(R.clock * 2.2) * 0.03;
    R.yawVT = 0.2;
    if (rem <= 0) {
      R.phase = 'go';
      R.t = 0;
      R.flash = 0.7;
      $('rCount').textContent = 'GO!';
      Sound.motorStart();
    }
  }
  var n = Math.max(1, Math.ceil(dt / 0.016));
  for (var i = 0; i < n; i++) rideStep(dt / n);
  if (R.phase === 'go') {
    if (R.flash > 0) {
      R.flash -= dt;
      if (R.flash <= 0) $('rCount').textContent = '';
    }
    $('rTime').textContent = R.t.toFixed(2);
    var b = Math.max(-1, Math.min(1, R.bal));
    $('rMark').style.left = 50 + b * 50 + '%';
    $('rMark').classList.toggle('warn', Math.abs(b) > 0.7);
    if (!R.eight && R.t >= 8) {
      R.eight = true;
      $('rCount').textContent = '8 SECONDS!';
      R.flash = 1.6;
      Sound.cheer();
    }
    if (Math.abs(R.bal) > 1) throwRider(false);
  } else if (R.phase === 'thrown') {
    R.k = Math.min(1, R.k + dt / 1.0);
    var k = R.k,
      e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(R.p0, R.p1, e);
    camera.position.y += Math.sin(Math.PI * k) * (R.voluntary ? 0.15 : 0.55);
    camera.quaternion.copy(R.q0).slerp(R.q1, e);
    if (k >= 1 && !R.shown) {
      R.shown = true;
      showRideResult();
    }
  }
  g.rotation.set(R.roll, R.yaw, R.pitch);
  g.position.y = Math.abs(R.pitch) * 0.25;
  Sound.motorSet(Math.abs(R.yawV));
  if (R.phase === 'countdown' || R.phase === 'go') {
    g.updateMatrixWorld(true);
    a.seat.getWorldPosition(_v);
    a.seat.getWorldQuaternion(_q);
    _e.set(-0.34, 0, -R.bal * 0.45);
    _q2.setFromEuler(_e);
    _q.multiply(_q2);
    camera.quaternion.copy(_q);
    camera.position.copy(_v).add(new THREE.Vector3(R.bal * 0.22, 0, 0).applyQuaternion(_q));
  }
}
export function throwRider(voluntary) {
  var R = Ride,
    a = bullArt();
  if (R.phase !== 'go' && R.phase !== 'countdown') return;
  R.voluntary = voluntary;
  R.time = R.phase === 'go' ? R.t : 0;
  R.phase = 'thrown';
  R.k = 0;
  R.shown = false;
  R.rollT = 0;
  R.yawVT = 0;
  Sound.motorStop();
  if (!voluntary) Sound.thud();
  $('rCount').textContent = '';
  R.p0 = camera.position.clone();
  R.q0 = camera.quaternion.clone();
  var side = new THREE.Vector3(R.bal >= 0 ? 1 : -1, 0, 0).applyQuaternion(camera.quaternion);
  side.y = 0;
  if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
  side.normalize();
  var bp = new THREE.Vector3(a.pos[0], 0, a.pos[2]);
  R.p1 = bp.clone().addScaledVector(side, voluntary ? 1.45 : 0.9);
  R.p1.y = voluntary ? player.eye : 0.32;
  _tmpCam.position.copy(R.p1);
  _tmpCam.lookAt(bp.x, voluntary ? 1.0 : 1.55, bp.z);
  R.q1 = _tmpCam.quaternion.clone();
  if (!voluntary) {
    _e.set(0, 0, 0.45);
    _q2.setFromEuler(_e);
    R.q1.multiply(_q2);
  }
}
function showRideResult() {
  var R = Ride,
    t = R.time,
    lv = R.level,
    nb = false,
    head,
    msg;
  if (t > R.best[lv]) {
    R.best[lv] = t;
    nb = t > 0;
    try {
      localStorage.setItem('d2-bull-best', JSON.stringify(R.best));
    } catch (e) {}
  }
  if (R.voluntary && t === 0) {
    head = 'You climbed off';
    msg = 'Before it even started. No shame. The bull will be here all night.';
  } else if (R.voluntary) {
    head = 'You climbed off';
    msg = 'A dignified exit. The bull respects you a little.';
  } else if (t < 2.3) {
    head = 'Thrown!';
    msg = 'Under two point three seconds. The operator announces it to the whole room like a weather report.';
  } else if (t < 5) {
    head = 'Thrown!';
    msg = 'Respectable. Somewhere in Kunshan, a grandmother is asking whether the bull is okay.';
  } else if (t < 8) {
    head = 'So close';
    msg = 'The whole room was counting down for you. Eight seconds is right there.';
  } else {
    head = 'Eight seconds. Legend.';
    msg = 'Shooters will be talking about this for a semester. Call your grandmother.';
  }
  $('rrLevel').textContent = 'Operator dial: ' + LEVELS[lv].name;
  $('rrTime').textContent = t.toFixed(2) + ' s';
  $('rrHead').textContent = head;
  $('rrMsg').textContent = msg;
  $('rrBest').textContent = nb ? 'New best on this setting.' : 'Best on this setting: ' + R.best[lv].toFixed(2) + ' s';
  $('ride').hidden = true;
  $('rideResult').hidden = false;
  game.state = 'rideResult';
  $('rideAgain').focus();
}
export function endRide() {
  var R = Ride,
    a = bullArt();
  R.active = false;
  R.phase = 'idle';
  Sound.motorStop();
  a.bull.rotation.set(0, 0, 0);
  a.bull.position.y = 0;
  $('rideResult').hidden = true;
  $('rideMenu').hidden = true;
  $('ride').hidden = true;
  $('hud').hidden = false;
  player.x = a.pos[0] + 1.7;
  player.z = a.pos[2] + 0.4;
  player.yaw = Math.atan2(player.x - a.pos[0], player.z - a.pos[2]);
  player.pitch = -0.12;
  player.vx = player.vz = 0;
  game.state = 'playing';
  game.lastPrompt = null;
  canvas.focus();
  requestLock();
}

export function initRide() {
  Array.prototype.forEach.call(document.querySelectorAll('#rideMenu .lvl'), function (b) {
    b.addEventListener('click', function () {
      startRide(+b.getAttribute('data-level'));
    });
  });
  $('rideCancel').addEventListener('click', closeRideMenu);
  $('rideAgain').addEventListener('click', function () {
    startRide(Ride.level);
  });
  $('rideBack').addEventListener('click', endRide);
}
