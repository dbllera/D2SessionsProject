/* Entry point: builds the room and artifacts, wires the interface, runs the frame loop. */
import './style.css';
import { ARTIFACTS } from './artifacts/data';
import { BUILDERS } from './artifacts/builders';
import { applyEnvironmentMap } from './environment';
import { focusLight, updateFocus } from './focus';
import { initHud } from './hud';
import { initInput } from './input';
import { initPanel } from './panel';
import { blocked, movePlayer, resetPlayer } from './player';
import { camera, renderer, scene, world } from './renderer';
import { Ride, initRide, rideUpdate } from './ride';
import { buildGothicReadingRoom } from './room';
import { initScreens } from './screens';
import { Sound } from './audio';
import { game, player, setRoom } from './state';
import { $ } from './util';

if (!renderer) {
  $('fatal').hidden = false;
  $('start').hidden = true;
} else {
  start();
}

function start() {
  // ---------------------------------------------------------------- build scene
  const room = buildGothicReadingRoom(world);
  setRoom(room);
  ARTIFACTS.forEach((a) => {
    a.glow = BUILDERS[a.build](a, world, room);
    a.found = false;
    a.heat = 0;
  });
  world.add(focusLight);
  applyEnvironmentMap();
  // The room is static: render the shadow map once.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;

  // ---------------------------------------------------------------- interface
  resetPlayer();
  initInput();
  initHud();
  initPanel();
  initScreens();
  initRide();

  // ---------------------------------------------------------------- loop
  function resize() {
    const w = window.innerWidth,
      h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  let last = performance.now(),
    time = 0,
    expo = 1;
  function frame(now: number) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    time += dt;
    if (game.state === 'start') {
      // slow attract-mode drift behind the start screen
      camera.position.set(0.4 + Math.sin(time * 0.11) * 0.5, 1.72, 15.4);
      camera.rotation.set(0.07, Math.sin(time * 0.08) * 0.16 - 0.03, 0);
    } else if (Ride.active) {
      rideUpdate(dt);
    } else if (game.state !== 'paused') {
      movePlayer(dt);
      Sound.listener(camera.position, -Math.sin(player.yaw), -Math.cos(player.yaw));
    }
    if (game.state !== 'paused') {
      room.update(time, dt);
      updateFocus(time, dt);
      // brighten slightly near the sunlit east windows
      const near = Math.max(0, Math.min(1, (camera.position.x + 3) / 7.5));
      expo += (0.96 + 0.16 * near - expo) * (1 - Math.exp(-1.5 * dt));
      renderer.toneMappingExposure = expo;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------------------------------------------------------------- hook for automated checks (tools/smoke.mjs)
  (window as any).__d2 = {
    ride: Ride,
    scene,
    world,
    camera,
    game,
    player,
    room,
    artifacts: ARTIFACTS,
    renderer,
    blocked,
    teleport(x: number, z: number, yaw?: number, pitch?: number) {
      player.x = x;
      player.z = z;
      player.yaw = yaw || 0;
      player.pitch = pitch || 0;
      player.vx = player.vz = 0;
    },
  };
}
