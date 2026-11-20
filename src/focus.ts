/* Which artifact the player is looking at: prompt, glow pulse and a soft follow light. */
import * as THREE from 'three';
import { $ } from './util';
import { ARTIFACTS } from './artifacts/data';
import { game, player } from './state';

export var focusLight = new THREE.PointLight(0xffd9a0, 0, 4.5, 2);

export function updateFocus(t, dt) {
  var best = null,
    bs = 0,
    fx = -Math.sin(player.yaw),
    fz = -Math.cos(player.yaw);
  ARTIFACTS.forEach(function (a) {
    var dx = a.pos[0] - player.x,
      dz = a.pos[2] - player.z,
      d = Math.hypot(dx, dz);
    a.dist = d;
    if (a.update) a.update(t, dt, d);
    if (game.state !== 'playing' || d > a.radius) return;
    var dot = d < 0.5 ? 1 : (dx * fx + dz * fz) / d;
    if (dot < 0.5) return;
    var s = dot * 2 - d / a.radius;
    if (!best || s > bs) {
      best = a;
      bs = s;
    }
  });
  if (game.state === 'panel') best = game.open;
  game.focus = game.state === 'playing' ? best : null;
  ARTIFACTS.forEach(function (a) {
    var target = a === best ? 1 : 0;
    a.heat += (target - a.heat) * (1 - Math.exp(-6 * dt));
    var e = a.heat * (0.06 + 0.025 * Math.sin(t * 3.2));
    a.glow.forEach(function (m: THREE.MeshStandardMaterial) {
      m.emissiveIntensity = e;
    });
  });
  if (best) {
    var k = 0.55 / Math.max(0.6, best.dist);
    focusLight.position.set(
      best.pos[0] + (player.x - best.pos[0]) * k,
      best.pos[1] + 0.75,
      best.pos[2] + (player.z - best.pos[2]) * k,
    );
  }
  focusLight.intensity += ((best ? 0.45 : 0) - focusLight.intensity) * (1 - Math.exp(-5 * dt));
  var on = !!game.focus;
  $('prompt').classList.toggle('on', on);
  $('cross').classList.toggle('hot', on);
  if (on) {
    $('promptTheme').textContent = game.focus.theme + (game.focus.found ? '  ·  visited' : '');
    if (game.lastPrompt !== game.focus.id) {
      game.lastPrompt = game.focus.id;
      $('promptMain').innerHTML =
        game.focus.id === 'bull'
          ? '<kbd>E</kbd> Explore &nbsp;&nbsp; <kbd>R</kbd> Ride the bull'
          : '<kbd>E</kbd> Press E to Explore';
    }
  }
}
