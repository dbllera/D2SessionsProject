/* First-person movement, collision against room colliders, and mouse look. */
import { camera, REDUCED } from './renderer';
import { Sound } from './audio';
import { game, player, keys, room } from './state';

export function resetPlayer() {
  var s = room.spawn;
  player.x = s.x;
  player.z = s.z;
  player.yaw = s.yaw;
  player.pitch = s.pitch;
  player.vx = player.vz = 0;
  player.bob = 0;
  player.stride = 0;
}

export function blocked(x, z) {
  var b = room.bounds,
    r = player.r;
  if (x < b.x0 + r || x > b.x1 - r || z < b.z0 + r || z > b.z1 - r) return true;
  for (var i = 0; i < room.colliders.length; i++) {
    var c = room.colliders[i],
      nx = Math.max(c.x0, Math.min(x, c.x1)),
      nz = Math.max(c.z0, Math.min(z, c.z1)),
      dx = x - nx,
      dz = z - nz;
    if (dx * dx + dz * dz < r * r) return true;
  }
  return false;
}
export function movePlayer(dt) {
  var f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
  var s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  if (game.state !== 'playing') {
    f = 0;
    s = 0;
  }
  var speed = keys.ShiftLeft || keys.ShiftRight ? 2.45 : 1.55,
    len = Math.hypot(f, s) || 1;
  var sin = Math.sin(player.yaw),
    cos = Math.cos(player.yaw);
  var tx = ((-sin * f + cos * s) / len) * speed,
    tz = ((-cos * f - sin * s) / len) * speed;
  var k = 1 - Math.exp(-(f || s ? 9 : 11) * Math.min(dt, 0.1));
  player.vx += (tx - player.vx) * k;
  player.vz += (tz - player.vz) * k;
  var steps = Math.max(1, Math.ceil(dt / 0.034)),
    h = dt / steps;
  for (var i = 0; i < steps; i++) {
    var nx = player.x + player.vx * h,
      nz = player.z + player.vz * h;
    if (!blocked(nx, player.z)) player.x = nx;
    else player.vx = 0;
    if (!blocked(player.x, nz)) player.z = nz;
    else player.vz = 0;
  }
  var v = Math.hypot(player.vx, player.vz);
  if (v > 0.2) {
    player.stride += v * dt;
    player.bob += v * dt * 4.4;
    if (player.stride > 0.72) {
      player.stride = 0;
      Sound.step();
    }
  }
  var bob = REDUCED ? 0 : Math.sin(player.bob) * 0.018 * Math.min(1, v / 1.5);
  camera.position.set(player.x, player.eye + bob, player.z);
  camera.rotation.set(player.pitch, player.yaw, 0);
}
export function look(dx, dy) {
  player.yaw -= dx * 0.0022;
  player.pitch -= dy * 0.0022;
  player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch));
}
